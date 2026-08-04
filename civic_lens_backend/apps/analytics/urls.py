from django.urls import path

from . import views

urlpatterns = [
    path("admin/analytics/overview", views.OverviewView.as_view()),
    path("admin/analytics/category-breakdown", views.CategoryBreakdownView.as_view()),
    path("admin/analytics/severity-distribution", views.SeverityDistributionView.as_view()),
    path("admin/analytics/resolution-trend", views.ResolutionTrendView.as_view()),
    path("admin/analytics/area-density", views.AreaDensityView.as_view()),
]
