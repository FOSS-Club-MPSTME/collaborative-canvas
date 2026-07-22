import React, { useState } from 'react';

export const AVATAR_PRESETS = [
  { id: 'artist', name: 'Artist', emoji: '🎨', bg: '#ff4757', border: '#1e272e' },
  { id: 'coder', name: 'Coder', emoji: '⚡', bg: '#10ac84', border: '#1e272e' },
  { id: 'hacker', name: 'Hacker', emoji: '🚀', bg: '#a855f7', border: '#1e272e' },
  { id: 'designer', name: 'Designer', emoji: '✨', bg: '#ffd32a', border: '#1e272e' },
  { id: 'dreamer', name: 'Dreamer', emoji: '🌙', bg: '#8b5cf6', border: '#1e272e' },
  { id: 'thinker', name: 'Thinker', emoji: '🧠', bg: '#00d2d3', border: '#1e272e' },
  { id: 'creator', name: 'Creator', emoji: '🔥', bg: '#ff5e7e', border: '#1e272e' },
  { id: 'explorer', name: 'Explorer', emoji: '🧭', bg: '#2e86de', border: '#1e272e' }
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
        border: '3px solid var(--ink-dark)',
        display: 'inline-flex',
        alignItems: 'center',
        justify: 'center',
        fontSize: `${size * 0.45}px`,
        boxShadow: '3px 3px 0px var(--ink-dark)',
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
      <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--ink-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Pick Your Sticker Avatar 🏷️
      </span>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.75rem'
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
                borderRadius: 'var(--radius-md)',
                backgroundColor: isSelected ? 'var(--pop-yellow)' : 'var(--cork-card)',
                border: '3px solid var(--ink-dark)',
                boxShadow: isSelected ? '4px 4px 0px var(--ink-dark)' : '2px 2px 0px var(--ink-dark)',
                transform: isSelected ? 'scale(1.05) rotate(-1deg)' : 'scale(1)',
                cursor: 'pointer',
                transition: 'all 0.1s ease'
              }}
            >
              <NotionAvatar avatarId={preset.id} size={42} />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--ink-dark)', fontFamily: 'Fredoka, cursive' }}>
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
