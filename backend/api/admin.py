from django.contrib import admin
from .models import Account, UserProfile, Land, Stake, Reading, WeatherForecast


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('name', 'api_key', 'active', 'created_at')
    search_fields = ('name', 'admin__username')
    list_filter = ('active',)
    date_hierarchy = 'created_at'
    readonly_fields = ('id', 'created_at', 'api_key')
    fields = ('id', 'name', 'admin', 'active', 'api_key', 'created_at')


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'account', 'last_api_login', 'active')
    search_fields = ('user__username', 'account__name')
    list_filter = ('active',)
    readonly_fields = ('id', 'last_api_login')
    fields = ('id', 'user', 'account', 'last_api_login', 'active')


@admin.register(Land)
class LandAdmin(admin.ModelAdmin):
    list_display = ('name', 'account', 'latitude', 'longitude', 'active', 'last_updated_at')
    search_fields = ('name', 'account__name')
    list_filter = ('active',)
    date_hierarchy = 'last_updated_at'
    readonly_fields = ('id', 'created_at', 'last_updated_at')
    fields = ('id', 'name', 'description', 'account', 'latitude', 'longitude', 'active', 'created_at', 'last_updated_at')


@admin.register(Stake)
class StakeAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'land', 'latitude', 'longitude', 'installed_at', 'last_reading_at', 'active', 'removed')
    search_fields = ('name', 'land__name')
    list_filter = ('active', 'removed')
    date_hierarchy = 'installed_at'
    readonly_fields = ('id', 'installed_at', 'last_reading_at')
    fields = ('id', 'name', 'land', 'latitude', 'longitude', 'active', 'removed', 'installed_at', 'last_reading_at')


@admin.register(Reading)
class ReadingAdmin(admin.ModelAdmin):
    list_display = ('stake', 'timestamp', 'soil_temperature', 'soil_humidity', 'air_temperature', 'air_humidity')
    search_fields = ('stake__name',)
    list_filter = ('stake__land',)
    date_hierarchy = 'timestamp'
    readonly_fields = ('id',)
    fields = ('id', 'stake', 'timestamp', 'soil_temperature', 'soil_humidity', 'air_temperature', 'air_humidity')


@admin.register(WeatherForecast)
class WeatherForecastAdmin(admin.ModelAdmin):
    list_display = ('land', 'timestamp', 'air_temperature', 'air_humidity', 'uv_index', 'source')
    search_fields = ('land__name', 'source')
    list_filter = ('source',)
    date_hierarchy = 'timestamp'
    readonly_fields = ('id',)
    fields = (
        'id', 'land', 'timestamp',
        'air_temperature', 'air_humidity',
        'uv_index', 'precipitation',
        'wind_speed', 'wind_direction',
        'cloud_coverage', 'source', 'raw_data'
    )
