import React, { useState } from 'react';

export const AVATAR_PRESETS = [
  { id: 'artist', name: 'Artist', emoji: '🎨', bg: '#f85149', border: '#30363d' },
  { id: 'coder', name: 'Coder', emoji: '⚡', bg: '#2ea043', border: '#30363d' },
  { id: 'hacker', name: 'Hacker', emoji: '🚀', bg: '#bc8cff', border: '#30363d' },
  { id: 'designer', name: 'Designer', emoji: '✨', bg: '#d29922', border: '#30363d' },
  { id: 'dreamer', name: 'Dreamer', emoji: '🌙', bg: '#8b5cf6', border: '#30363d' },
  { id: 'thinker', name: 'Thinker', emoji: '🧠', bg: '#39c5cf', border: '#30363d' },
  { id: 'creator', name: 'Creator', emoji: '🔥', bg: '#db61a2', border: '#30363d' },
  { id: 'explorer', name: 'Explorer', emoji: '🧭', bg: '#58a6ff', border: '#30363d' }
];

export function getAvatarByName(name) {
  if (!name) return AVATAR_PRESETS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PRESETS.length;
  return AVATAR_PRESETS[index];
}

export function NotionAvatar({ avatarId, name, size = 52, className = '' }) {
  const preset = AVATAR_PRESETS.find(p => p.id === avatarId) || getAvatarByName(name);
  const [imgSrc, setImgSrc] = useState(`/avatars/${preset.id}.svg`);
  const [imgError, setImgError] = useState(false);

  const handleImageError = () => {
    if (imgSrc.endsWith('.svg')) {
      // Try png next if svg fails
      setImgSrc(`/avatars/${preset.id}.png`);
    } else {
      // If both png and svg fail, fall back to emoji/initials
      setImgError(true);
    }
  };

  return (
    <div
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: preset.bg,
        border: '2px solid #30363d',
        display: 'inline-flex',
        alignItems: 'center',
        justify: 'center',
        fontSize: `${size * 0.45}px`,
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.6), 0 0 0 1px #30363d',
        userSelect: 'none',
        flexShrink: 0,
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {!imgError ? (
        <img
          src={imgSrc}
          alt={preset.name}
          onError={handleImageError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      ) : (
        <span>{preset.emoji}</span>
      )}
    </div>
  );
}

export function NotionAvatarPicker({ selectedAvatar, onSelectAvatar }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-dark)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Pixelify Sans, monospace' }}>
        Pick Your FOSS Avatar 🏷️
      </span>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.65rem'
      }}>
        {AVATAR_PRESETS.map((preset) => {
          const isSelected = selectedAvatar === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectAvatar(preset.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.65rem 0.25rem',
                borderRadius: '8px',
                backgroundColor: isSelected ? 'rgba(46, 160, 67, 0.15)' : '#161b22',
                border: isSelected ? '2px solid var(--pop-green)' : '1px solid #30363d',
                boxShadow: isSelected ? '0 0 10px rgba(0, 255, 102, 0.3)' : 'none',
                transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                cursor: 'pointer',
                transition: 'all 0.1s ease'
              }}
            >
              <NotionAvatar avatarId={preset.id} size={40} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isSelected ? 'var(--foss-green)' : 'var(--ink-dark)', fontFamily: 'Pixelify Sans, monospace' }}>
                {preset.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default NotionAvatar;
