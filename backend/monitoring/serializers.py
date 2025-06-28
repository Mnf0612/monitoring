from rest_framework import serializers
from .models import Region, Site, Alarm, AlarmHistory


class RegionSerializer(serializers.ModelSerializer):
    site_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Region
        fields = ['id', 'name', 'code', 'description', 'site_count', 'created_at']
    
    def get_site_count(self, obj):
        return obj.site_set.count()


class SiteSerializer(serializers.ModelSerializer):
    region_name = serializers.CharField(source='region.name', read_only=True)
    alarm_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Site
        fields = [
            'id', 'name', 'code', 'region', 'region_name',
            'latitude', 'longitude', 'status', 'ip_address',
            'last_ping', 'alarm_count', 'created_at', 'updated_at'
        ]
    
    def get_alarm_count(self, obj):
        return obj.alarm_set.filter(status='active').count()


class AlarmHistorySerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = AlarmHistory
        fields = ['id', 'action', 'comment', 'user_name', 'created_at']


class AlarmSerializer(serializers.ModelSerializer):
    site_name = serializers.CharField(source='site.name', read_only=True)
    site_code = serializers.CharField(source='site.code', read_only=True)
    region_name = serializers.CharField(source='site.region.name', read_only=True)
    acknowledged_by_name = serializers.CharField(source='acknowledged_by.get_full_name', read_only=True)
    history = AlarmHistorySerializer(many=True, read_only=True)
    
    class Meta:
        model = Alarm
        fields = [
            'id', 'site', 'site_name', 'site_code', 'region_name',
            'alarm_type', 'severity', 'status', 'title', 'description',
            'acknowledged_by', 'acknowledged_by_name', 'acknowledged_at',
            'resolved_at', 'created_at', 'updated_at', 'history'
        ]
        read_only_fields = ['acknowledged_at', 'resolved_at']


class AlarmCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alarm
        fields = [
            'site', 'alarm_type', 'severity', 'title', 'description'
        ]