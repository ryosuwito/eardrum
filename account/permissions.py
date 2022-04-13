from rest_framework.permissions import (
    IsAdminUser as RF_IsAdminUser,
    IsAuthenticated as RF_IsAuthenticated,
    BasePermission,
)


class IsAuthenticated(RF_IsAuthenticated):
    pass


class IsAdminUser(RF_IsAdminUser):
    is_authenticated_perm = IsAuthenticated()

    def has_permission(self, request, view):
        # IsAuthenticated
        if not self.is_authenticated_perm.has_permission(request, view):
            return False

        return request.user.is_superuser


class IsReviewer(BasePermission):
    is_authenticated_perm = IsAuthenticated()
    is_admin_perm = IsAdminUser()

    def has_object_permission(self, request, view, obj):
        # IsAdmin
        if self.is_admin_perm.has_permission(request, view):
            return True

        # IsAuthenticated
        if not self.is_authenticated_perm.has_permission(request, view):
            return False

        return obj.reviwer == request.user
