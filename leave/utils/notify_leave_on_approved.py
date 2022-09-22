from django.contrib.auth.models import User
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
        if leave.status != "approved":
            continue
        try:
            user = User.objects.get(username=leave.user)
            start_date = datetime.strptime(leave.startdate, "%Y%m%d")
            end_date = datetime.strptime(leave.enddate, "%Y%m%d")
            half_first = ""
            half_last = ""
            if leave.half == "10":
                half_first = "afternoon off on first day"
            elif leave.half == "01":
                half_last = "morning off on last day"
            elif leave.half == "11":
                half_first = "afternoon off on first day, morning off on last day"
            same_date = False
            if start_date == end_date:
                same_date = True
            data = {
                "username": user.username,
                "start_date": start_date.strftime("%d/%b/%Y"),
                "end_date": end_date.strftime("%d/%b/%Y"),
                "typ": leave.typ,
                "half_first": half_first,
                "half_last": half_last,
                "note": leave.note,
                "same_date": same_date
            }
            recipient_list = ["{}@{}".format(user.username, settings.DEFAULT_EMAIL_DOMAIN)]
        except Exception as e:
            print(e)
            continue
        context = {"data": data}
        subject = "Leave Request Has Been Approved".format(leave.typ)
        try:
            rendered = render_to_string('email_draft/notify_leave_on_approved.html', context=context)
            from_email = settings.DEFAULT_FROM_EMAIL
            body = render_to_string('email_draft/notify_leave_on_approved.txt', context=context)
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
    return "OK"
