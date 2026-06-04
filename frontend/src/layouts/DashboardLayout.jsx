import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, BookOpen, BookPlus, ClipboardList, 
  BookCheck, Bell, LogOut, Menu, X, Library
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';

export default function DashboardLayout({ role }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const loginDate = localStorage.getItem('loginDate') || 'N/A';
  const loginTime = localStorage.getItem('loginTime') || 'N/A';
  const studentId = localStorage.getItem('studentId') || 'u1';

  const { logStudentLogout, notifications } = useLibrary();

  const unreadCount = notifications.filter(n => 
    n.userId === (role === 'admin' ? 'admin' : studentId) && !n.read
  ).length;

  const handleLogout = async () => {
    const now = new Date();
    const logoutDate = now.toLocaleDateString();
    const logoutTime = now.toLocaleTimeString();
    
    if (role !== 'admin') {
      const logId = localStorage.getItem('currentLogId');
      if (logId) {
        await logStudentLogout(logId, logoutDate, logoutTime);
      }
    }
    
    localStorage.removeItem(role === 'admin' ? 'isAdmin' : 'studentId');
    localStorage.removeItem('currentLogId');
    localStorage.removeItem('loginDate');
    localStorage.removeItem('loginTime');
    navigate('/');
  };

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Books', path: '/admin/books', icon: BookOpen },
    { name: 'Add Book', path: '/admin/add-book', icon: BookPlus },
    { name: 'Requests', path: '/admin/requests', icon: ClipboardList },
    { name: 'Issued', path: '/admin/issued', icon: BookCheck },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
  ];

  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'My Books', path: '/student/my-books', icon: BookCheck },
    { name: 'Borrow Books', path: '/student/borrow', icon: BookOpen },
    { name: 'Want Book', path: '/student/want-book', icon: BookPlus },
    { name: 'Notifications', path: '/student/notifications', icon: Bell },
  ];

  const links = role === 'admin' ? adminLinks : studentLinks;

  const getBackgroundImage = () => {
    const p = location.pathname;
    if (p.includes('dashboard')) return 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000&auto=format&fit=crop'; // library
    if (p.includes('user')) return 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2000&auto=format&fit=crop'; // people
    if (p.includes('book') || p.includes('issued')) return 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2000&auto=format&fit=crop'; // books stack
    if (p.includes('request')) return 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2000&auto=format&fit=crop'; // desk/paper
    if (p.includes('notification')) return 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?q=80&w=2000&auto=format&fit=crop'; // abstract waves
    return 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000&auto=format&fit=crop';
  };

  return (
    <div className="dashboard-layout">
      {/* Dynamic Background Image */}
      <div 
        style={{
          position: 'fixed',
          inset: '-20px',
          zIndex: -2,
          backgroundImage: `url('${getBackgroundImage()}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(4px)',
          transition: 'background-image 0.5s ease-in-out'
        }}
      />
      {/* Dark Overlay for Readability */}
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          background: 'rgba(2, 6, 23, 0.75)',
        }}
      />
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 5 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="flex items-center gap-2">
            <Library size={24} color="var(--primary)" />
            <span style={{ fontWeight: 600, fontSize: '1.25rem' }}>LuminaLib</span>
          </div>
          <button className="btn-outline" style={{ padding: '0.25rem', border: 'none', display: 'none' }} onClick={() => setSidebarOpen(false)}>
             <X size={20} />
          </button>
        </div>
        
        <div className="sidebar-content">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
                style={{ position: 'relative' }}
              >
                <Icon size={20} />
                {link.name}
                {link.name === 'Notifications' && unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'var(--danger)', color: 'white', fontSize: '0.7rem', fontWeight: 'bold',
                    padding: '0.1rem 0.4rem', borderRadius: '99px'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div style={{ marginTop: 'auto', padding: '1.5rem', borderTop: '1px solid var(--border-color)', background: 'transparent', position: 'sticky', bottom: 0 }}>
          <button className="nav-item w-full" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)' }} onClick={handleLogout}>
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <button 
            className="btn-outline" 
            style={{ display: window.innerWidth <= 768 ? 'block' : 'none', padding: '0.5rem' }} 
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
              {role === 'admin' ? 'Admin Portal' : 'Student Portal'}
            </span>
          </div>
        </div>
        
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
