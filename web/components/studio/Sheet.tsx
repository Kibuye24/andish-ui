"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { X } from "lucide-react";

const DISMISS_AFTER = 90;

/**
 * Bottom drawer. Drag the grip or the title down to dismiss, tap the backdrop,
 * or press Escape. `tall` gives a near full-height sheet for search and chat.
 */
export default function Sheet({
  title,
  onClose,
  tall = false,
  flush = false,
  children,
}: {
  title: string;
  onClose: () => void;
  tall?: boolean;
  /** Removes body padding so the content can run edge to edge. */
  flush?: boolean;
  children: ReactNode;
}) {
  const [drag, setDrag] = useState(0);
  const from = useRef<number | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function down(e: PointerEvent<HTMLDivElement>) {
    from.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function move(e: PointerEvent<HTMLDivElement>) {
    if (from.current !== null) setDrag(Math.max(0, e.clientY - from.current));
  }

  function up() {
    if (from.current === null) return;
    from.current = null;
    if (drag > DISMISS_AFTER) onClose();
    else setDrag(0);
  }

  return (
    <div className="m-sheet-back" onClick={onClose}>
      <section
        className={`m-sheet ${tall ? "is-tall" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        style={drag ? { transform: `translateY(${drag}px)`, transition: "none" } : undefined}
      >
        <div className="m-sheet-head" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
          <span className="m-sheet-grip" aria-hidden="true" />
          <h2>{title}</h2>
          <button type="button" className="s-icon-btn" onPointerDown={(e) => e.stopPropagation()} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className={`m-sheet-body ${flush ? "is-flush" : ""}`}>{children}</div>
      </section>
    </div>
  );
}
