from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Team


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'team', 'is_active')
    list_filter = ('role', 'team', 'is_active', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('role', 'phone', 'team')}),
    )


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('name', 'team_type', 'is_active', 'created_at')
    list_filter = ('team_type', 'is_active')
    search_fields = ('name', 'description')