import { useEffect } from 'react';
import { useLibrary } from '../../context/LibraryContext';

export default function StudentNotifications() {
  const { notifications, markNotificationsAsRead } = useLibrary();
  const studentId = localStorage.getItem('studentId') || 'u1';
  const studentNotifs = notifications.filter(n => n.userId === studentId);

  useEffect(() => {
    const unreadIds = studentNotifs.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length > 0) {
      markNotificationsAsRead(unreadIds);
    }
  }, [notifications]);

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>Notifications</h2>
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        {studentNotifs.length > 0 ? (
          <div className="flex-col gap-4">
            {studentNotifs.map(notif => (
              <div key={notif.id} style={{ padding: '1rem', background: notif.read ? 'rgba(255,255,255,0.02)' : 'rgba(99,102,241,0.1)', borderLeft: notif.read ? 'none' : '4px solid var(--primary)', borderRadius: '4px' }}>
                <p style={{ color: 'var(--text-main)' }}>{notif.message}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{notif.date}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>You have no notifications.</p>
        )}
      </div>
    </div>
  );
}
