from rest_framework import serializers
from .models import Ticket, TicketComment, TicketAttachment


class TicketCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = TicketComment
        fields = ['id', 'comment', 'user', 'user_name', 'is_internal', 'created_at']
        read_only_fields = ['user']


class TicketAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    
    class Meta:
        model = TicketAttachment
        fields = ['id', 'file', 'filename', 'uploaded_by', 'uploaded_by_name', 'uploaded_at']
        read_only_fields = ['uploaded_by']


class TicketSerializer(serializers.ModelSerializer):
    site_name = serializers.CharField(source='site.name', read_only=True)
    site_code = serializers.CharField(source='site.code', read_only=True)
    region_name = serializers.CharField(source='site.region.name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    team_name = serializers.CharField(source='team.name', read_only=True)
    alarm_title = serializers.CharField(source='alarm.title', read_only=True)
    comments = TicketCommentSerializer(many=True, read_only=True)
    attachments = TicketAttachmentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Ticket
        fields = [
            'id', 'title', 'description', 'alarm', 'alarm_title',
            'site', 'site_name', 'site_code', 'region_name',
            'status', 'priority', 'assigned_to', 'assigned_to_name',
            'created_by', 'created_by_name', 'team', 'team_name',
            'resolved_at', 'created_at', 'updated_at',
            'comments', 'attachments'
        ]
        read_only_fields = ['created_by', 'resolved_at']


class TicketCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = [
            'title', 'description', 'alarm', 'site',
            'priority', 'assigned_to', 'team'
        ]