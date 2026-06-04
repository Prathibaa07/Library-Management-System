from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import time
from datetime import datetime, timedelta

from .mongo_db import db

# Helper function to format Mongo query results (converts ObjectId to string, etc.)
def clean_doc(doc):
    if doc is None:
        return None
    if '_id' in doc:
        doc['_id'] = str(doc['_id'])
    return doc

def clean_docs(docs):
    return [clean_doc(doc) for doc in docs]

# --- Users ---
@api_view(['GET'])
def users_list(request):
    if db is None:
        return Response({"error": "Database connection failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    users = list(db['users'].find({}, {'password': 0}))
    return Response(clean_docs(users))

@api_view(['DELETE'])
def user_delete(request, pk):
    if db is None:
        return Response({"error": "Database connection failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    result = db['users'].delete_one({'id': pk})
    if result.deleted_count == 0:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    
    # Also delete their logs and requests to keep clean
    db['user_logs'].delete_many({'userId': pk})
    db['requests'].delete_many({'userId': pk})
    
    return Response({"message": "User deleted successfully"})

@api_view(['POST'])
def auth_login(request):
    if db is None:
        return Response({"error": "Database connection failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    email = request.data.get('email')
    password = request.data.get('password')
    
    user = db['users'].find_one({'email': email, 'password': password})
    if not user:
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
    
    return Response(clean_doc(user))

@api_view(['POST'])
def auth_signup(request):
    if db is None:
        return Response({"error": "Database connection failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    name = request.data.get('name')
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not name or not email or not password:
        return Response({"error": "Please fill all fields"}, status=status.HTTP_400_BAD_REQUEST)
        
    existing_user = db['users'].find_one({'email': email})
    if existing_user:
        return Response({"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)
        
    new_id = 'u' + str(int(time.time() * 1000))
    new_user = {
        'id': new_id,
        'name': name,
        'email': email,
        'password': password,
        'role': 'student'
    }
    
    db['users'].insert_one(new_user)
    # Return user details without password
    res_user = new_user.copy()
    res_user.pop('password', None)
    return Response(clean_doc(res_user))

# --- Books ---
@api_view(['GET', 'POST'])
def books_list_create(request):
    if db is None:
        return Response({"error": "Database connection failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    if request.method == 'GET':
        books = list(db['books'].find({}))
        return Response(clean_docs(books))
        
    elif request.method == 'POST':
        title = request.data.get('title')
        author = request.data.get('author')
        category = request.data.get('category')
        totalCopies = request.data.get('totalCopies')
        
        if not title or not author or not category or totalCopies is None:
            return Response({"error": "Please fill all fields"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            totalCopies = int(totalCopies)
        except ValueError:
            return Response({"error": "Invalid copies count"}, status=status.HTTP_400_BAD_REQUEST)
            
        new_id = 'b' + str(int(time.time() * 1000))
        new_book = {
            'id': new_id,
            'title': title,
            'author': author,
            'category': category,
            'totalCopies': totalCopies,
            'available': totalCopies
        }
        
        db['books'].insert_one(new_book)
        return Response(clean_doc(new_book))

# --- Issued Books ---
@api_view(['GET', 'POST'])
def issued_list_create(request):
    if db is None:
        return Response({"error": "Database connection failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    if request.method == 'GET':
        today_str = datetime.now().strftime('%Y-%m-%d')
        # Check active issued books and mark overdue if past due
        overdue_records = list(db['issuedBooks'].find({'status': 'issued', 'dueDate': {'$lt': today_str}}))
        for rec in overdue_records:
            db['issuedBooks'].update_one(
                {'id': rec['id']},
                {'$set': {'status': 'overdue', 'fine': 10}}
            )
        issued = list(db['issuedBooks'].find({}))
        return Response(clean_docs(issued))
        
    elif request.method == 'POST':
        bookId = request.data.get('bookId')
        userId = request.data.get('userId')
        
        if not bookId or not userId:
            return Response({"error": "Missing bookId or userId"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Check if book is available
        book = db['books'].find_one({'id': bookId})
        if not book:
            return Response({"error": "Book not found"}, status=status.HTTP_404_NOT_FOUND)
            
        if book.get('available', 0) <= 0:
            return Response({"error": "Book out of stock"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Update book availability (atomic decrement)
        db['books'].update_one({'id': bookId}, {'$inc': {'available': -1}})
        
        new_id = 'i' + str(int(time.time() * 1000))
        issueDate = datetime.now().strftime('%Y-%m-%d')
        dueDate = (datetime.now() + timedelta(days=14)).strftime('%Y-%m-%d')
        
        new_issue = {
            'id': new_id,
            'bookId': bookId,
            'userId': userId,
            'issueDate': issueDate,
            'dueDate': dueDate,
            'status': 'issued',
            'fine': 0
        }
        
        db['issuedBooks'].insert_one(new_issue)
        return Response(clean_doc(new_issue))

@api_view(['POST'])
def issued_return(request, pk):
    if db is None:
        return Response({"error": "Database connection failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    issue_record = db['issuedBooks'].find_one({'id': pk, 'status': {'$ne': 'returned'}})
    if not issue_record:
        return Response({"error": "Invalid or already returned issue record"}, status=status.HTTP_400_BAD_REQUEST)
        
    # Mark record as returned
    db['issuedBooks'].update_one({'id': pk}, {'$set': {'status': 'returned'}})
    
    # Increment book availability
    db['books'].update_one({'id': issue_record['bookId']}, {'$inc': {'available': 1}})
    
    return Response({"message": "Book returned successfully"})

@api_view(['DELETE'])
def issued_delete(request, pk):
    if db is None:
        return Response({"error": "Database connection failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    issue_record = db['issuedBooks'].find_one({'id': pk})
    if not issue_record:
        return Response({"error": "Issued record not found"}, status=status.HTTP_404_NOT_FOUND)
        
    # If the book was not returned, we must restore the available count
    if issue_record.get('status') != 'returned':
        db['books'].update_one({'id': issue_record['bookId']}, {'$inc': {'available': 1}})
        
    db['issuedBooks'].delete_one({'id': pk})
    
    return Response({"message": "Issued record deleted successfully"})

# --- Requests ---
@api_view(['GET', 'POST'])
def requests_list_create(request):
    if db is None:
        return Response({"error": "Database connection failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    if request.method == 'GET':
        requests = list(db['requests'].find({}))
        return Response(clean_docs(requests))
        
    elif request.method == 'POST':
        userId = request.data.get('userId')
        bookTitle = request.data.get('bookTitle')
        author = request.data.get('author')
        reason = request.data.get('reason')
        
        if not userId or not bookTitle or not author:
            return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)
            
        new_id = 'r' + str(int(time.time() * 1000))
        date = datetime.now().strftime('%Y-%m-%d')
        
        new_request = {
            'id': new_id,
            'userId': userId,
            'bookTitle': bookTitle,
            'author': author,
            'reason': reason or '',
            'status': 'pending',
            'date': date
        }
        
        db['requests'].insert_one(new_request)
        return Response(clean_doc(new_request))

@api_view(['PUT'])
def requests_update(request, pk):
    if db is None:
        return Response({"error": "Database connection failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    status_val = request.data.get('status')
    if not status_val:
        return Response({"error": "Status is required"}, status=status.HTTP_400_BAD_REQUEST)
        
    result = db['requests'].update_one({'id': pk}, {'$set': {'status': status_val}})
    if result.matched_count == 0:
        return Response({"error": "Request not found"}, status=status.HTTP_404_NOT_FOUND)
        
    return Response({"message": "Request updated"})

# --- User Logs ---
@api_view(['GET', 'POST'])
def logs_list_create(request):
    if db is None:
        return Response({"error": "Database connection failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    if request.method == 'GET':
        logs = list(db['user_logs'].find({}))
        return Response(clean_docs(logs)[::-1]) # return newest logs first
        
    elif request.method == 'POST':
        userId = request.data.get('userId')
        name = request.data.get('name')
        email = request.data.get('email')
        loginDate = request.data.get('loginDate')
        loginTime = request.data.get('loginTime')
        
        if not userId or not name or not email:
            return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)
            
        new_id = 'l' + str(int(time.time() * 1000))
        new_log = {
            'id': new_id,
            'userId': userId,
            'name': name,
            'email': email,
            'loginDate': loginDate,
            'loginTime': loginTime,
            'logoutDate': '',
            'logoutTime': ''
        }
        
        db['user_logs'].insert_one(new_log)
        return Response(clean_doc(new_log))

@api_view(['POST'])
def logs_logout(request):
    if db is None:
        return Response({"error": "Database connection failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    db['user_logs'].update_one(
        {'id': logId},
        {'$set': {'logoutDate': logoutDate, 'logoutTime': logoutTime}}
    )
    return Response({"message": "Logout logged successfully"})

@api_view(['DELETE'])
def log_delete(request, pk):
    if db is None:
        return Response({"error": "Database connection failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    result = db['user_logs'].delete_one({'id': pk})
    if result.deleted_count == 0:
        return Response({"error": "Log not found"}, status=status.HTTP_404_NOT_FOUND)
        
    return Response({"message": "Log deleted successfully"})


# --- Book Editing and Deletion ---
@api_view(['PUT', 'DELETE'])
def book_detail(request, pk):
    if db is None:
        return Response({"error": "Database connection failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    if request.method == 'PUT':
        title = request.data.get('title')
        author = request.data.get('author')
        category = request.data.get('category')
        totalCopies = request.data.get('totalCopies')
        
        if not title or not author or not category or totalCopies is None:
            return Response({"error": "Please fill all fields"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            totalCopies = int(totalCopies)
        except ValueError:
            return Response({"error": "Invalid copies count"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Fetch book to calculate available copies delta
        book = db['books'].find_one({'id': pk})
        if not book:
            return Response({"error": "Book not found"}, status=status.HTTP_404_NOT_FOUND)
            
        issued_copies = book.get('totalCopies', 0) - book.get('available', 0)
        if totalCopies < issued_copies:
            return Response({"error": f"Total copies cannot be less than issued copies ({issued_copies})"}, status=status.HTTP_400_BAD_REQUEST)
            
        new_available = totalCopies - issued_copies
        
        db['books'].update_one(
            {'id': pk},
            {'$set': {
                'title': title,
                'author': author,
                'category': category,
                'totalCopies': totalCopies,
                'available': new_available
            }}
        )
        updated_book = db['books'].find_one({'id': pk})
        return Response(clean_doc(updated_book))
        
    elif request.method == 'DELETE':
        result = db['books'].delete_one({'id': pk})
        if result.deleted_count == 0:
            return Response({"error": "Book not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response({"message": "Book deleted successfully"})


# --- Notifications System ---
@api_view(['GET', 'POST'])
def notifications_list_create(request):
    if db is None:
        return Response({"error": "Database connection failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    if request.method == 'GET':
        notifs = list(db['notifications'].find({}))
        return Response(clean_docs(notifs)[::-1])
        
    elif request.method == 'POST':
        userId = request.data.get('userId')
        message = request.data.get('message')
        notif_type = request.data.get('type')
        bookId = request.data.get('bookId')
        studentId = request.data.get('studentId')
        
        if not userId or not message:
            return Response({"error": "userId and message are required"}, status=status.HTTP_400_BAD_REQUEST)
            
        new_id = 'n' + str(int(time.time() * 1000))
        date = datetime.now().strftime('%Y-%m-%d')
        
        new_notif = {
            'id': new_id,
            'userId': userId,
            'message': message,
            'type': notif_type or 'info',
            'status': 'pending',
            'bookId': bookId or '',
            'studentId': studentId or '',
            'date': date,
            'read': False
        }
        
        db['notifications'].insert_one(new_notif)
        return Response(clean_doc(new_notif))

@api_view(['PUT'])
def notifications_update(request, pk):
    if db is None:
        return Response({"error": "Database connection failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    status_val = request.data.get('status')
    if not status_val:
        return Response({"error": "Status is required"}, status=status.HTTP_400_BAD_REQUEST)
        
    notif = db['notifications'].find_one({'id': pk})
    if not notif:
        return Response({"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)
        
    db['notifications'].update_one({'id': pk}, {'$set': {'status': status_val, 'read': True}})
    
    # If approved, perform checkout actions
    if status_val == 'approved' and notif.get('type') == 'borrow_request':
        bookId = notif.get('bookId')
        userId = notif.get('studentId')
        
        # Check stock
        book = db['books'].find_one({'id': bookId})
        if not book:
            return Response({"error": "Book not found"}, status=status.HTTP_404_NOT_FOUND)
            
        if book.get('available', 0) <= 0:
            return Response({"error": "Book out of stock"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Atomic decrement
        db['books'].update_one({'id': bookId}, {'$inc': {'available': -1}})
        
        new_issue_id = 'i' + str(int(time.time() * 1000))
        issueDate = datetime.now().strftime('%Y-%m-%d')
        dueDate = (datetime.now() + timedelta(days=14)).strftime('%Y-%m-%d')
        
        new_issue = {
            'id': new_issue_id,
            'bookId': bookId,
            'userId': userId,
            'issueDate': issueDate,
            'dueDate': dueDate,
            'status': 'issued',
            'fine': 0
        }
        db['issuedBooks'].insert_one(new_issue)
        
        db['notifications'].insert_one({
            'id': str(uuid.uuid4()),
            'userId': userId,
            'message': "Your borrow book was accepted.",
            'type': 'general',
            'status': 'unread',
            'read': False,
            'date': datetime.now().strftime("%Y-%m-%d %H:%M")
        })
        
    return Response({"message": "Notification status updated successfully"})


# --- Due Date Extension ---
@api_view(['POST'])
def issued_extend(request, pk):
    if db is None:
        return Response({"error": "Database connection failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    days = request.data.get('days')
    try:
        days = int(days)
    except (TypeError, ValueError):
        return Response({"error": "Invalid days amount"}, status=status.HTTP_400_BAD_REQUEST)
        
    if days < 6 or days > 8:
        return Response({"error": "Extensions must be between 6 and 8 days"}, status=status.HTTP_400_BAD_REQUEST)
        
    record = db['issuedBooks'].find_one({'id': pk})
    if not record:
        return Response({"error": "Issued record not found"}, status=status.HTTP_404_NOT_FOUND)
        
    try:
        curr_due = datetime.strptime(record['dueDate'], '%Y-%m-%d')
    except Exception:
        curr_due = datetime.now()
        
    new_due = (curr_due + timedelta(days=days)).strftime('%Y-%m-%d')
    
    db['issuedBooks'].update_one(
        {'id': pk},
        {'$set': {'dueDate': new_due, 'status': 'issued', 'fine': 0}}
    )
    return Response({"message": f"Due date extended successfully to {new_due}", "newDueDate": new_due})

