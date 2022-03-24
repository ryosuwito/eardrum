from rest_framework.permissions import BasePermission


class IsApplicationAdminUser(BasePermission):
    ADMIN_GROUP_NAME = 'performance_admin'

    def has_permission(self, request, view):
        admin_group_name = IsApplicationAdminUser.ADMIN_GROUP_NAME

        if not request.user.is_authenticated:
            return False

        if request.user.groups.filter(name=admin_group_name).exists():
            return True

        return False


class IsReviewer(BasePermission):
    def has_object_permission(self, request, view, req):
        return req.reviewer.id == request.user.id
