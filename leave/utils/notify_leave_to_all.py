from django.contrib.auth.models import User
from django.template.loader import render_to_string
from leave.models import Leave
from datetime import datetime
from django.core.mail import EmailMultiAlternatives
from django.conf import settings


def handle():
    weekno = datetime.today().weekday()
    if weekno > 5:
        print ("Weekend")
        return
    now = datetime.now().strftime("%Y%m%d")
    leaves = Leave.objects.filter(startdate=now)
    data = []
    departments = {
        'HR': 'HR',
        'SA': 'System Admin',
        'OP': 'Operations',
    }
    for leave in leaves:
        if leave.status != "approved":
            continue
        try:
            user = User.objects.get(username=leave.user)
            if user.mentorship.department not in list(departments.keys()):
                continue
            half_day = ""
            if leave.half == "10":
                half_day = "afternoon off on first day"
            elif leave.half == "01":
                half_day = "morning off on last day"
            elif leave.half == "11":
                half_day = "afternoon off on first day, morning off on last day"
            elif leave.half == "00":
                half_day = "full day"
            data.append({
                "username": user.username,
                "department": departments[user.mentorship.department],
                "half_day": half_day
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
