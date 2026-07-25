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
          <h2 style={{ fontFamily: 'Pixelify Sans, monospace', color: 'var(--foss-green)' }}>Connecting to Live Canvas Feed... 🎨</h2>
        </div>
      ) : errorMsg ? (
        <div className="sticker-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--pop-red)', backgroundColor: '#161b22', border: '1px solid var(--pop-red)' }}>
          <h3 style={{ fontFamily: 'Pixelify Sans, monospace' }}>⚠️ {errorMsg}</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.75rem' }}>
          {/* Header Metadata & Progress Bar Card */}
          <div className="sticker-card" style={{
            width: '100%',
            padding: '1.75rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            backgroundColor: '#161b22',
            border: '1px solid #30363d'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--foss-green)', textTransform: 'uppercase', letterSpacing: '0.08em', backgroundColor: 'rgba(46, 160, 67, 0.15)', padding: '0.25rem 0.75rem', borderRadius: '6px', border: '1px solid var(--pop-green)', fontFamily: 'Pixelify Sans, monospace' }}>
                  Painting #{painting?.sequence_order} • Master Artwork
                </span>
                <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--ink-dark)', marginTop: '0.5rem', fontFamily: 'Pixelify Sans, monospace' }}>
                  {painting?.name || 'Untitled Painting'}
                </h2>
                {painting?.artist && (
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '0.2rem' }}>
                    Original Masterpiece by <strong style={{ color: 'var(--ink-dark)' }}>{painting.artist}</strong>
                  </p>
                )}
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2.6rem', fontWeight: 700, color: 'var(--foss-green)', fontFamily: 'Pixelify Sans, monospace', textShadow: '0 0 10px rgba(0,255,102,0.3)' }}>
                  {completionPercentage}%
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {lockedCount} of 6 Frames Locked
                </span>
              </div>
            </div>

            {/* Smooth Completion Progress Bar */}
            <div style={{
              width: '100%',
              height: '16px',
              backgroundColor: '#0d1117',
              borderRadius: '6px',
              overflow: 'hidden',
              border: '1px solid #30363d'
            }}>
              <div style={{
                width: `${completionPercentage}%`,
                height: '100%',
                backgroundColor: isCompleted ? 'var(--foss-green)' : 'var(--pop-green)',
                boxShadow: '0 0 12px rgba(0, 255, 102, 0.5)',
                transition: 'width 0.5s ease-in-out'
              }} />
            </div>
          </div>

          {/* Celebratory Banner Overlay when completed */}
          {isCompleted && (
            <div className="sticker-card animate-pop-in" style={{
              width: '100%',
              padding: '1.5rem',
              backgroundColor: '#161b22',
              border: '2px solid var(--pop-green)',
              boxShadow: '0 0 20px rgba(0, 255, 102, 0.4)',
              textAlign: 'center'
            }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--foss-green)', fontFamily: 'Pixelify Sans, monospace' }}>
                🎉 Master Painting Complete!
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--ink-dark)', fontWeight: 500, marginTop: '0.25rem' }}>
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
            fontSize: '0.9rem',
            fontWeight: 600,
            color: 'var(--ink-dark)',
            textAlign: 'center',
            backgroundColor: '#161b22',
            border: '1px solid #30363d',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}>
            🟩 <strong style={{ color: 'var(--foss-green)', fontFamily: 'Pixelify Sans, monospace' }}>FOSS Induction Event</strong> — <em>Six individual contributions combined into one shared masterpiece.</em>
          </footer>
        </div>
      )}
    </div>
  );
}
