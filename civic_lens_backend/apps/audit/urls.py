from django.urls import path

from . import views

urlpatterns = [
    path("admin/audit-logs", views.AuditLogListView.as_view()),
]
