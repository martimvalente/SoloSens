import requests
from django.conf import settings

OPENWEATHER_API_KEY = settings.OPENWEATHER_API_KEY  # Put this in your settings.py
OPENWEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"


def fetch_weather_for_coordinates(lat, lon):
    """
    Fetch current weather data from OpenWeatherMap based on latitude and longitude.
    """
    params = {
        "lat": lat,
        "lon": lon,
        "appid": OPENWEATHER_API_KEY,
        "units": "metric"  # or 'imperial' if needed
    }

    response = requests.get(OPENWEATHER_URL, params=params)
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"OpenWeatherMap error {response.status_code}: {response.text}")
