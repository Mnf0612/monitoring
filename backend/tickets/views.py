from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Q
from django.utils import timezone
from .models import Ticket, TicketComment, TicketAttachment
from .serializers import (
    TicketSerializer, TicketCreateSerializer, 
    TicketCommentSerializer, TicketAttachmentSerializer
)


class TicketListCreateView(generics.ListCreateAPIView):
    queryset = Ticket.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TicketCreateSerializer
        return TicketSerializer
    
    def get_queryset(self):
        queryset = Ticket.objects.all()
        
        # Filter based on user role
        user = self.request.user
        if user.role == 'technician':
            # Technicians only see tickets assigned to them or their team
            queryset = queryset.filter(
                Q(assigned_to=user) | Q(team=user.team)
            )
        
        # Additional filters
        status_filter = self.request.query_params.get('status')
        priority = self.request.query_params.get('priority')
        assigned_to = self.request.query_params.get('assigned_to')
        site = self.request.query_params.get('site')
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if priority:
            queryset = queryset.filter(priority=priority)
        if assigned_to:
            queryset = queryset.filter(assigned_to__id=assigned_to)
        if site:
            queryset = queryset.filter(site__code=site)
            
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class TicketDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'technician':
            return Ticket.objects.filter(
                Q(assigned_to=user) | Q(team=user.team)
            )
        return Ticket.objects.all()


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_comment(request, ticket_id):
    try:
        ticket = Ticket.objects.get(id=ticket_id)
        
        # Check permissions
        user = request.user
        if user.role == 'technician' and ticket.assigned_to != user and ticket.team != user.team:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = TicketCommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(ticket=ticket, user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Ticket.DoesNotExist:
        return Response({'error': 'Ticket not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_attachment(request, ticket_id):
    try:
        ticket = Ticket.objects.get(id=ticket_id)
        
        # Check permissions
        user = request.user
        if user.role == 'technician' and ticket.assigned_to != user and ticket.team != user.team:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = TicketAttachmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(ticket=ticket, uploaded_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Ticket.DoesNotExist:
        return Response({'error': 'Ticket not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def ticket_stats(request):
    user = self.request.user
    
    # Base queryset based on user role
    if user.role == 'technician':
        queryset = Ticket.objects.filter(
            Q(assigned_to=user) | Q(team=user.team)
        )
    else:
        queryset = Ticket.objects.all()
    
    # Get counts by status
    stats_by_status = queryset.values('status').annotate(
        count=Count('id')
    ).order_by('status')
    
    # Get counts by priority
    stats_by_priority = queryset.values('priority').annotate(
        count=Count('id')
    ).order_by('priority')
    
    # Recent tickets
    recent_tickets = queryset.order_by('-created_at')[:5]
    
    return Response({
        'total_tickets': queryset.count(),
        'open_tickets': queryset.filter(status='open').count(),
        'in_progress_tickets': queryset.filter(status='in_progress').count(),
        'resolved_tickets': queryset.filter(status='resolved').count(),
        'stats_by_status': list(stats_by_status),
        'stats_by_priority': list(stats_by_priority),
        'recent_tickets': TicketSerializer(recent_tickets, many=True).data
    })