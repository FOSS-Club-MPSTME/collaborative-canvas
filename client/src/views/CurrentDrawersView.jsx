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

  // Poll /api/active-drawers every 1.5 seconds
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
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
          👥 Who is Painting Right Now?
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.25rem' }}>
          Live participants contributing to the active collaborative artwork.
        </p>
      </div>

      {loading && !drawersData ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <h2>Connecting to Current Drawers Feed...</h2>
        </div>
      ) : errorMsg ? (
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--accent-red)' }}>
          <h3>⚠️ {errorMsg}</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          {/* Tablet A Tile */}
          <DrawerTile tabletId="A" drawer={tabletA} accentColor="var(--accent-cyan)" />

          {/* Tablet B Tile */}
          <DrawerTile tabletId="B" drawer={tabletB} accentColor="var(--accent-purple)" />
        </div>
      )}

      {/* FOSS Open Source Metaphor Banner */}
      <div className="glass-panel" style={{
        padding: '1.75rem 2rem',
        borderRadius: 'var(--radius-xl)',
        textAlign: 'center',
        border: '1px solid var(--border-color)',
        maxWidth: '840px',
        margin: '0 auto'
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
          💡 The FOSS Collaboration Metaphor
        </h3>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
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
      className="glass-card"
      style={{
        padding: '2rem',
        borderRadius: 'var(--radius-xl)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        border: `2px solid ${isActive ? accentColor : 'var(--border-color)'}`,
        boxShadow: isActive ? `0 0 25px ${accentColor}22` : 'none',
        position: 'relative',
        minHeight: '340px',
        justifyContent: 'center'
      }}
    >
      {/* Tablet Badge */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        padding: '0.3rem 0.85rem',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: 800,
        backgroundColor: `${accentColor}22`,
        color: accentColor,
        border: `1px solid ${accentColor}66`
      }}>
        Tablet {tabletId}
      </div>

      {isActive ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', width: '100%' }}>
          <NotionAvatar
            avatarId={drawer.participant_avatar}
            name={drawer.participant_name}
            size={96}
          />

          <div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {drawer.participant_name}
            </h3>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '0.4rem',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-dark)',
              border: '1px solid var(--border-color)',
              fontSize: '0.9rem',
              fontWeight: 700,
              color: accentColor
            }}>
              <span>Frame #{drawer.frame_number}</span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span style={{ color: 'var(--text-muted)' }}>{drawer.painting_name}</span>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'var(--accent-green)',
            padding: '0.35rem 0.85rem',
            borderRadius: '20px',
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.3)'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-green)', display: 'inline-block' }} className="animate-pulse-glow" />
            Active Drawer • Coloring Pixel Grid
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '2px dashed var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            fontSize: '2rem',
            color: 'var(--text-muted)'
          }}>
            ⏳
          </div>

          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              Tablet {tabletId} is Free!
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Sit down at Tablet {tabletId} to claim your frame and contribute!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
