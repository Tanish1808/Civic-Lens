from django.urls import path

from . import views

urlpatterns = [
    path("users/me", views.MeView.as_view()),
    path("users/leaderboard", views.LeaderboardView.as_view()),
]
