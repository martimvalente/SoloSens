from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.tasks import create_reading_task

class ReadingIngestView(APIView):
    def post(self, request):
        data = request.data
        try:
            create_reading_task.delay(
                stake_id=data['stake_id'],
                timestamp=data['timestamp'],
                soil_temperature=data['soil_temperature'],
                air_temperature=data['air_temperature'],
                soil_humidity=data['soil_humidity'],
                air_humidity=data['air_humidity'],
            )
            return Response({"message": "Reading submitted"}, status=status.HTTP_202_ACCEPTED)
        except KeyError as e:
            return Response({"error": f"Missing field: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
