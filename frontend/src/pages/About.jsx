import { BookOpen, ShieldCheck, GraduationCap, Server, Database, Code } from 'lucide-react';

export default function About() {
  return (
    <div className="container animate-fade-in" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
      <div className="text-center" style={{ marginBottom: '3.5rem' }}>
        <span className="badge badge-primary mb-2">About Platform</span>
        <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>LuminaLib Systems</h1>
        <p style={{ fontSize: '1.15rem', maxWidth: '700px', margin: '0 auto' }}>
          LuminaLib is a next-generation library ecosystem that brings students and library administrators closer together through seamless digital catalogs and analytics.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8" style={{ marginBottom: '4rem' }}>
        {/* Student Portal Card */}
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-gradient" style={{ padding: '0.75rem', borderRadius: '12px', background: 'linear-gradient(135deg, var(--secondary), var(--warning))' }}>
              <GraduationCap size={28} color="white" />
            </div>
            <h3 style={{ fontSize: '1.5rem' }}>For Students</h3>
          </div>
          <p style={{ marginBottom: '1rem' }}>
            Browse through thousands of available books by subject, filter instantly, and borrow what you need with a single click.
          </p>
          <ul style={{ listStyleType: 'none', paddingLeft: 0, color: 'var(--text-muted)' }}>
            <li style={{ marginBottom: '0.5rem' }}>✓ Seamless login and registration using school credentials</li>
            <li style={{ marginBottom: '0.5rem' }}>✓ Categorized browsing (Science, Computer, Tamil, History, etc.)</li>
            <li style={{ marginBottom: '0.5rem' }}>✓ Digital request form to request books not currently in the catalog</li>
            <li style={{ marginBottom: '0.5rem' }}>✓ Immediate borrowing validation and due-date tracking</li>
          </ul>
        </div>

        {/* Admin Portal Card */}
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-gradient" style={{ padding: '0.75rem', borderRadius: '12px' }}>
              <ShieldCheck size={28} color="white" />
            </div>
            <h3 style={{ fontSize: '1.5rem' }}>For Administrators</h3>
          </div>
          <p style={{ marginBottom: '1rem' }}>
            Empower library staff with analytics dashboards, approval systems, inventory monitors, and security controls.
          </p>
          <ul style={{ listStyleType: 'none', paddingLeft: 0, color: 'var(--text-muted)' }}>
            <li style={{ marginBottom: '0.5rem' }}>✓ Visual telemetry overview (total users, issued counts)</li>
            <li style={{ marginBottom: '0.5rem' }}>✓ Density analysis of book categories in live bar charts</li>
            <li style={{ marginBottom: '0.5rem' }}>✓ Request management dashboard for approving new stock requests</li>
            <li style={{ marginBottom: '0.5rem' }}>✓ Real-time student login history tracking and audit logging</li>
          </ul>
        </div>
      </div>

      {/* Tech Stack Segment */}
      <h3 className="text-center" style={{ fontSize: '1.75rem', marginBottom: '2rem' }}>Platform Technology Stack</h3>
      <div className="grid grid-cols-3 gap-6">
        <div className="glass-panel text-center" style={{ padding: '1.5rem' }}>
          <Code size={36} color="var(--primary)" style={{ marginBottom: '1rem', display: 'inline-block' }} />
          <h4>Frontend Client</h4>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            React SPA built with Vite. CSS styling crafted using custom-designed glassmorphism utility variables.
          </p>
        </div>
        <div className="glass-panel text-center" style={{ padding: '1.5rem' }}>
          <Server size={36} color="var(--secondary)" style={{ marginBottom: '1rem', display: 'inline-block' }} />
          <h4>Django REST Backend</h4>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Django REST Framework handles secure session validation, catalog querying logic, and administrative updates.
          </p>
        </div>
        <div className="glass-panel text-center" style={{ padding: '1.5rem' }}>
          <Database size={36} color="var(--accent)" style={{ marginBottom: '1rem', display: 'inline-block' }} />
          <h4>MongoDB Datastore</h4>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Flexible Document Store holding user accounts, books database, borrowing entries, and login logs.
          </p>
        </div>
      </div>
    </div>
  );
}
