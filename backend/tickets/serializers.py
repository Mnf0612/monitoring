from rest_framework import serializers
from django.utils import timezone
from .models import Team, Ticket, TicketUpdate, TicketAttachment
from monitoring.serializers import AlarmSerializer

class TeamSerializer(serializers.ModelSerializer):
    tickets_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Team
        fields = ['id', 'name', 'type', 'phone', 'email', 'description', 
                 'is_active', 'tickets_count', 'created_at']
    
    def get_tickets_count(self, obj):
        return obj.tickets.filter(status__in=['open', 'in_progress']).count()

class TicketUpdateSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = TicketUpdate
        fields = ['id', 'comment', 'status_changed_from', 'status_changed_to', 
                 'user_name', 'created_at']

class TicketAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.username', read_only=True)
    
    class Meta:
        model = TicketAttachment
        fields = ['id', 'file', 'filename', 'uploaded_by_name', 'uploaded_at']

class TicketSerializer(serializers.ModelSerializer):
    alarm = AlarmSerializer(read_only=True)
    team_name = serializers.CharField(source='team.name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.username', read_only=True)
    updates = TicketUpdateSerializer(many=True, read_only=True)
    attachments = TicketAttachmentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Ticket
        fields = ['id', 'alarm', 'team', 'team_name', 'assigned_to', 'assigned_to_name',
                 'status', 'priority', 'title', 'description', 'resolution',
                 'created_at', 'updated_at', 'resolved_at', 'closed_at',
                 'updates', 'attachments']
        read_only_fields = ['resolved_at', 'closed_at']

class TicketCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['alarm', 'team', 'assigned_to', 'priority', 'title', 'description']

class TicketUpdateStatusSerializer(serializers.ModelSerializer):
    comment = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = Ticket
        fields = ['status', 'resolution', 'comment']
    
    def update(self, instance, validated_data):
        comment = validated_data.pop('comment', '')
        user = self.context['request'].user
        
        # Track status changes
        old_status = instance.status
        new_status = validated_data.get('status', instance.status)
        
        # Update timestamps based on status
        if new_status == 'resolved' and old_status != 'resolved':
            instance.resolved_at = timezone.now()
        elif new_status == 'closed' and old_status != 'closed':
            instance.closed_at = timezone.now()
        
        # Update the ticket
        instance = super().update(instance, validated_data)
        
        # Create update record if status changed or comment provided
        if old_status != new_status or comment:
            TicketUpdate.objects.create(
                ticket=instance,
                user=user,
                comment=comment or f"Statut changé de {old_status} vers {new_status}",
                status_changed_from=old_status if old_status != new_status else '',
                status_changed_to=new_status if old_status != new_status else ''
            )
        
        return instance