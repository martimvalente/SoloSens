from rest_framework import serializers
from api.models import WeatherForecast

class WeatherForecastSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeatherForecast
        fields = '__all__'
        read_only_fields = ['id', 'raw_data']
