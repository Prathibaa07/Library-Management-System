from django.db import models
from django.utils import timezone
from datetime import timedelta


class Book(models.Model):
    GENRE_CHOICES = [
        ('fiction', 'Fiction'),
        ('non_fiction', 'Non-Fiction'),
        ('science', 'Science'),
        ('technology', 'Technology'),
        ('history', 'History'),
        ('biography', 'Biography'),
        ('children', "Children's"),
        ('mystery', 'Mystery'),
        ('fantasy', 'Fantasy'),
        ('other', 'Other'),
    ]

    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    isbn = models.CharField(max_length=20, unique=True)
    genre = models.CharField(max_length=50, choices=GENRE_CHOICES, default='other')
    publisher = models.CharField(max_length=255, blank=True)
    published_year = models.IntegerField(null=True, blank=True)
    total_copies = models.PositiveIntegerField(default=1)
    available_copies = models.PositiveIntegerField(default=1)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return f"{self.title} by {self.author}"

    @property
    def is_available(self):
        return self.available_copies > 0


class Member(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    membership_date = models.DateField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.email})"

    @property
    def active_borrows(self):
        return self.borrowrecord_set.filter(status='borrowed').count()


class BorrowRecord(models.Model):
    STATUS_CHOICES = [
        ('borrowed', 'Borrowed'),
        ('returned', 'Returned'),
        ('overdue', 'Overdue'),
    ]

    book = models.ForeignKey(Book, on_delete=models.PROTECT)
    member = models.ForeignKey(Member, on_delete=models.PROTECT)
    borrow_date = models.DateField(auto_now_add=True)
    due_date = models.DateField()
    return_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='borrowed')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-borrow_date']

    def __str__(self):
        return f"{self.member.name} — {self.book.title} ({self.status})"

    def save(self, *args, **kwargs):
        # Auto-set due_date to 14 days from today if not set
        if not self.due_date:
            self.due_date = timezone.now().date() + timedelta(days=14)
        # Auto-update status to overdue if past due and not returned
        if self.status == 'borrowed' and self.due_date < timezone.now().date():
            self.status = 'overdue'
        super().save(*args, **kwargs)
