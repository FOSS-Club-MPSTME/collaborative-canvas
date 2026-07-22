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
      const activeRes = await fetch('/api/active-painting');
      if (activeRes.ok) {
        const data = await activeRes.json();
        setActiveData(data);
      }

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

    const temp = newSeq[index];
    newSeq[index] = newSeq[targetIdx];
    newSeq[targetIdx] = temp;

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

      {statusMsg.text && (
        <div className="sticker-card" style={{
          padding: '0.85rem 1.25rem',
          marginBottom: '1.5rem',
          backgroundColor: statusMsg.type === 'error' ? 'var(--pop-red)' : 'var(--pop-green)',
          color: '#ffffff',
          fontWeight: 700,
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center'
        }}>
          <span>{statusMsg.text}</span>
          <button onClick={() => setStatusMsg({ type: '', text: '' })} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
        </div>
      )}

      {!authenticated ? (
        <div className="sticker-card tilt-slight" style={{ padding: '2.5rem', maxWidth: '460px', margin: '3rem auto', textAlign: 'center', position: 'relative' }}>
          <div className="pushpin" style={{ left: '50%' }} />

          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔒</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--ink-dark)', marginBottom: '0.35rem' }}>
            Staff Access Required
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '1.75rem' }}>
            Enter booth admin passcode to access reset controls.
          </p>

          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Passcode (default: 1234)"
              required
              autoFocus
              style={{
                width: '100%',
                padding: '0.9rem 1rem',
                fontSize: '1.2rem',
                fontWeight: 700,
                textAlign: 'center',
                letterSpacing: '0.2em',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#ffffff',
                color: 'var(--ink-dark)',
                border: '3px solid var(--ink-dark)',
                boxShadow: '3px 3px 0px var(--ink-dark)',
                outline: 'none'
              }}
            />

            <button
              type="submit"
              disabled={loading}
              className="sticker-btn"
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1.15rem',
                backgroundColor: 'var(--pop-red)',
                color: '#ffffff'
              }}
            >
              {loading ? 'Verifying...' : 'Unlock Admin Panel 🔓'}
            </button>
          </form>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="sticker-card" style={{
            padding: '1.25rem 1.5rem',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--ink-dark)', backgroundColor: 'var(--pop-green)', padding: '0.2rem 0.6rem', borderRadius: '12px', border: '2px solid var(--ink-dark)', fontFamily: 'Fredoka, cursive' }}>
                🟢 Admin Unlocked
              </span>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--ink-dark)', marginTop: '0.2rem' }}>
                Booth Control Dashboard
              </h2>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => loadAdminData()}
                className="sticker-btn"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', backgroundColor: 'var(--pop-yellow)' }}
              >
                Refresh Data 🔄
              </button>

              <button
                onClick={handleLogout}
                className="sticker-btn"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', backgroundColor: 'var(--pop-red)', color: '#ffffff' }}
              >
                Lock Panel 🔒
              </button>
            </div>
          </div>

          {activeData && activeData.painting && (
            <div className="sticker-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--ink-dark)', textTransform: 'uppercase' }}>
                    Active Painting Controls
                  </span>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink-dark)', marginTop: '0.1rem' }}>
                    {activeData.painting.name} ({activeData.completionPercentage}% Complete)
                  </h3>
                </div>

                <button
                  onClick={() => handleResetPainting(activeData.painting.id, activeData.painting.name)}
                  className="sticker-btn"
                  style={{ backgroundColor: 'var(--pop-red)', color: '#ffffff', fontSize: '0.85rem' }}
                >
                  Reset Entire Painting ⚠️
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {activeData.frames.map((frame) => {
                  const tabletAssigned = frame.frame_number % 2 !== 0 ? 'A' : 'B';
                  return (
                    <div
                      key={frame.id}
                      style={{
                        padding: '1.15rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--cork-bg)',
                        border: '3px solid var(--ink-dark)',
                        boxShadow: '3px 3px 0px var(--ink-dark)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.85rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--ink-dark)', fontFamily: 'Fredoka, cursive' }}>
                          Frame #{frame.frame_number} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>(Tablet {tabletAssigned})</span>
                        </span>
                        <span style={{
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '12px',
                          border: '2px solid var(--ink-dark)',
                          backgroundColor: frame.status === 'locked' ? 'var(--pop-green)' : frame.status === 'in_progress' ? 'var(--pop-yellow)' : '#ffffff',
                          color: 'var(--ink-dark)',
                          fontFamily: 'Fredoka, cursive'
                        }}>
                          {frame.status.toUpperCase()}
                        </span>
                      </div>

                      {frame.owner_name ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <NotionAvatar avatarId={frame.owner_avatar} name={frame.owner_name} size={36} />
                          <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>{frame.owner_name}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          Unclaimed slot
                        </span>
                      )}

                      <button
                        onClick={() => handleResetFrame(frame.id, frame.frame_number)}
                        className="sticker-btn"
                        style={{
                          marginTop: 'auto',
                          padding: '0.35rem 0.6rem',
                          fontSize: '0.8rem',
                          backgroundColor: 'var(--pop-pink)',
                          color: '#ffffff'
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

          <div className="sticker-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--ink-dark)', marginBottom: '1.25rem' }}>
              📜 Daily Painting Queue Sequence
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {sequence.map((item, index) => {
                const isActive = item.status === 'active';
                return (
                  <div
                    key={item.id}
                    style={{
                      padding: '1.15rem 1.35rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isActive ? 'var(--pop-yellow)' : 'var(--cork-bg)',
                      border: '3px solid var(--ink-dark)',
                      boxShadow: '3px 3px 0px var(--ink-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--ink-dark)', width: '32px', fontFamily: 'Fredoka, cursive' }}>
                        #{item.sequence_order}
                      </span>
                      <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink-dark)' }}>
                          {item.name}
                        </h4>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          {item.artist || 'Classic Masterpiece'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        border: '2px solid var(--ink-dark)',
                        backgroundColor: item.status === 'active' ? 'var(--pop-cyan)' : item.status === 'completed' ? 'var(--pop-green)' : '#ffffff',
                        color: 'var(--ink-dark)',
                        fontFamily: 'Fredoka, cursive'
                      }}>
                        {item.status.toUpperCase()}
                      </span>

                      {!isActive && (
                        <button
                          onClick={() => handleSetActivePainting(item.id, item.name)}
                          className="sticker-btn"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', backgroundColor: 'var(--pop-blue)', color: '#ffffff' }}
                        >
                          Make Active
                        </button>
                      )}

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <button
                          disabled={index === 0}
                          onClick={() => handleMoveSequence(index, -1)}
                          style={{
                            padding: '0.2rem 0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            borderRadius: '4px',
                            backgroundColor: '#ffffff',
                            border: '2px solid var(--ink-dark)',
                            color: 'var(--ink-dark)',
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
                            padding: '0.2rem 0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            borderRadius: '4px',
                            backgroundColor: '#ffffff',
                            border: '2px solid var(--ink-dark)',
                            color: 'var(--ink-dark)',
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
