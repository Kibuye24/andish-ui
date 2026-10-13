// Studio themes: a mode (light or dark) plus one accent colour. The accent
// drives buttons, highlights, badges and the assistant bot. Every other
// shade is derived here so each accent stays readable in both modes.

export type Mode = "light" | "dark";
export type Accent = { id: string; name: string; hex: string; tag?: string };

// Orange is Andishi's own orange (#f97316). The rest fill out the wheel.
export const accents: Accent[] = [
  { id: "orange", name: "Orange", hex: "#f97316", tag: "Brand" },
  { id: "amber", name: "Amber", hex: "#f59e0b" },
  { id: "yellow", name: "Yellow", hex: "#eab308" },
  { id: "lime", name: "Lime", hex: "#84cc16" },
  { id: "green", name: "Green", hex: "#16a34a" },
  { id: "emerald", name: "Emerald", hex: "#059669" },
  { id: "teal", name: "Teal", hex: "#0d9488" },
  { id: "cyan", name: "Cyan", hex: "#0891b2" },
  { id: "sky", name: "Sky", hex: "#0ea5e9" },
  { id: "blue", name: "Blue", hex: "#2563eb" },
  { id: "indigo", name: "Indigo", hex: "#4f46e5" },
  { id: "purple", name: "Purple", hex: "#7c3aed", tag: "Default" },
  { id: "fuchsia", name: "Fuchsia", hex: "#c026d3" },
  { id: "pink", name: "Pink", hex: "#db2777" },
  { id: "rose", name: "Rose", hex: "#e11d48" },
  { id: "red", name: "Red", hex: "#dc2626" },
  { id: "brown", name: "Brown", hex: "#8b5e3c" },
  { id: "graphite", name: "Graphite", hex: "#3f3f46" },
];

export const DEFAULT_MODE: Mode = "light";
export const DEFAULT_ACCENT = "purple";

/* ───────── colour maths ───────── */

type RGB = [number, number, number];

const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));

function toRgb(hex: string): RGB {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const toHex = (c: RGB) => `#${c.map((v) => Math.round(clamp(v / 255) * 255).toString(16).padStart(2, "0")).join("")}`;

const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

function luminance(c: RGB): number {
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
}

export function contrast(a: RGB, b: RGB): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function toHsl([r, g, b]: RGB): [number, number, number] {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === rn ? (gn - bn) / d + (gn < bn ? 6 : 0) : max === gn ? (bn - rn) / d + 2 : (rn - gn) / d + 4;
  return [h * 60, s, l];
}

function fromHsl([h, s, l]: [number, number, number]): RGB {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

/* ───────── the four accent variables the studio reads ───────── */

const WHITE: RGB = [255, 255, 255];
const DARK_INK = toRgb("#17151d");
const SURFACE = { light: toRgb("#ffffff"), dark: toRgb("#19171f") };

export function accentShades(hex: string, mode: Mode) {
  const dark = mode === "dark";
  let accent = toRgb(hex);
  // On a dark ground an accent is only lifted as far as it needs to be seen, so bright ones keep their true colour.
  if (dark) {
    const [h, s, l0] = toHsl(accent);
    let l = l0;
    while (l < 0.85 && contrast(accent, SURFACE.dark) < 5) {
      l += 0.02;
      accent = fromHsl([h, s, l]);
    }
  }
  // Text on the accent is white or near-black, whichever reads better.
  const ink = contrast(accent, WHITE) >= contrast(accent, DARK_INK) ? WHITE : DARK_INK;
  // A faint wash of the accent, for selected rows and callouts.
  const soft = mix(SURFACE[mode], accent, dark ? 0.2 : 0.12);
  // Accent-coloured text is pushed darker (or lighter) until it reads on that wash.
  let text = accent;
  const toward: RGB = dark ? WHITE : [0, 0, 0];
  for (let i = 0; i < 24 && contrast(text, soft) < 4.6; i++) text = mix(text, toward, 0.07);
  return { accent, ink, soft, text };
}

/** CSS custom properties for the studio root. */
export function accentStyle(id: string, mode: Mode): Record<string, string> {
  const hex = (accents.find((a) => a.id === id) ?? accents[0]).hex;
  const s = accentShades(hex, mode);
  return { "--accent": toHex(s.accent), "--accent-ink": toHex(s.ink), "--accent-soft": toHex(s.soft), "--accent-text": toHex(s.text) };
}

export function accentById(id: string): Accent {
  return accents.find((a) => a.id === id) ?? accents.find((a) => a.id === DEFAULT_ACCENT)!;
}
