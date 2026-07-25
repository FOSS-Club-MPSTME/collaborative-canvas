import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar({ title, subtitle, tabletId, paintingName, completionPercentage }) {
  return (
    <header className="sticker-card" style={{
      padding: '1rem 1.75rem',
      marginBottom: '2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      backgroundColor: 'var(--cork-card)',
      borderColor: '#30363d',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: '#161b22',
            border: '2px solid var(--pop-green)',
            boxShadow: '0 0 10px rgba(0, 255, 102, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem'
          }}>
            🟩
          </div>
        </Link>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--ink-dark)', fontFamily: 'Pixelify Sans, monospace' }}>
              {title || 'Pixel Canvas'}
            </h1>
            {tabletId && (
              <span style={{
                padding: '0.2rem 0.65rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                backgroundColor: tabletId === 'A' ? 'rgba(57, 197, 207, 0.15)' : 'rgba(219, 97, 162, 0.15)',
                color: tabletId === 'A' ? 'var(--pop-cyan)' : 'var(--pop-pink)',
                border: `1px solid ${tabletId === 'A' ? 'var(--pop-cyan)' : 'var(--pop-pink)'}`,
                fontFamily: 'Pixelify Sans, monospace'
              }}>
                Tablet {tabletId}
              </span>
            )}
          </div>
          {subtitle && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '0.15rem' }}>{subtitle}</p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {paintingName && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.45rem 0.95rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--cork-bg)',
            border: '1px solid #30363d'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Active Artwork
              </span>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--pop-green)', fontFamily: 'Pixelify Sans, monospace' }}>
                {paintingName}
              </span>
            </div>

            {completionPercentage !== undefined && (
              <div style={{
                padding: '0.2rem 0.55rem',
                borderRadius: '4px',
                backgroundColor: 'rgba(46, 160, 67, 0.2)',
                color: 'var(--foss-green)',
                fontWeight: 700,
                fontSize: '0.8rem',
                border: '1px solid var(--pop-green)',
                fontFamily: 'Pixelify Sans, monospace'
              }}>
                {completionPercentage}%
              </div>
            )}
          </div>
        )}

        <Link to="/" className="sticker-btn" style={{
          padding: '0.45rem 0.85rem',
          fontSize: '0.85rem',
          backgroundColor: '#21262d',
          color: 'var(--ink-dark)',
          borderColor: '#30363d'
        }}>
          Index ↗
        </Link>
      </div>
    </header>
  );
}
