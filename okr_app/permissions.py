from rest_framework.permissions import BasePermission

class IsApplicationAdminUser(BasePermission):
    def has_permission(self, request, view):
        admin_group_name = 'okr_admin'
        if not request.user.is_authenticated:
          return False
        if request.user.groups.filter(name=admin_group_name).exists():
           return True
        return False
