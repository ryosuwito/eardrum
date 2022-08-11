
from datetime import datetime
import json
from leave.models import HolidayLeave
from account.models import Country
from leave.models import ConfigEntry
from leave.models import ProratedLeave
from leave_update.eardrum.account.models import LeaveRule


def get_extra(instance):
    extra = None
    ce = ConfigEntry.objects.filter(name="leave_type_{}".format(datetime.now().year)).first()
    if ce :
        extra = json.loads(ce.extra)

    pr = ProratedLeave.objects.filter(name="{}_leave_{}".format(instance.user.username, datetime.now().year)).first()
    if pr :
        extra = json.loads(pr.extra)
    return extra

def save_personal_extra(extra, instance):
    if not extra:
        return
    pr = ProratedLeave.objects.filter(name="{}_leave_{}".format(instance.user.username, datetime.now().year)).first()
    if not pr:
        ProratedLeave.objects.create(
            user=instance.user,
            name="{}_leave_{}".format(instance.user.username, datetime.now().year),
            extra=json.dumps(extra)
        )
    else :
        pr.extra = json.dumps(extra, indent=2)
        pr.save()
        
def update_singapore_holiday(instance=None):
    additional = 0
    if instance.country.country_code == "SG":
        hl = HolidayLeave.objects.get_or_create(user=instance.user, year=datetime.now().year)[0]
        sample = HolidayLeave.objects.filter(year = datetime.now().year).first()
        if sample:
            hl.days = sample.days
            hl.extra = sample.extra
            hl.save()
            additional = sample.days
    return additional

def update_children_amount(instance=None):
    if instance.children_birth_year:
        try:
            instance.children = len(instance.children_birth_year.split(";"))
            if len(instance.children_birth_year) > 0 and instance.children == 0:
                instance.children = 1
        except:
            pass
    else:
       instance.children = 0 

def update_work_pass(instance=None):
    singapore = Country.objects.get_or_create(name="Singapore", country_code="SG")[0]
    if instance.work_pass and instance.country != singapore:
        instance.work_pass = None

def update_join_date(instance=None):
    extra = None
    pro_rated_leaves = []
    ce = ConfigEntry.objects.filter(name="leave_type_{}".format(datetime.now().year)).first()
    if ce :
        extra = json.loads(ce.extra)
    if instance.join_date and extra:
        this_start_year = datetime.fromisoformat("{}-01-01 00:00:00".format(datetime.now().year))
        this_end_year = datetime.fromisoformat("{}-12-31 00:00:00".format(datetime.now().year))
        this_year_days = (this_end_year - this_start_year).days
        join_with_time = datetime(
            year=instance.join_date.year, 
            month=instance.join_date.month,
            day=instance.join_date.day,
        )
        delta = this_end_year - join_with_time
        for leave in extra:
            if leave["name"] == "personal":
                holiday = update_singapore_holiday(instance)
                additional = (delta.days/this_year_days) * (leave["limitation"] + holiday)
                final = round(additional*2) / 2 - holiday
                leave["limitation"] = final if final < leave["limitation"] else leave["limitation"]
            pro_rated_leaves.append(leave)
        save_personal_extra(pro_rated_leaves, instance)


def update_personal_childcare_leave(profile):
    days = 0 
    eligible_children = 0
    extra = get_extra(profile)
    pro_rated_leaves = []
    rule = LeaveRule.objects.filter(
                                    country=profile.country,
                                    work_pass = profile.work_pass,
                                    leave_type = "CC",
                                    year = datetime.now().year
                                    ).first()

    if not rule:
        rule = LeaveRule.objects.filter(
                                country=profile.country,
                                work_pass = profile.work_pass,
                                leave_type = "CC"
                                ).order_by("-updated_at").first()
    elif profile.children_birth_year:
        for birth_year in profile.children_birth_year.split(";"):
            if int(birth_year) + rule.children_max_age >= datetime.now().year:
                eligible_children += 1

    if eligible_children:
        days = eligible_children * rule.days
        days = days if days <= rule.max_days else rule.max_days
    for leave in extra:
        if leave["name"] == "childcare":
            leave["limitation"] = days
        pro_rated_leaves.append(leave)
    save_personal_extra(pro_rated_leaves, profile)
