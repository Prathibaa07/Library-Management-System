import { useState } from 'react';
import { Mail, Send, User, MessageSquare } from 'lucide-react';
import axios from 'axios';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });

    try {
      const fullMessage = `Contact Form Submission from ${formData.name} (${formData.email}): ${formData.message}`;
      
      await axios.post('https://library-backend-1-itou.onrender.com/api/notifications', {
        userId: 'admin',
        message: fullMessage,
        type: 'contact',
      });
      
      setStatus({ type: 'success', msg: 'Your message has been sent to the admin successfully!' });
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', msg: 'Failed to send message. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="bg-gradient" style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
            <Mail size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Contact Us</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            Have a question or need assistance? Send a message directly to the library administration.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          {status.msg && (
            <div style={{ 
              padding: '1rem', 
              borderRadius: '8px', 
              marginBottom: '1.5rem',
              background: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${status.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              color: status.type === 'success' ? '#34d399' : '#f87171'
            }}>
              {status.msg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={16} /> Your Name
              </label>
              <input 
                type="text" 
                className="input-field" 
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} /> Email Address
              </label>
              <input 
                type="email" 
                className="input-field" 
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>

            <div className="input-group" style={{ marginBottom: '2rem' }}>
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare size={16} /> Message
              </label>
              <textarea 
                className="input-field" 
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="How can we help you?"
                style={{ minHeight: '150px', resize: 'vertical' }}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-full"
              disabled={loading}
              style={{ fontSize: '1.1rem', padding: '1rem' }}
            >
              {loading ? 'Sending...' : (
                <>
                  <Send size={20} /> Send Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
