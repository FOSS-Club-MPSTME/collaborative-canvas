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
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--ink-dark)' }}>
          👥 Who is Painting Right Now?
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', fontWeight: 600, marginTop: '0.25rem' }}>
          Live participants contributing to the active collaborative artwork.
        </p>
      </div>

      {loading && !drawersData ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <h2 style={{ fontFamily: 'Fredoka, cursive' }}>Connecting to Current Drawers Feed... 🎨</h2>
        </div>
      ) : errorMsg ? (
        <div className="sticker-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--pop-red)' }}>
          <h3>⚠️ {errorMsg}</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          {/* Tablet A Sticker Tile */}
          <DrawerTile tabletId="A" drawer={tabletA} accentColor="var(--pop-cyan)" tiltClass="tilt-left" />

          {/* Tablet B Sticker Tile */}
          <DrawerTile tabletId="B" drawer={tabletB} accentColor="var(--pop-pink)" tiltClass="tilt-right" />
        </div>
      )}

      {/* FOSS Open Source Metaphor Banner */}
      <div className="sticker-card tilt-slight" style={{
        padding: '2rem',
        textAlign: 'center',
        maxWidth: '860px',
        margin: '0 auto',
        backgroundColor: 'var(--pop-yellow)',
        position: 'relative'
      }}>
        <div className="pushpin" style={{ left: '50%' }} />

        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--ink-dark)', marginBottom: '0.5rem' }}>
          💡 The FOSS Collaboration Metaphor
        </h3>
        <p style={{ fontSize: '1rem', color: 'var(--ink-dark)', fontWeight: 600, lineHeight: '1.6' }}>
          Just like open-source software, individual contributions — each owned, created, and credited by name — combine together into one shared, meaningful master artifact.
        </p>
      </div>
    </div>
  );
}

function DrawerTile({ tabletId, drawer, accentColor, tiltClass }) {
  const isActive = drawer && drawer.active;

  return (
    <div
      className={`sticker-card ${tiltClass}`}
      style={{
        padding: '2.25rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        minHeight: '360px',
        justifyContent: 'center',
        backgroundColor: isActive ? '#ffffff' : 'var(--cork-card)'
      }}
    >
      <div className="pushpin" style={{ left: '50%' }} />

      {/* Tablet Badge */}
      <div style={{
        position: 'absolute',
        top: '1.25rem',
        left: '1.25rem',
        padding: '0.35rem 0.95rem',
        borderRadius: '20px',
        fontSize: '0.85rem',
        fontWeight: 800,
        backgroundColor: accentColor,
        color: 'var(--ink-dark)',
        border: '2px solid var(--ink-dark)',
        boxShadow: '2px 2px 0px var(--ink-dark)',
        fontFamily: 'Fredoka, cursive'
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
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--ink-dark)' }}>
              {drawer.participant_name}
            </h3>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '0.5rem',
              padding: '0.4rem 0.95rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--cork-bg)',
              border: '2px solid var(--ink-dark)',
              fontSize: '0.95rem',
              fontWeight: 800,
              color: 'var(--ink-dark)',
              fontFamily: 'Fredoka, cursive'
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
            fontSize: '0.9rem',
            fontWeight: 800,
            color: 'var(--ink-dark)',
            padding: '0.4rem 1rem',
            borderRadius: '20px',
            backgroundColor: 'var(--pop-green)',
            border: '2px solid var(--ink-dark)',
            boxShadow: '2px 2px 0px var(--ink-dark)',
            fontFamily: 'Fredoka, cursive'
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
            backgroundColor: 'var(--cork-bg)',
            border: '3px dashed var(--ink-dark)',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            fontSize: '2.5rem'
          }}>
            ⏳
          </div>

          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ink-dark)' }}>
              Tablet {tabletId} is Free!
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.25rem' }}>
              Sit down at Tablet {tabletId} to claim your frame and contribute!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
