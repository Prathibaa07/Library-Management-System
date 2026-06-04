import { Users, BookOpen, BookCheck, ClipboardList, BarChart3 } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { categoryColors } from '../../data/mockData';

export default function AdminDashboard() {
  const { users, books, issuedBooks, requests } = useLibrary();

  // Calculate book counts by category
  const categoryCounts = {};
  books.forEach(book => {
    categoryCounts[book.category] = (categoryCounts[book.category] || 0) + book.totalCopies;
  });

  // Sort and filter top 5 categories
  const sortedCategories = Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const maxCount = Math.max(...sortedCategories.map(c => c.count), 1);

  const stats = [
    { title: 'Total Users', value: users.length, icon: Users, color: 'var(--primary)' },
    { title: 'Total Books', value: books.reduce((acc, book) => acc + book.totalCopies, 0), icon: BookOpen, color: 'var(--secondary)' },
    { title: 'Books Issued', value: issuedBooks.length, icon: BookCheck, color: 'var(--success)' },
    { title: 'Pending Requests', value: requests.filter(r => r.status === 'pending').length, icon: ClipboardList, color: 'var(--warning)' },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>Dashboard Overview</h2>
      
      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: `${stat.color}20`, padding: '1rem', borderRadius: '12px' }}>
                <Icon size={24} color={stat.color} />
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>{stat.title}</p>
                <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Sections Grid: Lists (Left) vs Bar Chart Graph (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        
        {/* Left Column: Requests & Issued Books Stacked */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Recent Book Requests */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ClipboardList size={20} color="var(--primary)" />
              Recent Book Requests
            </h3>
            {requests.length > 0 ? (
              <div className="flex-col gap-3">
                {requests.slice(0, 3).map(req => (
                  <div key={req.id} style={{ padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: 500, color: 'var(--text-main)', fontSize: '0.95rem' }}>{req.bookTitle}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>by {req.author}</p>
                    </div>
                    <span className={`badge badge-${req.status === 'pending' ? 'warning' : req.status === 'approved' ? 'success' : 'danger'}`}>
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No recent requests.</p>
            )}
          </div>

          {/* Recently Issued Books */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookCheck size={20} color="var(--success)" />
              Recently Issued Books
            </h3>
            {issuedBooks.length > 0 ? (
              <div className="flex-col gap-3">
                {issuedBooks.slice(0, 3).map(issued => {
                  const book = books.find(b => b.id === issued.bookId);
                  const user = users.find(u => u.id === issued.userId);
                  return (
                    <div key={issued.id} style={{ padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                      <p style={{ fontWeight: 500, color: 'var(--text-main)', fontSize: '0.95rem' }}>{book?.title || 'Unknown Book'}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Issued to: {user?.name || 'Unknown User'}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem' }}>
                        <span>Due: {issued.dueDate}</span>
                        <span style={{ color: issued.status === 'overdue' ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>
                          {issued.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No recently issued books.</p>
            )}
          </div>
        </div>

        {/* Right Column: Book Categories Bar Graph (Bottom-Right) */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={20} color="var(--secondary)" />
            Top Categories by Book Count
          </h3>
          
          {sortedCategories.length > 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              {/* Vertical Bar Chart Graphic */}
              <div style={{ 
                position: 'relative', 
                height: '240px', 
                display: 'flex', 
                alignItems: 'flex-end', 
                justifyContent: 'space-between', 
                padding: '0 1rem', 
                borderBottom: '1px solid var(--border-color)', 
                marginBottom: '1rem',
                zIndex: 1
              }}>
                {/* Horizontal Dashed Gridlines */}
                <div style={{ position: 'absolute', left: 0, right: 0, top: '25%', borderTop: '1px dashed rgba(255,255,255,0.05)', zIndex: 0 }} />
                <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', borderTop: '1px dashed rgba(255,255,255,0.05)', zIndex: 0 }} />
                <div style={{ position: 'absolute', left: 0, right: 0, top: '75%', borderTop: '1px dashed rgba(255,255,255,0.05)', zIndex: 0 }} />

                {sortedCategories.map(({ category, count }) => {
                  const pct = (count / maxCount) * 100;
                  const barColor = categoryColors[category] || 'var(--primary)';
                  
                  return (
                    <div key={category} style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      flex: 1, 
                      zIndex: 2, 
                      height: '100%', 
                      justifyContent: 'flex-end' 
                    }}>
                      {/* Bar Value Count */}
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                        {count}
                      </span>
                      
                      {/* Interactive Bar */}
                      <div 
                        style={{
                          width: '45%',
                          height: `${pct * 0.75}%`, // reserve top 25% for values
                          background: barColor,
                          borderRadius: '6px 6px 0 0',
                          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          cursor: 'pointer'
                        }}
                        title={`${category}: ${count} Books`}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.filter = 'brightness(1.2)';
                          e.currentTarget.style.transform = 'scaleY(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.filter = 'none';
                          e.currentTarget.style.transform = 'none';
                        }}
                      />
                      
                      {/* Bar Label */}
                      <span style={{ 
                        fontSize: '0.7rem', 
                        marginTop: '0.5rem', 
                        color: 'var(--text-muted)', 
                        textAlign: 'center', 
                        width: '100%', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden' 
                      }}>
                        {category}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              {/* Density legend */}
              <div style={{ padding: '0.5rem 0', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Highest Category: <strong>{sortedCategories[0]?.category}</strong></span>
                <span>Total Copies: {sortedCategories.reduce((a, b) => a + b.count, 0)}</span>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>No book category data available to display.</p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
