import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, Plus, Edit3, Trash2, X, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLibrary } from '../../context/LibraryContext';

export default function AdminBooks() {
  const { books, categories, updateBookDetails, deleteBook, issuedBooks } = useLibrary();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingBook, setEditingBook] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', author: '', category: '', totalCopies: '' });
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openEditModal = (book) => {
    setEditingBook(book);
    setEditForm({
      title: book.title,
      author: book.author,
      category: book.category,
      totalCopies: book.totalCopies.toString()
    });
    setEditError('');
  };

  const closeEditModal = () => {
    setEditingBook(null);
    setEditForm({ title: '', author: '', category: '', totalCopies: '' });
    setEditError('');
  };

  const getIssuedCount = (bookId) => {
    return issuedBooks.filter(i => i.bookId === bookId && i.status !== 'returned').length;
  };

  const handleSaveEdit = async () => {
    setEditError('');
    const copies = parseInt(editForm.totalCopies);
    if (isNaN(copies) || copies < 1) {
      setEditError('Total copies must be at least 1.');
      return;
    }

    const issuedCount = getIssuedCount(editingBook.id);
    if (copies < issuedCount) {
      setEditError(`Cannot reduce total copies below ${issuedCount} (currently checked out).`);
      return;
    }

    setSaving(true);
    try {
      await updateBookDetails(editingBook.id, {
        title: editForm.title,
        author: editForm.author,
        category: editForm.category,
        totalCopies: copies
      });
      closeEditModal();
    } catch (err) {
      setEditError(err.response?.data?.error || 'Failed to update book.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const issuedCount = getIssuedCount(editingBook.id);
    if (issuedCount > 0) {
      setEditError(`Cannot delete this book. ${issuedCount} copies are currently checked out.`);
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to permanently delete "${editingBook.title}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      await deleteBook(editingBook.id);
      closeEditModal();
    } catch (err) {
      setEditError(err.response?.data?.error || 'Failed to delete book.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Library Books</h2>
        <Link to="/admin/add-book" className="btn btn-primary">
          <Plus size={20} /> Add New Book
        </Link>
      </div>

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
          const issued = getIssuedCount(book.id);
          return (
            <div key={book.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: '1rem' }}>
                <span className="badge badge-primary" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>{book.category}</span>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{book.title}</h3>
                <p style={{ fontSize: '0.875rem' }}>by {book.author}</p>
              </div>
              
              <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Copies</p>
                    <p style={{ fontWeight: 600 }}>{book.available} / {book.totalCopies}</p>
                  </div>
                  {issued > 0 && (
                    <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                      {issued} checked out
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn btn-primary" 
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                    onClick={() => openEditModal(book)}
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                </div>
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

      {/* Edit Book Modal */}
      {editingBook && createPortal(
        <>
          {/* Backdrop */}
          <div 
            style={{ 
              position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.6)', 
              backdropFilter: 'blur(4px)', zIndex: 100 
            }} 
            onClick={closeEditModal} 
          />

          {/* Modal Panel */}
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            zIndex: 101, width: '100%', maxWidth: '520px'
          }}>
            <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(15, 23, 42, 0.95)' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Edit3 size={20} color="var(--primary)" /> Edit Book
                </h3>
                <button 
                  onClick={closeEditModal} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Error */}
              {editError && (
                <div style={{ 
                  padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.15)', 
                  border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', 
                  marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                  color: '#f87171', fontSize: '0.875rem'
                }}>
                  <AlertTriangle size={16} /> {editError}
                </div>
              )}

              {/* Checked out warning */}
              {getIssuedCount(editingBook.id) > 0 && (
                <div style={{ 
                  padding: '0.75rem 1rem', background: 'rgba(245, 158, 11, 0.1)', 
                  border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', 
                  marginBottom: '1.25rem', fontSize: '0.85rem', color: '#fbbf24',
                  display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}>
                  <AlertTriangle size={16} />
                  {getIssuedCount(editingBook.id)} copies currently checked out. Copies cannot be reduced below this number.
                </div>
              )}

              {/* Form */}
              <div className="input-group">
                <label className="input-label">Book Title</label>
                <input 
                  type="text" className="input-field"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Author</label>
                <input 
                  type="text" className="input-field"
                  value={editForm.author}
                  onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Category</label>
                <select 
                  className="input-field"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="input-group" style={{ marginBottom: '2rem' }}>
                <label className="input-label">Total Copies</label>
                <input 
                  type="number" className="input-field" min="1"
                  value={editForm.totalCopies}
                  onChange={(e) => setEditForm({ ...editForm, totalCopies: e.target.value })}
                  required
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1 }}
                  onClick={handleSaveEdit}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  className="btn-outline" 
                  style={{ 
                    padding: '0.75rem 1.25rem', color: 'var(--danger)', borderColor: 'var(--danger)', 
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem'
                  }}
                  onClick={handleDelete}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          </div>
        </>, document.body
      )}
    </div>
  );
}
