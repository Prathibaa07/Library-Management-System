import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, BookOpen, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { categoryColors } from '../data/mockData';

export default function Books() {
  const { books, categories, createBorrowRequestNotification, notifications, issuedBooks } = useLibrary();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const urlSearch = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(48);

  const studentId = localStorage.getItem('studentId');
  const isLoggedIn = !!studentId;

  // Sync state with URL search param
  useEffect(() => {
    setSearchTerm(urlSearch);
  }, [urlSearch]);

  // Reset pagination when filter changes
  useEffect(() => {
    setVisibleCount(48);
  }, [searchTerm, selectedCategory]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (val.trim()) {
      setSearchParams({ search: val });
    } else {
      setSearchParams({});
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBorrow = async (book) => {
    if (!isLoggedIn) {
      navigate('/student/auth');
      return;
    }

    if (book.available > 0) {
      await createBorrowRequestNotification(book.id, studentId);
      setTimeout(() => {
        alert('Wait for admin to accept');
      }, 50);
    } else {
      alert(`Sorry, "${book.title}" is currently out of stock.`);
    }
  };

  const booksToShow = filteredBooks.slice(0, visibleCount);

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }} className="text-gradient">Explore Library Books</h2>
          <p style={{ color: 'var(--text-muted)' }}>Browse and discover from our collection of {filteredBooks.length} school books.</p>
        </div>
      </div>

      {/* Filters & Search Row */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '280px', position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="input-field" 
            placeholder="Search by book title or author..." 
            style={{ paddingLeft: '3rem', marginBottom: 0 }}
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Horizontal Category Row */}
      <div style={{ 
        display: 'flex', 
        gap: '0.75rem', 
        flexWrap: 'wrap', 
        marginBottom: '2.5rem', 
        padding: '0.5rem', 
        background: 'rgba(255,255,255,0.02)', 
        borderRadius: '12px',
        border: '1px solid var(--border-color)'
      }}>
        <button 
          onClick={() => setSelectedCategory('All')}
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: '20px',
            border: '1px solid var(--border-color)',
            background: selectedCategory === 'All' ? 'var(--primary)' : 'transparent',
            color: '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontWeight: 500,
            boxShadow: selectedCategory === 'All' ? '0 4px 10px rgba(99, 102, 241, 0.4)' : 'none'
          }}
        >
          All Categories
        </button>
        {categories.map(cat => {
          const isActive = selectedCategory === cat;
          const catColor = categoryColors[cat] || 'var(--primary)';
          return (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '20px',
                border: '1px solid var(--border-color)',
                background: isActive ? catColor : 'transparent',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontWeight: 500,
                boxShadow: isActive ? '0 4px 10px rgba(0,0,0,0.3)' : 'none'
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-4 gap-6">
        {booksToShow.map(book => {
          const catColor = categoryColors[book.category] || 'linear-gradient(145deg, #1e293b, #0f172a)';
          const isAvailable = book.available > 0;
          const isWaiting = notifications.some(n => n.bookId === book.id && n.studentId === studentId && n.status === 'pending');
          const isIssued = issuedBooks.some(i => i.bookId === book.id && i.userId === studentId && i.status !== 'returned');
          
          return (
            <div 
              key={book.id} 
              className="glass-panel" 
              style={{ 
                padding: '1.25rem', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--glass-shadow)';
              }}
            >
              {/* Decorative Book Cover */}
              <div style={{
                background: catColor,
                height: '180px',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.25rem',
                marginBottom: '1rem',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
                borderLeft: '4px solid rgba(255,255,255,0.25)'
              }}>
                {/* Book spine line */}
                <div style={{
                  position: 'absolute',
                  left: '8px',
                  top: 0,
                  bottom: 0,
                  width: '1px',
                  background: 'rgba(255, 255, 255, 0.2)'
                }} />
                
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: 'rgba(255,255,255,0.85)'
                }}>{book.category}</span>
                
                <h4 style={{
                  color: '#ffffff',
                  fontSize: '1rem',
                  fontWeight: 700,
                  lineHeight: '1.3',
                  textShadow: '0 2px 4px rgba(0,0,0,0.4)',
                  margin: '0.5rem 0',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical'
                }}>{book.title}</h4>

                <span style={{
                  fontSize: '0.75rem',
                  color: 'rgba(255,255,255,0.75)',
                  fontStyle: 'italic',
                  alignSelf: 'flex-start'
                }}>by {book.author}</span>
              </div>

              {/* Book Details & Availability */}
              <div style={{ marginTop: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div className="flex items-center gap-1">
                    {isAvailable ? (
                      <CheckCircle2 size={16} color="var(--success)" />
                    ) : (
                      <AlertCircle size={16} color="var(--danger)" />
                    )}
                    <span style={{ fontSize: '0.75rem', color: isAvailable ? 'var(--success)' : 'var(--danger)' }}>
                      {isAvailable ? `${book.available} Available` : 'Out of Stock'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Total: {book.totalCopies}
                  </span>
                </div>

                <button 
                  className={isIssued ? "btn btn-secondary w-full" : (isWaiting ? "btn-outline w-full" : (isAvailable ? "btn btn-primary w-full" : "btn-outline w-full"))}
                  style={{ 
                    padding: '0.5rem 1rem', 
                    fontSize: '0.875rem',
                    opacity: (isIssued || (!isAvailable && isLoggedIn && !isWaiting)) ? 0.5 : 1,
                    background: isIssued ? 'var(--success)' : (isWaiting ? 'transparent' : ((isAvailable && isLoggedIn) ? 'linear-gradient(135deg, var(--secondary), var(--warning))' : undefined)),
                    color: (isWaiting || isIssued) ? '#ffffff' : (isWaiting ? 'var(--danger)' : undefined),
                    borderColor: isWaiting ? 'var(--danger)' : (isIssued ? 'var(--success)' : undefined),
                    boxShadow: (isAvailable && isLoggedIn && !isWaiting && !isIssued) ? '0 4px 10px rgba(236, 72, 153, 0.3)' : undefined,
                    cursor: (isIssued || isWaiting || (!isAvailable && isLoggedIn)) ? 'not-allowed' : 'pointer'
                  }}
                  onClick={() => !isWaiting && !isIssued && handleBorrow(book)}
                  disabled={isIssued || isWaiting || (isAvailable ? false : isLoggedIn)}
                >
                  {isIssued ? 'Issued' : (isWaiting ? 'Waiting...' : (isLoggedIn ? 'Borrow Book' : 'Login to Borrow'))}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination "Load More" */}
      {filteredBooks.length > visibleCount && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
          <button className="btn btn-primary" onClick={() => setVisibleCount(prev => prev + 48)}>
            Load More Books
          </button>
        </div>
      )}

      {/* Empty State */}
      {filteredBooks.length === 0 && (
        <div className="text-center glass-panel" style={{ padding: '4rem 2rem', marginTop: '2rem' }}>
          <BookOpen size={48} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h3>No Books Found</h3>
          <p style={{ marginTop: '0.5rem' }}>We couldn't find any books matching your search or category filter.</p>
        </div>
      )}
    </div>
  );
}
