from django.urls import path
from . import views

urlpatterns = [
    path('teams/', views.TeamListView.as_view(), name='team-list'),
    path('', views.TicketListCreateView.as_view(), name='ticket-list-create'),
    path('<int:pk>/', views.TicketDetailView.as_view(), name='ticket-detail'),
    path('<int:ticket_id>/comment/', views.add_ticket_comment, name='add-ticket-comment'),
    path('<int:ticket_id>/assign/', views.assign_ticket, name='assign-ticket'),
    path('stats/', views.ticket_stats, name='ticket-stats'),
]