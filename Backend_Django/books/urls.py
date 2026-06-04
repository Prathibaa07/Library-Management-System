from django.urls import path
from . import views

urlpatterns = [
    # Users
    path('users', views.users_list, name='users_list'),
    path('users/<str:pk>', views.user_delete, name='user_delete'),
    
    # Auth
    path('auth/login', views.auth_login, name='auth_login'),
    path('auth/signup', views.auth_signup, name='auth_signup'),
    
    # Books
    path('books', views.books_list_create, name='books_list_create'),
    
    # Issued Books
    path('issued', views.issued_list_create, name='issued_list_create'),
    path('issued/return/<str:pk>', views.issued_return, name='issued_return'),
    path('issued/<str:pk>', views.issued_delete, name='issued_delete'),
    
    # Requests
    path('requests', views.requests_list_create, name='requests_list_create'),
    path('requests/<str:pk>', views.requests_update, name='requests_update'),
    
    # User Logs
    path('logs', views.logs_list_create, name='logs_list_create'),
    path('logs/logout', views.logs_logout, name='logs_logout'),
    path('logs/<str:pk>', views.log_delete, name='log_delete'),

    # Books single view
    path('books/<str:pk>', views.book_detail, name='book_detail'),

    # Notifications
    path('notifications', views.notifications_list_create, name='notifications_list_create'),
    path('notifications/<str:pk>', views.notifications_update, name='notifications_update'),

    # Extend Book
    path('issued/extend/<str:pk>', views.issued_extend, name='issued_extend'),
]

