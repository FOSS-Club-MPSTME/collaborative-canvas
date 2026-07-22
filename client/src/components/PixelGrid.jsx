import React, { useState, useRef, useEffect } from 'react';

/**
 * 24x24 Interactive Pixel Grid Component — Corkboard & Scribble Theme
 */
export default function PixelGrid({
  pixelGrid,
  guideData,
  selectedColor = '#3b82f6',
  onPixelChange,
  readOnly = false,
  gridSize = 24,
  cellSize = 16,
  showGuides = true,
  frameNumber = null
}) {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const gridRef = useRef(null);

  const grid = pixelGrid || Array.from({ length: gridSize }, () => Array(gridSize).fill(null));
  const guides = guideData || Array.from({ length: gridSize }, () => Array(gridSize).fill(null));

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsMouseDown(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const handleCellPaint = (r, c) => {
    if (readOnly || !onPixelChange) return;
    if (grid[r] && grid[r][c] !== selectedColor) {
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
          fontSize: '0.85rem',
          fontWeight: 800,
          color: 'var(--ink-dark)',
          fontFamily: 'Fredoka, cursive',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          backgroundColor: 'var(--pop-yellow)',
          padding: '0.2rem 0.65rem',
          borderRadius: '12px',
          border: '2px solid var(--ink-dark)',
          boxShadow: '2px 2px 0px var(--ink-dark)'
        }}>
          <span>📌 Frame #{frameNumber}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--ink-dark)', opacity: 0.8 }}>(24×24)</span>
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
          backgroundColor: 'var(--ink-dark)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          boxShadow: '5px 5px 0px var(--ink-dark)',
          border: '3px solid var(--ink-dark)',
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
                  backgroundColor: isPainted ? cellColor : (showGuides && guideColor ? guideColor : '#ffffff'),
                  opacity: isPainted ? 1 : (showGuides && guideColor ? 0.38 : 1),
                  borderRadius: '1px',
                  cursor: readOnly ? 'default' : 'crosshair',
                  transition: 'background-color 0.05s ease',
                  position: 'relative'
                }}
              >
                {!isPainted && showGuides && guideColor && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '2px',
                    height: '2px',
                    borderRadius: '50%',
                    backgroundColor: guideColor,
                    opacity: 0.95
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
 * Composite Multi-Frame Canvas (Renders full 48x72 painting in 2x3 grid)
 */
export function MultiFrameCanvas({ frames, cellSize = 12, showGuides = true }) {
  const sortedFrames = Array.from({ length: 6 }).map((_, idx) => {
    const frameNum = idx + 1;
    return frames?.find(f => f.frame_number === frameNum) || null;
  });

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, auto)',
      gridTemplateRows: 'repeat(2, auto)',
      gap: '6px',
      padding: '12px',
      backgroundColor: 'var(--cork-card)',
      borderRadius: 'var(--radius-xl)',
      border: '4px solid var(--ink-dark)',
      boxShadow: '6px 6px 0px var(--ink-dark)',
      position: 'relative'
    }}>
      {sortedFrames.map((frame, idx) => (
        <PixelGrid
          key={idx + 1}
          frameNumber={idx + 1}
          pixelGrid={frame?.pixel_grid}
          guideData={frame?.guide_data}
          readOnly={true}
          gridSize={24}
          cellSize={cellSize}
          showGuides={showGuides}
        />
      ))}
    </div>
  );
}
