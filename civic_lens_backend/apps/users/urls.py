from django.urls import path

from . import views

urlpatterns = [
    path("users/me", views.MeView.as_view()),
    path("users/change-password", views.ChangePasswordView.as_view()),
    path("users/leaderboard", views.LeaderboardView.as_view()),
    path("support-requests", views.SupportRequestCreateView.as_view()),
    path("admin/support-requests", views.AdminSupportRequestListView.as_view()),
    path("admin/support-requests/<str:request_id>/process", views.AdminSupportRequestProcessView.as_view()),
]
