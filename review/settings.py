from django.conf import settings

from easydict import EasyDict


DEFAULT_SETTINGS = {
    # The number of hours that is used to close requests automatically
    'REQUEST_WILL_BE_CLOSED_AFTER': 3 * 24,
}


def get_config_of(key, default_value=None):
    return getattr(settings, key, default_value)


app_settings = EasyDict({k: get_config_of(k, v) for k, v in DEFAULT_SETTINGS.items()})
