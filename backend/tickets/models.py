from django.db import models
from django.contrib.auth import get_user_model
from monitoring.models import Alarm

User = get_user_model()

class Team(models.Model):
    TEAM_TYPES = [
        ('power', 'Power'),
        ('ip', 'IP'),
        ('transmission', 'Transmission'),
        ('bss', 'BSS'),
    ]
    
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=TEAM_TYPES, unique=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Équipe'
        verbose_name_plural = 'Équipes'
    
    def __str__(self):
        return self.name

class Ticket(models.Model):
    STATUS_CHOICES = [
        ('open', 'Ouvert'),
        ('in_progress', 'En cours'),
        ('resolved', 'Résolu'),
        ('closed', 'Fermé'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Basse'),
        ('medium', 'Moyenne'),
        ('high', 'Haute'),
    ]
    
    alarm = models.OneToOneField(Alarm, on_delete=models.CASCADE, related_name='ticket')
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='tickets')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tickets')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    title = models.CharField(max_length=200)
    description = models.TextField()
    resolution = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Ticket'
        verbose_name_plural = 'Tickets'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Ticket #{self.id} - {self.alarm.site.name}"

class TicketUpdate(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='updates')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    comment = models.TextField()
    status_changed_from = models.CharField(max_length=20, blank=True)
    status_changed_to = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Mise à jour de ticket'
        verbose_name_plural = 'Mises à jour de tickets'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Update #{self.id} - Ticket #{self.ticket.id}"

class TicketAttachment(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='ticket_attachments/')
    filename = models.CharField(max_length=255)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Pièce jointe'
        verbose_name_plural = 'Pièces jointes'
    
    def __str__(self):
        return f"{self.filename} - Ticket #{self.ticket.id}"