import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLibrary } from '../../context/LibraryContext';

export default function AdminAddBook() {
  const navigate = useNavigate();
  const { addBook, categories } = useLibrary();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: categories[0],
    totalCopies: 1
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addBook(formData);
    alert(`Book "${formData.title}" added successfully!`);
    navigate('/admin/books');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '2rem' }}>Add New Book</h2>
      
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
            <label className="input-label">Category</label>
            <select 
              className="input-field"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Total Copies</label>
            <input 
              type="number" 
              className="input-field" 
              min="1"
              value={formData.totalCopies}
              onChange={(e) => setFormData({...formData, totalCopies: parseInt(e.target.value)})}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-outline w-full" onClick={() => navigate('/admin/books')}>Cancel</button>
            <button type="submit" className="btn btn-primary w-full">Add Book</button>
          </div>
        </form>
      </div>
    </div>
  );
}
