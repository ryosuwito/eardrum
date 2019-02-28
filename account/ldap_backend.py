import logging
import pam

from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponseBadRequest

logger = logging.getLogger(__name__)


class LDAPBackend():
    """
    LDAPBackend
    """
    MODEL_BACKEND = ModelBackend()

    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None or password is None:
            return HttpResponseBadRequest

        authenticated = pam.pam().authenticate(username, password)        
        if not authenticated:
            return None

        try:
            user = User.objects.get(username=username)
        except ObjectDoesNotExist:
            logger.info("Save user {} into database")
            user = User(username=username, password=password, email="{}@dytechlab.com".format(username))
            user.save()

        return user

    def get_user(self, user_id):
        return MODEL_BACKEND.get_user(user_id)


