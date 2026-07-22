import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar({ title, subtitle, tabletId, paintingName, completionPercentage }) {
  return (
    <header className="sticker-card tilt-slight" style={{
      padding: '1rem 1.75rem',
      marginBottom: '2rem',
      display: 'flex',
      alignItems: 'center',
      justify: 'space-between',
      gap: '1rem',
      backgroundColor: 'var(--cork-card)',
      position: 'relative'
    }}>
      {/* Pushpin Accents */}
      <div className="pushpin" style={{ left: '2.5rem' }} />
      <div className="pushpin" style={{ left: 'auto', right: '2.5rem', background: 'var(--pop-yellow)' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--pop-yellow)',
            border: '3px solid var(--ink-dark)',
            boxShadow: '2px 2px 0px var(--ink-dark)',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            fontSize: '1.4rem'
          }}>
            🎨
          </div>
        </Link>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--ink-dark)' }}>
              {title || 'Pixel Canvas'}
            </h1>
            {tabletId && (
              <span style={{
                padding: '0.2rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 800,
                backgroundColor: tabletId === 'A' ? 'var(--pop-cyan)' : 'var(--pop-pink)',
                color: 'var(--ink-dark)',
                border: '2px solid var(--ink-dark)',
                boxShadow: '2px 2px 0px var(--ink-dark)',
                fontFamily: 'Fredoka, cursive'
              }}>
                Tablet {tabletId}
              </span>
            )}
          </div>
          {subtitle && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{subtitle}</p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {paintingName && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--cork-bg)',
            border: '2px solid var(--ink-dark)',
            boxShadow: '2px 2px 0px var(--ink-dark)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Active Artwork
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--ink-dark)', fontFamily: 'Fredoka, cursive' }}>
                {paintingName}
              </span>
            </div>

            {completionPercentage !== undefined && (
              <div style={{
                padding: '0.25rem 0.6rem',
                borderRadius: '8px',
                backgroundColor: 'var(--pop-green)',
                color: 'var(--ink-dark)',
                fontWeight: 800,
                fontSize: '0.85rem',
                border: '2px solid var(--ink-dark)',
                fontFamily: 'Fredoka, cursive'
              }}>
                {completionPercentage}%
              </div>
            )}
          </div>
        )}

        <Link to="/" className="sticker-btn" style={{
          padding: '0.45rem 0.9rem',
          fontSize: '0.85rem',
          backgroundColor: 'var(--pop-blue)',
          color: '#ffffff'
        }}>
          Index ↗
        </Link>
      </div>
    </header>
  );
}
