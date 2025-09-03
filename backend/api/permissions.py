from rest_framework.permissions import BasePermission


class IsAccountMember(BasePermission):
    """
    Allows access only to users accessing objects in their own account.
    """

    def has_object_permission(self, request, view, obj):
        user_profile = getattr(request.user, 'userprofile', None)
        if not user_profile:
            return False

        # Direct account check
        if hasattr(obj, 'account'):
            return obj.account == user_profile.account

        # Stake: check stake.land.account
        if hasattr(obj, 'land') and hasattr(obj.land, 'account'):
            return obj.land.account == user_profile.account

        # Reading: check reading.stake.land.account
        if hasattr(obj, 'stake') and hasattr(obj.stake, 'land'):
            return obj.stake.land.account == user_profile.account

        return False



class HasValidAPIKey(BasePermission):
    def has_permission(self, request, view):
        return request.auth is not None