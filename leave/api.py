import json
import datetime
import copy
import calendar

from django.contrib.auth.models import User, Group
from django.forms.models import model_to_dict

from rest_framework import (
    viewsets,
    permissions,
    decorators,
    response,
    mixins,
    status,
)

from .models import (
    Leave,
    ConfigEntry,
    LeaveMask,
)
from .serializers import LeaveSerializer

from .helpers import (
    get_mask,
    accumulate_mask,
)

Response = response.Response


class LeaveViewSet(mixins.CreateModelMixin,
                   mixins.ListModelMixin,
                   mixins.RetrieveModelMixin,
                   mixins.UpdateModelMixin,
                   viewsets.GenericViewSet):
    queryset = Leave.objects.all()
    serializer_class = LeaveSerializer

    def is_admin_user(self):
        return permissions.IsAdminUser.has_permission(None, self.request, self)

    def get_validated_query_value(self, fieldname, value):
        def validate_date(value):
            try: 
                date = datetime.datetime.strptime(value, '%Y%m%d')
                return value
            except (ValueError, TypeError):
                return None
                
        def validate_year(value):
            try:
                year = int(value)
            except (ValueError, TypeError):
                return None
            else:
                current_year = datetime.datetime.now().year
                return value if current_year - 10 <= year <= current_year + 10 else None

        def validate_status(value):
            config_entry = ConfigEntry.objects.get(name='leave_context')
            leave_context = json.loads(config_entry.extra)
            if leave_context.get('leave_statuses') is None:
                leave_statuses = []
            else:
                leave_statuses = list(map(lambda x: x['name'], leave_context['leave_statuses']))

            return value if value in leave_statuses else None

        validation_funcs = {
            'year': validate_year,
            'status': validate_status,
            'date': validate_date,
        }

        return (fieldname, validation_funcs[fieldname](value)) if validation_funcs.get(fieldname) is not None else (fieldname, None)

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['update', 'partial_update']:
            permission_classes = [permissions.IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        request = self.request
        queries = []
        for queried_field in ['year', 'status']:
            queried_value = request.query_params.get(queried_field)
            if queried_value is not None:
                queries.append(self.get_validated_query_value(queried_field, queried_value))

        for queried_field, queried_value in queries:
            if queried_value is None:
                # Return none queryset if there is an invalid query_param
                return self.queryset.none()

        queries = {queried_field: queried_value for queried_field, queried_value in queries}

        if self.is_admin_user():
            return self.queryset.filter(active=True, **queries)
        else:
            return self.queryset.filter(user=self.request.user.username, active=True, **queries)

    def create(self, request, *args, **kwargs):
        initial_data = copy.deepcopy(request.data)
        initial_data['year'] = initial_data.get('startdate', '')[:4]
        initial_data['status'] = 'pending'
        serializer = self.get_serializer(data=initial_data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        if not self.is_admin_user():
            if instance.status == 'pending':
                instance.active = False
                instance.save(update_fields=['active'])

                return Response(status=status.HTTP_204_NO_CONTENT)
            else:
                errors = {
                    'errors': {
                        'status': ['is not pending'],
                    }
                }
                return Response(errors, status=status.HTTP_403_FORBIDDEN)
        else:
            instance.active = False
            instance.save(update_fields=['active'])

            if instance.status == 'approved':
                mask = get_mask(user=instance.user, year=instance.year)
                base_mask = get_mask(user='_', year=instance.year)
                mask.value = base_mask.value
                mask.summary = base_mask.summary

                accumulate_mask(mask, Leave.objects.filter(user=instance.user,
                                                                year=instance.year,
                                                                status='approved',
                                                                active=True))

            return Response(status=status.HTTP_204_NO_CONTENT)

    def perform_update(self, serializer):
        instance = serializer.save()
        if (instance.status != "approved"):
            return

        mask = get_mask(user=instance.user, year=instance.year)
        accumulate_mask(mask, [instance])

    @decorators.action(methods=['GET'], detail=False)
    def context(self, *args, **kwargs):
        config_entry = ConfigEntry.objects.get(name='leave_context')
        leave_context = json.loads(config_entry.extra)
        users = User.objects.all()
        if not self.is_admin_user():
            users = users.filter(username=self.request.user.username)

        res = {
            **leave_context,
            "users": list(map(lambda x: model_to_dict(x, fields=['id', 'username']), users)),
        }

        return Response(res)

    @decorators.action(methods=['GET', 'PATCH'], detail=False)
    def holidays(self, request, *args, **kargs):    
        if request.method == "GET":
            year = request.query_params.get('year')
            _, year = self.get_validated_query_value('year', year)
            if year is not None:
                try:
                    config_entry = ConfigEntry.objects.get(name='holidays_{}'.format(year))
                except ConfigEntry.DoesNotExist:
                    return Response(None, status=status.HTTP_404_NOT_FOUND)
                else:
                    holidays = config_entry.extra.split()
                    return Response(holidays)
            else:
                return Response(None, status=status.HTTP_404_NOT_FOUND)

        elif request.method == "PATCH":
            if not self.is_admin_user():
                return Response(status=status.HTTP_403_FORBIDDEN)

            year = request.query_params.get('year')

            _, year = self.get_validated_query_value('year', year)
            if year is not None:
                holidays = request.data.get('holidays').split()
                for holiday in holidays:
                    _, validated_holiday = self.get_validated_query_value('date', holiday)
                    if validated_holiday is None:
                        ret = {
                            "message": "some holiday is not in correct format"
                        }
                        return Response(ret, status=status.HTTP_400_BAD_REQUEST)
                    elif validated_holiday[:4] != year:
                        ret = {
                            "message": "some holiday is not in correct year"
                        }
                        return Response(ret, status=status.HTTP_400_BAD_REQUEST)

                try:
                    holidays_entry = ConfigEntry.objects.get(name='holidays_{}'.format(year))
                    unique_holidays = '\n'.join(set(holidays))
                    holidays_entry.extra = unique_holidays
                    holidays_entry.save(update_fields=["extra"])
                    return Response(status=status.HTTP_204_NO_CONTENT)
                    
                except ConfigEntry.DoesNotExist:
                    return Response(status=status.HTTP_404_NOT_FOUND)

            else:
                ret = {
                    "message": "year not provided or not in the correct format (YYYY)"
                }

                return Response(ret, status=status.HTTP_400_BAD_REQUEST)


    @decorators.action(methods=['GET'], detail=False)
    def statistics(self, request, *args, **kargs):
        year = request.query_params.get('year')
        _, year = self.get_validated_query_value('year', year)
        if year is not None:
            try:
                leave_type_config = ConfigEntry.objects.get(name='leave_type_{}'.format(year))
            except ConfigEntry.DoesNotExist:
                leave_type_config = ConfigEntry.objects.get(name='leave_context')
                leave_types = json.loads(leave_type_config.extra)['leave_types']
            else:
                leave_types = json.loads(leave_type_config.extra)

            users = User.objects.all()
            if not self.is_admin_user():
                users = users.filter(username=self.request.user.username)

            stats = []
            for user in users:
                try:
                    mask = get_mask(user=user, year=year)
                    stat = json.loads(mask.summary)
                except LeaveMask.DoesNotExist:
                    stat = {leave_type['name']: 0 for leave_type in leave_types}
                stats.append({**stat, 'user': user.username})

            ret = {
                'year': year,
                'leave_types': leave_types,
                'stats': stats,
            }
            return Response(ret)
        else:
            return Response(None, status=status.HTTP_404_NOT_FOUND)

    @decorators.action(methods=['GET'], detail=False)
    def leave_users(self, request, *args, **kargs):
        date = request.query_params.get('date')
        try:
            datetime.datetime.strptime(date, '%Y%m%d')
        except (ValueError, TypeError):
            ret = {
                'message': "Date format must be YYYYMMDD"
            }
            return Response(ret, status=status.HTTP_400_BAD_REQUEST)

        prefix = "leave_app__"

        leave_status = {group.name[len(prefix):]: {} for group in Group.objects.filter(name__startswith=prefix)}
        leave_status['all'] = {}
        
        for user in User.objects.all():
            mask_value = get_mask(user=user.username, year=date[:4]).value
            day_in_year = datetime.datetime.strptime(date, '%Y%m%d').timetuple().tm_yday
            
            # '-' = work, otherwise = leave
            leave = mask_value[(2 * day_in_year - 2):(2 * day_in_year)]

            for group in user.groups.filter(name__startswith=prefix):
                leave_status[group.name[len(prefix):]][user.username] = leave

            leave_status['all'][user.username] = leave

        ret = {
            'date': date,
            'leave_status': leave_status,
        }

        return Response(ret)

    @decorators.action(methods=['POST'], detail=False)
    def recalculate_masks(self, request, *args, **kargs):
        _, year = self.get_validated_query_value('year', request.data.get('year'))

        if year is None:
            ret = {
                'message': 'no year provided'
            }
            return Response(ret, status=status.HTTP_400_BAD_REQUEST)
    
        holidays = ConfigEntry.objects.get(name="holidays_{}".format(year)).extra.split()
        holidays_in_year = [datetime.datetime.strptime(item, '%Y%m%d').timetuple().tm_yday - 1
                            for item in holidays]
        first_sat = 6 - (datetime.datetime(int(year), 1, 1).weekday() + 1) % 7
        mask = ['-'] * ((366 if calendar.isleap(int(year)) else 365) * 2)
        for holiday in holidays_in_year:
            mask[2 * holiday] = '0'
            mask[2 * holiday + 1] = '0'
        for saturday in range(first_sat, len(mask) // 2, 7):
            mask[2 * saturday] = '0'
            mask[2 * saturday + 1] = '0'
        for sunday in range(first_sat + 1, len(mask) // 2, 7):
            mask[2 * sunday] = '0'
            mask[2 * sunday + 1] = '0'

        leave_type_config = ConfigEntry.objects.get(name='leave_context')
        leave_types = json.loads(leave_type_config.extra)['leave_types']
        summary = json.dumps({leave_type['name']: 0 for leave_type in leave_types}, indent=2)

        mask_name = '__{}'.format(year)
        (leave_mask, _) = LeaveMask.objects.get_or_create(name=mask_name)
        leave_mask.value = ''.join(mask)
        leave_mask.summary = summary
        leave_mask.save()

        success = []
        failed = []
        for user in User.objects.all():
            try:
                mask = get_mask(user=user.username, year=year)
                leaves = Leave.objects.filter(user=user.username,
                                            year=year,
                                            status='approved',
                                            active=True)

                # assumption: base_mask exists for every year leave request exist
                base_mask = get_mask(user='_', year=year)
                mask.value = base_mask.value
                mask.summary = base_mask.summary
                accumulate_mask(mask, leaves)
                
                success.append({'user': user.username}) 

            except Exception as e:
                failed.append({'user': user.username, 'error': str(e)})

        ret = {
            'year': year,
            'success': success,
            'failed': failed,
        }
        return Response(ret)
