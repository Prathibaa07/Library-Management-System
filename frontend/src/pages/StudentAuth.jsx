import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';

export default function StudentAuth() {
  const [mode, setMode] = useState('login'); // login, signup, forgot
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { loginUser, signupUser, createLoginLog } = useLibrary();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (mode === 'login') {
        const user = await loginUser(email, password);
        if (user.role === 'student') {
          localStorage.setItem('studentId', user.id);
          const now = new Date();
          const lDate = now.toLocaleDateString();
          const lTime = now.toLocaleTimeString();
          localStorage.setItem('loginDate', lDate);
          localStorage.setItem('loginTime', lTime);
          
          const logRecord = await createLoginLog(user.id, user.name, user.email, lDate, lTime);
          if (logRecord && logRecord.id) {
            localStorage.setItem('currentLogId', logRecord.id);
          }
          navigate('/student/dashboard');
        } else {
          setError('Invalid role.');
        }
      } else if (mode === 'signup') {
        const user = await signupUser({ name, email, password });
        localStorage.setItem('studentId', user.id);
        const now = new Date();
        const lDate = now.toLocaleDateString();
        const lTime = now.toLocaleTimeString();
        localStorage.setItem('loginDate', lDate);
        localStorage.setItem('loginTime', lTime);
        
        const logRecord = await createLoginLog(user.id, user.name, user.email, lDate, lTime);
        if (logRecord && logRecord.id) {
          localStorage.setItem('currentLogId', logRecord.id);
        }
        navigate('/student/dashboard');
      } else {
        alert('Password reset link sent to ' + email);
        setMode('login');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed.');
    }
  };

  return (
    <div className="container flex items-center justify-center" style={{ minHeight: 'calc(100vh - 100px)' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <div className="flex-col items-center mb-6">
          <div className="bg-gradient" style={{ padding: '1rem', borderRadius: '50%', marginBottom: '1rem', background: 'linear-gradient(135deg, var(--secondary), var(--warning))' }}>
            <UserCircle size={32} color="white" />
          </div>
          <h2 className="text-center" style={{ fontSize: '1.5rem' }}>
            {mode === 'login' ? 'Student Login' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
          </h2>
        </div>

        {error && (
          <div className="badge badge-danger mb-4 text-center" style={{ padding: '0.5rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          {mode !== 'forgot' && (
            <div className="input-group" style={{ marginBottom: mode === 'login' ? '0.5rem' : '2rem' }}>
              <label className="input-label">Password</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}

          {mode === 'login' && (
            <div className="text-right mb-6">
              <button type="button" onClick={() => setMode('forgot')} style={{ background: 'none', border: 'none', color: 'var(--secondary)', cursor: 'pointer', fontSize: '0.875rem' }}>
                Forgot Password?
              </button>
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full" style={{ background: 'linear-gradient(135deg, var(--secondary), var(--warning))', boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)' }}>
            {mode === 'login' ? 'Login' : mode === 'signup' ? 'Sign Up' : 'Send Reset Link'}
          </button>
        </form>

        <div className="text-center mt-6" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {mode === 'login' ? (
            <>Don't have an account? <button type="button" onClick={() => setMode('signup')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>Sign up</button></>
          ) : mode === 'signup' ? (
            <>Already have an account? <button type="button" onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>Login</button></>
          ) : (
            <button type="button" onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>Back to Login</button>
          )}
        </div>
      </div>
    </div>
  );
}
