from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('operator', 'Operator'),
        ('technician', 'Technician'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='technician')
    phone = models.CharField(max_length=20, blank=True)
    team = models.ForeignKey('Team', on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class Team(models.Model):
    TEAM_TYPES = [
        ('power', 'Power Team'),
        ('transmission', 'Transmission Team'),
        ('bss', 'BSS Team'),
        ('hardware', 'Hardware Team'),
        ('security', 'Security Team'),
        ('general', 'General Team'),
    ]
    
    name = models.CharField(max_length=100)
    team_type = models.CharField(max_length=20, choices=TEAM_TYPES)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']