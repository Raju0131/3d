'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { useSneakerStore } from '@/lib/store';
import {
  MATERIAL_IDS,
  MATERIAL_PRESETS,
  COLOR_PALETTE,
  BASE_PRICE,
  type MaterialId,
} from '@/lib/modelConfig';

// ---------------------------------------------------------------------------
// Animated price hook
// ---------------------------------------------------------------------------
function useAnimatedPrice(targetPrice: number): string {
  const [displayPrice, setDisplayPrice] = useState(targetPrice);
  const rafRef = useRef<number>(0);
  const currentRef = useRef(targetPrice);

  useEffect(() => {
    const target = targetPrice;
    const animate = () => {
      const diff = target - currentRef.current;
      if (Math.abs(diff) < 0.5) {
        currentRef.current = target;
        setDisplayPrice(target);
        return;
      }
      currentRef.current += diff * 0.15;
      setDisplayPrice(Math.round(currentRef.current));
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [targetPrice]);

  return displayPrice.toString();
}

// ---------------------------------------------------------------------------
// Screenshot helper
// ---------------------------------------------------------------------------
function takeScreenshot() {
  const canvas = document.querySelector('#scene-canvas-wrapper canvas') as HTMLCanvasElement | null;
  if (!canvas) return;
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `sneaker-lab-${Date.now()}.png`;
  link.href = dataUrl;
  link.click();
}

// ---------------------------------------------------------------------------
// Summary Modal
// ---------------------------------------------------------------------------
interface SummaryModalProps {
  onClose: () => void;
}

function SummaryModal({ onClose }: SummaryModalProps) {
  const color = useSneakerStore((s) => s.color);
  const material = useSneakerStore((s) => s.material);
  const totalPrice = useSneakerStore((s) => s.totalPrice());
  const colorName = COLOR_PALETTE.find((s) => s.hex === color)?.name ?? 'Custom';

  // Trap focus inside modal
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-content"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Order summary"
      >
        <h2 className="modal-title">Order Summary</h2>

        <div className="modal-section">
          <h3 className="modal-section-title">Colour</h3>
          <div className="modal-row">
            <span className="modal-label">{colorName}</span>
            <div className="modal-color-preview">
              <span
                className="modal-color-dot"
                style={{ backgroundColor: color }}
              />
              <span className="modal-color-hex">{color}</span>
            </div>
          </div>
        </div>

        <div className="modal-section">
          <h3 className="modal-section-title">Material</h3>
          <div className="modal-row">
            <span className="modal-label">{MATERIAL_PRESETS[material].label}</span>
            <span className="modal-value">
              {MATERIAL_PRESETS[material].priceDelta > 0
                ? `+$${MATERIAL_PRESETS[material].priceDelta}`
                : 'Included'}
            </span>
          </div>
        </div>

        <div className="modal-divider" />

        <div className="modal-row modal-total">
          <span>Total</span>
          <span>${totalPrice}</span>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose} type="button">
            Continue Editing
          </button>
          <button className="btn btn-primary" onClick={onClose} type="button">
            Confirm Order
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bottom-sheet drag logic (mobile only)
// ---------------------------------------------------------------------------
const SNAP_PEEK = 0.4;  // 40% of viewport
const SNAP_FULL = 0.85; // 85% of viewport

function useBottomSheet() {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [snapPoint, setSnapPoint] = useState<'peek' | 'full'>('peek');
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);

  const onDragStart = useCallback((e: ReactPointerEvent) => {
    dragStartY.current = e.clientY;
    dragStartHeight.current = sheetRef.current?.offsetHeight ?? 0;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onDragMove = useCallback((e: ReactPointerEvent) => {
    if (!dragStartY.current) return;
    const dy = dragStartY.current - e.clientY;
    const newH = dragStartHeight.current + dy;
    if (sheetRef.current) {
      sheetRef.current.style.height = `${Math.max(100, Math.min(newH, window.innerHeight * 0.9))}px`;
    }
  }, []);

  const snapTo = useCallback((point: 'peek' | 'full') => {
    setSnapPoint(point);
    if (sheetRef.current) {
      const fraction = point === 'full' ? SNAP_FULL : SNAP_PEEK;
      sheetRef.current.style.height = `${window.innerHeight * fraction}px`;
    }
  }, []);

  const onDragEnd = useCallback(() => {
    if (!sheetRef.current) return;
    const h = sheetRef.current.offsetHeight;
    const midpoint = window.innerHeight * ((SNAP_PEEK + SNAP_FULL) / 2);
    snapTo(h > midpoint ? 'full' : 'peek');
    dragStartY.current = 0;
  }, [snapTo]);

  return { sheetRef, snapPoint, snapTo, onDragStart, onDragMove, onDragEnd };
}

// ---------------------------------------------------------------------------
// Configurator
// ---------------------------------------------------------------------------
export default function Configurator() {
  const [showModal, setShowModal] = useState(false);
  const color = useSneakerStore((s) => s.color);
  const material = useSneakerStore((s) => s.material);
  const setColor = useSneakerStore((s) => s.setColor);
  const setMaterial = useSneakerStore((s) => s.setMaterial);
  const reset = useSneakerStore((s) => s.reset);
  const totalPrice = useSneakerStore((s) => s.totalPrice());

  const animatedPrice = useAnimatedPrice(totalPrice);
  const { sheetRef, snapPoint, snapTo, onDragStart, onDragMove, onDragEnd } = useBottomSheet();

  const handleSwatchKey = useCallback(
    (e: ReactKeyboardEvent, hex: string) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setColor(hex);
      }
    },
    [setColor],
  );

  // The handle is focusable, so it needs to do something from the keyboard —
  // and ARIA requires a focusable separator to expose its current value.
  const handleSheetKey = useCallback(
    (e: ReactKeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        snapTo('full');
      } else if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        snapTo('peek');
      }
    },
    [snapTo],
  );

  const handleMaterialKey = useCallback(
    (e: ReactKeyboardEvent, id: MaterialId) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setMaterial(id);
      }
    },
    [setMaterial],
  );

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  const panelContent = (
    <>
      {/* Header */}
      <div className="config-header">
        <div>
          <h1 className="config-title">Sneaker Lab</h1>
          <p className="config-subtitle">Pick your colourway</p>
        </div>
        <div className="config-price" aria-live="polite">
          <span className="config-price-currency">$</span>
          <span className="config-price-value">{animatedPrice}</span>
        </div>
      </div>

      {/* Color Swatches */}
      <div className="config-section">
        <h2 className="config-section-label">Colour</h2>
        <div className="swatches" role="radiogroup" aria-label="Shoe colour">
          {COLOR_PALETTE.map((swatch) => {
            const isSelected = color === swatch.hex;
            return (
              <button
                key={swatch.hex}
                role="radio"
                aria-checked={isSelected}
                aria-label={swatch.name}
                title={swatch.name}
                className={`swatch ${isSelected ? 'swatch--selected' : ''}`}
                style={{ '--swatch-color': swatch.hex } as React.CSSProperties}
                onClick={() => setColor(swatch.hex)}
                onKeyDown={(e) => handleSwatchKey(e, swatch.hex)}
                type="button"
              />
            );
          })}
        </div>
      </div>

      {/* Material Cards */}
      <div className="config-section">
        <h2 className="config-section-label">Material</h2>
        <div className="material-cards">
          {MATERIAL_IDS.map((id) => {
            const preset = MATERIAL_PRESETS[id];
            const isActive = material === id;
            return (
              <button
                key={id}
                className={`material-card ${isActive ? 'material-card--active' : ''}`}
                onClick={() => setMaterial(id)}
                onKeyDown={(e) => handleMaterialKey(e, id)}
                aria-pressed={isActive}
                type="button"
              >
                <span className="material-card-name">{preset.label}</span>
                <span className="material-card-price">
                  {preset.priceDelta > 0 ? `+$${preset.priceDelta}` : `$${BASE_PRICE}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="config-actions">
        <button
          className="btn btn-outline"
          onClick={takeScreenshot}
          type="button"
          aria-label="Take a screenshot of your sneaker"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          Screenshot
        </button>

        <button
          className="btn btn-outline btn-reset"
          onClick={reset}
          type="button"
          aria-label="Reset all customizations"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          Reset
        </button>
      </div>

      <button
        className="btn btn-primary btn-cart"
        onClick={() => setShowModal(true)}
        type="button"
      >
        Add to Cart — ${totalPrice}
      </button>
    </>
  );

  return (
    <>
      {/* Desktop panel */}
      <aside className="configurator-desktop" aria-label="Sneaker configurator">
        <div className="configurator-inner">{panelContent}</div>
      </aside>

      {/* Mobile bottom sheet */}
      <aside
        className="configurator-mobile"
        ref={sheetRef}
        aria-label="Sneaker configurator"
      >
        <div
          className="sheet-handle"
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onPointerCancel={onDragEnd}
          role="separator"
          aria-orientation="horizontal"
          aria-label="Resize panel"
          aria-valuenow={Math.round((snapPoint === 'full' ? SNAP_FULL : SNAP_PEEK) * 100)}
          aria-valuemin={Math.round(SNAP_PEEK * 100)}
          aria-valuemax={Math.round(SNAP_FULL * 100)}
          aria-valuetext={snapPoint === 'full' ? 'Panel expanded' : 'Panel collapsed'}
          tabIndex={0}
          onKeyDown={handleSheetKey}
        >
          <div className="sheet-handle-bar" />
        </div>
        <div className="configurator-inner">{panelContent}</div>
      </aside>

      {/* Summary modal */}
      {showModal && <SummaryModal onClose={() => setShowModal(false)} />}
    </>
  );
}
