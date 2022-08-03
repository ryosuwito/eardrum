from django.contrib.auth.models import User
from django.utils import timezone
from django.template.loader import render_to_string
from leave.models import Leave
from datetime import datetime
from django.core.mail import EmailMultiAlternatives
from django.conf import settings

def handle(leaves=None):
    now = datetime.now().strftime("%Y%m%d")
    if not leaves:
        leaves = Leave.objects.filter(startdate=now)
    data = None
    for leave in leaves:
        try:
            user = User.objects.get(username=leave.user)
            start_date = datetime.strptime(leave.startdate, "%Y%m%d")
            end_date = datetime.strptime(leave.enddate, "%Y%m%d")
            data = {
                "username" : user.username,
                "start_date" : start_date.strftime("%d/%b/%Y"),
                "end_date" : end_date.strftime("%d/%b/%Y"),
                "leave_type" : leave.typ
            }
            recipient_list = ["{}@{}".format(x.username,settings.DEFAULT_EMAIL_DOMAIN) for x in
                user.mentorship.teammate.all()
            ]
        except:
            continue
        context = {"data": data}
        subject = "Teammate {} on leave".format(user.username)
        try:
            rendered = render_to_string('email_draft/notify_leave_teammates.html', context=context)
            from_email = settings.DEFAULT_FROM_EMAIL
            body = render_to_string('email_draft/notify_leave_teammates.txt', context=context)
            message = EmailMultiAlternatives(
                subject,
                body,
                from_email,
                recipient_list,
            )
            message.attach_alternative(rendered, "text/html")
            message.send()
        except Exception as e:
            pass
    return "OK"