from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Q
from django.utils import timezone
from .models import Region, Site, Alarm
from .serializers import (
    RegionSerializer, SiteSerializer, AlarmSerializer, 
    AlarmCreateSerializer, AlarmUpdateSerializer
)

class RegionListView(generics.ListCreateAPIView):
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    permission_classes = [permissions.IsAuthenticated]

class SiteListCreateView(generics.ListCreateAPIView):
    queryset = Site.objects.select_related('region').all()
    serializer_class = SiteSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['region', 'status']
    search_fields = ['name', 'region__name']
    ordering_fields = ['name', 'created_at', 'updated_at']

class SiteDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Site.objects.select_related('region').all()
    serializer_class = SiteSerializer
    permission_classes = [permissions.IsAuthenticated]

class AlarmListCreateView(generics.ListCreateAPIView):
    queryset = Alarm.objects.select_related('site', 'site__region').all()
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['site', 'type', 'severity', 'status', 'site__region']
    search_fields = ['message', 'site__name']
    ordering_fields = ['created_at', 'updated_at', 'severity']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AlarmCreateSerializer
        return AlarmSerializer

class AlarmDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Alarm.objects.select_related('site', 'site__region').prefetch_related('history').all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return AlarmUpdateSerializer
        return AlarmSerializer

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    """Get dashboard statistics"""
    
    # Sites statistics
    total_sites = Site.objects.count()
    online_sites = Site.objects.filter(status='online').count()
    offline_sites = Site.objects.filter(status='offline').count()
    maintenance_sites = Site.objects.filter(status='maintenance').count()
    
    # Alarms statistics
    total_alarms = Alarm.objects.count()
    active_alarms = Alarm.objects.filter(status='active').count()
    critical_alarms = Alarm.objects.filter(status='active', severity='critical').count()
    
    # Alarms by type
    alarms_by_type = Alarm.objects.filter(status='active').values('type').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Alarms by severity
    alarms_by_severity = Alarm.objects.filter(status='active').values('severity').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Sites by region
    sites_by_region = Site.objects.values('region__name').annotate(
        total=Count('id'),
        online=Count('id', filter=Q(status='online')),
        offline=Count('id', filter=Q(status='offline')),
        maintenance=Count('id', filter=Q(status='maintenance')),
        alarms=Count('alarms', filter=Q(alarms__status='active'))
    ).order_by('region__name')
    
    # Top impacted sites
    top_impacted_sites = Site.objects.annotate(
        alarm_count=Count('alarms', filter=Q(alarms__status='active'))
    ).filter(alarm_count__gt=0).order_by('-alarm_count')[:10]
    
    return Response({
        'sites': {
            'total': total_sites,
            'online': online_sites,
            'offline': offline_sites,
            'maintenance': maintenance_sites,
        },
        'alarms': {
            'total': total_alarms,
            'active': active_alarms,
            'critical': critical_alarms,
        },
        'alarms_by_type': list(alarms_by_type),
        'alarms_by_severity': list(alarms_by_severity),
        'sites_by_region': list(sites_by_region),
        'top_impacted_sites': [
            {
                'site': site.name,
                'region': site.region.name,
                'alarm_count': site.alarm_count
            }
            for site in top_impacted_sites
        ]
    })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def acknowledge_alarm(request, alarm_id):
    """Acknowledge an alarm"""
    try:
        alarm = Alarm.objects.get(id=alarm_id)
        if alarm.status == 'active':
            alarm.status = 'acknowledged'
            alarm.acknowledged_by = request.user
            alarm.acknowledged_at = timezone.now()
            alarm.save()
            
            return Response({'message': 'Alarme acquittée avec succès'})
        else:
            return Response(
                {'error': 'Cette alarme ne peut pas être acquittée'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    except Alarm.DoesNotExist:
        return Response(
            {'error': 'Alarme non trouvée'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def resolve_alarm(request, alarm_id):
    """Resolve an alarm"""
    try:
        alarm = Alarm.objects.get(id=alarm_id)
        if alarm.status in ['active', 'acknowledged']:
            alarm.status = 'resolved'
            alarm.resolved_by = request.user
            alarm.resolved_at = timezone.now()
            alarm.save()
            
            return Response({'message': 'Alarme résolue avec succès'})
        else:
            return Response(
                {'error': 'Cette alarme ne peut pas être résolue'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    except Alarm.DoesNotExist:
        return Response(
            {'error': 'Alarme non trouvée'}, 
            status=status.HTTP_404_NOT_FOUND
        )