from leave.helpers import (
    get_mask,
    get_leave_types,
)
from leave.models import (
    HolidayLeave,
    ProratedLeave,
    AdditionalLeave
)
from datetime import datetime
import json


def get_leave_spent(user):
    stats = []
    year = datetime.today().year
    mask = get_mask(user, year)
    data = json.loads(mask.summary)
    stat = {}
    for key, value in data.items():
        try:
            leave = AdditionalLeave.objects.get(
                year=year, user=user, typ=key
            )
        except Exception as e:
            print(e)
            leave = None
        if leave:
            stat[key] = value + leave.days
        else:
            stat[key] = value
    stats.append({**stat, 'user': user.username})
    return stats


def get_prorated_capacity(user, year, default_capacity):
    data = {}

    def capacity_of(user):
        mask = get_mask(user.username, year)
        return {**default_capacity, **json.loads(mask.capacity)}

    def prorated_capacity(extra):
        mask = get_mask(user.username, year)
        default_capacity = {leave_type['name']: leave_type['limitation'] for leave_type in extra}
        return {**default_capacity, **json.loads(mask.capacity)}

    data[user.username] = capacity_of(user)
    prorated = ProratedLeave.objects.filter(name="{}_leave_{}".format(user.username, year)).first()
    if prorated:
        data[user.username] = prorated_capacity(json.loads(prorated.extra))
    if user.mentorship and user.mentorship.country and user.mentorship.country.country_code == "SG":
        hl = HolidayLeave.objects.filter(user=user).first()
        if hl:
            data[user.username]["personal"] += hl.days
    if not user.mentorship.children:
        data[user.username]["childcare"] = 0
    data[user.username]["work_from_home"] = int(data[user.username]["work_from_home"] / 12)

    return data


def get_capacity(user):
    year = datetime.today().year
    leave_types = get_leave_types()
    default_capacity = {leave_type['name']: leave_type['limitation'] for leave_type in leave_types}
    data = get_prorated_capacity(user, year, default_capacity)
    return data
