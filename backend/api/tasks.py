from celery import shared_task
from api.models import Reading, Stake
from django.utils.dateparse import parse_datetime

@shared_task
def create_reading_task(stake_id, timestamp, soil_temperature, air_temperature, soil_humidity, air_humidity):
    try:
        stake = Stake.objects.get(id=stake_id, active=True, removed=False)
        reading = Reading.objects.create(
            stake=stake,
            timestamp=parse_datetime(timestamp),
            soil_temperature=soil_temperature,
            air_temperature=air_temperature,
            soil_humidity=soil_humidity,
            air_humidity=air_humidity
        )
        stake.last_reading_at = reading.timestamp
        stake.save(update_fields=["last_reading_at"])
    except Stake.DoesNotExist:
        # You can log this or raise an error if needed
        pass


# verifica estado do celery
@shared_task(bind=True)
def ping_celery(self):
    return 'pong'