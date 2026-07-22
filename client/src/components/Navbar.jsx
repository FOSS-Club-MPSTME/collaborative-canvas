import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar({ title, subtitle, tabletId, paintingName, completionPercentage }) {
  return (
    <header className="glass-panel" style={{
      padding: '0.85rem 1.5rem',
      borderRadius: 'var(--radius-lg)',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      justify: 'space-between',
      gap: '1rem',
      border: '1px solid var(--border-color)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid var(--accent-cyan)',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            fontSize: '1.2rem'
          }}>
            🎨
          </div>
        </Link>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {title || 'Pixel Canvas'}
            </h1>
            {tabletId && (
              <span style={{
                padding: '0.2rem 0.6rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: tabletId === 'A' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                color: tabletId === 'A' ? 'var(--accent-cyan)' : 'var(--accent-purple)',
                border: `1px solid ${tabletId === 'A' ? 'var(--accent-cyan)' : 'var(--accent-purple)'}`
              }}>
                Tablet {tabletId}
              </span>
            )}
          </div>
          {subtitle && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{subtitle}</p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {paintingName && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Active Painting
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                {paintingName}
              </span>
            </div>

            {completionPercentage !== undefined && (
              <div style={{
                padding: '0.2rem 0.5rem',
                borderRadius: '6px',
                backgroundColor: 'var(--accent-green)22',
                color: 'var(--accent-green)',
                fontWeight: 700,
                fontSize: '0.8rem',
                border: '1px solid var(--accent-green)44'
              }}>
                {completionPercentage}%
              </div>
            )}
          </div>
        )}

        <Link to="/" style={{
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'var(--text-muted)',
          textDecoration: 'none',
          padding: '0.4rem 0.75rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)',
          transition: 'all 0.15s ease'
        }}>
          Index ↗
        </Link>
      </div>
    </header>
  );
}
