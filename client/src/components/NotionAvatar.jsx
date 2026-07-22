import React from 'react';

export const AVATAR_PRESETS = [
  { id: 'artist', name: 'Artist', emoji: '🎨', bg: '#1e3a8a', border: '#3b82f6' },
  { id: 'coder', name: 'Coder', emoji: '⚡', bg: '#15803d', border: '#22c55e' },
  { id: 'hacker', name: 'Hacker', emoji: '🚀', bg: '#701a75', border: '#c026d3' },
  { id: 'designer', name: 'Designer', emoji: '✨', bg: '#ca8a04', border: '#eab308' },
  { id: 'dreamer', name: 'Dreamer', emoji: '🌙', bg: '#4c1d95', border: '#a855f7' },
  { id: 'thinker', name: 'Thinker', emoji: '🧠', bg: '#164e63', border: '#06b6d4' },
  { id: 'creator', name: 'Creator', emoji: '🔥', bg: '#991b1b', border: '#ef4444' },
  { id: 'explorer', name: 'Explorer', emoji: '🧭', bg: '#365314', border: '#84cc16' }
];

/**
 * Hash name string to pick a deterministic preset fallback if no avatar specified
 */
export function getAvatarByName(name) {
  if (!name) return AVATAR_PRESETS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PRESETS.length;
  return AVATAR_PRESETS[index];
}

export function NotionAvatar({ avatarId, name, size = 48, className = '' }) {
  const preset = AVATAR_PRESETS.find(p => p.id === avatarId) || getAvatarByName(name);

  return (
    <div
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: preset.bg,
        border: `2px solid ${preset.border}`,
        display: 'inline-flex',
        alignItems: 'center',
        justify: 'center',
        fontSize: `${size * 0.5}px`,
        boxShadow: `0 0 12px ${preset.border}33`,
        userSelect: 'none',
        flexShrink: 0
      }}
    >
      <span>{preset.emoji}</span>
    </div>
  );
}

export function NotionAvatarPicker({ selectedAvatar, onSelectAvatar }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Choose Your Notion Avatar
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
                padding: '0.6rem 0.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-card)',
                border: isSelected ? '2px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <NotionAvatar avatarId={preset.id} size={40} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isSelected ? 'var(--accent-cyan)' : 'var(--text-main)' }}>
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
