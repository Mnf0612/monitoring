from django.contrib.auth.models import AbstractUser
from django.db import models


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


class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('operator', 'Operator'),
        ('technician', 'Technician'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='technician')
    phone = models.CharField(max_length=20, blank=True)
    team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Fix the reverse accessor conflicts
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name='custom_user_set',
        related_query_name='custom_user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='custom_user_set',
        related_query_name='custom_user',
    )

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"