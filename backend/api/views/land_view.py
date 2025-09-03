from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from api.models import Land
from api.serializers.land_serializer import LandSerializer

class LandViewSet(viewsets.ModelViewSet):
    queryset = Land.objects.all()
    serializer_class = LandSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only lands from the user's account
        return Land.objects.filter(account=self.request.user.userprofile.account)

    def perform_create(self, serializer):
        # Automatically assign the user's account on creation
        serializer.save(account=self.request.user.userprofile.account)