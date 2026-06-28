import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { categories as defaultCategories } from '../data/mockData';

const LibraryContext = createContext();

export function useLibrary() {
  return useContext(LibraryContext);
}

const API_URL = 'https://library-management-system-1-0h4b.onrender.com/api';

export function LibraryProvider({ children }) {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [userLogs, setUserLogs] = useState([]);
  
  const [loading, setLoading] = useState(true);

  const categories = useMemo(() => {
    const uniqueCats = new Set(defaultCategories);
    books.forEach(b => {
      if (b.category) uniqueCats.add(b.category);
    });
    return Array.from(uniqueCats).sort();
  }, [books]);

  const fetchData = async () => {
    try {
      const t = new Date().getTime();
      const [booksRes, usersRes, issuedRes, requestsRes, logsRes, notifsRes] = await Promise.all([
        axios.get(`${API_URL}/books?t=${t}`),
        axios.get(`${API_URL}/users?t=${t}`),
        axios.get(`${API_URL}/issued?t=${t}`),
        axios.get(`${API_URL}/requests?t=${t}`),
        axios.get(`${API_URL}/logs?t=${t}`),
        axios.get(`${API_URL}/notifications?t=${t}`)
      ]);
      const sortedBooks = booksRes.data.sort((a, b) => {
        const catCompare = a.category.localeCompare(b.category);
        if (catCompare !== 0) return catCompare;
        return a.title.localeCompare(b.title);
      });
      setBooks(sortedBooks);
      setUsers(usersRes.data);
      setIssuedBooks(issuedRes.data);
      setRequests(requestsRes.data);
      setUserLogs(logsRes.data);
      setNotifications(notifsRes.data);
    } catch (err) {
      console.error("Error fetching data from API", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(() => {
      fetchData();
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  // --- Actions ---
  const addBook = async (newBook) => {
    try {
      const res = await axios.post(`${API_URL}/books`, newBook);
      setBooks(prev => {
        const newBooks = [...prev, res.data];
        return newBooks.sort((a, b) => {
          const catCompare = a.category.localeCompare(b.category);
          if (catCompare !== 0) return catCompare;
          return a.title.localeCompare(b.title);
        });
      });
      return res.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const addPurchaseDetailsNotification = async (bookTitle, purchaseDetails) => {
    try {
      const res = await axios.post(`${API_URL}/notifications`, {
        userId: 'admin',
        message: `Purchase details recorded for "${bookTitle}"`,
        type: 'add_book_details',
        extraData: purchaseDetails
      });
      setNotifications(prev => [res.data, ...prev]);
    } catch (err) {
      console.error("Error creating purchase notification", err);
    }
  };

  const requestBook = async (request) => {
    try {
      const res = await axios.post(`${API_URL}/requests`, request);
      setRequests(prev => [...prev, res.data]);
    } catch (err) {
      console.error(err);
    }
  };

  const approveRequest = async (reqId) => {
    try {
      await axios.put(`${API_URL}/requests/${reqId}`, { status: 'approved' });
      setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'approved' } : r));
      
      // Send notification to the student
      const req = requests.find(r => r.id === reqId);
      if (req && req.userId) {
        const res = await axios.post(`${API_URL}/notifications`, {
          userId: req.userId,
          message: `Your request for the book "${req.bookTitle}" was accepted and added.`,
          type: 'general',
          studentId: req.userId
        });
        setNotifications(prev => [res.data, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const rejectRequest = async (reqId) => {
    try {
      await axios.put(`${API_URL}/requests/${reqId}`, { status: 'rejected' });
      setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'rejected' } : r));
    } catch (err) {
      console.error(err);
    }
  };

  const borrowBook = async (bookId, userId) => {
    try {
      const res = await axios.post(`${API_URL}/issued`, { bookId, userId });
      setIssuedBooks(prev => [...prev, res.data]);
      setBooks(prev => prev.map(b => b.id === bookId ? { ...b, available: b.available - 1 } : b));
    } catch (err) {
      console.error("Error borrowing book", err);
      alert("Failed to borrow book. It might be out of stock.");
    }
  };

  const returnBook = async (issueId) => {
    try {
      await axios.post(`${API_URL}/issued/return/${issueId}`);
      let bookIdToReturn = null;
      setIssuedBooks(prev => prev.map(i => {
        if (i.id === issueId) {
          bookIdToReturn = i.bookId;
          return { ...i, status: 'returned' };
        }
        return i;
      }));
      
      if (bookIdToReturn) {
        setBooks(prev => prev.map(b => b.id === bookIdToReturn ? { ...b, available: b.available + 1 } : b));
      }
      
      const usersRes = await axios.get(`${API_URL}/users`);
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const signupUser = async (userData) => {
    try {
      const res = await axios.post(`${API_URL}/auth/signup`, userData);
      setUsers(prev => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const loginUser = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      return res.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const createLoginLog = async (userId, name, email, loginDate, loginTime) => {
    try {
      const res = await axios.post(`${API_URL}/logs`, { userId, name, email, loginDate, loginTime });
      setUserLogs(prev => [res.data, ...prev]);
      return res.data;
    } catch (err) {
      console.error("Error creating login log", err);
    }
  };

  const logStudentLogout = async (logId, logoutDate, logoutTime) => {
    try {
      await axios.post(`${API_URL}/logs/logout`, { logId, logoutDate, logoutTime });
      setUserLogs(prev => prev.map(l => l.id === logId ? { ...l, logoutDate, logoutTime } : l));
    } catch (err) {
      console.error("Error logging logout", err);
    }
  };

  const deleteUser = async (userId) => {
    try {
      await axios.delete(`${API_URL}/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
      setUserLogs(prev => prev.filter(l => l.userId !== userId));
    } catch (err) {
      console.error("Error deleting user", err);
      throw err;
    }
  };

  const deleteLog = async (logId) => {
    try {
      await axios.delete(`${API_URL}/logs/${logId}`);
      setUserLogs(prev => prev.filter(l => l.id !== logId));
    } catch (err) {
      console.error("Error deleting log", err);
      throw err;
    }
  };

  const createBorrowRequestNotification = async (bookId, userId, proposedDueDate) => {
    try {
      const book = books.find(b => String(b.id) === String(bookId));
      let user = users.find(u => String(u.id) === String(userId));
      
      // Failsafe: if user not in local state, try to fetch fresh from API
      if (!user && userId !== 'u1') {
        const t = new Date().getTime();
        const usersRes = await axios.get(`${API_URL}/users?t=${t}`);
        setUsers(usersRes.data);
        user = usersRes.data.find(u => String(u.id) === String(userId));
      }
      
      const bookTitle = book ? book.title : 'a book';
      const userName = user ? user.name : 'A student';
      const userEmail = user ? user.email : 'No Email';
      
      const message = `Student ${userName} (${userEmail}) requested to borrow "${bookTitle}".`;
      const res = await axios.post(`${API_URL}/notifications`, {
        userId: 'admin',
        message,
        type: 'borrow_request',
        bookId,
        studentId: userId,
        proposedDueDate
      });
      setNotifications(prev => [res.data, ...prev]);
      return res.data;
    } catch (err) {
      console.error("Error creating borrow request notification", err);
    }
  };

  const approveBorrowRequest = async (notifId) => {
    try {
      await axios.put(`${API_URL}/notifications/${notifId}`, { status: 'approved' });
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, status: 'approved', read: true } : n));
      
      const notif = notifications.find(n => n.id === notifId);
      if (notif && notif.studentId && notif.bookId) {
        // The backend `notifications_update` API already inserts into `issuedBooks`
        // and creates a notification for the student automatically.
        // We do NOT need to do it again here.
      }
      const [booksRes, issuedRes, notifsRes] = await Promise.all([
        axios.get(`${API_URL}/books`),
        axios.get(`${API_URL}/issued`),
        axios.get(`${API_URL}/notifications`)
      ]);
      setBooks(booksRes.data);
      setIssuedBooks(issuedRes.data);
      setNotifications(notifsRes.data);
    } catch (err) {
      console.error("Error approving borrow request", err);
      alert(err.response?.data?.error || "Error approving request. The book might be out of stock or deleted.");
      throw err;
    }
  };

  const markNotificationsAsRead = async (notifIds) => {
    try {
      await Promise.all(notifIds.map(id => axios.put(`${API_URL}/notifications/${id}`, { read: true })));
      setNotifications(prev => prev.map(n => notifIds.includes(n.id) ? { ...n, read: true } : n));
    } catch (err) {
      console.error("Error marking notifications as read", err);
    }
  };

  const deleteNotification = async (notifId) => {
    try {
      await axios.delete(`${API_URL}/notifications/${notifId}`);
      setNotifications(prev => prev.filter(n => n.id !== notifId));
    } catch (err) {
      console.error("Error deleting notification", err);
    }
  };

  const rejectBorrowRequest = async (notifId) => {
    try {
      await axios.put(`${API_URL}/notifications/${notifId}`, { status: 'rejected' });
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, status: 'rejected', read: true } : n));
      
      const notif = notifications.find(n => n.id === notifId);
      if (notif && notif.studentId && notif.bookId) {
        const book = books.find(b => b.id === notif.bookId);
        const bookTitle = book ? book.title : 'book';
        
        await axios.post(`${API_URL}/notifications`, {
          userId: notif.studentId,
          message: `Your borrow '${bookTitle}' was rejected.`,
          type: 'general',
          studentId: notif.studentId
        });
        
        // Refresh notifications to show the new one
        const notifsRes = await axios.get(`${API_URL}/notifications`);
        setNotifications(notifsRes.data);
      }
    } catch (err) {
      console.error("Error rejecting borrow request", err);
    }
  };

  const updateBookDetails = async (bookId, bookData) => {
    try {
      const res = await axios.put(`${API_URL}/books/${bookId}`, bookData);
      setBooks(prev => prev.map(b => b.id === bookId ? res.data : b));
      return res.data;
    } catch (err) {
      console.error("Error updating book details", err);
      throw err;
    }
  };

  const deleteBook = async (bookId) => {
    try {
      await axios.delete(`${API_URL}/books/${bookId}`);
      setBooks(prev => prev.filter(b => b.id !== bookId));
    } catch (err) {
      console.error("Error deleting book", err);
      throw err;
    }
  };

  const extendBookDue = async (issueId, newDate) => {
    try {
      const res = await axios.post(`${API_URL}/issued/extend/${issueId}`, { newDate });
      setIssuedBooks(prev => prev.map(i => i.id === issueId ? { ...i, dueDate: res.data.newDueDate, status: 'issued', fine: 0 } : i));
      return res.data;
    } catch (err) {
      console.error("Error extending book due date", err);
      throw err;
    }
  };

  const deleteIssuedBook = async (issueId) => {
    try {
      await axios.delete(`${API_URL}/issued/${issueId}`);
      setIssuedBooks(prev => prev.filter(i => i.id !== issueId));
      fetchData(); // Refresh to update book available counts
    } catch (err) {
      console.error("Error deleting issued book", err);
      throw err;
    }
  };

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <h2 className="text-gradient">Loading Library Data...</h2>
    </div>;
  }

  return (
    <LibraryContext.Provider value={{
      books, users, issuedBooks, requests, notifications, categories, userLogs,
      fetchData,
      addBook, requestBook, approveRequest, rejectRequest, borrowBook, returnBook,
      signupUser, loginUser, createLoginLog, logStudentLogout,
      createBorrowRequestNotification, approveBorrowRequest, rejectBorrowRequest,
      updateBookDetails, deleteBook, extendBookDue, deleteUser, deleteLog,
      markNotificationsAsRead, deleteIssuedBook, deleteNotification, addPurchaseDetailsNotification
    }}>
      {children}
    </LibraryContext.Provider>
  );
}
