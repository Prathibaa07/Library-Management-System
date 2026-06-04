import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import StudentAuth from './pages/StudentAuth';
import Books from './pages/Books';
import About from './pages/About';
import Contact from './pages/Contact';
import DashboardLayout from './layouts/DashboardLayout';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminBooks from './pages/admin/AdminBooks';
import AdminAddBook from './pages/admin/AdminAddBook';
import AdminRequests from './pages/admin/AdminRequests';
import AdminIssued from './pages/admin/AdminIssued';
import AdminNotifications from './pages/admin/AdminNotifications';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentBooks from './pages/student/StudentBooks';
import StudentBorrow from './pages/student/StudentBorrow';
import StudentWantBook from './pages/student/StudentWantBook';
import StudentNotifications from './pages/student/StudentNotifications';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes with Navbar */}
        <Route path="/" element={
          <>
            <Navbar />
            <Home />
          </>
        } />
        <Route path="/admin/login" element={
          <>
            <Navbar />
            <AdminLogin />
          </>
        } />
        <Route path="/student/auth" element={
          <>
            <Navbar />
            <StudentAuth />
          </>
        } />
        <Route path="/books" element={
          <>
            <Navbar />
            <Books />
          </>
        } />
        <Route path="/about" element={
          <>
            <Navbar />
            <About />
          </>
        } />
        <Route path="/contact" element={
          <>
            <Navbar />
            <Contact />
          </>
        } />
        
        {/* Admin Dashboard Routes */}
        <Route path="/admin/*" element={<DashboardLayout role="admin" />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="books" element={<AdminBooks />} />
          <Route path="add-book" element={<AdminAddBook />} />
          <Route path="requests" element={<AdminRequests />} />
          <Route path="issued" element={<AdminIssued />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        {/* Student Dashboard Routes */}
        <Route path="/student/*" element={<DashboardLayout role="student" />}>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="my-books" element={<StudentBooks />} />
          <Route path="borrow" element={<StudentBorrow />} />
          <Route path="want-book" element={<StudentWantBook />} />
          <Route path="notifications" element={<StudentNotifications />} />
          <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
