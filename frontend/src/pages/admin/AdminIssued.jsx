import { useLibrary } from '../../context/LibraryContext';
import { Trash2 } from 'lucide-react';

export default function AdminIssued() {
  const { issuedBooks, books, users, returnBook, deleteIssuedBook } = useLibrary();

  const handleDelete = async (issueId) => {
    if (window.confirm("Are you sure you want to delete this issued record?")) {
      await deleteIssuedBook(issueId);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>Issued Books</h2>
      <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        {issuedBooks.length > 0 ? (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1rem' }}>Book</th>
                <th style={{ padding: '1rem' }}>Student Name</th>
                <th style={{ padding: '1rem' }}>Email</th>
                <th style={{ padding: '1rem' }}>Issue Date</th>
                <th style={{ padding: '1rem' }}>Due Date</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Fine</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {issuedBooks.map(issued => {
                const book = books.find(b => b.id === issued.bookId);
                const user = users.find(u => u.id === issued.userId);
                return (
                  <tr key={issued.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{book?.title || 'Unknown'}</td>
                    <td style={{ padding: '1rem' }}>{user?.name || 'Unknown'}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user?.email || 'N/A'}</td>
                    <td style={{ padding: '1rem' }}>{issued.issueDate}</td>
                    <td style={{ padding: '1rem' }}>{issued.dueDate}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge badge-${issued.status === 'overdue' ? 'danger' : issued.status === 'returned' ? 'success' : 'primary'}`}>
                        {issued.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: issued.fine > 0 ? 'var(--danger)' : 'var(--text-main)', fontWeight: 600 }}>
                      ₹{issued.fine}
                    </td>
                    <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                      {issued.status !== 'returned' && (
                        <button className="btn-outline" onClick={() => returnBook(issued.id)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                          Mark Returned
                        </button>
                      )}
                      <button 
                        className="btn-outline" 
                        onClick={() => handleDelete(issued.id)} 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No books currently issued.</p>
        )}
      </div>
    </div>
  );
}
