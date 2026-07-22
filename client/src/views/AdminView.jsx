import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import NotionAvatar from '../components/NotionAvatar';

export default function AdminView() {
  const [passcode, setPasscode] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [activeData, setActiveData] = useState(null);
  const [sequence, setSequence] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Load authenticated passcode from session storage if present
  useEffect(() => {
    const saved = sessionStorage.getItem('admin_passcode');
    if (saved) {
      verifyPasscode(saved);
    }
  }, []);

  const verifyPasscode = async (codeToVerify) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Passcode': codeToVerify
        }
      });

      if (res.ok) {
        setAuthenticated(true);
        setPasscode(codeToVerify);
        sessionStorage.setItem('admin_passcode', codeToVerify);
        setStatusMsg({ type: 'success', text: 'Passcode verified successfully' });
        loadAdminData(codeToVerify);
      } else {
        setAuthenticated(false);
        sessionStorage.removeItem('admin_passcode');
        setStatusMsg({ type: 'error', text: 'Invalid admin passcode' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Server connection error' });
    } finally {
      setLoading(false);
    }
  };

  const loadAdminData = async (code = passcode) => {
    try {
      // 1. Fetch active painting & frame states
      const activeRes = await fetch('/api/active-painting');
      if (activeRes.ok) {
        const data = await activeRes.json();
        setActiveData(data);
      }

      // 2. Fetch sequence queue
      const seqRes = await fetch('/api/admin/sequence', {
        headers: { 'X-Admin-Passcode': code }
      });
      if (seqRes.ok) {
        const seqData = await seqRes.json();
        setSequence(seqData.sequence || []);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    verifyPasscode(passcode);
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setPasscode('');
    sessionStorage.removeItem('admin_passcode');
  };

  // Admin Actions
  const handleResetFrame = async (frameId, frameNumber) => {
    if (!window.confirm(`Reset Frame #${frameNumber} back to unclaimed?`)) return;
    try {
      const res = await fetch('/api/admin/reset-frame', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Passcode': passcode
        },
        body: JSON.stringify({ frame_id: frameId })
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg({ type: 'success', text: data.message });
        loadAdminData();
      } else {
        setStatusMsg({ type: 'error', text: data.error });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to reset frame' });
    }
  };

  const handleResetPainting = async (paintingId, paintingName) => {
    if (!window.confirm(`Reset ALL frames of "${paintingName}" back to unclaimed?`)) return;
    try {
      const res = await fetch('/api/admin/reset-painting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Passcode': passcode
        },
        body: JSON.stringify({ painting_id: paintingId })
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg({ type: 'success', text: data.message });
        loadAdminData();
      } else {
        setStatusMsg({ type: 'error', text: data.error });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to reset painting' });
    }
  };

  const handleSetActivePainting = async (paintingId, paintingName) => {
    if (!window.confirm(`Set "${paintingName}" as the active painting on booth displays?`)) return;
    try {
      const res = await fetch('/api/admin/set-active-painting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Passcode': passcode
        },
        body: JSON.stringify({ painting_id: paintingId })
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg({ type: 'success', text: data.message });
        loadAdminData();
      } else {
        setStatusMsg({ type: 'error', text: data.error });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to set active painting' });
    }
  };

  const handleMoveSequence = async (index, direction) => {
    const newSeq = [...sequence];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= newSeq.length) return;

    // Swap items
    const temp = newSeq[index];
    newSeq[index] = newSeq[targetIdx];
    newSeq[targetIdx] = temp;

    // Update sequence orders
    const payload = newSeq.map((item, idx) => ({
      id: item.id,
      sequence_order: idx + 1
    }));

    try {
      const res = await fetch('/api/admin/sequence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Passcode': passcode
        },
        body: JSON.stringify({ sequence: payload })
      });
      const data = await res.json();
      if (res.ok) {
        setSequence(data.sequence);
        setStatusMsg({ type: 'success', text: 'Painting queue sequence updated' });
      } else {
        setStatusMsg({ type: 'error', text: data.error });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to update sequence' });
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto', minHeight: '100vh' }}>
      <Navbar
        title="Staff Admin Panel"
        subtitle="Emergency Resets & Daily Queue Management"
      />

      {/* Status Messages */}
      {statusMsg.text && (
        <div className="glass-panel" style={{
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          backgroundColor: statusMsg.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
          border: `1px solid ${statusMsg.type === 'error' ? 'var(--accent-red)' : 'var(--accent-green)'}`,
          color: statusMsg.type === 'error' ? 'var(--accent-red)' : 'var(--accent-green)',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center'
        }}>
          <span>{statusMsg.text}</span>
          <button onClick={() => setStatusMsg({ type: '', text: '' })} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
        </div>
      )}

      {/* Screen 1: Passcode Authentication Screen */}
      {!authenticated ? (
        <div className="glass-card" style={{ padding: '2.5rem', maxWidth: '440px', margin: '3rem auto', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔒</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
            Staff Access Required
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
            Enter booth admin passcode to access reset controls.
          </p>

          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter passcode (default: 1234)"
              required
              autoFocus
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                fontSize: '1.1rem',
                fontWeight: 600,
                textAlign: 'center',
                letterSpacing: '0.2em',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-dark)',
                color: 'var(--text-main)',
                border: '2px solid var(--border-color)',
                outline: 'none'
              }}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.9rem',
                fontSize: '1rem',
                fontWeight: 800,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-red)',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Verifying...' : 'Unlock Admin Panel'}
            </button>
          </form>
        </div>
      ) : (
        /* Screen 2: Staff Dashboard */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Header Controls */}
          <div className="glass-panel" style={{
            padding: '1.25rem 1.5rem',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-green)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                🟢 Admin Unlocked
              </span>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.1rem' }}>
                Booth Control Dashboard
              </h2>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => loadAdminData()}
                style={{
                  padding: '0.5rem 0.85rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  color: 'var(--accent-cyan)',
                  border: '1px solid var(--accent-cyan)44',
                  cursor: 'pointer'
                }}
              >
                Refresh Data 🔄
              </button>

              <button
                onClick={handleLogout}
                style={{
                  padding: '0.5rem 0.85rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  color: 'var(--accent-red)',
                  border: '1px solid var(--accent-red)44',
                  cursor: 'pointer'
                }}
              >
                Lock Panel 🔒
              </button>
            </div>
          </div>

          {/* Section A: Active Painting Frame Management */}
          {activeData && activeData.painting && (
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                    Active Painting Controls
                  </span>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.1rem' }}>
                    {activeData.painting.name} ({activeData.completionPercentage}% Complete)
                  </h3>
                </div>

                <button
                  onClick={() => handleResetPainting(activeData.painting.id, activeData.painting.name)}
                  style={{
                    padding: '0.6rem 1rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--accent-red)',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Reset Entire Painting ⚠️
                </button>
              </div>

              {/* 6 Frames Management Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {activeData.frames.map((frame) => {
                  const tabletAssigned = frame.frame_number % 2 !== 0 ? 'A' : 'B';
                  return (
                    <div
                      key={frame.id}
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-dark)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--accent-cyan)' }}>
                          Frame #{frame.frame_number} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(Tablet {tabletAssigned})</span>
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '12px',
                          backgroundColor: frame.status === 'locked' ? 'var(--accent-green)22' : frame.status === 'in_progress' ? 'var(--accent-gold)22' : 'rgba(255,255,255,0.08)',
                          color: frame.status === 'locked' ? 'var(--accent-green)' : frame.status === 'in_progress' ? 'var(--accent-gold)' : 'var(--text-muted)'
                        }}>
                          {frame.status}
                        </span>
                      </div>

                      {frame.owner_name ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <NotionAvatar avatarId={frame.owner_avatar} name={frame.owner_name} size={32} />
                          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{frame.owner_name}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', italic: 'true' }}>
                          Unclaimed slot
                        </span>
                      )}

                      <button
                        onClick={() => handleResetFrame(frame.id, frame.frame_number)}
                        style={{
                          marginTop: 'auto',
                          padding: '0.4rem 0.6rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'rgba(239, 68, 68, 0.15)',
                          color: 'var(--accent-red)',
                          border: '1px solid var(--accent-red)44',
                          cursor: 'pointer'
                        }}
                      >
                        Reset Frame #{frame.frame_number}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section B: Daily Painting Queue & Sequence Manager */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
              📜 Daily Painting Queue Sequence
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {sequence.map((item, index) => {
                const isActive = item.status === 'active';
                return (
                  <div
                    key={item.id}
                    style={{
                      padding: '1rem 1.25rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isActive ? 'rgba(56, 189, 248, 0.1)' : 'var(--bg-dark)',
                      border: `1px solid ${isActive ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-muted)', width: '28px' }}>
                        #{item.sequence_order}
                      </span>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: isActive ? 'var(--accent-cyan)' : 'var(--text-main)' }}>
                          {item.name}
                        </h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {item.artist || 'Classic Masterpiece'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        backgroundColor: item.status === 'active' ? 'var(--accent-cyan)22' : item.status === 'completed' ? 'var(--accent-green)22' : 'rgba(255,255,255,0.08)',
                        color: item.status === 'active' ? 'var(--accent-cyan)' : item.status === 'completed' ? 'var(--accent-green)' : 'var(--text-muted)'
                      }}>
                        {item.status.toUpperCase()}
                      </span>

                      {!isActive && (
                        <button
                          onClick={() => handleSetActivePainting(item.id, item.name)}
                          style={{
                            padding: '0.4rem 0.75rem',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'rgba(56, 189, 248, 0.15)',
                            color: 'var(--accent-cyan)',
                            border: '1px solid var(--accent-cyan)44',
                            cursor: 'pointer'
                          }}
                        >
                          Make Active
                        </button>
                      )}

                      {/* Reorder Buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <button
                          disabled={index === 0}
                          onClick={() => handleMoveSequence(index, -1)}
                          style={{
                            padding: '0.15rem 0.4rem',
                            fontSize: '0.7rem',
                            borderRadius: '3px',
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-main)',
                            cursor: index === 0 ? 'not-allowed' : 'pointer',
                            opacity: index === 0 ? 0.3 : 1
                          }}
                        >
                          ▲
                        </button>
                        <button
                          disabled={index === sequence.length - 1}
                          onClick={() => handleMoveSequence(index, 1)}
                          style={{
                            padding: '0.15rem 0.4rem',
                            fontSize: '0.7rem',
                            borderRadius: '3px',
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-main)',
                            cursor: index === sequence.length - 1 ? 'not-allowed' : 'pointer',
                            opacity: index === sequence.length - 1 ? 0.3 : 1
                          }}
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
