import { Trash2 } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

export default function AdminUsers() {
  const { userLogs, deleteLog } = useLibrary();

  return (
    <div style={{ paddingBottom: '3rem' }}>
      <h2 style={{ marginBottom: '2rem' }}>User Login Details</h2>
      <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem' }}>Name</th>
              <th style={{ padding: '1rem' }}>Email</th>
              <th style={{ padding: '1rem' }}>Date</th>
              <th style={{ padding: '1rem' }}>Login Time</th>
              <th style={{ padding: '1rem' }}>Logout Time</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {userLogs.length > 0 ? (
              userLogs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{log.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{log.email}</td>
                  <td style={{ padding: '1rem' }}>{log.loginDate}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{log.loginTime}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {log.logoutTime ? (
                      <span style={{ color: 'var(--text-muted)' }}>{log.logoutTime}</span>
                    ) : (
                      <span style={{ fontStyle: 'italic', color: 'var(--warning)', fontWeight: 500 }}>Active session...</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge ${log.logoutTime ? 'badge-danger' : 'badge-success'}`}>
                      {log.logoutTime ? 'Logged Out' : 'Active Now'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button 
                      onClick={() => {
                        if(window.confirm('Are you sure you want to delete this log?')) {
                          deleteLog(log.id);
                        }
                      }}
                      className="btn-outline" 
                      style={{ padding: '0.5rem', color: 'var(--danger)', borderColor: 'transparent', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                      title="Delete Detail"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No user login details recorded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
