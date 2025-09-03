from rest_framework import serializers
from api.models import Reading

class ReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reading
        fields = '__all__'
        read_only_fields = ['id']  # readings are immutable once created
