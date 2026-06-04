import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { categories } from '../data/mockData';

const LibraryContext = createContext();

export function useLibrary() {
  return useContext(LibraryContext);
}

const API_URL = 'http://localhost:8000/api';

export function LibraryProvider({ children }) {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [userLogs, setUserLogs] = useState([]);
  
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [booksRes, usersRes, issuedRes, requestsRes, logsRes, notifsRes] = await Promise.all([
        axios.get(`${API_URL}/books`),
        axios.get(`${API_URL}/users`),
        axios.get(`${API_URL}/issued`),
        axios.get(`${API_URL}/requests`),
        axios.get(`${API_URL}/logs`),
        axios.get(`${API_URL}/notifications`)
      ]);
      setBooks(booksRes.data);
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
      setBooks(prev => [...prev, res.data]);
    } catch (err) {
      console.error(err);
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

  const createBorrowRequestNotification = async (bookId, userId) => {
    try {
      const book = books.find(b => b.id === bookId);
      const user = users.find(u => u.id === userId);
      if (!book || !user) return;
      
      const message = `Student ${user.name} (${user.email}) requested to borrow "${book.title}".`;
      const res = await axios.post(`${API_URL}/notifications`, {
        userId: 'admin',
        message,
        type: 'borrow_request',
        bookId,
        studentId: userId
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
    }
  };

  const markNotificationsAsRead = async (notifIds) => {
    try {
      await Promise.all(notifIds.map(id => axios.put(`${API_URL}/notifications/${id}`, { status: 'read' })));
      setNotifications(prev => prev.map(n => notifIds.includes(n.id) ? { ...n, read: true, status: 'read' } : n));
    } catch (err) {
      console.error("Error marking notifications as read", err);
    }
  };

  const rejectBorrowRequest = async (notifId) => {
    try {
      await axios.put(`${API_URL}/notifications/${notifId}`, { status: 'rejected' });
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, status: 'rejected', read: true } : n));
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

  const extendBookDue = async (issueId, days) => {
    try {
      const res = await axios.post(`${API_URL}/issued/extend/${issueId}`, { days });
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
      addBook, requestBook, approveRequest, rejectRequest, borrowBook, returnBook,
      signupUser, loginUser, createLoginLog, logStudentLogout,
      createBorrowRequestNotification, approveBorrowRequest, rejectBorrowRequest,
      updateBookDetails, deleteBook, extendBookDue, deleteUser, deleteLog,
      markNotificationsAsRead, deleteIssuedBook
    }}>
      {children}
    </LibraryContext.Provider>
  );
}
