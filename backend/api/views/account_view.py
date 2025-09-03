from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from api.models import Account
from api.permissions import IsAccountMember
from api.serializers.account_serializer import AccountSerializer



class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()  # Required by DRF router
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated, IsAccountMember]

    def get_queryset(self):
        user_profile = self.request.user.userprofile
        return Account.objects.filter(id=user_profile.account.id)

    def perform_update(self, serializer):
        if self.request.user != self.request.user.userprofile.account.admin:
            raise PermissionError("Only the account admin can update the account.")
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user != self.request.user.userprofile.account.admin:
            raise PermissionError("Only the account admin can delete the account.")
        instance.delete()
