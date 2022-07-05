from django.contrib.auth.models import User
from django.template.loader import render_to_string
from leave.models import Leave
from datetime import datetime
from django.core.mail import EmailMultiAlternatives
from django.conf import settings


def handle():
    now = datetime.now().strftime("%Y%m%d")
    leaves = Leave.objects.filter(startdate=now)
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
            data.append({
                "username": user.username,
                "department": departments[user.mentorship.department],
            })
        except Exception as e:
            print(e)
            pass
    if not data:
        return "Nothing to process"
    context = {"data": data}
    recipient_list = ["all@{}".format(settings.DEFAULT_EMAIL_DOMAIN)]
    subject = "HR/SysAdmin/OPs on leave"
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
