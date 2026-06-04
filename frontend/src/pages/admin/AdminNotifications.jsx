import { useLibrary } from '../../context/LibraryContext';
import { Bell, CheckCircle2, XCircle, BookOpen, Clock } from 'lucide-react';

export default function AdminNotifications() {
  const { notifications, books, users, approveBorrowRequest, rejectBorrowRequest } = useLibrary();
  const adminNotifs = notifications.filter(n => n.userId === 'admin');

  const handleApprove = async (notifId) => {
    await approveBorrowRequest(notifId);
  };

  const handleReject = async (notifId) => {
    await rejectBorrowRequest(notifId);
  };

  return (
    <div>
      <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Bell size={24} color="var(--primary)" />
        Notifications
      </h2>
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        {adminNotifs.length > 0 ? (
          <div className="flex-col gap-4">
            {adminNotifs.map(notif => {
              const book = books.find(b => b.id === notif.bookId);
              const student = users.find(u => u.id === notif.studentId);
              const isPending = notif.status === 'pending';
              const isApproved = notif.status === 'approved';
              const isRejected = notif.status === 'rejected';
              const isBorrowRequest = notif.type === 'borrow_request';

              return (
                <div 
                  key={notif.id} 
                  style={{ 
                    padding: '1.25rem', 
                    background: isPending ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255,255,255,0.02)', 
                    borderLeft: isPending ? '4px solid var(--primary)' : isApproved ? '4px solid var(--success)' : '4px solid var(--danger)',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      {isBorrowRequest ? (
                        <BookOpen size={16} color="var(--primary)" />
                      ) : (
                        <Bell size={16} color="var(--text-muted)" />
                      )}
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>
                        {isBorrowRequest ? 'Borrow Request' : 'Notification'}
                      </span>
                    </div>

                    <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '0.5rem' }}>
                      {notif.message}
                    </p>

                    {isBorrowRequest && book && (
                      <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        <span>Book: <strong style={{ color: 'var(--text-main)' }}>{book.title}</strong></span>
                        <span>Available: <strong>{book.available}/{book.totalCopies}</strong></span>
                        {student && <span>Student: <strong>{student.name}</strong></span>}
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} /> {notif.date}
                      </span>
                      <span className={`badge badge-${isApproved ? 'success' : isRejected ? 'danger' : 'warning'}`}>
                        {notif.status.charAt(0).toUpperCase() + notif.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {isPending && isBorrowRequest && (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                        onClick={() => handleApprove(notif.id)}
                      >
                        <CheckCircle2 size={16} /> Approve
                      </button>
                      <button 
                        className="btn-outline" 
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: 'var(--danger)', borderColor: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}
                        onClick={() => handleReject(notif.id)}
                      >
                        <XCircle size={16} /> Reject
                      </button>
                    </div>
                  )}

                  {!isPending && (
                    <div style={{ flexShrink: 0 }}>
                      {isApproved ? (
                        <CheckCircle2 size={24} color="var(--success)" />
                      ) : (
                        <XCircle size={24} color="var(--danger)" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>No notifications yet.</p>
        )}
      </div>
    </div>
  );
}
