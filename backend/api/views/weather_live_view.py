from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from api.models import Land
from api.services.openweather_service import fetch_weather_for_coordinates

class LiveWeatherView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, land_id):
        try:
            land = Land.objects.get(id=land_id)
        except Land.DoesNotExist:
            return Response({'detail': 'Land not found'}, status=status.HTTP_404_NOT_FOUND)

        if land.account != request.user.userprofile.account:
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        try:
            weather_data = fetch_weather_for_coordinates(land.latitude, land.longitude)
            return Response(weather_data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)
