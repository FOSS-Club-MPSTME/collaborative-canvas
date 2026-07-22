import React from 'react';

export const MASTER_PALETTE = [
  { hex: '#1a1b26', name: 'Obsidian Black' },
  { hex: '#1e3a8a', name: 'Starry Navy' },
  { hex: '#3b82f6', name: 'Azure Blue' },
  { hex: '#06b6d4', name: 'Cyan Sky' },
  { hex: '#15803d', name: 'Cypress Green' },
  { hex: '#ca8a04', name: 'Klimt Gold' },
  { hex: '#f59e0b', name: 'Warm Amber' },
  { hex: '#ef4444', name: 'Crimson Red' },
  { hex: '#ec4899', name: 'Rose Pink' },
  { hex: '#8b5cf6', name: 'Twilight Violet' },
  { hex: '#f3f4f6', name: 'Foam White' },
  { hex: '#78350f', name: 'Earth Bronze' }
];

export default function ColorPalette({ selectedColor, onSelectColor }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      width: '100%'
    }}>
      <div style={{
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Select Color Palette
        </span>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: 700,
          color: selectedColor
        }}>
          <span style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: selectedColor,
            boxShadow: `0 0 8px ${selectedColor}`
          }} />
          {MASTER_PALETTE.find(p => p.hex === selectedColor)?.name || 'Custom Color'}
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '0.75rem'
      }}>
        {MASTER_PALETTE.map((color) => {
          const isSelected = selectedColor === color.hex;
          return (
            <button
              key={color.hex}
              type="button"
              onClick={() => onSelectColor(color.hex)}
              title={color.name}
              style={{
                height: '52px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: color.hex,
                border: isSelected ? '3px solid #ffffff' : '1px solid rgba(255,255,255,0.15)',
                boxShadow: isSelected ? `0 0 16px ${color.hex}` : 'none',
                transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justify: 'center'
              }}
            >
              {isSelected && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color.hex === '#f3f4f6' ? '#000000' : '#ffffff'} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
