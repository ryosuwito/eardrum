import json
import datetime
import calendar
from collections import Counter

from .models import (
    LeaveMask,
    ConfigEntry,
)


def mask_from_holiday(year, holidays):
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

    return ''.join(mask)


def get_mask(user, year):
    mask_name = "{user}_{year}".format(user=user, year=year)
    base_mask = get_base_mask(year)
    mask, _ = LeaveMask.objects.get_or_create(name=mask_name,
                                              defaults={'value': base_mask.value,
                                                        'summary': base_mask.summary,
                                                        'capacity': base_mask.capacity})
    return mask


def get_base_mask(year):
    try:
        return LeaveMask.objects.get(name="__{}".format(year))
    except LeaveMask.DoesNotExist:
        try:
            holidays = ConfigEntry.objects.get(name="holidays_{}".format(year)).extra.split()
        except ConfigEntry.DoesNotExist:
            holidays = []
        value = mask_from_holiday(year, holidays)

        leave_types = get_leave_types()
        summary = json.dumps({leave_type['name']: 0 for leave_type in leave_types}, indent=2)

        capacity = '{}'

        defaults = {
            'value': value,
            'summary': summary,
            'capacity': capacity,
        }

        mask, _ = LeaveMask.objects.get_or_create(name="__{}".format(year), defaults=defaults)
        return mask


def accumulate_mask(mask, leave_requests):
    leave_types = get_leave_types()

    arr = list(mask.value)

    type_to_priority = {leave_type['name']: leave_type['priority'] for leave_type in leave_types}

    for leave_request in leave_requests:
        # represent every day with 2 characters, each for the morning and afternoon shift
        start = datetime.datetime.strptime(leave_request.startdate, '%Y%m%d').timetuple().tm_yday
        start = 2 * (start - 1) + (leave_request.half[0] == "1")
        end = datetime.datetime.strptime(leave_request.enddate, '%Y%m%d').timetuple().tm_yday
        end = 2 * (end - 1) + (leave_request.half[1] == "0")

        priority = type_to_priority[leave_request.typ]

        # '-': work day
        # '0': holiday/weekend
        # otherwise: on leave, the representing character is the same as the leave type's priority,
        #            lower priority value means higher priority
        for i in range(start, end + 1):
            if arr[i] == '-' or int(arr[i]) > priority:
                arr[i] = str(priority)

    count = Counter(arr)
    summary = {leave_type['name']: count.get(str(type_to_priority[leave_type['name']]), 0) / 2
               for leave_type in leave_types}

    mask.value = ''.join(arr)
    mask.summary = json.dumps(summary, indent=2)
    mask.save(update_fields=['value', 'summary'])


def get_leave_types():
    leave_type_config = ConfigEntry.objects.get(name='leave_context')
    return json.loads(leave_type_config.extra)['leave_types']
