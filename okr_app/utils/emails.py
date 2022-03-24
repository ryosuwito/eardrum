from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string


def notify_mentor(request, okr, settings):
    if okr and hasattr(okr.issuer, 'mentorship'):
        recipient_list = ["{}@{}".format(x, settings.DEFAULT_EMAIL_DOMAIN) for x in
                          okr.issuer.mentorship.mentor.values_list('username', flat=True)]
        username = okr.issuer.username
        subject = "{}_Q{}_{}_okr".format(username, okr.quarter, okr.year)
        files = []
        if okr.files.all():
            for f in okr.files.all():
                file_url = request.build_absolute_uri(f.file.url)
                file_name = f.file.name.split("/")[-1]
                files.append({"url": file_url, "name": file_name})
        context = {"username": username, "okr": okr, "files": files}
        try:
            rendered = render_to_string('email_draft/notify_okr.html', context=context)
            from_email = settings.DEFAULT_FROM_EMAIL
            body = render_to_string('email_draft/notify_okr.txt', context=context)
            message = EmailMultiAlternatives(
                subject,
                body,
                from_email,
                recipient_list,
                cc=["{}@{}".format(okr.issuer.username, settings.DEFAULT_EMAIL_DOMAIN)],
            )
            message.attach_alternative(rendered, "text/html")
            message.send()
        except Exception:
            return False
        return True
    else:
        return False
