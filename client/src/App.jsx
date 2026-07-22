import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import PixelGrid, { MultiFrameCanvas } from './components/PixelGrid';
import ColorPalette, { MASTER_PALETTE } from './components/ColorPalette';
import NotionAvatar, { NotionAvatarPicker } from './components/NotionAvatar';
import TabletView from './views/TabletView';
import LiveCanvasView from './views/LiveCanvasView';
import CurrentDrawersView from './views/CurrentDrawersView';
import AdminView from './views/AdminView';
import './App.css';

function Home() {
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [selectedAvatar, setSelectedAvatar] = useState('coder');
  const [demoGrid, setDemoGrid] = useState(
    Array.from({ length: 16 }, () => Array(16).fill(null))
  );

  const handlePixelChange = (r, c, color) => {
    setDemoGrid(prev => {
      const next = prev.map(row => [...row]);
      next[r][c] = color;
      return next;
    });
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <Navbar title="Collaborative Canvas" subtitle="FOSS Induction Event Booth Installation" />

      {/* Navigation Route Tiles */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Select Route View
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          <Link to="/tablet/a" className="glass-card" style={{ padding: '1.25rem', textDecoration: 'none', color: 'inherit' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📱</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>Tablet A Interface</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Participant drawing view for Tablet A (Frames 1, 3, 5)
            </p>
          </Link>

          <Link to="/tablet/b" className="glass-card" style={{ padding: '1.25rem', textDecoration: 'none', color: 'inherit' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📱</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-purple)' }}>Tablet B Interface</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Participant drawing view for Tablet B (Frames 2, 4, 6)
            </p>
          </Link>

          <Link to="/display/canvas" className="glass-card" style={{ padding: '1.25rem', textDecoration: 'none', color: 'inherit', borderColor: 'rgba(56, 189, 248, 0.4)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🖥️</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>Live Canvas Screen</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Display 1: Real-time assembling master painting & celebration
            </p>
          </Link>

          <Link to="/display/drawers" className="glass-card" style={{ padding: '1.25rem', textDecoration: 'none', color: 'inherit', borderColor: 'rgba(168, 85, 247, 0.4)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>👥</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-purple)' }}>Current Drawers Screen</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Display 2: Active participant cards with Notion avatars
            </p>
          </Link>

          <Link to="/admin" className="glass-card" style={{ padding: '1.25rem', textDecoration: 'none', color: 'inherit', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚙️</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-red)' }}>Staff Admin Panel</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Passcode protected: Frame/painting resets & sequence order
            </p>
          </Link>
        </div>
      </section>

      {/* Component Design System Interactive Sandbox */}
      <section className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
          🎨 Shared Component Design System Sandbox
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          {/* Interactive Grid Sandbox */}
          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '1rem' }}>
              Interactive 16×16 Pixel Grid (Touch-Drag Enabled)
            </h3>
            <PixelGrid
              pixelGrid={demoGrid}
              selectedColor={selectedColor}
              onPixelChange={handlePixelChange}
              cellSize={20}
              frameNumber={1}
            />
            <button
              onClick={() => setDemoGrid(Array.from({ length: 16 }, () => Array(16).fill(null)))}
              style={{
                marginTop: '1rem',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: 'var(--accent-red)',
                border: '1px solid var(--accent-red)44',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Clear Demo Grid
            </button>
          </div>

          {/* Color Palette & Avatar Sandbox */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <ColorPalette selectedColor={selectedColor} onSelectColor={setSelectedColor} />
            </div>

            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <NotionAvatar avatarId={selectedAvatar} size={54} />
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Participant Avatar Preview</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Notion-style visual avatar</p>
                </div>
              </div>
              <NotionAvatarPicker selectedAvatar={selectedAvatar} onSelectAvatar={setSelectedAvatar} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function RoutePlaceholder({ title, route, tabletId }) {
  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <Navbar title={title} subtitle={`Route: ${route}`} tabletId={tabletId} />
      <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--accent-cyan)' }}>{title} View Ready</h2>
        <p style={{ color: 'var(--text-muted)' }}>Full view component logic will be connected in Phase 4–6.</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tablet/a" element={<TabletView tabletId="A" />} />
        <Route path="/tablet/b" element={<TabletView tabletId="B" />} />
        <Route path="/display/canvas" element={<LiveCanvasView />} />
        <Route path="/display/drawers" element={<CurrentDrawersView />} />
        <Route path="/admin" element={<AdminView />} />
      </Routes>
    </BrowserRouter>
  );
}
