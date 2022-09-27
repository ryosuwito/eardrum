from django.contrib.auth.models import User
from django.template.loader import render_to_string
from datetime import datetime, timedelta
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from leave.utils.capacity import (
        get_capacity,
        get_leave_spent
    )


def handle(leaves=None):
    data = None
    for leave in leaves:
        try:
            user = User.objects.get(username=leave.user)
            capacity = get_capacity(user)[user.username]
            spent = get_leave_spent(user)[0]
            print(capacity)
            print(spent)
            if "htan" in [x.username for x in user.mentorship.mentor.all()]:
                continue
            start_date = datetime.strptime(leave.startdate, "%Y%m%d")
            end_date = datetime.strptime(leave.enddate, "%Y%m%d")
            half_day = ""
            reduce = 0
            if leave.half == "10":
                reduce = 0.5
                half_day = "afternoon off on first day"
            elif leave.half == "01":
                reduce = 0.5
                half_day = "morning off on last day"
            elif leave.half == "11":
                reduce = 1
                half_day = "afternoon off on first day, morning off on last day"
            elif leave.half == "00":
                reduce = 0
                half_day = "full day"
            same_date = False
            if start_date == end_date:
                same_date = True

            def daterange(date1, date2):
                for n in range(int((date2 - date1).days)+1):
                    yield date1 + timedelta(n)
            span = 0
            for dt in daterange(start_date, end_date):
                if dt.weekday() not in [5, 6]:
                    span += 1
                    print(dt.strftime("%Y-%m-%d"))
            span -= reduce

            data = {
                "username": user.username,
                "start_date": start_date.strftime("%d/%b/%Y"),
                "end_date": end_date.strftime("%d/%b/%Y"),
                "typ": leave.typ,
                "half_day": half_day,
                "same_date": same_date,
                "reason": leave.note,
                "spent": spent[leave.typ],
                "span": span,
                "capacity": capacity[leave.typ]
            }
            recipient = [user.username]
            additional_recipient = ["htan", "wkoh", "zlok", "ysheng"]
            recipient = [x for x in recipient if x not in additional_recipient]
            if len(recipient) == 0:
                recipient = ["htan"]
                additional_recipient = additional_recipient[1:]
            recipient_list = ["{}@{}".format(x, settings.DEFAULT_EMAIL_DOMAIN) for x in recipient]
            bcc_recipient_list = ["{}@{}".format(x, settings.DEFAULT_EMAIL_DOMAIN) for x in additional_recipient]
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
                bcc=bcc_recipient_list
            )
            message.attach_alternative(rendered, "text/html")
            message.send()
        except Exception as e:
            print(e)
            return
    return "OK"
