from django.contrib.auth.models import User
from django.template.loader import render_to_string
from leave.models import Leave
from datetime import datetime
from django.core.mail import EmailMultiAlternatives
from django.conf import settings


def handle(leaves=None):
    now = datetime.now().strftime("%Y%m%d")
    if not leaves:
        leaves = Leave.objects.\
            filter(startdate__lte=now, enddate__gte=now, status="approved").\
            exclude(typ="work_from_home")
    data = None
    for leave in leaves:
        try:
            user = User.objects.get(username=leave.user)
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
            data = {
                "username": user.username,
                "start_date": start_date.strftime("%d/%b/%Y"),
                "end_date": end_date.strftime("%d/%b/%Y"),
                "now": datetime.now().strftime("%d/%b/%Y"),
                "leave_type": leave.typ,
                "half_first": half_first,
                "half_last": half_last,
                "on_start_date": on_start_date,
                "on_end_date": on_end_date
            }
            recipient_list = ["{}@{}".format(x.username, settings.DEFAULT_EMAIL_DOMAIN) for x in
                              user.mentorship.teammate.all()] + \
                             ["{}@{}".format(x.username, settings.DEFAULT_EMAIL_DOMAIN) for x in
                              user.mentorship.mentor.all()]
        except Exception as e:
            print(e)
            continue
        context = {"data": data}
        if start_date.date() == end_date.date():
            subject = "{} Leave of Absence on {}".format(user.username, start_date)
        else:
            subject = "{} Leave of Absence from {} to {}".format(user.username, start_date, end_date)
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
            print(e)
    return "OK"
