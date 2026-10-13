"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { accents, DEFAULT_ACCENT, DEFAULT_MODE, type Mode } from "@/lib/studio-themes";

// The theme is a personal choice, kept in this browser. Reads and writes can
// fail (private windows, blocked storage), so the latest value is also held in
// memory and the theme still changes for the rest of the visit.

const KEY = "studio-theme";
type Theme = { mode: Mode; accent: string };

let current = "";
let loaded = false;
const listeners = new Set<() => void>();

function snapshot(): string {
  if (!loaded) {
    loaded = true;
    try {
      current = window.localStorage.getItem(KEY) ?? "";
    } catch {
      current = "";
    }
  }
  return current;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    current = e.newValue ?? "";
    cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function parse(raw: string): Theme {
  try {
    const v = JSON.parse(raw) as Partial<Theme>;
    return {
      mode: v.mode === "dark" ? "dark" : "light",
      accent: accents.some((a) => a.id === v.accent) ? (v.accent as string) : DEFAULT_ACCENT,
    };
  } catch {
    return { mode: DEFAULT_MODE, accent: DEFAULT_ACCENT };
  }
}

function write(next: Theme) {
  current = JSON.stringify(next);
  try {
    window.localStorage.setItem(KEY, current);
  } catch {
    // Kept in memory only.
  }
  listeners.forEach((l) => l());
}

export function useStudioTheme() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "");
  const theme = useMemo(() => parse(raw), [raw]);

  const setMode = useCallback((mode: Mode) => write({ ...parse(snapshot()), mode }), []);
  const setAccent = useCallback((accent: string) => write({ ...parse(snapshot()), accent }), []);
  const reset = useCallback(() => write({ mode: DEFAULT_MODE, accent: DEFAULT_ACCENT }), []);

  return { ...theme, setMode, setAccent, reset };
}
