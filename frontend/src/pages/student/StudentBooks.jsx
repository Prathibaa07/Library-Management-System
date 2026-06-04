import { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';

export default function StudentBooks() {
  const { issuedBooks, books, extendBookDue } = useLibrary();
  const studentId = localStorage.getItem('studentId') || 'u1';
  const myIssued = issuedBooks.filter(i => i.userId === studentId);

  // Tracks extension days choice per issue record (6, 7, or 8 days, defaults to 7)
  const [extensionDays, setExtensionDays] = useState({});

  const handleDaysChange = (issueId, val) => {
    setExtensionDays(prev => ({ ...prev, [issueId]: val }));
  };

  const handleExtend = async (issueId) => {
    const days = extensionDays[issueId] || '7';
    try {
      await extendBookDue(issueId, parseInt(days));
      alert(`Successfully extended your due date by ${days} days!`);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to extend due date.");
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>My Books History</h2>
      <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        {myIssued.length > 0 ? (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1rem' }}>Book Title</th>
                <th style={{ padding: '1rem' }}>Issue Date</th>
                <th style={{ padding: '1rem' }}>Due Date</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Fine</th>
              </tr>
            </thead>
            <tbody>
              {myIssued.map(issued => {
                const book = books.find(b => b.id === issued.bookId);
                const isActive = issued.status !== 'returned';
                
                return (
                  <tr key={issued.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{book?.title || 'Unknown'}</td>
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>You have not borrowed any books yet.</p>
        )}
      </div>
    </div>
  );
}
