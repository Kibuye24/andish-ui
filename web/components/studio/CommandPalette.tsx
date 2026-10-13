"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CornerDownLeft, Search } from "lucide-react";

export type Command = { label: string; hint: string; run: () => void };

export default function CommandPalette({ commands, close }: { commands: Command[]; close: () => void }) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    input.current?.focus();
  }, []);

  const shown = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return commands.filter((c) => words.every((w) => `${c.label} ${c.hint}`.toLowerCase().includes(w))).slice(0, 9);
  }, [commands, query]);

  function pick(c: Command | undefined) {
    if (!c) return;
    c.run();
    close();
  }

  return (
    <div className="s-palette-back" onClick={close}>
      <div
        className="s-palette"
        role="dialog"
        aria-modal="true"
        aria-label="Search and jump"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") close();
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setIndex((i) => Math.min(i + 1, shown.length - 1));
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setIndex((i) => Math.max(i - 1, 0));
          }
          if (e.key === "Enter") pick(shown[index]);
        }}
      >
        <label>
          <Search size={17} aria-hidden="true" />
          <input
            ref={input}
            id="palette-input"
            type="text"
            placeholder="Where do you want to go?"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            aria-label="Search and jump"
          />
        </label>
        <ul role="listbox" aria-label="Results">
          {shown.length === 0 && <li className="s-empty">Nothing by that name. Try “orders” or “working hours”.</li>}
          {shown.map((c, i) => (
            <li key={c.label + c.hint} role="presentation">
              <button type="button" role="option" aria-selected={i === index} onMouseEnter={() => setIndex(i)} onClick={() => pick(c)}>
                <span>{c.label}</span>
                <small>{c.hint}</small>
                {i === index && <CornerDownLeft size={14} aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
