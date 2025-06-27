from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Q
from .models import Team, Ticket, TicketUpdate
from .serializers import (
    TeamSerializer, TicketSerializer, TicketCreateSerializer, 
    TicketUpdateStatusSerializer, TicketUpdateSerializer
)

class TeamListView(generics.ListCreateAPIView):
    queryset = Team.objects.filter(is_active=True)
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]

class TicketListCreateView(generics.ListCreateAPIView):
    queryset = Ticket.objects.select_related('alarm', 'team', 'assigned_to').all()
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['team', 'status', 'priority', 'assigned_to']
    search_fields = ['title', 'description', 'alarm__site__name']
    ordering_fields = ['created_at', 'updated_at', 'priority']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TicketCreateSerializer
        return TicketSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by user role and team
        user = self.request.user
        if user.role == 'technician':
            # Technicians can only see tickets assigned to them or their team
            queryset = queryset.filter(
                Q(assigned_to=user) | Q(team__type=user.team)
            )
        elif user.role == 'operator':
            # Operators can see all tickets but with some restrictions
            pass
        # Admins can see all tickets
        
        return queryset

class TicketDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Ticket.objects.select_related('alarm', 'team', 'assigned_to').prefetch_related('updates', 'attachments').all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return TicketUpdateStatusSerializer
        return TicketSerializer

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_ticket_comment(request, ticket_id):
    """Add a comment to a ticket"""
    try:
        ticket = Ticket.objects.get(id=ticket_id)
        comment = request.data.get('comment', '')
        
        if not comment:
            return Response(
                {'error': 'Le commentaire est requis'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create update record
        update = TicketUpdate.objects.create(
            ticket=ticket,
            user=request.user,
            comment=comment
        )
        
        return Response(TicketUpdateSerializer(update).data)
        
    except Ticket.DoesNotExist:
        return Response(
            {'error': 'Ticket non trouvé'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def ticket_stats(request):
    """Get ticket statistics"""
    
    # Basic stats
    total_tickets = Ticket.objects.count()
    open_tickets = Ticket.objects.filter(status='open').count()
    in_progress_tickets = Ticket.objects.filter(status='in_progress').count()
    resolved_tickets = Ticket.objects.filter(status='resolved').count()
    closed_tickets = Ticket.objects.filter(status='closed').count()
    
    # Tickets by priority
    tickets_by_priority = Ticket.objects.values('priority').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Tickets by team
    tickets_by_team = Ticket.objects.values('team__name').annotate(
        count=Count('id'),
        open=Count('id', filter=Q(status='open')),
        in_progress=Count('id', filter=Q(status='in_progress')),
        resolved=Count('id', filter=Q(status='resolved'))
    ).order_by('-count')
    
    # Tickets by status over time (last 30 days)
    from django.utils import timezone
    from datetime import timedelta
    
    thirty_days_ago = timezone.now() - timedelta(days=30)
    recent_tickets = Ticket.objects.filter(created_at__gte=thirty_days_ago)
    
    return Response({
        'total': total_tickets,
        'open': open_tickets,
        'in_progress': in_progress_tickets,
        'resolved': resolved_tickets,
        'closed': closed_tickets,
        'by_priority': list(tickets_by_priority),
        'by_team': list(tickets_by_team),
        'recent_count': recent_tickets.count()
    })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def assign_ticket(request, ticket_id):
    """Assign a ticket to a user"""
    try:
        ticket = Ticket.objects.get(id=ticket_id)
        user_id = request.data.get('user_id')
        
        if user_id:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            try:
                user = User.objects.get(id=user_id)
                ticket.assigned_to = user
                ticket.save()
                
                # Create update record
                TicketUpdate.objects.create(
                    ticket=ticket,
                    user=request.user,
                    comment=f"Ticket assigné à {user.username}"
                )
                
                return Response({'message': f'Ticket assigné à {user.username}'})
            except User.DoesNotExist:
                return Response(
                    {'error': 'Utilisateur non trouvé'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            # Unassign ticket
            ticket.assigned_to = None
            ticket.save()
            
            TicketUpdate.objects.create(
                ticket=ticket,
                user=request.user,
                comment="Ticket désassigné"
            )
            
            return Response({'message': 'Ticket désassigné'})
            
    except Ticket.DoesNotExist:
        return Response(
            {'error': 'Ticket non trouvé'}, 
            status=status.HTTP_404_NOT_FOUND
        )