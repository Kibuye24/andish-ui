"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CornerDownLeft, Search, X } from "lucide-react";
import type { Command } from "./CommandPalette";

/**
 * The one search box in the studio. On a list it filters that list as you
 * type, and the dropdown offers matching places elsewhere in the studio.
 * ⌘K or / puts the cursor in it from anywhere.
 */
export default function TopSearch({ query, setQuery, commands, listName }: { query: string; setQuery: (q: string) => void; commands: Command[]; listName?: string }) {
  const [focused, setFocused] = useState(false);
  const [hi, setHi] = useState(0);
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const typing = e.target instanceof HTMLElement && e.target.closest("input, textarea, select, [contenteditable]");
      if (((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") || (e.key === "/" && !typing)) {
        e.preventDefault();
        field.current?.focus();
        field.current?.select();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const found = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) return [];
    return commands.filter((c) => words.every((w) => `${c.label} ${c.hint}`.toLowerCase().includes(w))).slice(0, listName ? 5 : 8);
  }, [commands, query, listName]);

  function run(c: Command) {
    setQuery("");
    setFocused(false);
    field.current?.blur();
    c.run();
  }

  const open = focused && query.trim() !== "";
  const active = Math.min(hi, Math.max(found.length - 1, 0));

  return (
    <div className="s-topsearch">
      <label className="s-topsearch-field">
        <Search size={16} aria-hidden="true" />
        <input
          ref={field}
          type="search"
          value={query}
          placeholder={listName ? `Search ${listName.toLowerCase()} or jump to…` : "Search or jump to…"}
          aria-label="Search the studio"
          aria-expanded={open}
          aria-controls="top-search-results"
          role="combobox"
          aria-autocomplete="list"
          onChange={(e) => {
            setQuery(e.target.value);
            setHi(0);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHi(Math.min(active + 1, found.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHi(Math.max(active - 1, 0));
            } else if (e.key === "Enter" && found[active] && !listName) {
              run(found[active]);
            } else if (e.key === "Escape") {
              setQuery("");
              field.current?.blur();
            }
          }}
        />
        {query ? (
          <button type="button" className="s-topsearch-clear" aria-label="Clear search" onMouseDown={(e) => e.preventDefault()} onClick={() => setQuery("")}>
            <X size={14} />
          </button>
        ) : (
          <kbd>⌘K</kbd>
        )}
      </label>

      {open && (
        <div className="s-topsearch-pop" id="top-search-results" role="listbox" onMouseDown={(e) => e.preventDefault()}>
          {listName && <p className="s-topsearch-note">Filtering {listName.toLowerCase()} below</p>}
          {found.length > 0 ? (
            <>
              <p className="s-label">{listName ? "Elsewhere in the studio" : "Go to"}</p>
              {found.map((c, i) => (
                <button key={c.label + c.hint} type="button" role="option" aria-selected={i === active} onMouseEnter={() => setHi(i)} onClick={() => run(c)}>
                  <span>
                    <strong>{c.label}</strong>
                    <small>{c.hint}</small>
                  </span>
                  {i === active && !listName && <CornerDownLeft size={14} aria-hidden="true" />}
                </button>
              ))}
            </>
          ) : (
            !listName && <p className="s-topsearch-note">Nothing by that name. Try “orders” or “working hours”.</p>
          )}
        </div>
      )}
    </div>
  );
}
