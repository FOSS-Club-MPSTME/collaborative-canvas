import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';

function Home() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', background: '#0f172a', color: '#f8fafc', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#38bdf8' }}>
        🎨 Live Collaborative Pixel Canvas
      </h1>
      <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
        FOSS Induction Event Installation Route Selector
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', maxWidth: '900px' }}>
        <Link to="/tablet/a" style={cardStyle}>
          <h2>📱 Tablet A Interface</h2>
          <p>Name entry & frame coloring for Tablet A (Frames 1, 3, 5)</p>
        </Link>

        <Link to="/tablet/b" style={cardStyle}>
          <h2>📱 Tablet B Interface</h2>
          <p>Name entry & frame coloring for Tablet B (Frames 2, 4, 6)</p>
        </Link>

        <Link to="/display/canvas" style={{ ...cardStyle, borderColor: '#38bdf8' }}>
          <h2>🖥️ Live Canvas Screen</h2>
          <p>Display 1: Assembled painting, progress & celebratory completion</p>
        </Link>

        <Link to="/display/drawers" style={{ ...cardStyle, borderColor: '#a855f7' }}>
          <h2>👥 Current Drawers Screen</h2>
          <p>Display 2: Active participant names, Notion avatars & active frames</p>
        </Link>

        <Link to="/admin" style={{ ...cardStyle, borderColor: '#ef4444' }}>
          <h2>⚙️ Staff Admin Panel</h2>
          <p>Passcode protected: Frame/painting resets & sequence management</p>
        </Link>
      </div>
    </div>
  );
}

const cardStyle = {
  display: 'block',
  padding: '1.5rem',
  background: '#1e293b',
  borderRadius: '12px',
  border: '2px solid #334155',
  color: '#f8fafc',
  textDecoration: 'none',
  transition: 'transform 0.2s, border-color 0.2s'
};

function RoutePlaceholder({ title, route, tabletId }) {
  return (
    <div style={{ padding: '2rem', background: '#0f172a', color: '#f8fafc', minHeight: '100vh' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#38bdf8' }}>{title}</h1>
        <Link to="/" style={{ color: '#94a3b8', textDecoration: 'underline' }}>← Back to Index</Link>
      </header>
      <div style={{ padding: '2rem', background: '#1e293b', borderRadius: '12px', border: '1px solid #334155' }}>
        <p>Route: <code>{route}</code></p>
        {tabletId && <p>Assigned Tablet: <strong>Tablet {tabletId}</strong></p>}
        <p style={{ color: '#94a3b8', marginTop: '1rem' }}>Component UI will be constructed in Phase 3–6.</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tablet/a" element={<RoutePlaceholder title="Tablet A Interface" route="/tablet/a" tabletId="A" />} />
        <Route path="/tablet/b" element={<RoutePlaceholder title="Tablet B Interface" route="/tablet/b" tabletId="B" />} />
        <Route path="/display/canvas" element={<RoutePlaceholder title="Live Canvas Display" route="/display/canvas" />} />
        <Route path="/display/drawers" element={<RoutePlaceholder title="Current Drawers Display" route="/display/drawers" />} />
        <Route path="/admin" element={<RoutePlaceholder title="Staff Admin Panel" route="/admin" />} />
      </Routes>
    </BrowserRouter>
  );
}
