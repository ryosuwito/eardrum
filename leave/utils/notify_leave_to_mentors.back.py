from django.contrib.auth.models import User
from django.template.loader import render_to_string
from datetime import datetime
from django.core.mail import EmailMultiAlternatives
from django.conf import settings


def handle(leaves=None):
    data = None
    for leave in leaves:
        if leave.typ == "work_from_home":
            continue
        if datetime.strptime(leave.startdate, "%Y%m%d").date() < datetime.today().date():
            continue
        htan = User.objects.filter(username='htan').first()
        try:
            user = User.objects.get(username=leave.user)
            if htan in user.mentorship.mentor.all():
                continue
            hr_list = User.objects.filter(mentorship__department="HR")
            start_date = datetime.strptime(leave.startdate, "%Y%m%d")
            end_date = datetime.strptime(leave.enddate, "%Y%m%d")
            half_day = ""
            if leave.half == "10":
                half_day = "afternoon only"
            elif leave.half == "01":
                half_day = "morning only"
            same_date = False
            if start_date == end_date:
                same_date = True
            data = {
                "username": user.username,
                "start_date": start_date.strftime("%d/%b/%Y"),
                "end_date": end_date.strftime("%d/%b/%Y"),
                "leave_type": leave.typ,
                "half_day": half_day,
                "same_date": same_date
            }
            recipient = [x.username for x in user.mentorship.mentor.all()]
            hr_recipient = [x.username for x in hr_list]
            recipient.extend(hr_recipient)
            additional_recipient = ["htan", "wkoh", "zlok", "ysheng"]
            recipient.extend(additional_recipient)
            recipient = set(recipient)
            recipient_list = ["{}@{}".format(x, settings.DEFAULT_EMAIL_DOMAIN) for x in recipient]
        except Exception as e:
            print(e)
            continue
        context = {"data": data}
        subject = "Leave Request from {}".format(user.username)
        try:
            rendered = render_to_string('email_draft/notify_leave_on_create.html', context=context)
            from_email = settings.DEFAULT_FROM_EMAIL
            body = render_to_string('email_draft/notify_leave_on_create.txt', context=context)
            message = EmailMultiAlternatives(
                subject,
                body,
                from_email,
                recipient_list,
            )
            message.attach_alternative(rendered, "text/html")
            message.send()
        except Exception as e:
            print(e)
            return
    return "OK"
