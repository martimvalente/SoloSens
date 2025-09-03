from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import connection
from api.tasks import ping_celery
import logging

logger = logging.getLogger(__name__)

class HealthCheckView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        health_status = {"status": "ok"}

        # Check DB connection
        try:
            connection.ensure_connection()
            health_status["database"] = "ok"
        except Exception as e:
            logger.error("Database health check failed: %s", e)
            health_status["database"] = "error"

        # Check Celery via ping task
        try:
            result = ping_celery.apply(timeout=5)  # Synchronous call
            if result.get(timeout=2) == "pong":
                health_status["celery"] = "ok"
            else:
                health_status["celery"] = "error"
        except Exception as e:
            logger.error("Celery health check failed: %s", e)
            health_status["celery"] = "error"

        # Status code
        overall_status = status.HTTP_200_OK if all(v == "ok" for v in health_status.values() if v != "status") else status.HTTP_503_SERVICE_UNAVAILABLE
        return Response(health_status, status=overall_status)
