import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import PixelGrid from '../components/PixelGrid';
import ColorPalette from '../components/ColorPalette';
import NotionAvatar, { NotionAvatarPicker } from '../components/NotionAvatar';

export default function TabletView({ tabletId = 'A' }) {
  // State: 'onboarding' | 'drawing' | 'waiting'
  const [mode, setMode] = useState('onboarding');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('coder');
  const [activePainting, setActivePainting] = useState(null);
  const [assignedFrame, setAssignedFrame] = useState(null);
  const [pixelGrid, setPixelGrid] = useState(null);
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [celebrationMsg, setCelebrationMsg] = useState(null);

  const lastSyncedGridRef = useRef(null);

  // Fetch active painting metadata on mount
  useEffect(() => {
    fetchActivePainting();
  }, [tabletId]);

  const fetchActivePainting = async () => {
    try {
      const res = await fetch('/api/active-painting');
      if (res.ok) {
        const data = await res.json();
        setActivePainting(data.painting);
      }
    } catch (err) {
      console.error('Failed to fetch active painting:', err);
    }
  };

  // Periodic background pixel batch sync (every 1.5 seconds)
  useEffect(() => {
    if (mode !== 'drawing' || !assignedFrame || !pixelGrid) return;

    const syncTimer = setInterval(async () => {
      const currentGridStr = JSON.stringify(pixelGrid);
      if (currentGridStr !== lastSyncedGridRef.current) {
        try {
          await fetch('/api/update-pixels-batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tablet_id: tabletId,
              frame_id: assignedFrame.id,
              pixel_grid: pixelGrid
            })
          });
          lastSyncedGridRef.current = currentGridStr;
        } catch (err) {
          console.error('Background pixel sync failed:', err);
        }
      }
    }, 1500);

    return () => clearInterval(syncTimer);
  }, [mode, assignedFrame, pixelGrid, tabletId]);

  // Handle Start Painting Submission
  const handleStartPainting = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter your name to start');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/start-frame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tablet_id: tabletId,
          participant_name: name.trim(),
          participant_avatar: avatar
        })
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setMode('waiting');
          setErrorMsg(data.error || 'All frames for this tablet are claimed in the active painting.');
        } else {
          setErrorMsg(data.error || 'Failed to start session');
        }
        setLoading(false);
        return;
      }

      setAssignedFrame(data.frame);
      // Initialize pixel grid from frame or empty 16x16
      const initialGrid = data.frame.pixel_grid || Array.from({ length: 16 }, () => Array(16).fill(null));
      setPixelGrid(initialGrid);
      lastSyncedGridRef.current = JSON.stringify(initialGrid);
      setMode('drawing');
    } catch (err) {
      setErrorMsg('Server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle local cell painting
  const handlePixelChange = (r, c, color) => {
    if (!pixelGrid) return;
    setPixelGrid(prev => {
      const next = prev.map(row => [...row]);
      next[r][c] = color;
      return next;
    });
  };

  // Clear Frame Action
  const handleClearFrame = () => {
    if (window.confirm('Are you sure you want to clear your painted pixels for this frame?')) {
      const emptyGrid = Array.from({ length: 16 }, () => Array(16).fill(null));
      setPixelGrid(emptyGrid);
    }
  };

  // Submit Frame Action
  const handleSubmitFrame = async () => {
    if (!assignedFrame) return;
    if (!window.confirm('Ready to submit and lock your frame contribution?')) return;

    setLoading(true);
    try {
      const res = await fetch('/api/submit-frame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tablet_id: tabletId,
          frame_id: assignedFrame.id,
          pixel_grid: pixelGrid
        })
      });

      const data = await res.json();
      if (res.ok) {
        setCelebrationMsg(
          data.painting_completed
            ? `🎉 Painting Complete! You helped finish "${activePainting?.name || 'the painting'}"!`
            : `✨ Frame #${assignedFrame.frame_number} Submitted! Thank you, ${name}!`
        );

        // Reset local session state after brief celebratory pause
        setTimeout(() => {
          setCelebrationMsg(null);
          setName('');
          setAssignedFrame(null);
          setPixelGrid(null);
          setMode('onboarding');
          fetchActivePainting();
        }, 3000);
      } else {
        setErrorMsg(data.error || 'Failed to submit frame');
      }
    } catch (err) {
      setErrorMsg('Failed to submit frame. Please check server connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '1.25rem', maxWidth: '960px', margin: '0 auto' }}>
      <Navbar
        title={`Tablet ${tabletId}`}
        subtitle={mode === 'onboarding' ? 'Participant Onboarding' : `Frame #${assignedFrame?.frame_number || ''}`}
        tabletId={tabletId}
        paintingName={activePainting?.name}
      />

      {/* Celebratory Banner Modal */}
      {celebrationMsg && (
        <div className="glass-panel animate-pulse-glow" style={{
          padding: '2rem',
          borderRadius: 'var(--radius-xl)',
          textAlign: 'center',
          backgroundColor: 'rgba(34, 197, 94, 0.15)',
          border: '2px solid var(--accent-green)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--accent-green)', fontWeight: 800 }}>
            {celebrationMsg}
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Preparing tablet interface for next participant...
          </p>
        </div>
      )}

      {/* Mode 1: Participant Onboarding */}
      {mode === 'onboarding' && (
        <div className="glass-card" style={{ padding: '2rem', maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Welcome to the FOSS Pixel Canvas!
            </h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.35rem', fontSize: '0.95rem' }}>
              Enter your name to color your assigned section of the famous painting.
            </p>
          </div>

          <form onSubmit={handleStartPainting} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* Name Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                Your Name / Handle
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex, Sam, Dev123"
                maxLength={30}
                required
                style={{
                  width: '100%',
                  padding: '0.85rem 1.15rem',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-dark)',
                  color: 'var(--text-main)',
                  border: '2px solid var(--border-color)',
                  outline: 'none'
                }}
              />
            </div>

            {/* Avatar Selector */}
            <div>
              <NotionAvatarPicker selectedAvatar={avatar} onSelectAvatar={setAvatar} />
            </div>

            {errorMsg && (
              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--accent-red)', color: 'var(--accent-red)', fontSize: '0.875rem', textAlign: 'center' }}>
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1.1rem',
                fontWeight: 800,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-cyan)',
                color: '#090d16',
                border: 'none',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-glow)',
                transition: 'transform 0.15s ease'
              }}
            >
              {loading ? 'Starting Session...' : 'Start Painting →'}
            </button>
          </form>
        </div>
      )}

      {/* Mode 2: Interactive Drawing View */}
      {mode === 'drawing' && assignedFrame && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          {/* Left Column: Pixel Canvas Grid */}
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', width: '100%', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <NotionAvatar avatarId={avatar} name={name} size={42} />
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{name}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                    Tablet {tabletId} • Frame #{assignedFrame.frame_number}
                  </span>
                </div>
              </div>

              <button
                onClick={handleClearFrame}
                style={{
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  color: 'var(--accent-red)',
                  border: '1px solid var(--accent-red)44',
                  cursor: 'pointer'
                }}
              >
                Clear Frame
              </button>
            </div>

            <PixelGrid
              pixelGrid={pixelGrid}
              guideData={assignedFrame.guide_data}
              selectedColor={selectedColor}
              onPixelChange={handlePixelChange}
              cellSize={22}
              frameNumber={assignedFrame.frame_number}
            />

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.85rem', textAlign: 'center' }}>
              💡 <em>Tap or drag finger across grid tiles to paint. Faint background outline shows reference artwork.</em>
            </p>
          </div>

          {/* Right Column: Palette & Submit Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <ColorPalette selectedColor={selectedColor} onSelectColor={setSelectedColor} />
            </div>

            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Finish Contribution
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Once satisfied with your coloring, tap Submit to lock your frame into the master painting display!
              </p>

              <button
                onClick={handleSubmitFrame}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--accent-green)',
                  color: '#090d16',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)',
                  transition: 'transform 0.15s ease'
                }}
              >
                {loading ? 'Locking Frame...' : '✓ Submit & Lock Frame'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Waiting Mode (if all frames for this tablet are complete) */}
      {mode === 'waiting' && (
        <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: '560px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '0.75rem' }}>
            🎨 Tablet {tabletId} Frames Complete!
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            {errorMsg || `All 3 frames assigned to Tablet ${tabletId} for "${activePainting?.name}" have been completed! Waiting for the other tablet to finish...`}
          </p>
          <button
            onClick={() => {
              setMode('onboarding');
              setErrorMsg('');
              fetchActivePainting();
            }}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-cyan)',
              color: '#090d16',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Check Active Painting Status 🔄
          </button>
        </div>
      )}
    </div>
  );
}
