from rest_framework import serializers
from django.utils import timezone
from .models import Book, Member, BorrowRecord


class BookSerializer(serializers.ModelSerializer):
    is_available = serializers.ReadOnlyField()

    class Meta:
        model = Book
        fields = [
            'id', 'title', 'author', 'isbn', 'genre', 'publisher',
            'published_year', 'total_copies', 'available_copies',
            'is_available', 'description', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, data):
        available = data.get('available_copies', getattr(self.instance, 'available_copies', None))
        total = data.get('total_copies', getattr(self.instance, 'total_copies', None))
        if available is not None and total is not None and available > total:
            raise serializers.ValidationError(
                "Available copies cannot exceed total copies."
            )
        return data


class BookListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    is_available = serializers.ReadOnlyField()

    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'isbn', 'genre', 'available_copies', 'total_copies', 'is_available']


class MemberSerializer(serializers.ModelSerializer):
    active_borrows = serializers.ReadOnlyField()

    class Meta:
        model = Member
        fields = [
            'id', 'name', 'email', 'phone', 'address',
            'membership_date', 'is_active', 'active_borrows', 'created_at',
        ]
        read_only_fields = ['membership_date', 'created_at']


class MemberListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    active_borrows = serializers.ReadOnlyField()

    class Meta:
        model = Member
        fields = ['id', 'name', 'email', 'phone', 'is_active', 'active_borrows', 'membership_date']


class BorrowRecordSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_author = serializers.CharField(source='book.author', read_only=True)
    member_name = serializers.CharField(source='member.name', read_only=True)
    member_email = serializers.CharField(source='member.email', read_only=True)

    class Meta:
        model = BorrowRecord
        fields = [
            'id', 'book', 'book_title', 'book_author',
            'member', 'member_name', 'member_email',
            'borrow_date', 'due_date', 'return_date',
            'status', 'notes', 'created_at',
        ]
        read_only_fields = ['borrow_date', 'created_at', 'status']

    def validate(self, data):
        book = data.get('book')
        # On create: check availability
        if self.instance is None and book and book.available_copies < 1:
            raise serializers.ValidationError({"book": "No copies available for this book."})
        return data

    def validate_due_date(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError("Due date cannot be in the past.")
        return value
