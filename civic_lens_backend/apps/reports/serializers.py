from rest_framework import serializers

from common.validators import validate_image_file, validate_latitude, validate_longitude
from django.conf import settings

from .models import CATEGORY_CHOICES


class ReportSubmitSerializer(serializers.Serializer):
    image = serializers.FileField()
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()
    user_selected_category = serializers.ChoiceField(
        choices=CATEGORY_CHOICES, required=False, allow_null=True
    )
    description = serializers.CharField(
        max_length=200, required=False, allow_blank=True, allow_null=True
    )

    def validate_image(self, value):
        return validate_image_file(value, settings.MAX_REPORT_IMAGE_SIZE_BYTES)

    def validate_latitude(self, value):
        return validate_latitude(value)

    def validate_longitude(self, value):
        return validate_longitude(value)


class AttachPhotoSerializer(serializers.Serializer):
    image = serializers.FileField()

    def validate_image(self, value):
        return validate_image_file(value, settings.MAX_REPORT_IMAGE_SIZE_BYTES)
