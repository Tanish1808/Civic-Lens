from django.urls import path

from . import admin_views, views

urlpatterns = [
    path("tickets", views.TicketListView.as_view()),
    path("tickets/search", views.TicketSearchView.as_view()),
    path("tickets/<str:ticket_id>", views.TicketDetailView.as_view()),
    path("tickets/<str:ticket_id>/upvote", views.UpvoteView.as_view()),
    path("tickets/<str:ticket_id>/mark-resolved", views.MarkResolvedView.as_view()),
    path("tickets/<str:ticket_id>/comments", views.CommentListCreateView.as_view()),
    # Admin Ticket Management (API Design Document Section 11)
    path("admin/tickets", admin_views.AdminTicketListView.as_view()),
    path("admin/tickets/bulk-status", admin_views.AdminBulkStatusUpdateView.as_view()),
    path("admin/tickets/<str:ticket_id>/status", admin_views.AdminTicketStatusUpdateView.as_view()),
    path("admin/tickets/<str:ticket_id>/override", admin_views.AdminTicketOverrideView.as_view()),
    path("admin/tickets/<str:ticket_id>/flag-spam", admin_views.AdminFlagSpamView.as_view()),
]
