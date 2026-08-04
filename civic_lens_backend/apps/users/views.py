"""
Auth & Profile views — API Design Document Sections 4 & 5.
"""
import jwt
from mongoengine import NotUniqueError
from rest_framework.views import APIView

from common import jwt_utils
from common.exceptions import ApplicationError
from common.response import error, success
from common.throttling import ScopedActionThrottle

from .models import RefreshToken, User
from .serializers import (
    GoogleAuthSerializer,
    LoginSerializer,
    SignupSerializer,
    UserUpdateSerializer,
)

REFRESH_COOKIE_KWARGS = dict(
    httponly=True,
    secure=True,
    samesite="Strict",
    path="/api/v1/auth",
)


class LoginThrottle(ScopedActionThrottle):
    def __init__(self):
        super().__init__("auth_login")


class SignupThrottle(ScopedActionThrottle):
    def __init__(self):
        super().__init__("auth_signup")


def _issue_tokens(user, response_data):
    access_token = jwt_utils.generate_access_token(user)
    refresh_token = jwt_utils.generate_refresh_token(user)
    payload = jwt_utils.decode_token(refresh_token)
    RefreshToken(jti=payload["jti"], user_id=str(user.id)).save()

    resp = success(
        {**response_data, "access_token": access_token, "expires_in": int(
            __import__("django.conf", fromlist=["settings"]).settings.JWT_ACCESS_TOKEN_LIFETIME.total_seconds()
        )},
        status=200,
    )
    resp.set_cookie(
        "civic_lens_refresh_token", refresh_token, **REFRESH_COOKIE_KWARGS
    )
    return resp


class SignupView(APIView):
    throttle_classes = [SignupThrottle]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        user = User(email=data["email"], phone=data.get("phone"), full_name=data.get("full_name"))
        user.set_password(data["password"])
        try:
            user.save()
        except NotUniqueError:
            return error("ALREADY_REGISTERED", "Email or phone already registered.", status=409)

        return success(
            {"user_id": str(user.id), "email": user.email, "role": user.role}, status=201
        )


class LoginView(APIView):
    throttle_classes = [LoginThrottle]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        user = User.objects(email=data["email"], is_active=True).first()
        if not user or not user.check_password(data["password"]):
            return error("INVALID_CREDENTIALS", "Invalid email or password.", status=401)

        return _issue_tokens(user, {"role": user.role, "full_name": user.full_name})


class RefreshView(APIView):
    def post(self, request):
        token = request.COOKIES.get("civic_lens_refresh_token")
        if not token:
            return error("MISSING_REFRESH_TOKEN", "Refresh token cookie missing.", status=401)

        try:
            payload = jwt_utils.decode_token(token)
        except jwt.PyJWTError:
            return error("INVALID_REFRESH_TOKEN", "Refresh token invalid or expired.", status=401)

        if payload.get("type") != "refresh":
            return error("INVALID_REFRESH_TOKEN", "Invalid token type.", status=401)

        stored = RefreshToken.objects(jti=payload["jti"], revoked=False).first()
        if not stored:
            return error("INVALID_REFRESH_TOKEN", "Refresh token invalid or revoked.", status=401)

        user = User.objects(id=payload["sub"], is_active=True).first()
        if not user:
            return error("INVALID_REFRESH_TOKEN", "User not found or inactive.", status=401)

        access_token = jwt_utils.generate_access_token(user)
        from django.conf import settings

        return success(
            {
                "access_token": access_token,
                "expires_in": int(settings.JWT_ACCESS_TOKEN_LIFETIME.total_seconds()),
            }
        )


class LogoutView(APIView):
    def post(self, request):
        token = request.COOKIES.get("civic_lens_refresh_token")
        if token:
            try:
                payload = jwt_utils.decode_token(token)
                RefreshToken.objects(jti=payload.get("jti")).update(revoked=True)
            except jwt.PyJWTError:
                pass
        resp = success(status=204)
        resp.delete_cookie("civic_lens_refresh_token", path="/api/v1/auth")
        return resp


class GoogleAuthView(APIView):
    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        id_token = serializer.validated_data["id_token"]

        google_profile = self._verify_google_token(id_token)
        if not google_profile:
            return error("INVALID_GOOGLE_TOKEN", "Invalid Google token.", status=401)

        user = User.objects(google_oauth_id=google_profile["sub"]).first()
        if not user:
            user = User.objects(email=google_profile["email"]).first()
        if not user:
            user = User(
                email=google_profile["email"],
                full_name=google_profile.get("name"),
                google_oauth_id=google_profile["sub"],
            )
            user.set_password(jwt_utils.uuid.uuid4().hex)  # unusable random password
            user.save()
        elif not user.google_oauth_id:
            user.google_oauth_id = google_profile["sub"]
            user.save()

        return _issue_tokens(user, {"role": user.role})

    @staticmethod
    def _verify_google_token(id_token):
        """
        Verifies the Google-issued ID token via Google's tokeninfo endpoint.
        Kept as a thin, swappable function so it can be mocked in tests.
        """
        import requests
        from django.conf import settings

        try:
            resp = requests.get(
                "https://oauth2.googleapis.com/tokeninfo",
                params={"id_token": id_token},
                timeout=5,
            )
            if resp.status_code != 200:
                return None
            payload = resp.json()
            if payload.get("aud") != settings.GOOGLE_OAUTH_CLIENT_ID:
                return None
            return payload
        except requests.RequestException:
            return None


class MeView(APIView):
    def get(self, request):
        if not request.user.is_authenticated:
            return error("UNAUTHORIZED", "Authentication required.", status=401)
        return success(request.user.to_public_dict())

    def patch(self, request):
        if not request.user.is_authenticated:
            return error("UNAUTHORIZED", "Authentication required.", status=401)
        serializer = UserUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = request.user
        for field, value in serializer.validated_data.items():
            setattr(user, field, value)
        user.save()
        return success(user.to_public_dict())
