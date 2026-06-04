import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, GraduationCap } from 'lucide-react';

const featuredBooks = [
  { title: "Introduction to Python", author: "Prof. Yash Pal", category: "Computer", color: "linear-gradient(145deg, #0c4a6e, #0284c7, #38bdf8)" },
  { title: "Organic Chemistry Basics", author: "Dr. A. P. J. Kalam", category: "Chemistry", color: "linear-gradient(145deg, #9a3412, #c2410c, #fb923c)" },
  { title: "Classical Mechanics", author: "Dr. H. C. Verma", category: "Physics", color: "linear-gradient(145deg, #1e3a8a, #1d4ed8, #818cf8)" },
  { title: "Human Anatomy Study", author: "Dr. M. S. Swaminathan", category: "Biology", color: "linear-gradient(145deg, #14532d, #16a34a, #4ade80)" },
  { title: "Ancient World History", author: "Prof. R. Srinivasan", category: "History", color: "linear-gradient(145deg, #881337, #9f1239, #f43f5e)" },
  { title: "Grammar & Composition", author: "Prof. V. K. Rao", category: "English", color: "linear-gradient(145deg, #1e40af, #2563eb, #3b82f6)" },
  { title: "Tamil Ilakkiyam", author: "Dr. S. K. Jain", category: "Tamil", color: "linear-gradient(145deg, #b91c1c, #dc2626, #ea580c)" },
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredBooks.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const book = featuredBooks[currentIndex];

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4rem',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh'
      }}>
        {/* Left Column: Book Slider */}
        <div style={{
          flex: '1 1 300px',
          maxWidth: '380px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Main Book Card Container */}
          <div style={{
            position: 'relative',
            height: '380px',
            width: '260px',
            borderRadius: '12px',
            background: book.color,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(99, 102, 241, 0.1)',
            borderLeft: '6px solid rgba(255, 255, 255, 0.3)',
            transition: 'all 0.5s ease',
            transformStyle: 'preserve-3d',
            perspective: '1000px'
          }}>
            {/* Book spine line */}
            <div style={{
              position: 'absolute',
              left: '8px',
              top: 0,
              bottom: 0,
              width: '1px',
              background: 'rgba(255, 255, 255, 0.2)'
            }} />
            
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              color: 'rgba(255, 255, 255, 0.85)'
            }}>{book.category}</span>
            
            <h3 style={{
              color: '#ffffff',
              fontSize: '1.5rem',
              fontWeight: 700,
              lineHeight: '1.3',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
              margin: '1.5rem 0',
              wordBreak: 'break-word'
            }}>{book.title}</h3>

            <span style={{
              fontSize: '0.9rem',
              color: 'rgba(255, 255, 255, 0.75)',
              fontStyle: 'italic',
              marginTop: 'auto'
            }}>by {book.author}</span>
          </div>

          {/* Bullet Indicators */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginTop: '2rem'
          }}>
            {featuredBooks.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                style={{
                  width: currentIndex === idx ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  border: 'none',
                  background: currentIndex === idx ? 'var(--primary)' : 'rgba(255, 255, 255, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: 0
                }}
                aria-label={`Slide to book ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Portal Info & Links */}
        <div style={{
          flex: '1 1 450px',
          maxWidth: '650px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <h1 className="text-gradient" style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>
            Welcome to LuminaLib
          </h1>
          <p style={{ fontSize: '1.25rem', marginBottom: '2.5rem', lineHeight: '1.6' }}>
            Experience the next generation of library management. Seamlessly browse, borrow, and manage your literary journey.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem'
          }}>
            {/* Admin Portal Card */}
            <Link to="/admin/login" style={{ textDecoration: 'none' }}>
              <div className="glass-panel flex-col items-center justify-center text-center" 
                style={{ 
                  padding: '2.5rem 1.5rem', 
                  transition: 'all 0.3s ease', 
                  cursor: 'pointer', 
                  height: '100%' 
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div className="bg-gradient" style={{ padding: '1.25rem', borderRadius: '50%', marginBottom: '1.25rem', display: 'inline-flex' }}>
                  <ShieldCheck size={36} color="white" />
                </div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Admin Portal</h2>
                <p style={{ fontSize: '0.9rem' }}>Manage books, users, and library operations securely.</p>
              </div>
            </Link>

            {/* Student Portal Card */}
            <Link to="/student/auth" style={{ textDecoration: 'none' }}>
              <div className="glass-panel flex-col items-center justify-center text-center" 
                style={{ 
                  padding: '2.5rem 1.5rem', 
                  transition: 'all 0.3s ease', 
                  cursor: 'pointer', 
                  height: '100%' 
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div className="bg-gradient" style={{ padding: '1.25rem', borderRadius: '50%', marginBottom: '1.25rem', background: 'linear-gradient(135deg, var(--secondary), var(--warning))', display: 'inline-flex' }}>
                  <GraduationCap size={36} color="white" />
                </div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Student Portal</h2>
                <p style={{ fontSize: '0.9rem' }}>Borrow books, request new titles, and track your reads.</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
