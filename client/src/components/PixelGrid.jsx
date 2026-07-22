import React, { useState, useRef, useEffect } from 'react';

/**
 * 16x16 Interactive Pixel Grid Component
 */
export default function PixelGrid({
  pixelGrid,
  guideData,
  selectedColor = '#3b82f6',
  onPixelChange,
  readOnly = false,
  gridSize = 16,
  cellSize = 24,
  showGuides = true,
  frameNumber = null
}) {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const gridRef = useRef(null);

  // Initialize empty grid fallback
  const grid = pixelGrid || Array.from({ length: gridSize }, () => Array(gridSize).fill(null));
  const guides = guideData || Array.from({ length: gridSize }, () => Array(gridSize).fill(null));

  // Global mouseup listener to end drag when releasing outside grid
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsMouseDown(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const handleCellPaint = (r, c) => {
    if (readOnly || !onPixelChange) return;
    if (grid[r][c] !== selectedColor) {
      onPixelChange(r, c, selectedColor);
    }
  };

  const handleMouseDown = (r, c) => {
    if (readOnly) return;
    setIsMouseDown(true);
    handleCellPaint(r, c);
  };

  const handleMouseEnter = (r, c) => {
    if (readOnly) return;
    if (isMouseDown) {
      handleCellPaint(r, c);
    }
  };

  // Touch drag tracking over 16x16 grid elements
  const handleTouchMove = (e) => {
    if (readOnly || !onPixelChange) return;
    const touch = e.touches[0];
    if (!touch) return;

    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element && element.dataset && element.dataset.row !== undefined) {
      const r = parseInt(element.dataset.row, 10);
      const c = parseInt(element.dataset.col, 10);
      if (!isNaN(r) && !isNaN(c)) {
        handleCellPaint(r, c);
      }
    }
  };

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      {frameNumber && (
        <div style={{
          fontSize: '0.8rem',
          fontWeight: 700,
          color: 'var(--accent-cyan)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem'
        }}>
          <span>Frame #{frameNumber}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(16×16 Grid)</span>
        </div>
      )}

      <div
        ref={gridRef}
        className={readOnly ? '' : 'touch-paint-canvas'}
        onTouchStart={handleTouchMove}
        onTouchMove={handleTouchMove}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
          gap: '1px',
          backgroundColor: '#1e293b',
          padding: '3px',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          border: '2px solid var(--border-color)',
          userSelect: 'none',
          WebkitUserSelect: 'none'
        }}
      >
        {Array.from({ length: gridSize }).map((_, r) =>
          Array.from({ length: gridSize }).map((_, c) => {
            const cellColor = grid[r] ? grid[r][c] : null;
            const guideColor = guides[r] ? guides[r][c] : null;
            const isPainted = cellColor !== null && cellColor !== undefined;

            return (
              <div
                key={`${r}-${c}`}
                data-row={r}
                data-col={c}
                onMouseDown={() => handleMouseDown(r, c)}
                onMouseEnter={() => handleMouseEnter(r, c)}
                style={{
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                  backgroundColor: isPainted ? cellColor : (showGuides && guideColor ? guideColor : '#0f172a'),
                  opacity: isPainted ? 1 : (showGuides && guideColor ? 0.35 : 1),
                  borderRadius: '2px',
                  cursor: readOnly ? 'default' : 'crosshair',
                  transition: 'background-color 0.05s ease, opacity 0.1s ease',
                  boxShadow: isPainted ? 'inset 0 0 2px rgba(0,0,0,0.3)' : 'none',
                  position: 'relative'
                }}
              >
                {/* Faint outline dot indicator for unpainted guide pixels */}
                {!isPainted && showGuides && guideColor && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '3px',
                    height: '3px',
                    borderRadius: '50%',
                    backgroundColor: guideColor,
                    opacity: 0.8
                  }} />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/**
 * Composite Multi-Frame Canvas (Renders full painting from 6 frames: 2 rows x 3 cols)
 */
export function MultiFrameCanvas({ frames, cellSize = 14, showGuides = true }) {
  // Sort frames 1 to 6
  const sortedFrames = Array.from({ length: 6 }).map((_, idx) => {
    const frameNum = idx + 1;
    return frames?.find(f => f.frame_number === frameNum) || null;
  });

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, auto)',
      gridTemplateRows: 'repeat(2, auto)',
      gap: '4px',
      padding: '8px',
      backgroundColor: '#090d16',
      borderRadius: 'var(--radius-lg)',
      border: '2px solid var(--border-color)',
      boxShadow: 'var(--shadow-glow)'
    }}>
      {sortedFrames.map((frame, idx) => (
        <PixelGrid
          key={idx + 1}
          frameNumber={idx + 1}
          pixelGrid={frame?.pixel_grid}
          guideData={frame?.guide_data}
          readOnly={true}
          cellSize={cellSize}
          showGuides={showGuides}
        />
      ))}
    </div>
  );
}
