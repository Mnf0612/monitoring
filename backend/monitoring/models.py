from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Region(models.Model):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=10, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Région'
        verbose_name_plural = 'Régions'
    
    def __str__(self):
        return self.name

class Site(models.Model):
    STATUS_CHOICES = [
        ('online', 'En ligne'),
        ('offline', 'Hors ligne'),
        ('maintenance', 'Maintenance'),
    ]
    
    name = models.CharField(max_length=100, unique=True)
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='sites')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='online')
    latitude = models.FloatField()
    longitude = models.FloatField()
    address = models.TextField(blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Site BTS'
        verbose_name_plural = 'Sites BTS'
    
    def __str__(self):
        return f"{self.name} - {self.region.name}"

class Alarm(models.Model):
    TYPE_CHOICES = [
        ('power', 'Power'),
        ('ip', 'IP'),
        ('transmission', 'Transmission'),
        ('bss', 'BSS'),
        ('hardware', 'Hardware'),
        ('security', 'Security'),
    ]
    
    SEVERITY_CHOICES = [
        ('critical', 'Critique'),
        ('major', 'Majeure'),
        ('minor', 'Mineure'),
        ('warning', 'Avertissement'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('acknowledged', 'Acquittée'),
        ('resolved', 'Résolue'),
    ]
    
    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name='alarms')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    message = models.TextField()
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    acknowledged_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='acknowledged_alarms')
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_alarms')
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Alarme'
        verbose_name_plural = 'Alarmes'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.site.name} - {self.get_type_display()} - {self.get_severity_display()}"

class AlarmHistory(models.Model):
    alarm = models.ForeignKey(Alarm, on_delete=models.CASCADE, related_name='history')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    action = models.CharField(max_length=50)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Historique d\'alarme'
        verbose_name_plural = 'Historiques d\'alarmes'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.alarm} - {self.action} par {self.user.username}"