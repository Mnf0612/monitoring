from django.urls import path
from . import views

urlpatterns = [
    path('regions/', views.RegionListView.as_view(), name='region-list'),
    path('sites/', views.SiteListView.as_view(), name='site-list'),
    path('sites/<int:pk>/', views.SiteDetailView.as_view(), name='site-detail'),
    path('alarms/', views.AlarmListCreateView.as_view(), name='alarm-list-create'),
    path('alarms/<int:pk>/', views.AlarmDetailView.as_view(), name='alarm-detail'),
    path('alarms/<int:alarm_id>/acknowledge/', views.acknowledge_alarm, name='acknowledge-alarm'),
    path('alarms/<int:alarm_id>/resolve/', views.resolve_alarm, name='resolve-alarm'),
    path('dashboard/stats/', views.dashboard_stats, name='dashboard-stats'),
]