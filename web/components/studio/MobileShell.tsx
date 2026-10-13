"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ChevronRight, Ellipsis, ExternalLink, Moon, Plus, Search, Sun, X, type LucideIcon } from "lucide-react";
import type { Role, SectionDef, SectionId, TabDef } from "@/lib/studio-data";
import Assistant from "./Assistant";
import type { Command } from "./CommandPalette";
import type { Go } from "./views";

const BAR_SLOTS = 4;

type Props = {
  workspace: string;
  name: string;
  title: string;
  kicker: string;
  current: SectionDef;
  visible: SectionDef[];
  tabs: TabDef[];
  activeTab?: TabDef;
  tabBadges: Record<string, number>;
  /** Label of the screen's main action, shown as the round button in the header. */
  action?: string;
  onAction?: () => void;
  /** Drawers and messages that sit above the whole screen, such as forms. */
  overlay?: ReactNode;
  siteUrl?: string;
  siteHref?: string;
  /** The description typed into the landing page chat, if that is how this visit began. */
  brief?: string;
  /** What the header search is typed into. On a list it also filters that list. */
  query: string;
  setQuery: (q: string) => void;
  /** The name of the list on screen, if there is one, for the search hint. */
  listName?: string;
  icons: Record<SectionId, LucideIcon>;
  badges: Partial<Record<SectionId, number>>;
  commands: Command[];
  role: Role;
  dark: boolean;
  themeStyle?: CSSProperties;
  go: Go;
  setTab: (id: string) => void;
  setRole: (r: Role) => void;
  setDark: (d: boolean) => void;
  children: ReactNode;
};

