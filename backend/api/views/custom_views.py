from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from rest_framework.generics import ListAPIView
from api.serializers.user_serializer import UserSerializer
from rest_framework import status
from api.models import UserProfile, Stake, Reading
from api.serializers.user_serializer import UserProfileSerializer
from api.serializers.reading_serializer import ReadingSerializer
from api.serializers.stake_serializer import StakeSerializer
from api.permissions import IsAccountMember
from api.models import UserProfile


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.userprofile
        except UserProfile.DoesNotExist:
            return Response({"detail": "User profile not found."}, status=400)

        return Response({
            "username": request.user.username,
            "email": request.user.email,
            "account_id": str(profile.account.id),  # 👈 added here
            "account_name": profile.account.name,
            "last_api_login": profile.last_api_login,
        })

class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        account = request.user.userprofile.account
        users = User.objects.filter(userprofile__account=account)
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

# ---- /lands/<id>/stakes/ ----
class StakesByLandView(ListAPIView):
    serializer_class = StakeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        land_id = self.kwargs['land_id']
        return Stake.objects.filter(land__id=land_id, land__account=self.request.user.userprofile.account)

# ---- /stakes/<id>/latest-reading/ ----
class StakeLatestReadingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, stake_id):
        try:
            stake = Stake.objects.get(id=stake_id)
        except Stake.DoesNotExist:
            return Response({'error': 'Stake not found'}, status=status.HTTP_404_NOT_FOUND)

        if stake.land.account != request.user.userprofile.account:
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        latest = Reading.objects.filter(stake=stake).order_by('-timestamp').first()
        if not latest:
            return Response({'detail': 'No readings'}, status=status.HTTP_404_NOT_FOUND)

        return Response(ReadingSerializer(latest).data)


class ReadingsByStakeView(ListAPIView):
    serializer_class = ReadingSerializer
    permission_classes = [IsAuthenticated, IsAccountMember]

    def get_queryset(self):
        stake_id = self.kwargs['stake_id']
        return Reading.objects.filter(
            stake_id=stake_id,
            stake__land__account=self.request.user.userprofile.account
        ).order_by('-timestamp')