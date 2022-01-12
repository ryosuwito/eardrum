import os


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Uncomment these settings for production
#
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql',
#         'NAME': os.environ.get('POSTGRES_DB'),
#         'USER': os.environ.get('POSTGRES_USER'),
#         'PASSWORD': os.environ.get('POSTGRES_PASSWORD'),
#         'HOST': 'eardrum_db',
#         'PORT': '5432',
#         'CONN_MAX_AGE': 3600,
#     }
# }
# ALLOWED_HOSTS = [os.environ.get('NGINX_SERVER_NAME')]

# Uncomment these settings for development
#
# SECRET_KEY = 'SECRET_KEY'
#
# DEBUG = True
#
# ALLOWED_HOSTS = ['*']
#
# STATIC_ROOT = os.path.join(BASE_DIR, 'assets/static/')
# MEDIA_ROOT = os.path.join(BASE_DIR, 'assets/media/')
# MEDIA_URL = "/media/"
#
# For Real SMTP email backend
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# For Development email backend
# EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# EMAIL_HOST = ''
# EMAIL_HOST_USER = ''
# EMAIL_HOST_PASSWORD = ''
# EMAIL_PORT = ''
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
