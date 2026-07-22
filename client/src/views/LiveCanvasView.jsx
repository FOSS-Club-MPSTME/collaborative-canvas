import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import PixelGrid, { MultiFrameCanvas } from '../components/PixelGrid';

export default function LiveCanvasView() {
  const [paintingState, setPaintingState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchPaintingState = async () => {
    try {
      const res = await fetch('/api/painting-state');
      if (res.ok) {
        const data = await res.json();
        setPaintingState(data);
        setErrorMsg('');
      } else {
        setErrorMsg('Failed to load live canvas feed');
      }
    } catch (err) {
      setErrorMsg('Server connection offline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaintingState();
    const timer = setInterval(fetchPaintingState, 2000);
    return () => clearInterval(timer);
  }, []);

  const painting = paintingState?.painting;
  const frames = paintingState?.frames || [];
  const completionPercentage = paintingState?.completionPercentage || 0;
  const lockedCount = paintingState?.lockedCount || 0;
  const isCompleted = paintingState?.isCompleted || completionPercentage === 100;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto', minHeight: '100vh' }}>
      <Navbar
        title="Live Canvas Screen"
        subtitle="Display 1 • Real-Time Assembling Master Painting"
        paintingName={painting?.name}
        completionPercentage={completionPercentage}
      />

      {loading && !paintingState ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <h2 style={{ fontFamily: 'Fredoka, cursive' }}>Connecting to Live Canvas Feed... 🎨</h2>
        </div>
      ) : errorMsg ? (
        <div className="sticker-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--pop-red)' }}>
          <h3>⚠️ {errorMsg}</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.75rem' }}>
          {/* Header Metadata & Progress Bar Card */}
          <div className="sticker-card tilt-slight" style={{
            width: '100%',
            padding: '1.75rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            position: 'relative'
          }}>
            <div className="pushpin" style={{ left: '50%' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--ink-dark)', textTransform: 'uppercase', letterSpacing: '0.08em', backgroundColor: 'var(--pop-yellow)', padding: '0.2rem 0.6rem', borderRadius: '12px', border: '2px solid var(--ink-dark)' }}>
                  Painting #{painting?.sequence_order} • Master Artwork
                </span>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--ink-dark)', marginTop: '0.35rem' }}>
                  {painting?.name || 'Untitled Painting'}
                </h2>
                {painting?.artist && (
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Original Masterpiece by <strong>{painting.artist}</strong>
                  </p>
                )}
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--ink-dark)', fontFamily: 'Fredoka, cursive' }}>
                  {completionPercentage}%
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 800 }}>
                  {lockedCount} of 6 Frames Locked
                </span>
              </div>
            </div>

            {/* Smooth Completion Progress Bar */}
            <div style={{
              width: '100%',
              height: '18px',
              backgroundColor: 'var(--cork-bg)',
              borderRadius: '10px',
              overflow: 'hidden',
              border: '3px solid var(--ink-dark)',
              boxShadow: '2px 2px 0px var(--ink-dark)'
            }}>
              <div style={{
                width: `${completionPercentage}%`,
                height: '100%',
                backgroundColor: isCompleted ? 'var(--pop-green)' : 'var(--pop-cyan)',
                borderRadius: '8px',
                transition: 'width 0.5s ease-in-out'
              }} />
            </div>
          </div>

          {/* Celebratory Banner Overlay when completed */}
          {isCompleted && (
            <div className="sticker-card animate-pop-in" style={{
              width: '100%',
              padding: '1.5rem',
              backgroundColor: 'var(--pop-yellow)',
              border: '4px solid var(--ink-dark)',
              boxShadow: '6px 6px 0px var(--ink-dark)',
              textAlign: 'center'
            }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--ink-dark)' }}>
                🎉 Master Painting Complete!
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--ink-dark)', fontWeight: 600, marginTop: '0.25rem' }}>
                All 6 frames locked! Transitioning to next masterpiece in queue...
              </p>
            </div>
          )}

          {/* Master 6-Frame Assembled Painting (48×72 Resolution Matrix) */}
          <div style={{ margin: '0.5rem 0' }}>
            <MultiFrameCanvas frames={frames} cellSize={14} showGuides={true} />
          </div>

          {/* FOSS Tagline */}
          <footer className="sticker-card" style={{
            padding: '0.85rem 1.5rem',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: 'var(--ink-dark)',
            textAlign: 'center',
            backgroundColor: 'var(--pop-yellow)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🤝 <strong>FOSS Induction Event</strong> — <em>Six individual contributions combined into one shared masterpiece.</em>
          </footer>
        </div>
      )}
    </div>
  );
}
