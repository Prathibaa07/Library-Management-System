import { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';

export default function StudentWantBook() {
  const { requestBook } = useLibrary();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    reason: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const studentId = localStorage.getItem('studentId') || 'u1';
    requestBook({
      bookTitle: formData.title,
      author: formData.author,
      userId: studentId,
      reason: formData.reason
    });
    alert(`Request for "${formData.title}" submitted to the admin.`);
    setFormData({ title: '', author: '', reason: '' });
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2>Request a New Book</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Can't find what you're looking for? Let us know!</p>
      </div>
      
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Book Title</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Enter book title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Author Name</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Enter author name"
              value={formData.author}
              onChange={(e) => setFormData({...formData, author: e.target.value})}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Why do you need this book? (Optional)</label>
            <textarea 
              className="input-field" 
              placeholder="E.g., required for upcoming project..."
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              rows="4"
              style={{ resize: 'vertical' }}
            ></textarea>
          </div>

          <button type="submit" className="btn btn-primary w-full mt-4">
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
}
