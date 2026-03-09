from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        elif hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'dog'):
            return obj.dog.owner == request.user
        return False


class IsSuperAdmin(permissions.BasePermission):
    """
    Only allow superadmins (role='superadmin') or Django superusers.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        return (
            hasattr(request.user, 'profile') and
            request.user.profile.role == 'superadmin'
        )


class IsBreeder(permissions.BasePermission):
    """
    Custom permission to only allow breeders.
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            hasattr(request.user, 'profile') and
            request.user.profile.role == 'breeder'
        )


class IsTrainer(permissions.BasePermission):
    """
    Custom permission to only allow trainers.
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            hasattr(request.user, 'profile') and
            request.user.profile.role == 'trainer'
        )


class IsBreederOrSuperAdmin(permissions.BasePermission):
    """Allow breeders and superadmins only."""
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        if not hasattr(request.user, 'profile'):
            return False
        return request.user.profile.role in ('breeder', 'superadmin')


class IsTrainerOrSuperAdmin(permissions.BasePermission):
    """Allow trainers and superadmins only."""
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        if not hasattr(request.user, 'profile'):
            return False
        return request.user.profile.role in ('trainer', 'superadmin')
