import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Search } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
       navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
       navigate('/books');
    }
  };

  const getBackgroundImage = () => {
    const p = location.pathname;
    if (p.includes('admin/login') || p.includes('student/auth')) return 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2000&auto=format&fit=crop'; // people
    if (p.includes('book')) return 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2000&auto=format&fit=crop'; // books stack
    if (p.includes('about')) return 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2000&auto=format&fit=crop'; // abstract desk
    if (p.includes('contact')) return 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?q=80&w=2000&auto=format&fit=crop'; // abstract
    return 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000&auto=format&fit=crop'; // library (home)
  };

  return (
    <>
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
      
      <nav className="glass-nav" style={{ position: 'sticky', top: 0, zIndex: 50, padding: '1rem 0' }}>
      <div className="container flex items-center justify-between" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
          <div className="bg-gradient" style={{ padding: '0.5rem', borderRadius: '8px' }}>
            <BookOpen size={24} color="white" />
          </div>
          <span className="text-gradient" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            LuminaLib
          </span>
        </Link>

        <div className="flex gap-6 items-center" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search books..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '0.4rem 1rem 0.4rem 2.2rem',
                borderRadius: '20px',
                border: '1px solid var(--border-color)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-main)',
                outline: 'none',
                width: '180px',
                fontSize: '0.875rem',
                transition: 'all 0.3s'
              }}
            />
          </form>
          
          <Link to="/" style={{ textDecoration: 'none', color: location.pathname === '/' ? 'var(--primary)' : 'var(--text-main)', fontWeight: 500 }}>Home</Link>
          <Link to="/about" style={{ textDecoration: 'none', color: location.pathname === '/about' ? 'var(--primary)' : 'var(--text-main)', fontWeight: 500 }}>About</Link>
          <Link to="/books" style={{ textDecoration: 'none', color: location.pathname === '/books' ? 'var(--primary)' : 'var(--text-main)', fontWeight: 500 }}>Books</Link>
          <Link to="/admin/login" style={{ textDecoration: 'none', color: location.pathname === '/admin/login' ? 'var(--primary)' : 'var(--text-main)', fontWeight: 500 }}>Admin</Link>
          <Link to="/student/auth" style={{ textDecoration: 'none', color: location.pathname === '/student/auth' ? 'var(--primary)' : 'var(--text-main)', fontWeight: 500 }}>Student</Link>
          <Link to="/contact" style={{ textDecoration: 'none', color: location.pathname === '/contact' ? 'var(--primary)' : 'var(--text-main)', fontWeight: 500 }}>Contact</Link>
        </div>
      </div>
    </nav>
      {location.pathname !== '/' && (
        <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '0.5rem' }}>
          <Link to="/" className="btn-back">
            ← Back to Home
          </Link>
        </div>
      )}
    </>
  );
}
