"use client";

import type { PointerEvent, ReactNode } from "react";

// Moves the hero's glow towards the pointer by updating two CSS variables.
export default function Spotlight({ children, className }: { children: ReactNode; className?: string }) {
  function move(e: PointerEvent<HTMLElement>) {
    const box = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--glow-x", `${((e.clientX - box.left) / box.width) * 100}%`);
    e.currentTarget.style.setProperty("--glow-y", `${((e.clientY - box.top) / box.height) * 100}%`);
  }

  return (
    <section className={className} id="top" onPointerMove={move}>
      {children}
    </section>
  );
}
