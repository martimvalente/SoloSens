from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.models import Stake, Reading
from api.permissions import HasValidAPIKey
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.models import Stake, Reading
from api.permissions import HasValidAPIKey
import logging

logger = logging.getLogger(__name__)  # <- add this line


class ReadingIngestView(APIView):
    permission_classes = [HasValidAPIKey]

    def post(self, request):
        api_key = request.headers.get('X-API-Key')
        logger.debug("API key received: %s", api_key)
        logger.debug("Authenticated account: %s", request.auth)

        account = request.auth

        try:
            stake = Stake.objects.get(id=request.data['stake_id'])
        except Stake.DoesNotExist:
            return Response({'error': 'Stake not found'}, status=status.HTTP_404_NOT_FOUND)

        if stake.land.account != account:
            logger.warning("Stake does not belong to this account")
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        Reading.objects.create(
            stake=stake,
            timestamp=request.data['timestamp'],
            soil_temperature=request.data['soil_temperature'],
            air_temperature=request.data['air_temperature'],
            soil_humidity=request.data['soil_humidity'],
            air_humidity=request.data['air_humidity']
        )

        logger.info("Reading created successfully")
        return Response({'status': 'reading created'}, status=status.HTTP_201_CREATED)