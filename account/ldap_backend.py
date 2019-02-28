import logging

from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponseBadRequest
from django.conf import settings

from ldap3 import (
    Server,
    Connection,
    ALL,
)
from ldap3.core.exceptions import LDAPBindError

logger = logging.getLogger(__name__)


class LDAPBackend:
    """
    LDAPBackend
    """
    MODEL_BACKEND = ModelBackend()

    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None or password is None:
            return HttpResponseBadRequest

        try:
            server = Server(
                getattr(settings, 'LDAP_SERVER', '10.0.0.201'),
                get_info=ALL,
            )
            Connection(
                server,
                'cn={}, ou=People, dc=dtl'.format(username),
                password,
                auto_bind=True,
            )
        except LDAPBindError:
            logger.info('Sign in failed with username={}'.format(username))
            return None

        try:
            user = User.objects.get(username=username)
        except ObjectDoesNotExist:
            logger.info("Save user {} into database")
            user = User(username=username, password='', email="{}@dytechlab.com".format(username))
            user.save()

        return user if LDAPBackend.MODEL_BACKEND.user_can_authenticate(user) else None

    def get_user(self, user_id):
        return LDAPBackend.MODEL_BACKEND.get_user(user_id)


