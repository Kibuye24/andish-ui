"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Bell, ChevronRight, Ellipsis, LayoutGrid, Plus, Search, X, type LucideIcon } from "lucide-react";
import type { Role, SectionDef, SectionId, TabDef } from "@/lib/studio-data";
import Assistant from "./Assistant";
import type { Command } from "./CommandPalette";
import Sheet from "./Sheet";
import { FilterSelect, type FilterGroup, type Go } from "./views";

const BAR_SLOTS = 4;
/** The expanded panel is a square of this many tiles across. */
const MORE_COLS = 3;

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
  /** The person's avatar and menu: settings, theme, and the way back from a preview. */
  account: ReactNode;
  /** Unread notices, shown on the bell in the header. */
  alerts: number;
  /** The filters for the list on screen, shown in the tab row so they scroll with the tabs. */
  filters?: { groups: FilterGroup[]; values: Record<string, string | null>; onChange: (group: string, value: string | null) => void };
  children: ReactNode;
};

export default function MobileShell(p: Props) {
  const [searching, setSearching] = useState(false);
  const [more, setMore] = useState(false);
  const [allTabs, setAllTabs] = useState(false);
  const [edges, setEdges] = useState({ overflow: false, start: true, end: true });
  const body = useRef<HTMLElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const strip = useRef<HTMLDivElement>(null);

  // Start each screen at the top, the way a pushed native screen does.
  useEffect(() => {
    body.current?.scrollTo({ top: 0 });
  }, [p.current.id, p.activeTab?.id]);

  useEffect(() => {
    if (searching) field.current?.focus();
  }, [searching]);

  // Whether the tabs run off screen, and on which side, for the fades and the "all" button.
  useEffect(() => {
    const el = strip.current;
    if (!el) return;
    const measure = () =>
      setEdges({ overflow: el.scrollWidth > el.clientWidth + 2, start: el.scrollLeft <= 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 });
    const watch = new ResizeObserver(measure);
    watch.observe(el);
    el.addEventListener("scroll", measure, { passive: true });
    return () => {
      watch.disconnect();
      el.removeEventListener("scroll", measure);
    };
  }, [p.tabs]);

  // Keep the chosen tab in view, so picking one from the sheet scrolls the strip to it.
  useEffect(() => {
    const el = strip.current;
    const on = el?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (el && on) el.scrollTo({ left: on.offsetLeft - el.clientWidth / 2 + on.offsetWidth / 2, behavior: "smooth" });
  }, [p.activeTab?.id, p.current.id]);

  // The inbox lives on the bell in the header, so the bar and the panel hold every other section.
  const sections_ = p.visible.filter((s) => s.id !== "inbox");
  const inBar = sections_.slice(0, BAR_SLOTS);
  const moreActive = sections_.some((s) => s.id === p.current.id);
  const moreBadge = sections_.slice(BAR_SLOTS).reduce((n, s) => n + (p.badges[s.id] ?? 0), 0);
  const panelRows = Math.ceil(sections_.length / MORE_COLS);
  // The panel replaces the bar, so it reads from the bottom: the bar's first sections on the bottom row,
  // then the rest above, and the ones the bar had no room for on top.
  const panelOrder = Array.from({ length: panelRows }, (_, r) => sections_.slice(r * MORE_COLS, (r + 1) * MORE_COLS)).reverse().flat();

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
    setAllTabs(false);
    run();
  }

  const label = (s: SectionDef) => (p.role === "staff" && s.id === "today" ? "My day" : p.role === "staff" && s.id === "bookings" ? "Mine" : s.label);
  // Up to four tabs always fit on screen (wrapping if they must), so they need no "see all" button.
  const few = p.tabs.length <= 4;
  const tabBadgeTotal = p.tabs.reduce((n, t) => n + (p.tabBadges[t.id] ?? 0), 0);

  return (
    <div
      className={`studio is-mobile${more ? " is-more" : ""}`}
      data-theme={p.dark ? "dark" : "light"}
      style={{ ...p.themeStyle, "--more-rows": panelRows } as CSSProperties}
    >
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
          <div className="m-top-row is-bar">
            {/* The screen's main action takes the top left; screens without one show where you are. */}
            {p.action ? (
              <button type="button" className="m-add" aria-label={p.action} title={p.action} onClick={p.onAction}>
                <Plus size={20} />
              </button>
            ) : (
              <p className="m-kicker">{p.kicker}</p>
            )}
            <div className="m-top-acts">
              <button type="button" className="m-top-search" aria-label="Search" onClick={() => setSearching(true)}>
                <Search size={19} />
              </button>
              {p.visible.some((s) => s.id === "inbox") && (
                <button type="button" className="m-top-search m-bell" aria-label={p.alerts ? `Notifications, ${p.alerts} new` : "Notifications"} onClick={() => leave(() => p.go("inbox"))}>
                  <Bell size={19} aria-hidden="true" />
                  {p.alerts ? <b>{p.alerts}</b> : null}
                </button>
              )}
              {p.account}
            </div>
          </div>
        )}
        {/* The page name sits on its own line under the bar. */}
        <div className="m-title-row">
          <h1>{p.title}</h1>
        </div>
        {p.tabs.length > 0 && (
          <div className={`m-tabbar${few ? " is-few" : ""}${edges.overflow && !few ? " is-overflow" : ""}${edges.start ? "" : " is-scrolled"}${edges.end ? " is-end" : ""}`}>
            <div className="m-tabs" ref={strip}>
              <div role="tablist" aria-label={p.current.label} className="m-tabs-tabs">
                {p.tabs.map((t) => (
                  <button key={t.id} type="button" role="tab" aria-selected={p.activeTab?.id === t.id} onClick={() => leave(() => p.setTab(t.id))}>
                    {t.label}
                    {p.tabBadges[t.id] ? <b>{p.tabBadges[t.id]}</b> : null}
                  </button>
                ))}
              </div>
            </div>
            {edges.overflow && !few && (
              <button type="button" className="m-tabs-all" onClick={() => setAllTabs(true)} aria-label={`See all ${p.tabs.length} ${p.current.label.toLowerCase()} views`}>
                <LayoutGrid size={16} aria-hidden="true" />
                <span>{p.tabs.length}</span>
                {tabBadgeTotal ? <i className="s-dot" aria-hidden="true" /> : null}
              </button>
            )}
          </div>
        )}
        {/* Filters for the list on screen get their own row under the tabs. */}
        {p.filters && p.filters.groups.length > 0 && (
          <div className="m-filterbar" role="group" aria-label="Filters">
            {p.filters.groups.map((g) => {
              const value = p.filters?.values[g.label] ?? null;
              return <FilterSelect key={g.label} group={g} value={value} onChange={(v) => p.filters?.onChange(g.label, v)} />;
            })}
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

      {more && <button type="button" className="m-pop-catch" aria-label="Close menu" onClick={() => setMore(false)} />}

      {/* The bar stays where it is; the panel grows up from it with every section as a tile. */}
      <div className="m-dock">
        <div className={`m-dock-panel${more ? " is-open" : ""}`}>
          <div className="m-more" id="m-more" inert={!more}>
            <div className="m-more-inner" role="menu" aria-label="All sections">
              <button type="button" className="m-more-close" aria-label="Close" onClick={() => setMore(false)}>
                <X size={18} aria-hidden="true" />
              </button>
              <div className="m-more-grid">
                {panelOrder.map((s) => {
                  const Icon = p.icons[s.id];
                  const badge = p.badges[s.id];
                  return (
                    <button key={s.id} type="button" role="menuitem" aria-current={p.current.id === s.id ? "page" : undefined} onClick={() => leave(() => p.go(s.id))}>
                      <span className="m-more-icon">
                        <Icon size={28} aria-hidden="true" />
                        {badge ? <b>{badge}</b> : null}
                      </span>
                      <span className="m-more-label">{label(s)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
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
            {sections_.length > BAR_SLOTS && (
              <button type="button" aria-current={moreActive && !more ? "page" : undefined} aria-controls="m-more" aria-expanded={more} onClick={() => setMore(!more)}>
                <span className="m-bar-icon">
                  <Ellipsis size={21} aria-hidden="true" />
                  {moreBadge && !more ? <b>{moreBadge}</b> : null}
                </span>
                More
              </button>
            )}
          </nav>
        </div>
      </div>

      {allTabs && (
        <Sheet title={p.current.label} onClose={() => setAllTabs(false)}>
          <div className="m-tab-grid">
            {p.tabs.map((t) => (
              <button key={t.id} type="button" aria-current={p.activeTab?.id === t.id ? "true" : undefined} onClick={() => leave(() => p.setTab(t.id))}>
                <span>{t.label}</span>
                {p.tabBadges[t.id] ? <b>{p.tabBadges[t.id]}</b> : null}
              </button>
            ))}
          </div>
        </Sheet>
      )}

      <Assistant key={p.brief ?? "none"} mobile brief={p.brief} section={p.current.id} sectionLabel={p.current.id === "today" ? "Today" : p.current.label} />

      {p.overlay}
    </div>
  );
}
