import React from 'react';

export const MASTER_PALETTE = [
  { hex: '#0d1117', name: 'Obsidian Black' },
  { hex: '#1e3a8a', name: 'Starry Navy' },
  { hex: '#2563eb', name: 'Cobalt Blue' },
  { hex: '#3b82f6', name: 'Azure Sky' },
  { hex: '#06b6d4', name: 'Electric Cyan' },
  { hex: '#00ff66', name: 'Matrix Neon' },
  { hex: '#15803d', name: 'Cypress Green' },
  { hex: '#22c55e', name: 'Vivid Emerald' },
  { hex: '#facc15', name: 'Sunburst Gold' },
  { hex: '#ca8a04', name: 'Ochre Gold' },
  { hex: '#f97316', name: 'Sunset Orange' },
  { hex: '#ef4444', name: 'Crimson Red' },
  { hex: '#ec4899', name: 'Rose Pink' },
  { hex: '#8b5cf6', name: 'Twilight Violet' },
  { hex: '#92400e', name: 'Warm Sienna' },
  { hex: '#d97706', name: 'Terracotta Amber' },
  { hex: '#fde047', name: 'Cream Highlight' },
  { hex: '#f3f4f6', name: 'Foam White' }
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
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-dark)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Pixelify Sans, monospace' }}>
          Select Paint Color 🎨
        </span>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.85rem',
          fontWeight: 700,
          color: 'var(--foss-green)',
          fontFamily: 'Pixelify Sans, monospace'
        }}>
          <span style={{
            width: '14px',
            height: '14px',
            borderRadius: '3px',
            backgroundColor: selectedColor,
            border: '1px solid #30363d',
            boxShadow: '0 0 6px rgba(0,0,0,0.5)'
          }} />
          {MASTER_PALETTE.find(p => p.hex === selectedColor)?.name || 'Paint Color'}
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '0.65rem'
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
                height: '48px',
                borderRadius: '6px',
                backgroundColor: color.hex,
                border: isSelected ? '2px solid var(--foss-green)' : '2px solid #30363d',
                boxShadow: isSelected ? '0 0 12px rgba(0, 255, 102, 0.4), 0 4px 0 #000000' : '0 2px 0 #000000',
                transform: isSelected ? 'scale(1.06)' : 'scale(1)',
                cursor: 'pointer',
                transition: 'all 0.1s ease',
                display: 'flex',
                alignItems: 'center',
                justify: 'center'
              }}
            >
              {isSelected && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color.hex === '#f3f4f6' || color.hex === '#00ff66' ? '#0d1117' : '#ffffff'} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
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
