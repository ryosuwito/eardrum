from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string

from rest_framework import (viewsets, mixins)
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import (IsAuthenticated, IsAdminUser)
from rest_framework.response import Response

from .serializers import (OKRSerializer, OKRFileSerializer, LightOKRSerializer)
from .models import OKR, OKRFile
from .permissions import IsApplicationAdminUser, IsOKROwner, IsMentor
# Create your views here.


class OKRViewset(viewsets.GenericViewSet,
                 mixins.CreateModelMixin,
                 mixins.RetrieveModelMixin,
                 mixins.ListModelMixin,
                 mixins.DestroyModelMixin,
                 mixins.UpdateModelMixin):
    """
    """
    permission_classes = [IsAuthenticated]
    serializer_class = OKRSerializer
    queryset = OKR.objects.all()

    def check_okr_permission(self, okr):
        return (IsApplicationAdminUser().has_permission(self.request, self) or
                IsOKROwner().has_object_permission(self.request, None, okr))

    def get_queryset(self):
        """
        """
        if IsApplicationAdminUser.has_permission(None, self.request, self):
            return self.queryset.all()
        else:
            mentees_okr_queryset = OKR.objects.filter(issuer__mentorship__mentor=self.request.user)
            return (self.request.user.okr_set.all() | mentees_okr_queryset).distinct()

    def get_serializer_class(self):
        if self.action == 'list':
            return LightOKRSerializer
        else:
            return self.serializer_class

    def create(self, request, *args, **kwargs):
        request.data['issuer'] = request.user.username
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if not IsAdminUser.has_permission(None, request, self):
            if request.data.get('issuer', None):
                del request.data['issuer']
        return super().update(request, *args, **kwargs)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated, IsOKROwner])
    def notify(self, request, *args, **kwargs):
        okr = self.get_object()
        if okr and hasattr(self.request.user, 'mentorship'):
            recipient_list = ["{}@{}".format(x, settings.DEFAULT_EMAIL_DOMAIN) for x in
                              self.request.user.mentorship.mentor.values_list('email', flat=True)]
            username = self.request.user.username
            subject = "{}_Q{}_{}_okr".format(username, okr.quarter, okr.year)
            context = {"username": username, "okr": okr}
            rendered = render_to_string('email_draft/notify_okr.html', context=context)
            from_email = settings.DEFAULT_FROM_EMAIL
            body = "Hi, {} has uploaded an OKR for Q{}_{}.".format(username, okr.quarter, okr.year)
            message = EmailMultiAlternatives(
                subject,
                body,
                from_email,
                recipient_list,
                cc=["{}@{}".format(self.request.user.username, settings.DEFAULT_EMAIL_DOMAIN)],
            )
            if okr.files.all():
                for f in okr.files.all():
                    message.attach_file(f.file.path)
            message.attach_alternative(rendered, "text/html")
            message.send()
            return Response({"success": True})
        else:
            raise PermissionDenied({"error": "Not OKR owner."})


class OKRFileViewset(viewsets.GenericViewSet,
                     mixins.CreateModelMixin,
                     mixins.DestroyModelMixin,
                     mixins.RetrieveModelMixin,
                     mixins.ListModelMixin):
    """
    """
    permission_classes = [IsAuthenticated]
    serializer_class = OKRFileSerializer
    queryset = OKRFile.objects.all()

    def check_okr_permission(self, okr):
        return (IsApplicationAdminUser().has_permission(self.request, self) or
                IsOKROwner().has_object_permission(self.request, None, okr) or
                IsMentor().has_object_permission(self.request, None, okr))

    def get_queryset(self):
        okr = None
        if self.request.GET.get("okr", None):
            okr = get_object_or_404(OKR, pk=self.request.GET.get("okr", None))
        elif self.kwargs.get("pk", None):
            okr = get_object_or_404(OKR, files=self.kwargs['pk'])

        if okr and self.check_okr_permission(okr):
            return self.queryset.filter(okr_id=okr.id)

        return self.queryset.none()

    def create(self, request, *args, **kwargs):
        okr = get_object_or_404(OKR, pk=request.data['okr'])
        if okr and self.check_okr_permission(okr):
            return super().create(request, *args, **kwargs)
        else:
            raise PermissionDenied({"error": "Not OKR owner."})
