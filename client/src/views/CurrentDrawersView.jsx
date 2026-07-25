import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import NotionAvatar from '../components/NotionAvatar';

export default function CurrentDrawersView() {
  const [drawersData, setDrawersData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchActiveDrawers = async () => {
    try {
      const res = await fetch('/api/active-drawers');
      if (res.ok) {
        const data = await res.json();
        setDrawersData(data);
        setErrorMsg('');
      } else {
        setErrorMsg('Failed to load active drawers feed');
      }
    } catch (err) {
      setErrorMsg('Server connection offline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveDrawers();
    const timer = setInterval(fetchActiveDrawers, 1500);
    return () => clearInterval(timer);
  }, []);

  const tabletA = drawersData?.tabletA;
  const tabletB = drawersData?.tabletB;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto', minHeight: '100vh' }}>
      <Navbar
        title="Current Drawers Screen"
        subtitle="Display 2 • Live Participant Roster & Notion Avatars"
      />

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--ink-dark)', fontFamily: 'Pixelify Sans, monospace' }}>
          👥 Who is Painting Right Now?
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500, marginTop: '0.25rem' }}>
          Live participants contributing to the active collaborative artwork.
        </p>
      </div>

      {loading && !drawersData ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <h2 style={{ fontFamily: 'Pixelify Sans, monospace', color: 'var(--foss-green)' }}>Connecting to Current Drawers Feed... 🎨</h2>
        </div>
      ) : errorMsg ? (
        <div className="sticker-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--pop-red)', backgroundColor: '#161b22', border: '1px solid var(--pop-red)' }}>
          <h3 style={{ fontFamily: 'Pixelify Sans, monospace' }}>⚠️ {errorMsg}</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          {/* Tablet A Sticker Tile */}
          <DrawerTile tabletId="A" drawer={tabletA} accentColor="var(--pop-cyan)" />

          {/* Tablet B Sticker Tile */}
          <DrawerTile tabletId="B" drawer={tabletB} accentColor="var(--pop-pink)" />
        </div>
      )}

      {/* FOSS Open Source Metaphor Banner */}
      <div className="sticker-card" style={{
        padding: '2rem',
        textAlign: 'center',
        maxWidth: '860px',
        margin: '0 auto',
        backgroundColor: '#161b22',
        border: '1px solid var(--pop-green)',
        boxShadow: '0 0 16px rgba(0, 255, 102, 0.2)'
      }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--foss-green)', marginBottom: '0.5rem', fontFamily: 'Pixelify Sans, monospace' }}>
          💡 The FOSS Collaboration Metaphor
        </h3>
        <p style={{ fontSize: '0.95rem', color: 'var(--ink-dark)', fontWeight: 500, lineHeight: '1.6' }}>
          Just like open-source software, individual contributions — each owned, created, and credited by name — combine together into one shared, meaningful master artifact.
        </p>
      </div>
    </div>
  );
}

function DrawerTile({ tabletId, drawer, accentColor }) {
  const isActive = drawer && drawer.active;

  return (
    <div
      className="sticker-card"
      style={{
        padding: '2.25rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        minHeight: '360px',
        justifyContent: 'center',
        backgroundColor: '#161b22',
        border: isActive ? '2px solid var(--pop-green)' : '1px solid #30363d',
        boxShadow: isActive ? '0 0 16px rgba(0, 255, 102, 0.25)' : 'none'
      }}
    >
      {/* Tablet Badge */}
      <div style={{
        position: 'absolute',
        top: '1.25rem',
        left: '1.25rem',
        padding: '0.3rem 0.85rem',
        borderRadius: '6px',
        fontSize: '0.8rem',
        fontWeight: 700,
        backgroundColor: 'rgba(22, 27, 34, 0.9)',
        color: accentColor,
        border: `1px solid ${accentColor}`,
        fontFamily: 'Pixelify Sans, monospace'
      }}>
        Tablet {tabletId}
      </div>

      {isActive ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', width: '100%' }}>
          <NotionAvatar
            avatarId={drawer.participant_avatar}
            name={drawer.participant_name}
            size={104}
          />

          <div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--ink-dark)', fontFamily: 'Pixelify Sans, monospace' }}>
              {drawer.participant_name}
            </h3>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '0.5rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '6px',
              backgroundColor: '#0d1117',
              border: '1px solid #30363d',
              fontSize: '0.88rem',
              fontWeight: 700,
              color: 'var(--foss-green)',
              fontFamily: 'Pixelify Sans, monospace'
            }}>
              <span>Frame #{drawer.frame_number}</span>
              <span>•</span>
              <span>{drawer.painting_name}</span>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'var(--foss-green)',
            padding: '0.35rem 0.95rem',
            borderRadius: '6px',
            backgroundColor: 'rgba(46, 160, 67, 0.15)',
            border: '1px solid var(--pop-green)',
            boxShadow: '0 0 10px rgba(0, 255, 102, 0.2)',
            fontFamily: 'Pixelify Sans, monospace'
          }}>
            🎨 Active Drawer • Coloring Pixel Grid
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '88px',
            height: '88px',
            borderRadius: '50%',
            backgroundColor: '#0d1117',
            border: '2px dashed #30363d',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            fontSize: '2.5rem'
          }}>
            ⏳
          </div>

          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--ink-dark)', fontFamily: 'Pixelify Sans, monospace' }}>
              Tablet {tabletId} is Free!
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '0.25rem' }}>
              Sit down at Tablet {tabletId} to claim your frame and contribute!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
