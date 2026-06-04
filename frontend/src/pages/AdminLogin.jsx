import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { loginUser } = useLibrary();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const user = await loginUser(email, password);
      if (user.role === 'admin') {
        localStorage.setItem('isAdmin', 'true');
        const now = new Date();
        localStorage.setItem('loginDate', now.toLocaleDateString());
        localStorage.setItem('loginTime', now.toLocaleTimeString());
        navigate('/admin/dashboard');
      } else {
        setError('Access denied. Admin role required.');
      }
    } catch (err) {
      setError('Invalid admin credentials.');
    }
  };

  return (
    <div className="container flex items-center justify-center" style={{ minHeight: 'calc(100vh - 100px)' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <div className="flex-col items-center mb-8">
          <div className="bg-gradient" style={{ padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
            <ShieldAlert size={32} color="white" />
          </div>
          <h2 className="text-center" style={{ fontSize: '1.5rem' }}>Admin Access</h2>
        </div>

        {error && (
          <div className="badge badge-danger mb-4 text-center" style={{ padding: '0.5rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label className="input-label">Admin Email</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="admin@library.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group" style={{ marginBottom: '2rem' }}>
            <label className="input-label">Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="admin@123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full">
            Login to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
