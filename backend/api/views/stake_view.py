from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from api.models import Stake
from api.serializers.stake_serializer import StakeSerializer
from api.permissions import IsAccountMember

class StakeViewSet(viewsets.ModelViewSet):
    serializer_class = StakeSerializer
    permission_classes = [IsAuthenticated, IsAccountMember]

    def get_queryset(self):
        return Stake.objects.filter(land__account=self.request.user.userprofile.account)

    def perform_create(self, serializer):
        # Optional: ensure stake is tied to a land within this user's account
        land = serializer.validated_data.get('land')
        if land.account != self.request.user.userprofile.account:
            raise PermissionDenied("You cannot create a stake for this land.")
        serializer.save()
