from django.contrib.auth.models import User
from django.utils import timezone
from django.template.loader import render_to_string
from leave.models import Leave
from datetime import datetime
from django.core.mail import EmailMultiAlternatives
from django.conf import settings

def handle(leaves=None):
    data = None
    for leave in leaves:
        try:
            user = User.objects.get(username=leave.user)
            hr_list = User.objects.filter(mentorship__department="HR")
            start_date = datetime.strptime(leave.startdate, "%Y%m%d")
            end_date = datetime.strptime(leave.enddate, "%Y%m%d")
            data = {
                "username" : user.username,
                "start_date" : start_date.strftime("%d/%b/%Y"),
                "end_date" : end_date.strftime("%d/%b/%Y"),
                "leave_type" : leave.typ
            }
            recipient_list = ["{}@{}".format(x.username,settings.DEFAULT_EMAIL_DOMAIN) for x in
                user.mentorship.mentor.all()
            ]
            hr_recipient_list = ["{}@{}".format(x.username,settings.DEFAULT_EMAIL_DOMAIN) for x in
                hr_list
            ]
            recipient_list.extend(hr_recipient_list)
            recipient_list.append("htan@{}".format(settings.DEFAULT_EMAIL_DOMAIN))
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