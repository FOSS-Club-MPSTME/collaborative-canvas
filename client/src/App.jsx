import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import PixelGrid from './components/PixelGrid';
import ColorPalette from './components/ColorPalette';
import NotionAvatar, { NotionAvatarPicker } from './components/NotionAvatar';
import TabletView from './views/TabletView';
import LiveCanvasView from './views/LiveCanvasView';
import CurrentDrawersView from './views/CurrentDrawersView';
import AdminView from './views/AdminView';
import './App.css';

function Home() {
  const [selectedColor, setSelectedColor] = useState('#00ff66');
  const [selectedAvatar, setSelectedAvatar] = useState('coder');
  const [demoGrid, setDemoGrid] = useState(
    Array.from({ length: 24 }, () => Array(24).fill(null))
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

      {/* Navigation Route Sticker Tiles */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--foss-green)', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Pixelify Sans, monospace' }}>
          Select Route View 📍
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          <Link to="/tablet/a" className="sticker-card" style={{ padding: '1.5rem', textDecoration: 'none', color: 'inherit', backgroundColor: '#161b22', border: '1px solid #30363d' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📱</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink-dark)', fontFamily: 'Pixelify Sans, monospace' }}>Tablet A Interface</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '0.35rem' }}>
              Participant drawing view for Tablet A (Frames 1, 3, 5)
            </p>
          </Link>

          <Link to="/tablet/b" className="sticker-card" style={{ padding: '1.5rem', textDecoration: 'none', color: 'inherit', backgroundColor: '#161b22', border: '1px solid #30363d' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📱</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink-dark)', fontFamily: 'Pixelify Sans, monospace' }}>Tablet B Interface</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '0.35rem' }}>
              Participant drawing view for Tablet B (Frames 2, 4, 6)
            </p>
          </Link>

          <Link to="/display/canvas" className="sticker-card" style={{ padding: '1.5rem', textDecoration: 'none', color: 'inherit', backgroundColor: '#161b22', border: '1px solid var(--pop-green)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🖥️</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--foss-green)', fontFamily: 'Pixelify Sans, monospace' }}>Live Canvas Screen</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '0.35rem' }}>
              Display 1: Real-time assembling master painting & celebration
            </p>
          </Link>

          <Link to="/display/drawers" className="sticker-card" style={{ padding: '1.5rem', textDecoration: 'none', color: 'inherit', backgroundColor: '#161b22', border: '1px solid #30363d' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--pop-cyan)', fontFamily: 'Pixelify Sans, monospace' }}>Current Drawers Screen</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '0.35rem' }}>
              Display 2: Active participant cards with Notion avatars
            </p>
          </Link>

          <Link to="/admin" className="sticker-card" style={{ padding: '1.5rem', textDecoration: 'none', color: 'inherit', backgroundColor: '#161b22', border: '1px solid #30363d' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚙️</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--pop-pink)', fontFamily: 'Pixelify Sans, monospace' }}>Staff Admin Panel</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '0.35rem' }}>
              Passcode protected (`1234`): Frame resets & sequence order
            </p>
          </Link>
        </div>
      </section>

      {/* Component Design System Interactive Sandbox */}
      <section className="sticker-card" style={{ padding: '2rem', backgroundColor: '#161b22', border: '1px solid #30363d' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--ink-dark)', marginBottom: '1.5rem', fontFamily: 'Pixelify Sans, monospace' }}>
          🟩 GitHub x Minecraft Visual Design Sandbox
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          {/* Interactive 24x24 Grid Sandbox */}
          <div className="sticker-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#0d1117', border: '1px solid #30363d' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--foss-green)', marginBottom: '1rem', fontFamily: 'Pixelify Sans, monospace' }}>
              Interactive 24×24 Pixel Grid (Touch-Drag Enabled)
            </h3>
            <PixelGrid
              pixelGrid={demoGrid}
              selectedColor={selectedColor}
              onPixelChange={handlePixelChange}
              gridSize={24}
              cellSize={14}
              frameNumber={1}
            />
            <button
              onClick={() => setDemoGrid(Array.from({ length: 24 }, () => Array(24).fill(null)))}
              className="sticker-btn"
              style={{
                marginTop: '1.25rem',
                padding: '0.4rem 0.9rem',
                fontSize: '0.85rem',
                backgroundColor: 'var(--pop-red)',
                color: '#ffffff'
              }}
            >
              Clear Demo Grid
            </button>
          </div>

          {/* Color Palette & Notion Avatar Sandbox */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            <div className="sticker-card" style={{ padding: '1.5rem', backgroundColor: '#0d1117', border: '1px solid #30363d' }}>
              <ColorPalette selectedColor={selectedColor} onSelectColor={setSelectedColor} />
            </div>

            <div className="sticker-card" style={{ padding: '1.5rem', backgroundColor: '#0d1117', border: '1px solid #30363d' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <NotionAvatar avatarId={selectedAvatar} size={58} />
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink-dark)', fontFamily: 'Pixelify Sans, monospace' }}>FOSS Avatar Preview</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Drop custom files in <code>client/public/avatars/</code></p>
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
