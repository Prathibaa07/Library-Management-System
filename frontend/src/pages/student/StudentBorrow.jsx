import { useState } from 'react';
import { Search } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

export default function StudentBorrow() {
  const { books, categories, createBorrowRequestNotification, issuedBooks, notifications } = useLibrary();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const studentId = localStorage.getItem('studentId') || 'u1';

  const getBookStatus = (bookId) => {
    const isIssued = issuedBooks.some(i => i.bookId === bookId && i.userId === studentId && i.status !== 'returned');
    if (isIssued) return 'Issued';

    const isPending = notifications.some(n => n.type === 'borrow_request' && n.bookId === bookId && n.studentId === studentId && n.status === 'pending');
    if (isPending) return 'Waiting';

    return 'Available';
  };

  const handleBorrow = (book) => {
    if (book.available > 0) {
      createBorrowRequestNotification(book.id, studentId);
      // Removed alert as UI will now update automatically to 'Waiting...'
    } else {
      alert(`Sorry, "${book.title}" is currently out of stock.`);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>Borrow New Books</h2>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '250px', position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="input-field" 
            placeholder="Search by title or author..." 
            style={{ paddingLeft: '3rem', marginBottom: 0 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          className="input-field" 
          style={{ width: '200px', marginBottom: 0 }}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {filteredBooks.map(book => {
          const status = getBookStatus(book.id);
          const isAvailable = status === 'Available' && book.available > 0;
          const isOutOfStock = status === 'Available' && book.available === 0;
          
          return (
            <div key={book.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: '1rem' }}>
                <span className="badge badge-primary" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>{book.category}</span>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{book.title}</h3>
                <p style={{ fontSize: '0.875rem' }}>by {book.author}</p>
              </div>
              
              <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: isAvailable ? 'var(--success)' : isOutOfStock ? 'var(--danger)' : status === 'Waiting' ? 'var(--warning)' : 'var(--primary)' }}>
                    {isOutOfStock ? 'Out of Stock' : status}
                  </p>
                </div>
                <button 
                  className="btn-outline" 
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: isAvailable ? 1 : 0.5 }}
                  onClick={() => handleBorrow(book)}
                  disabled={!isAvailable}
                >
                  {status === 'Waiting' ? 'Waiting...' : status === 'Issued' ? 'Issued' : 'Borrow'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredBooks.length === 0 && (
        <div className="text-center" style={{ padding: '3rem' }}>
          <p>No books found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
