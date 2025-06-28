from django.contrib import admin
from .models import Ticket, TicketComment, TicketAttachment


class TicketCommentInline(admin.TabularInline):
    model = TicketComment
    extra = 0
    readonly_fields = ('created_at',)


class TicketAttachmentInline(admin.TabularInline):
    model = TicketAttachment
    extra = 0
    readonly_fields = ('uploaded_at',)


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'site', 'status', 'priority', 'assigned_to', 'created_at')
    list_filter = ('status', 'priority', 'team', 'site__region')
    search_fields = ('title', 'description', 'site__name')
    date_hierarchy = 'created_at'
    inlines = [TicketCommentInline, TicketAttachmentInline]


@admin.register(TicketComment)
class TicketCommentAdmin(admin.ModelAdmin):
    list_display = ('ticket', 'user', 'is_internal', 'created_at')
    list_filter = ('is_internal', 'created_at')
    search_fields = ('ticket__title', 'user__username', 'comment')


@admin.register(TicketAttachment)
class TicketAttachmentAdmin(admin.ModelAdmin):
    list_display = ('ticket', 'filename', 'uploaded_by', 'uploaded_at')
    list_filter = ('uploaded_at',)
    search_fields = ('ticket__title', 'filename', 'uploaded_by__username')