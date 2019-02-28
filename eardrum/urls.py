"""eardrum URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
import os

from django.contrib import admin
from django.urls import (
    path,
    include,
)
from django.conf.urls import url
from django.views.generic import TemplateView
from django.conf import settings

from rest_framework_jwt import views as jwt_views
from rest_framework_swagger.views import get_swagger_view
from rest_framework import routers

from review import views as review_viewsets
from config import views as config_viewsets

swagger_schema_view = get_swagger_view(title='Eardrum API', url='/')
router = routers.DefaultRouter()
router.register('requests', review_viewsets.RequestViewSet)
router.register('configs', config_viewsets.ConfigViewset)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    url(r'^markdownx/', include('markdownx.urls')),
    url(r'^swagger/', swagger_schema_view),
    path('api-token-auth/', jwt_views.obtain_jwt_token),
    path('api-auth', include('rest_framework.urls', namespace='rest_framework')),
    url('^(?!api)', TemplateView.as_view(template_name='frontend/index.html')),
]
