"""Shared validation helpers used across serializers (TDD Section 21 - input validation)."""
import re

from rest_framework import serializers

PHONE_REGEX = re.compile(r"^\+[1-9]\d{6,14}$")  # E.164
ALLOWED_IMAGE_CONTENT_TYPES = {"image/jpeg", "image/png"}


def validate_phone(value):
    if value and not PHONE_REGEX.match(value):
        raise serializers.ValidationError("Phone number must be in E.164 format, e.g. +919000000000.")
    return value


def validate_password(value):
    if len(value) < 8 or not any(c.isdigit() for c in value):
        raise serializers.ValidationError(
            "Password must be at least 8 characters and include at least 1 number."
        )
    return value


def validate_latitude(value):
    if value is None or not (-90.0 <= float(value) <= 90.0):
        raise serializers.ValidationError("Latitude must be between -90 and 90.")
    return value


def validate_longitude(value):
    if value is None or not (-180.0 <= float(value) <= 180.0):
        raise serializers.ValidationError("Longitude must be between -180 and 180.")
    return value


def validate_image_file(file_obj, max_bytes):
    content_type = getattr(file_obj, "content_type", None)
    if content_type not in ALLOWED_IMAGE_CONTENT_TYPES:
        raise serializers.ValidationError("Image must be JPEG or PNG.")
    if file_obj.size > max_bytes:
        raise serializers.ValidationError(
            f"Image too large — please use a photo under {max_bytes // (1024*1024)}MB."
        )
    return file_obj
