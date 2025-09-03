# api/views/reading_feed_view.py
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from api.models import Reading
from api.serializers.reading_serializer import ReadingSerializer
from api.permissions import IsAccountMember

class ReadingFeedView(ListAPIView):
    serializer_class = ReadingSerializer
    permission_classes = [IsAuthenticated, IsAccountMember]

    def get_queryset(self):
        return Reading.objects.filter(
            stake__land__account=self.request.user.userprofile.account
        ).order_by('-timestamp')
