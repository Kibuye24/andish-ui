"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ChevronRight, Ellipsis, ExternalLink, Moon, Plus, Search, Sun, type LucideIcon } from "lucide-react";
import type { Role, SectionDef, SectionId, TabDef } from "@/lib/studio-data";
import Assistant from "./Assistant";
import type { Command } from "./CommandPalette";
import Sheet from "./Sheet";
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
  /** Address of the public site, shown as a link in the More drawer. */
  siteUrl?: string;
  siteHref?: string;
  /** The description typed into the landing page chat, if that is how this visit began. */
  brief?: string;
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

function SearchSheet({ commands, jump, close }: { commands: Command[]; jump: Command[]; close: () => void }) {
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    input.current?.focus();
  }, []);

  const shown = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) return jump;
    return commands.filter((c) => words.every((w) => `${c.label} ${c.hint}`.toLowerCase().includes(w))).slice(0, 30);
  }, [commands, jump, query]);

  return (
    <Sheet title="Search" tall onClose={close}>
      <label className="s-search m-search-field">
        <Search size={17} aria-hidden="true" />
        <input ref={input} id="mobile-search" type="search" placeholder="Bookings, orders, settings" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search the studio" />
      </label>
      <p className="s-label m-results-label">{query.trim() ? `${shown.length} found` : "Jump to"}</p>
      <ul className="m-results">
        {shown.length === 0 && <li className="s-empty">Nothing by that name. Try “orders” or “working hours”.</li>}
        {shown.map((c) => (
          <li key={c.label + c.hint}>
            <button
              type="button"
              onClick={() => {
                c.run();
                close();
              }}
            >
              <span>
                <strong>{c.label}</strong>
                <small>{c.hint}</small>
              </span>
              <ChevronRight size={17} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}

export default function MobileShell(p: Props) {
  const [sheet, setSheet] = useState<"more" | "search" | null>(null);
  const body = useRef<HTMLElement>(null);

  // Start each screen at the top, the way a pushed native screen does.
  useEffect(() => {
    body.current?.scrollTo({ top: 0 });
  }, [p.current.id, p.activeTab?.id]);

  const inBar = p.visible.slice(0, BAR_SLOTS);
  const inMore = p.visible.slice(BAR_SLOTS);
  const moreActive = inMore.some((s) => s.id === p.current.id);
  const moreBadge = inMore.reduce((n, s) => n + (p.badges[s.id] ?? 0), 0);
  const jump: Command[] = p.visible.map((s) => ({ label: s.label, hint: s.blurb, run: () => p.go(s.id) }));

  const label = (s: SectionDef) => (p.role === "staff" && s.id === "today" ? "My day" : p.role === "staff" && s.id === "bookings" ? "Mine" : s.label);

  return (
    <div className="studio is-mobile" data-theme={p.dark ? "dark" : "light"} style={p.themeStyle}>
      <header className="m-top">
        <div className="m-top-row">
          <div>
            <p className="m-kicker">{p.kicker}</p>
            <h1>{p.title}</h1>
          </div>
          <div className="m-top-acts">
            <button type="button" className="m-top-search" aria-label="Search" onClick={() => setSheet("search")}>
              <Search size={19} />
            </button>
            {p.action && (
              <button type="button" className="m-add" aria-label={p.action} onClick={p.onAction}>
                <Plus size={20} />
              </button>
            )}
          </div>
        </div>
        {p.tabs.length > 0 && (
          <div className="m-tabs" role="tablist" aria-label={p.current.label}>
            {p.tabs.map((t) => (
              <button key={t.id} type="button" role="tab" aria-selected={p.activeTab?.id === t.id} onClick={() => p.setTab(t.id)}>
                {t.label}
                {p.tabBadges[t.id] ? <b>{p.tabBadges[t.id]}</b> : null}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="m-body" ref={body}>
        {p.children}
      </main>

      <div className="m-dock">
        <nav className="m-bar" aria-label="Studio">
          {inBar.map((s) => {
            const Icon = p.icons[s.id];
            const badge = p.badges[s.id];
            return (
              <button key={s.id} type="button" aria-current={p.current.id === s.id ? "page" : undefined} onClick={() => p.go(s.id)}>
                <span className="m-bar-icon">
                  <Icon size={21} aria-hidden="true" />
                  {badge ? <b>{badge}</b> : null}
                </span>
                {label(s)}
              </button>
            );
          })}
          <button type="button" aria-current={moreActive ? "page" : undefined} aria-haspopup="dialog" onClick={() => setSheet("more")}>
            <span className="m-bar-icon">
              <Ellipsis size={21} aria-hidden="true" />
              {moreBadge ? <b>{moreBadge}</b> : null}
            </span>
            More
          </button>
        </nav>
      </div>

      <Assistant key={p.brief ?? "none"} mobile brief={p.brief} section={p.current.id} sectionLabel={p.current.id === "today" ? "Today" : p.current.label} />

      {p.overlay}

      {sheet === "search" && <SearchSheet commands={p.commands} jump={jump} close={() => setSheet(null)} />}

      {sheet === "more" && (
        <Sheet title={p.workspace} onClose={() => setSheet(null)}>
          {inMore.length > 0 && (
            <ul className="m-more">
              {inMore.map((s) => {
                const Icon = p.icons[s.id];
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      aria-current={p.current.id === s.id ? "page" : undefined}
                      onClick={() => {
                        p.go(s.id);
                        setSheet(null);
                      }}
                    >
                      <Icon size={22} aria-hidden="true" />
                      <strong>{s.label}</strong>
                      <small>{s.blurb}</small>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {p.siteUrl && (
            <a className="m-site" href={p.siteHref ?? `https://${p.siteUrl}`} target="_blank" rel="noopener noreferrer">
              <span>
                <strong>View site</strong>
                <small>{p.siteUrl}</small>
              </span>
              <ExternalLink size={18} aria-hidden="true" />
            </a>
          )}

          <div className="m-prefs">
            <div>
              <span>
                <strong>Viewing as</strong>
                <small>{p.role === "owner" ? "Everything in the workspace" : "A barber sees only their own bookings"}</small>
              </span>
              <div className="s-seg" role="group" aria-label="Viewing as">
                <button type="button" aria-pressed={p.role === "owner"} onClick={() => p.setRole("owner")}>
                  Owner
                </button>
                <button
                  type="button"
                  aria-pressed={p.role === "staff"}
                  onClick={() => {
                    p.setRole("staff");
                    p.go("today");
                    setSheet(null);
                  }}
                >
                  Barber
                </button>
              </div>
            </div>
            <div>
              <span>
                <strong>Appearance</strong>
                <small>{p.dark ? "Dark" : "Light"}</small>
              </span>
              <button type="button" className="s-icon-btn" onClick={() => p.setDark(!p.dark)} aria-label={p.dark ? "Use the light theme" : "Use the dark theme"}>
                {p.dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
            <div>
              <span>
                <strong>{p.name}</strong>
                <small>{p.role === "owner" ? "Owner" : "Barber"}</small>
              </span>
            </div>
          </div>
        </Sheet>
      )}
    </div>
  );
}
