from rest_framework import serializers
from api.models import Stake

class StakeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stake
        fields = '__all__'
