from django.urls import path

from . import views

urlpatterns = [
    path("reports", views.ReportSubmitView.as_view()),
    path("reports/<str:report_id>", views.ReportDetailView.as_view()),
    path("reports/<str:report_id>/status", views.ReportStatusView.as_view()),
    path("my-reports", views.MyReportsView.as_view()),
    path("tickets/<str:ticket_id>/attach-photo", views.AttachPhotoView.as_view()),
    path("admin/manual-review-queue", views.ManualReviewQueueListView.as_view()),
    path(
        "admin/manual-review-queue/<str:report_id>/resolve",
        views.ManualReviewQueueResolveView.as_view(),
    ),
]
