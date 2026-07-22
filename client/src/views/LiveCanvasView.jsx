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

  // Poll /api/painting-state every 2 seconds
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
          <h2>Connecting to Live Canvas Feed...</h2>
        </div>
      ) : errorMsg ? (
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--accent-red)' }}>
          <h3>⚠️ {errorMsg}</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          {/* Header Metadata & Progress Bar */}
          <div className="glass-panel" style={{
            width: '100%',
            padding: '1.5rem 2rem',
            borderRadius: 'var(--radius-xl)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Painting #{painting?.sequence_order} • Master Artwork
                </span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                  {painting?.name || 'Untitled Painting'}
                </h2>
                {painting?.artist && (
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Original Artist: <strong>{painting.artist}</strong>
                  </p>
                )}
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-green)' }}>
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
              height: '14px',
              backgroundColor: 'var(--bg-dark)',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{
                width: `${completionPercentage}%`,
                height: '100%',
                backgroundColor: isCompleted ? 'var(--accent-green)' : 'var(--accent-cyan)',
                borderRadius: '8px',
                transition: 'width 0.5s ease-in-out',
                boxShadow: `0 0 12px ${isCompleted ? 'var(--accent-green)' : 'var(--accent-cyan)'}`
              }} />
            </div>
          </div>

          {/* Celebratory Banner Overlay when completed */}
          {isCompleted && (
            <div className="glass-panel animate-pulse-glow" style={{
              width: '100%',
              padding: '1.25rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              border: '2px solid var(--accent-green)',
              textAlign: 'center'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-green)' }}>
                🎉 Master Painting Complete!
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                All 6 frames locked. Transitioning to next artwork in queue...
              </p>
            </div>
          )}

          {/* Master 6-Frame Assembled Painting (32×48 Resolution Matrix) */}
          <div style={{ margin: '1rem 0' }}>
            <MultiFrameCanvas frames={frames} cellSize={18} showGuides={true} />
          </div>

          {/* FOSS Tagline */}
          <footer style={{
            fontSize: '0.9rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
            letterSpacing: '0.04em'
          }}>
            🤝 <strong>FOSS Induction Event</strong> — <em>Six individual contributions combined into one shared masterpiece.</em>
          </footer>
        </div>
      )}
    </div>
  );
}
