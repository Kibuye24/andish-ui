"use client";

import { useState, type CSSProperties } from "react";
import { Check } from "lucide-react";
import { accentById, accents, accentStyle, type Mode } from "@/lib/studio-themes";
import { Mascot } from "./Assistant";

// Fixed colours for the little previews, so each mode can be shown while the other is active.
const frames: Record<Mode, Record<string, string>> = {
  light: { "--m-bg": "#f6f5f9", "--m-surface": "#ffffff", "--m-ink": "#17151d", "--m-line": "#e6e3ee" },
  dark: { "--m-bg": "#100f15", "--m-surface": "#19171f", "--m-ink": "#f1eff6", "--m-line": "#2a2734" },
};

function Mini({ mode, accent }: { mode: Mode; accent: string }) {
  const shade = accentStyle(accent, mode);
  const style = { ...frames[mode], "--m-accent": shade["--accent"] } as CSSProperties;
  return (
    <span className="s-mini" style={style} aria-hidden="true">
      <span className="s-mini-rail">
        <span />
        <span />
        <span />
      </span>
      <span className="s-mini-main">
        <span className="s-mini-title" />
        <span className="s-mini-card" />
        <span className="s-mini-btn" />
      </span>
    </span>
  );
}

export default function ThemeSettings({
  mode,
  accent,
  setMode,
  setAccent,
  reset,
}: {
  mode: Mode;
  accent: string;
  setMode: (m: Mode) => void;
  setAccent: (id: string) => void;
  reset: () => void;
}) {
  const [on, setOn] = useState(true);
  const chosen = accentById(accent);
  const options: [Mode, string, string][] = [
    ["light", "Light", "Bright and clean, best in daylight."],
    ["dark", "Dark", "Easier on the eyes in the evening."],
  ];

  return (
    <div className="s-setup s-theme">
      <p className="s-callout">Only you see this theme, on this device. Your public site keeps its own look under Website, then Appearance.</p>

      <section>
        <h2>Mode</h2>
        <div className="s-modes" role="radiogroup" aria-label="Mode">
          {options.map(([id, name, about]) => (
            <button key={id} type="button" role="radio" aria-checked={mode === id} onClick={() => setMode(id)}>
              <Mini mode={id} accent={accent} />
              <span>
                <strong>{name}</strong>
                <small>{about}</small>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2>Colour</h2>
        <p className="s-muted">Used for buttons, highlights and the assistant. It adjusts itself to stay readable in {mode} mode.</p>
        <div className="s-accents" role="radiogroup" aria-label="Colour">
          {accents.map((a) => {
            const shade = accentStyle(a.id, mode);
            return (
              <button key={a.id} type="button" role="radio" aria-checked={accent === a.id} onClick={() => setAccent(a.id)}>
                <span className="s-swatch-dot" style={{ background: shade["--accent"], color: shade["--accent-ink"] }}>
                  {accent === a.id && <Check size={14} aria-hidden="true" />}
                </span>
                <span>
                  <strong>{a.name}</strong>
                  {a.tag && <small>{a.tag}</small>}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h2>Preview</h2>
        <div className="s-card s-theme-preview">
          <span className="s-theme-bot">
            <Mascot size={76} />
          </span>
          <div>
            <p className="s-bubble is-bot">Hi, I am your assistant. I wear the same colour as the rest of the studio.</p>
            <div className="s-theme-sample">
              <button type="button" className="s-btn is-primary">
                Save changes
              </button>
              <button type="button" className="s-btn">
                Cancel
              </button>
              <span className="s-pill is-ok">Confirmed</span>
              <button type="button" role="switch" aria-checked={on} aria-label="Sample switch" className="s-switch" onClick={() => setOn(!on)}>
                <span />
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="s-theme-foot">
        <span className="s-muted">
          Now using {mode} with {chosen.name.toLowerCase()}.
        </span>
        <button type="button" className="s-btn" onClick={reset}>
          Reset to default
        </button>
      </div>
    </div>
  );
}
