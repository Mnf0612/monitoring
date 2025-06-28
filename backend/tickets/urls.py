from django.urls import path
from . import views

urlpatterns = [
    path('', views.TicketListCreateView.as_view(), name='ticket-list-create'),
    path('<int:pk>/', views.TicketDetailView.as_view(), name='ticket-detail'),
    path('<int:ticket_id>/comment/', views.add_comment, name='add-comment'),
    path('<int:ticket_id>/attachment/', views.add_attachment, name='add-attachment'),
    path('stats/', views.ticket_stats, name='ticket-stats'),
]