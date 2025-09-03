from django.contrib.auth.models import AnonymousUser
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from api.models import Account

class APIKeyUser:
    is_authenticated = True

    def __str__(self):
        return "APIKeyUser"

class APIKeyAuthentication(BaseAuthentication):
    def authenticate(self, request):
        api_key = request.headers.get('X-API-Key')
        if not api_key:
            return None

        try:
            account = Account.objects.get(api_key=api_key)
        except Account.DoesNotExist:
            raise AuthenticationFailed('Invalid API key')

        # Return AnonymousUser and the account object
        return (AnonymousUser(), account)
