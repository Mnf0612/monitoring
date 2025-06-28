from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Region(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class Site(models.Model):
    SITE_STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('maintenance', 'Under Maintenance'),
        ('alarm', 'Has Alarms'),
    ]
    
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    region = models.ForeignKey(Region, on_delete=models.CASCADE)
    latitude = models.DecimalField(max_digits=10, decimal_places=8)
    longitude = models.DecimalField(max_digits=11, decimal_places=8)
    status = models.CharField(max_length=20, choices=SITE_STATUS_CHOICES, default='active')
    ip_address = models.GenericIPAddressField()
    last_ping = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.code})"

    class Meta:
        ordering = ['name']


class Alarm(models.Model):
    ALARM_TYPES = [
        ('power', 'Power'),
        ('ip', 'IP Connectivity'),
        ('transmission', 'Transmission'),
        ('bss', 'BSS'),
        ('hardware', 'Hardware'),
        ('security', 'Security'),
    ]
    
    SEVERITY_LEVELS = [
        ('critical', 'Critical'),
        ('major', 'Major'),
        ('minor', 'Minor'),
        ('warning', 'Warning'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('acknowledged', 'Acknowledged'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    
    site = models.ForeignKey(Site, on_delete=models.CASCADE)
    alarm_type = models.CharField(max_length=20, choices=ALARM_TYPES)
    severity = models.CharField(max_length=20, choices=SEVERITY_LEVELS)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    title = models.CharField(max_length=200)
    description = models.TextField()
    acknowledged_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.site.name} - {self.title}"

    class Meta:
        ordering = ['-created_at']


class AlarmHistory(models.Model):
    alarm = models.ForeignKey(Alarm, on_delete=models.CASCADE, related_name='history')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    action = models.CharField(max_length=50)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.alarm} - {self.action}"

    class Meta:
        ordering = ['-created_at']