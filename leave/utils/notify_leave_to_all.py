from django.contrib.auth.models import User
from django.template.loader import render_to_string
from leave.models import Leave
from datetime import datetime
from django.core.mail import EmailMultiAlternatives
from django.conf import settings


def handle():
    weekno = datetime.today().weekday()
    if weekno > 5:
        print("Weekend")
        return
    now = datetime.now().strftime("%Y%m%d")
    leaves = Leave.objects.\
        filter(startdate__lte=now, enddate__gte=now, status="approved").\
        exclude(typ="work_from_home")
    data = []
    departments = {
        'HR': 'HR',
        'SA': 'System Admin',
        'OP': 'Operations',
    }
    for leave in leaves:
        try:
            user = User.objects.get(username=leave.user)
            if user.mentorship.department not in list(departments.keys()):
                continue
            start_date = datetime.strptime(leave.startdate, "%Y%m%d")
            end_date = datetime.strptime(leave.enddate, "%Y%m%d")
            half_first = ""
            half_last = ""
            if leave.half == "10":
                half_first = "afternoon"
            elif leave.half == "01":
                half_last = "morning"
            elif leave.half == "11":
                half_first = "afternoon"
                half_last = "morning"
            elif leave.half == "00":
                half_first = "full day"
                half_last = "full day"
            on_start_date = False
            on_end_date = False
            if start_date.date() == datetime.now().date():
                on_start_date = True
            if end_date.date() == datetime.now().date():
                on_end_date = True
            data.append({
                "start_date": start_date.strftime("%d/%b/%Y"),
                "end_date": end_date.strftime("%d/%b/%Y"),
                "now": datetime.now().strftime("%d/%b/%Y"),
                "username": user.username,
                "department": departments[user.mentorship.department],
                "half": leave.half,
                "half_first": half_first,
                "half_last": half_last,
                "on_start_date": on_start_date,
                "on_end_date": on_end_date
            })
        except Exception as e:
            print(e)
            pass
    if not data:
        return "Nothing to process"
    context = {"data": data}
    recipient_list = ["all@{}".format(settings.DEFAULT_EMAIL_DOMAIN)]
    subject = "Colleagues from Sysadmin/HR/Ops team on Leave today"
    try:
        rendered = render_to_string('email_draft/notify_leave.html', context=context)
        from_email = settings.DEFAULT_FROM_EMAIL
        body = render_to_string('email_draft/notify_leave.txt', context=context)
        message = EmailMultiAlternatives(
            subject,
            body,
            from_email,
            recipient_list,
        )
        message.attach_alternative(rendered, "text/html")
        message.send()
    except Exception as e:
        return str(e)
    return "OK"
