from rest_framework import serializers
from .models import Region, Site, Alarm, AlarmHistory

class RegionSerializer(serializers.ModelSerializer):
    sites_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Region
        fields = ['id', 'name', 'code', 'sites_count', 'created_at']
    
    def get_sites_count(self, obj):
        return obj.sites.count()

class SiteSerializer(serializers.ModelSerializer):
    region_name = serializers.CharField(source='region.name', read_only=True)
    alarms_count = serializers.SerializerMethodField()
    active_alarms_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Site
        fields = ['id', 'name', 'region', 'region_name', 'status', 'latitude', 
                 'longitude', 'address', 'description', 'alarms_count', 
                 'active_alarms_count', 'created_at', 'updated_at']
    
    def get_alarms_count(self, obj):
        return obj.alarms.count()
    
    def get_active_alarms_count(self, obj):
        return obj.alarms.filter(status='active').count()

class AlarmHistorySerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = AlarmHistory
        fields = ['id', 'action', 'comment', 'user_name', 'created_at']

class AlarmSerializer(serializers.ModelSerializer):
    site_name = serializers.CharField(source='site.name', read_only=True)
    region_name = serializers.CharField(source='site.region.name', read_only=True)
    acknowledged_by_name = serializers.CharField(source='acknowledged_by.username', read_only=True)
    resolved_by_name = serializers.CharField(source='resolved_by.username', read_only=True)
    history = AlarmHistorySerializer(many=True, read_only=True)
    
    class Meta:
        model = Alarm
        fields = ['id', 'site', 'site_name', 'region_name', 'type', 'severity', 
                 'status', 'message', 'description', 'created_at', 'updated_at',
                 'acknowledged_by', 'acknowledged_by_name', 'acknowledged_at',
                 'resolved_by', 'resolved_by_name', 'resolved_at', 'history']
        read_only_fields = ['acknowledged_by', 'acknowledged_at', 'resolved_by', 'resolved_at']

class AlarmCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alarm
        fields = ['site', 'type', 'severity', 'message', 'description']

class AlarmUpdateSerializer(serializers.ModelSerializer):
    comment = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = Alarm
        fields = ['status', 'comment']
    
    def update(self, instance, validated_data):
        comment = validated_data.pop('comment', '')
        user = self.context['request'].user
        
        # Update alarm status
        old_status = instance.status
        new_status = validated_data.get('status', instance.status)
        
        if old_status != new_status:
            if new_status == 'acknowledged':
                instance.acknowledged_by = user
                instance.acknowledged_at = timezone.now()
                action = 'Acquittée'
            elif new_status == 'resolved':
                instance.resolved_by = user
                instance.resolved_at = timezone.now()
                action = 'Résolue'
            else:
                action = f'Statut changé vers {new_status}'
            
            # Create history entry
            AlarmHistory.objects.create(
                alarm=instance,
                user=user,
                action=action,
                comment=comment
            )
        
        return super().update(instance, validated_data)