import { useLibrary } from '../../context/LibraryContext';

export default function AdminRequests() {
  const { requests, users, approveRequest, rejectRequest } = useLibrary();

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>Book Requests</h2>
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        {requests.length > 0 ? (
          <div className="flex-col gap-4">
            {requests.map(req => {
              const user = users.find(u => u.id === req.userId);
              return (
                <div key={req.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '1.125rem' }}>{req.bookTitle}</h4>
                    <p style={{ fontSize: '0.875rem' }}>by {req.author}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Requested by: {user?.name || 'Unknown'}</p>
                  </div>
                  {req.status === 'pending' ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-primary" onClick={() => approveRequest(req.id)} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Approve</button>
                      <button className="btn btn-outline" onClick={() => rejectRequest(req.id)} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Reject</button>
                    </div>
                  ) : (
                    <span className={`badge badge-${req.status === 'approved' ? 'success' : 'danger'}`}>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p>No book requests.</p>
        )}
      </div>
    </div>
  );
}
