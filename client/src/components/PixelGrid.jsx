import React, { useState, useRef, useEffect } from 'react';

/**
 * 24x24 Interactive Pixel Grid Component — GitHub Dark & Minecraft Pixel Theme
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
  frameNumber = null,
  showFrameHeader = true,
  borderless = false
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
      {showFrameHeader && frameNumber && (
        <div style={{
          fontSize: '0.82rem',
          fontWeight: 700,
          color: 'var(--foss-green)',
          fontFamily: 'Pixelify Sans, monospace',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          backgroundColor: '#161b22',
          padding: '0.25rem 0.75rem',
          borderRadius: '6px',
          border: '1px solid var(--pop-green)',
          boxShadow: '0 0 8px rgba(0, 255, 102, 0.2)'
        }}>
          <span>🟩 Frame #{frameNumber}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(24×24)</span>
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
          backgroundColor: borderless ? '#161b22' : '#30363d',
          padding: borderless ? '0' : '4px',
          borderRadius: borderless ? '0' : 'var(--radius-sm)',
          boxShadow: borderless ? 'none' : '0 0 16px rgba(0, 0, 0, 0.8), 0 0 0 1px #30363d',
          border: borderless ? 'none' : '2px solid #30363d',
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
                  backgroundColor: isPainted ? cellColor : (showGuides && guideColor ? guideColor : '#161b22'),
                  opacity: isPainted ? 1 : (showGuides && guideColor ? 0.42 : 1),
                  borderRadius: '0px',
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
 * Composite Multi-Frame Canvas (Renders full 48x72 painting seamlessly as ONE big canvas)
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
      gap: '0px',
      padding: '0px',
      backgroundColor: '#161b22',
      borderRadius: 'var(--radius-sm)',
      border: '3px solid #30363d',
      boxShadow: '0 0 24px rgba(0, 255, 102, 0.25), 0 10px 30px rgba(0,0,0,0.9)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {sortedFrames.map((frame, idx) => (
        <PixelGrid
          key={idx + 1}
          frameNumber={idx + 1}
          showFrameHeader={false}
          borderless={true}
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
