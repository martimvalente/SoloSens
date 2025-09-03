import uuid
import secrets
from django.db import models
from django.contrib.auth.models import User


class Account(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    admin = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    active = models.BooleanField(default=True)
    api_key = models.CharField(max_length=64, unique=True, blank=True, editable=False)

    def save(self, *args, **kwargs):
        if not self.api_key:
            self.api_key = secrets.token_hex(32)
        super().save(*args, **kwargs)


class UserProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    last_api_login = models.DateTimeField(null=True, blank=True)
    active = models.BooleanField(default=True)


class Land(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated_at = models.DateTimeField(auto_now=True)
    active = models.BooleanField(default=True)


class Stake(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    land = models.ForeignKey(Land, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    installed_at = models.DateTimeField(auto_now_add=True)
    last_reading_at = models.DateTimeField(null=True, blank=True)
    active = models.BooleanField(default=True)
    removed = models.BooleanField(default=False)


class Reading(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    stake = models.ForeignKey(Stake, on_delete=models.CASCADE)
    timestamp = models.DateTimeField()
    soil_temperature = models.DecimalField(max_digits=5, decimal_places=2)
    air_temperature = models.DecimalField(max_digits=5, decimal_places=2)
    soil_humidity = models.DecimalField(max_digits=5, decimal_places=2)
    air_humidity = models.DecimalField(max_digits=5, decimal_places=2)


class WeatherForecast(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    land = models.ForeignKey(Land, on_delete=models.CASCADE)
    timestamp = models.DateTimeField()
    air_temperature = models.DecimalField(max_digits=5, decimal_places=2)
    air_humidity = models.DecimalField(max_digits=5, decimal_places=2)
    uv_index = models.DecimalField(max_digits=4, decimal_places=2)
    precipitation = models.DecimalField(max_digits=5, decimal_places=2)
    wind_speed = models.DecimalField(max_digits=5, decimal_places=2)
    wind_direction = models.IntegerField()
    cloud_coverage = models.DecimalField(max_digits=5, decimal_places=2)
    source = models.CharField(max_length=50)
    raw_data = models.JSONField()
