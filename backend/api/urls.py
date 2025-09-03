from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from api.views.account_view import AccountViewSet
from api.views.user_view import UserProfileViewSet
from api.views.land_view import LandViewSet
from api.views.stake_view import StakeViewSet
from api.views.reading_view import ReadingViewSet
from api.views.reading_feed_view import ReadingFeedView  # ✅ NEW import
from api.views.weather_live_view import LiveWeatherView
from api.views.weather_forecast_view import WeatherForecastViewSet
from api.views.reading_ingest_view import ReadingIngestView
from api.views.health_check_view import HealthCheckView
from api.views.ipma_evapo_view import EvapotranspirationView
from api.views.custom_views import (
    MeView,
    UserListView,
    StakesByLandView,
    StakeLatestReadingView,
    ReadingsByStakeView
)

router = DefaultRouter()
router.register(r'accounts', AccountViewSet,  basename='account')
router.register(r'users', UserProfileViewSet, basename='userprofile')
router.register(r'lands', LandViewSet, basename='land')
router.register(r'stakes', StakeViewSet, basename='stake')
router.register(r'readings', ReadingViewSet, basename="reading")
router.register(r'forecasts', WeatherForecastViewSet, basename='meteo')

urlpatterns = [
    path('api/v1/readings/ingest/', ReadingIngestView.as_view(), name='reading-ingest'),
    path('api/v1/readings/feed/', ReadingFeedView.as_view(), name='reading-feed'),
    path('api/v1/stakes/<uuid:stake_id>/readings/', ReadingsByStakeView.as_view(), name='stake-readings'),
    path('api/v1/lands/<uuid:land_id>/live-weather/', LiveWeatherView.as_view(), name='live-weather'),
    path('api/v1/lands/<uuid:land_id>/evapotranspiration/', EvapotranspirationView.as_view(), name='evapo'),
    path('api/v1/', include(router.urls)),
    path('api/v1/me/', MeView.as_view(), name='me'),
    path('api/v1/users/', UserListView.as_view(), name='user-list'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/health/', HealthCheckView.as_view(), name='health-check'),
    path('api/v1/lands/<uuid:land_id>/stakes/', StakesByLandView.as_view(), name='stakes-by-land'),
    path('api/v1/stakes/<uuid:stake_id>/latest-reading/', StakeLatestReadingView.as_view(), name='latest-reading'),
]
