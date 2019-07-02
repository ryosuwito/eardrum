import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql',
#         'NAME': 'eardrum',
#         'USER': 'ado',
#         'PASSWORD': '',
#         'HOST': 'localhost',
#         'PORT': '5432',
#         'CONN_MAX_AGE': 3600,
#     }
# }


# SECRET_KEY = 'SECRET_KEY'

# DEBUG = True

# ALLOWED_HOSTS = []

# STATIC_ROOT = 'asset/static/'
# MEDIA_ROOT = 'asset/media/'


# Uncomment these settings for development
#
# STATICFILES_DIRS = (
#     # We do this so that django's collectstatic copies or our bundles to the
#     # STATIC_ROOT or syncs them to whatever storage we use.
#     os.path.join(BASE_DIR, 'frontend', 'dist', 'static'),
# )
#
# WEBPACK_LOADER = {
#     'DEFAULT': {
#         'BUNDLE_DIR_NAME': '',
#         'STATS_FILE': os.path.join(BASE_DIR, 'frontend', 'webpack-stats.json'),
#     }
# }
