from rest_framework import serializers


class CommentCreateSerializer(serializers.Serializer):
    text = serializers.CharField(max_length=500)
