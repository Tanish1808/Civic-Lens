from rest_framework import serializers

from common.validators import validate_password, validate_phone


class SignupSerializer(serializers.Serializer):
    email = serializers.EmailField()
    phone = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    password = serializers.CharField(write_only=True)
    full_name = serializers.CharField()

    def validate_phone(self, value):
        return validate_phone(value) if value else value

    def validate_password(self, value):
        return validate_password(value)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class GoogleAuthSerializer(serializers.Serializer):
    id_token = serializers.CharField()


class UserUpdateSerializer(serializers.Serializer):
    full_name = serializers.CharField(required=False)
    phone = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    def validate_phone(self, value):
        return validate_phone(value) if value else value


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True)

    def validate_new_password(self, value):
        return validate_password(value)


class SupportRequestSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    email = serializers.EmailField(max_length=150)
    municipality = serializers.CharField(max_length=150)
    details = serializers.CharField(max_length=1000)
