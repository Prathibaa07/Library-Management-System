from django.contrib import admin
from .models import Book, Member, BorrowRecord


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'isbn', 'genre', 'total_copies', 'available_copies', 'created_at']
    search_fields = ['title', 'author', 'isbn']
    list_filter = ['genre']


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'phone', 'membership_date', 'is_active']
    search_fields = ['name', 'email', 'phone']
    list_filter = ['is_active']


@admin.register(BorrowRecord)
class BorrowRecordAdmin(admin.ModelAdmin):
    list_display = ['book', 'member', 'borrow_date', 'due_date', 'return_date', 'status']
    search_fields = ['book__title', 'member__name']
    list_filter = ['status']
