import datetime
import calendar
import json
from collections import namedtuple

from django.core.management.base import (
    BaseCommand,
)

from leave.models import ConfigEntry, LeaveMask


class Command(BaseCommand):
    help = "Create config for a year"

    def add_arguments(self, parser):
        current_year = datetime.datetime.now().year
        YEAR_CHOICES = [current_year + add - 5 for add in range(11)]
        parser.add_argument('year', type=int, choices=YEAR_CHOICES)

    def handle(self, *args, **options):
        year = options['year']
        self.stdout.write('[INFO] Initialize database config for year ' + str(year))

        LeaveType = namedtuple('LeaveType', ['name', 'label', 'limitation', 'priority'])
        LeaveStatus = namedtuple('LeaveStatus', ['name', 'label'])
        # leave context
        leave_context_name = 'leave_context'
        if ConfigEntry.objects.filter(name=leave_context_name).count() == 0:
            leave_context_config = ConfigEntry(name=leave_context_name)
            leave_context = {
                'leave_types': [
                    LeaveType('personal', 'Personal', 15, 5)._asdict(),
                    LeaveType('medical', 'Medical', 14, 2)._asdict(),
                    LeaveType('compassionate', 'Compassionate', 99, 1)._asdict(),
                    LeaveType('childcare', 'Childcare', 14, 3)._asdict(),
                    LeaveType('work_from_home', 'Work From Home', 12, 4)._asdict(),
                ],
                'leave_statuses': [
                    LeaveStatus('pending', 'pending')._asdict(),
                    LeaveStatus('approved', 'approved')._asdict(),
                    LeaveStatus('rejected', 'rejected')._asdict(),
                ],
            }
            leave_context_config.extra = json.dumps(leave_context, indent=2)
            leave_context_config.save()
            self.stdout.write(self.style.SUCCESS('ConfigEntry[name={}] is created'.format(leave_context_name)))

        # leave types for a specific year
        leave_type_name = 'leave_type_{}'.format(year)
        if ConfigEntry.objects.filter(name=leave_type_name).count() == 0:
            leave_type_config = ConfigEntry(name=leave_type_name)
            leave_types = [
                LeaveType('personal', 'Personal', 15, 5)._asdict(),
                LeaveType('medical', 'Medical', 14, 2)._asdict(),
                LeaveType('compassionate', 'Compassionate', 99, 1)._asdict(),
                LeaveType('childcare', 'Childcare', 14, 3)._asdict(),
                LeaveType('work_from_home', 'Work From Home', 12, 4)._asdict(),
            ]
            leave_type_config.extra = json.dumps(leave_types, indent=2)
            leave_type_config.save()
            self.stdout.write(self.style.SUCCESS('ConfigEntry[name={}] is created'.format(leave_type_name)))

        # holidays for a specific year
        holidays_name = 'holidays_{}'.format(year)
        if ConfigEntry.objects.filter(name=holidays_name).count() == 0:
            holidays_config = ConfigEntry(name=holidays_name)
            holidays_config.extra = '{}0101'.format(year)
            holidays_config.save()
            self.stdout.write(self.style.SUCCESS('ConfigEntry[name={}] is created'.format(holidays_name)))

        # base leave mask for a specific year
        mask_name = '__{}'.format(year)
        if LeaveMask.objects.filter(name=mask_name).count() == 0:
            holidays = ConfigEntry.objects.get(name="holidays_{}".format(year)).extra.split('\r\n')
            holidays_in_year = [datetime.datetime.strptime(item, '%Y%m%d').timetuple().tm_yday - 1
                                for item in holidays]
            first_sat = 6 - (datetime.datetime(year, 1, 1).weekday() + 1) % 7
            mask = ['-'] * ((366 if calendar.isleap(year) else 365) * 2)
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

            leave_mask = LeaveMask(name=mask_name, value=''.join(mask), summary=summary)
            leave_mask.save()
            self.stdout.write(self.style.SUCCESS('LeaveMask[name={}] is created'.format(mask_name)))