export default function MobileShell(p: Props) {
  const [searching, setSearching] = useState(false);
  const [more, setMore] = useState(false);
  const body = useRef<HTMLElement>(null);
  const field = useRef<HTMLInputElement>(null);

  // Start each screen at the top, the way a pushed native screen does.
  useEffect(() => {
    body.current?.scrollTo({ top: 0 });
  }, [p.current.id, p.activeTab?.id]);

  useEffect(() => {
    if (searching) field.current?.focus();
  }, [searching]);

  const inBar = p.visible.slice(0, BAR_SLOTS);
  const inMore = p.visible.slice(BAR_SLOTS);
  const moreActive = inMore.some((s) => s.id === p.current.id);
  const moreBadge = inMore.reduce((n, s) => n + (p.badges[s.id] ?? 0), 0);

  // Matches from the rest of the studio. On a list these sit above the filtered list.
  const found = useMemo(() => {
    const words = p.query.toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) return [];
    return p.commands.filter((c) => words.every((w) => `${c.label} ${c.hint}`.toLowerCase().includes(w))).slice(0, p.listName ? 3 : 6);
  }, [p.commands, p.query, p.listName]);

  function closeSearch() {
    setSearching(false);
    p.setQuery("");
  }

  function leave(run: () => void) {
    setSearching(false);
    setMore(false);
    run();
  }

  const label = (s: SectionDef) => (p.role === "staff" && s.id === "today" ? "My day" : p.role === "staff" && s.id === "bookings" ? "Mine" : s.label);

  return (
    <div className="studio is-mobile" data-theme={p.dark ? "dark" : "light"} style={p.themeStyle}>
      <header className="m-top">
        {searching ? (
          <div className="m-top-row is-search">
            <label className="m-searchbar">
              <Search size={18} aria-hidden="true" />
              <input
                ref={field}
                id="top-search"
                type="search"
                value={p.query}
                onChange={(e) => p.setQuery(e.target.value)}
                placeholder={p.listName ? `Search ${p.listName.toLowerCase()}` : "Search the studio"}
                aria-label={p.listName ? `Search ${p.listName.toLowerCase()} and the studio` : "Search the studio"}
              />
            </label>
            <button type="button" className="m-top-search" onClick={closeSearch} aria-label="Close search">
              <X size={19} />
            </button>
          </div>
        ) : (
          <div className="m-top-row">
            <div>
              <p className="m-kicker">{p.kicker}</p>
              <h1>{p.title}</h1>
            </div>
            <div className="m-top-acts">
              <button type="button" className="m-top-search" aria-label="Search" onClick={() => setSearching(true)}>
                <Search size={19} />
              </button>
              {p.action && (
                <button type="button" className="m-add" aria-label={p.action} onClick={p.onAction}>
                  <Plus size={20} />
                </button>
              )}
            </div>
          </div>
        )}
        {p.tabs.length > 0 && (
          <div className="m-tabs" role="tablist" aria-label={p.current.label}>
            {p.tabs.map((t) => (
              <button key={t.id} type="button" role="tab" aria-selected={p.activeTab?.id === t.id} onClick={() => leave(() => p.setTab(t.id))}>
                {t.label}
                {p.tabBadges[t.id] ? <b>{p.tabBadges[t.id]}</b> : null}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="m-body" ref={body}>
        {searching && found.length > 0 && (
          <section className="m-found" aria-label={p.listName ? "Elsewhere in the studio" : "Go to"}>
            <p className="s-label">{p.listName ? "Elsewhere in the studio" : "Go to"}</p>
            <ul>
              {found.map((c) => (
                <li key={c.label + c.hint}>
                  <button type="button" onClick={() => leave(c.run)}>
                    <span>
                      <strong>{c.label}</strong>
                      <small>{c.hint}</small>
                    </span>
                    <ChevronRight size={16} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
        {searching && !p.listName && p.query.trim() && found.length === 0 && <p className="s-empty">Nothing by that name. Try “orders” or “working hours”.</p>}
        {p.children}
      </main>

      <div className="m-dock">
        <nav className="m-bar" aria-label="Studio">
          {inBar.map((s) => {
            const Icon = p.icons[s.id];
            const badge = p.badges[s.id];
            return (
              <button key={s.id} type="button" aria-current={p.current.id === s.id ? "page" : undefined} onClick={() => leave(() => p.go(s.id))}>
                <span className="m-bar-icon">
                  <Icon size={21} aria-hidden="true" />
                  {badge ? <b>{badge}</b> : null}
                </span>
                {label(s)}
              </button>
            );
          })}
          <button type="button" aria-current={moreActive ? "page" : undefined} aria-haspopup="menu" aria-expanded={more} onClick={() => setMore(!more)}>
            <span className="m-bar-icon">
              <Ellipsis size={21} aria-hidden="true" />
              {moreBadge ? <b>{moreBadge}</b> : null}
            </span>
            More
          </button>
        </nav>
      </div>

      {/* A small menu above the bar. It leaves the screen behind it visible. */}
      {more && (
        <>
          <button type="button" className="m-pop-catch" aria-label="Close menu" onClick={() => setMore(false)} />
          <div className="m-pop" role="menu" aria-label="More">
            {inMore.map((s) => {
              const Icon = p.icons[s.id];
              return (
                <button key={s.id} type="button" role="menuitem" aria-current={p.current.id === s.id ? "page" : undefined} onClick={() => leave(() => p.go(s.id))}>
                  <Icon size={18} aria-hidden="true" />
                  {s.label}
                </button>
              );
            })}
            {p.siteUrl && (
              <a role="menuitem" href={p.siteHref ?? `https://${p.siteUrl}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={18} aria-hidden="true" />
                View site
              </a>
            )}
            <div className="m-pop-foot">
              <div className="s-seg" role="group" aria-label="Viewing as">
                <button type="button" aria-pressed={p.role === "owner"} onClick={() => p.setRole("owner")}>
                  Owner
                </button>
                <button
                  type="button"
                  aria-pressed={p.role === "staff"}
                  onClick={() =>
                    leave(() => {
                      p.setRole("staff");
                      p.go("today");
                    })
                  }
                >
                  Barber
                </button>
              </div>
              <button type="button" className="s-icon-btn" onClick={() => p.setDark(!p.dark)} aria-label={p.dark ? "Use the light theme" : "Use the dark theme"}>
                {p.dark ? <Sun size={17} /> : <Moon size={17} />}
              </button>
            </div>
          </div>
        </>
      )}

      <Assistant key={p.brief ?? "none"} mobile brief={p.brief} section={p.current.id} sectionLabel={p.current.id === "today" ? "Today" : p.current.label} />

      {p.overlay}
    </div>
  );
}
