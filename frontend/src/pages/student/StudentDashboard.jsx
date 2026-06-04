import { BookCheck, BookOpen, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLibrary } from '../../context/LibraryContext';

export default function StudentDashboard() {
  const { issuedBooks, books } = useLibrary();
  const studentId = localStorage.getItem('studentId') || 'u1';
  const myIssued = issuedBooks.filter(i => i.userId === studentId);
  const myFines = myIssued.reduce((acc, curr) => acc + curr.fine, 0);

  const stats = [
    { title: 'Total Books', value: books.reduce((acc, book) => acc + book.totalCopies, 0), icon: BookOpen, color: 'var(--secondary)' },
    { title: 'Books Borrowed', value: myIssued.filter(i => i.status !== 'returned').length, icon: BookOpen, color: 'var(--primary)' },
    { title: 'Total Fines', value: `₹${myFines}`, icon: AlertCircle, color: 'var(--danger)' },
  ];

  const categoryData = books.reduce((acc, book) => {
    const existing = acc.find(item => item.name === book.category);
    if (existing) {
      existing.count += book.totalCopies;
    } else {
      acc.push({ name: book.category, count: book.totalCopies });
    }
    return acc;
  }, []).sort((a, b) => b.count - a.count).slice(0, 5);

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>My Dashboard</h2>

      <div className="grid grid-cols-3 gap-6 mb-8">
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Currently Borrowed</h3>
          {myIssued.filter(i => i.status !== 'returned').length > 0 ? (
            <div className="flex-col gap-4">
              {myIssued.filter(i => i.status !== 'returned').map(issued => {
                const book = books.find(b => b.id === issued.bookId);
                return (
                  <div key={issued.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '1.125rem' }}>{book?.title || 'Unknown'}</h4>
                      <p style={{ fontSize: '0.875rem' }}>Due Date: {issued.dueDate}</p>
                    </div>
                    <div>
                      {issued.fine > 0 && <span className="badge badge-danger" style={{ marginRight: '1rem' }}>Fine: ₹{issued.fine}</span>}
                      <span className={`badge badge-${issued.status === 'overdue' ? 'danger' : 'primary'}`}>
                        {issued.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>You have no currently borrowed books.</p>
          )}
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Top Book Categories</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-main)' }}
                />
                <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
