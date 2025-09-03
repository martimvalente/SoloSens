from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from api.models import WeatherForecast
from api.serializers.weather_forecast_serializer import WeatherForecastSerializer
from api.permissions import IsAccountMember

class WeatherForecastViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = WeatherForecast.objects.all()
    serializer_class = WeatherForecastSerializer
    permission_classes = [IsAuthenticated, IsAccountMember]

    def get_queryset(self):
        return WeatherForecast.objects.filter(land__account=self.request.user.userprofile.account)
