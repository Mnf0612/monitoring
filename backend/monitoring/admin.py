from django.contrib import admin
from .models import Region, Site, Alarm, AlarmHistory


@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'created_at')
    search_fields = ('name', 'code')


@admin.register(Site)
class SiteAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'region', 'status', 'ip_address', 'last_ping')
    list_filter = ('region', 'status')
    search_fields = ('name', 'code', 'ip_address')


@admin.register(Alarm)
class AlarmAdmin(admin.ModelAdmin):
    list_display = ('title', 'site', 'alarm_type', 'severity', 'status', 'created_at')
    list_filter = ('alarm_type', 'severity', 'status', 'site__region')
    search_fields = ('title', 'description', 'site__name')
    date_hierarchy = 'created_at'


@admin.register(AlarmHistory)
class AlarmHistoryAdmin(admin.ModelAdmin):
    list_display = ('alarm', 'user', 'action', 'created_at')
    list_filter = ('action', 'created_at')
    search_fields = ('alarm__title', 'user__username', 'comment')