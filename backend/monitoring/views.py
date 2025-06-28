from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Q
from django.utils import timezone
from .models import Region, Site, Alarm, AlarmHistory
from .serializers import (
    RegionSerializer, SiteSerializer, AlarmSerializer, 
    AlarmCreateSerializer, AlarmHistorySerializer
)


class RegionListView(generics.ListAPIView):
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    permission_classes = [permissions.IsAuthenticated]


class SiteListView(generics.ListCreateAPIView):
    queryset = Site.objects.all()
    serializer_class = SiteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Site.objects.all()
        region = self.request.query_params.get('region')
        status_filter = self.request.query_params.get('status')
        
        if region:
            queryset = queryset.filter(region__code=region)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        return queryset


class SiteDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Site.objects.all()
    serializer_class = SiteSerializer
    permission_classes = [permissions.IsAuthenticated]


class AlarmListCreateView(generics.ListCreateAPIView):
    queryset = Alarm.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AlarmCreateSerializer
        return AlarmSerializer
    
    def get_queryset(self):
        queryset = Alarm.objects.all()
        
        # Filter parameters
        site = self.request.query_params.get('site')
        alarm_type = self.request.query_params.get('type')
        severity = self.request.query_params.get('severity')
        status_filter = self.request.query_params.get('status')
        region = self.request.query_params.get('region')
        
        if site:
            queryset = queryset.filter(site__code=site)
        if alarm_type:
            queryset = queryset.filter(alarm_type=alarm_type)
        if severity:
            queryset = queryset.filter(severity=severity)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if region:
            queryset = queryset.filter(site__region__code=region)
            
        return queryset


class AlarmDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Alarm.objects.all()
    serializer_class = AlarmSerializer
    permission_classes = [permissions.IsAuthenticated]


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def acknowledge_alarm(request, alarm_id):
    try:
        alarm = Alarm.objects.get(id=alarm_id)
        alarm.status = 'acknowledged'
        alarm.acknowledged_by = request.user
        alarm.acknowledged_at = timezone.now()
        alarm.save()
        
        # Create history entry
        AlarmHistory.objects.create(
            alarm=alarm,
            user=request.user,
            action='acknowledged',
            comment=request.data.get('comment', '')
        )
        
        return Response({'message': 'Alarm acknowledged successfully'})
    except Alarm.DoesNotExist:
        return Response({'error': 'Alarm not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def resolve_alarm(request, alarm_id):
    try:
        alarm = Alarm.objects.get(id=alarm_id)
        alarm.status = 'resolved'
        alarm.resolved_at = timezone.now()
        alarm.save()
        
        # Create history entry
        AlarmHistory.objects.create(
            alarm=alarm,
            user=request.user,
            action='resolved',
            comment=request.data.get('comment', '')
        )
        
        return Response({'message': 'Alarm resolved successfully'})
    except Alarm.DoesNotExist:
        return Response({'error': 'Alarm not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    # Get basic counts
    total_sites = Site.objects.count()
    active_sites = Site.objects.filter(status='active').count()
    total_alarms = Alarm.objects.filter(status='active').count()
    critical_alarms = Alarm.objects.filter(status='active', severity='critical').count()
    
    # Alarms by type
    alarms_by_type = Alarm.objects.filter(status='active').values('alarm_type').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Alarms by severity
    alarms_by_severity = Alarm.objects.filter(status='active').values('severity').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Sites by region
    sites_by_region = Site.objects.values('region__name').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Top impacted sites
    top_impacted_sites = Site.objects.annotate(
        alarm_count=Count('alarm', filter=Q(alarm__status='active'))
    ).filter(alarm_count__gt=0).order_by('-alarm_count')[:10]
    
    return Response({
        'total_sites': total_sites,
        'active_sites': active_sites,
        'total_alarms': total_alarms,
        'critical_alarms': critical_alarms,
        'alarms_by_type': list(alarms_by_type),
        'alarms_by_severity': list(alarms_by_severity),
        'sites_by_region': list(sites_by_region),
        'top_impacted_sites': [
            {
                'name': site.name,
                'code': site.code,
                'region': site.region.name,
                'alarm_count': site.alarm_count
            }
            for site in top_impacted_sites
        ]
    })