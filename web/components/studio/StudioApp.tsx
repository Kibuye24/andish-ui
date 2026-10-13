"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { CalendarDays, ExternalLink, Folder, Globe, Moon, Search, Settings, ShoppingBag, Sun, Sunrise, TrendingUp, Users, Wallet, type LucideIcon } from "lucide-react";
import {
  bookings as seedBookings,
  claims,
  files as seedFiles,
  resources,
  sections,
  workspace,
  type BookingStatus,
  type FileNode,
  type Capability,
  type Role,
  type SectionDef,
  type SectionId,
  type TabDef,
} from "@/lib/studio-data";
import Assistant from "./Assistant";
import CommandPalette, { type Command } from "./CommandPalette";
import Files from "./Files";
import FormPanel, { Toast } from "./FormPanel";
import MobileShell from "./MobileShell";
import RecordView from "./RecordView";
import ThemeSettings from "./ThemeSettings";
import { useStudioTheme } from "./useStudioTheme";
import { accentStyle } from "@/lib/studio-themes";
import { bookingFrom, fileNodeFrom, forms, type Values } from "@/lib/studio-forms";
import { Agenda, Appearance, BookingActions, BookingFacts, CalendarDay, DataTable, MyDay, Pages, type PageItem, ReportView, SetupList, ToConfirm, Today, WorkspaceSettings } from "./views";

const icons: Record<SectionId, LucideIcon> = {
  today: Sunrise,
  bookings: CalendarDays,
  store: ShoppingBag,
  payments: Wallet,
  customers: Users,
  website: Globe,
  files: Folder,
  reports: TrendingUp,
  settings: Settings,
};

// Rail order: the day, then running the business, then building it, then reviewing it.
const railGroups: SectionId[][] = [["today"], ["bookings", "store", "payments", "customers"], ["website", "files"], ["reports"]];

const PHONE = "(max-width: 860px)";

function watchPhone(onChange: () => void) {
  const query = window.matchMedia(PHONE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export default function StudioApp({ forceMobile = false }: { forceMobile?: boolean }) {
  const narrow = useSyncExternalStore(
    watchPhone,
    () => window.matchMedia(PHONE).matches,
    () => false,
  );
  const mobile = forceMobile || narrow;
  const [section, setSection] = useState<SectionId>("today");
  const [tab, setTab] = useState("");
  const [role, setRole] = useState<Role>("owner");
  const { mode, accent, setMode, setAccent, reset: resetTheme } = useStudioTheme();
  const dark = mode === "dark";
  const setDark = (d: boolean) => setMode(d ? "dark" : "light");
  const themeStyle = accentStyle(accent, mode) as CSSProperties;
  const [palette, setPalette] = useState(false);
  const [caps, setCaps] = useState<Record<Capability, boolean>>({ website: true, bookings: true, store: true, payments: true });
  const [bookings, setBookings] = useState(seedBookings);
  const [decided, setDecided] = useState<string[]>([]);
  // Forms: which one is open, and what each has added to the example data.
  const [formKey, setFormKey] = useState<string | null>(null);
  const [ops, setOps] = useState<Record<string, Array<(rows: string[][]) => string[][]>>>({});
  const [uploads, setUploads] = useState<FileNode[]>([]);
  const [extraPages, setExtraPages] = useState<PageItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  // Set when someone arrives from the landing page chat: the AI builder starts from this.
  const [brief, setBrief] = useState<string | null>(null);
  // The header search on a phone, and the record that is open on its own page.
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<{ key: string; id: string } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  const claimsLeft = claims.filter((c) => !decided.includes(c.id));
  const pending = bookings.filter((b) => b.status === "Pending").length;
  const badges: Partial<Record<SectionId, number>> = { bookings: pending, store: 3, payments: claimsLeft.length };

  const visible = useMemo(() => {
    if (role === "staff") return sections.filter((s) => s.id === "today" || s.id === "bookings");
    return sections.filter((s) => !s.capability || caps[s.capability]);
  }, [role, caps]);

  const current: SectionDef = visible.find((s) => s.id === section) ?? visible[0];

  const tabs: TabDef[] = useMemo(() => {
    if (current.id !== "bookings") return current.tabs;
    const mine = role === "staff";
    const rows = bookings
      .filter((b) => !mine || b.resource === "kevin")
      .map((b) => [b.ref, `Today, ${b.start}`, b.customer, b.service, resources.find((r) => r.id === b.resource)?.name ?? "", b.status, b.payment]);
    const withLive = current.tabs.map((t) => (t.id === "list" && t.table ? { ...t, label: mine ? "My bookings" : t.label, table: { ...t.table, rows, action: mine ? undefined : t.table.action, moreFilters: mine ? undefined : [{ label: "Barber", options: resources.map((r) => r.name) }] } } : t));
    return mine ? withLive.filter((t) => t.id === "calendar" || t.id === "list") : withLive;
  }, [current, role, bookings]);

  const activeTab = tabs.find((t) => t.id === tab) ?? tabs[0];

  function go(next: SectionId, nextTab?: string) {
    setSection(next);
    setTab(nextTab ?? "");
    setQuery("");
    setDetail(null);
  }

  function pickTab(id: string) {
    setTab(id);
    setQuery("");
    setDetail(null);
  }

  function replaceRow(key: string, id: string, next: string[]) {
    setOps((o) => ({ ...o, [key]: [...(o[key] ?? []), (rows) => rows.map((r) => (r[0] === id ? next : r))] }));
  }

  function setStatus(id: string, status: BookingStatus) {
    setBookings((list) => list.map((b) => (b.id === id ? { ...b, status } : b)));
  }

  const folderNames = [...seedFiles, ...uploads].filter((f) => f.kind === "folder").map((f) => f.name);
  const folderId = (name: string) => [...seedFiles, ...uploads].find((f) => f.kind === "folder" && f.name === name)?.id ?? null;

  function flash(message: string) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }

  function openForm(key: string) {
    setFormKey(key);
  }

  function submitForm(values: Values) {
    if (!formKey) return;
    const key = formKey;
    const def = forms[key];
    const [sec, tabId] = key.split("/");
    let next: [SectionId, string?] = [sec as SectionId, tabId];
    const name = String(values.name ?? "").trim();

    switch (def.effect) {
      case "booking":
        setBookings((list) => [...list, bookingFrom(values, list)]);
        next = ["bookings", "calendar"];
        break;
      case "upload": {
        const parent = folderId(String(values.folder));
        setUploads((u) => [...u, ...(values.files as File[]).map((f, i) => fileNodeFrom(f, parent, u.length + i))]);
        next = ["files"];
        break;
      }
      case "folder": {
        const parent = folderId(String(values.folder));
        setUploads((u) => [...u, { id: `folder-${u.length}-${name}`, name, kind: "folder", parent, modified: "Just now" }]);
        next = ["files"];
        break;
      }
      case "page": {
        const path = `/${String(values.path || name).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
        setExtraPages((p) => [...p, { id: `new-${p.length}-${path}`, name, path, status: "Draft", sections: ["Header", "Opening section", "Footer"] }]);
        break;
      }
      default: {
        const apply = def.apply;
        if (apply) setOps((o) => ({ ...o, [key]: [...(o[key] ?? []), (rows) => apply(rows, values)] }));
      }
    }

    setFormKey(null);
    flash(def.done(values));
    if (current.id !== next[0]) go(next[0], next[1]);
  }

  // Deep links: #bookings/calendar
  const linked = useRef(false);
  useEffect(() => {
    function fromHash() {
      linked.current = true;
      const [s, t] = window.location.hash.slice(1).split("/");
      if (sections.some((x) => x.id === s)) {
        setSection(s as SectionId);
        setTab(t ?? "");
      }
    }
    const first = requestAnimationFrame(fromHash);
    window.addEventListener("hashchange", fromHash);
    return () => {
      cancelAnimationFrame(first);
      window.removeEventListener("hashchange", fromHash);
    };
  }, []);

  useEffect(() => {
    // Wait until the address has been read once, or a deep link would be overwritten.
    if (!linked.current) return;
    const hash = `#${current.id}${activeTab ? `/${activeTab.id}` : ""}`;
    if (window.location.hash !== hash) window.history.replaceState(null, "", hash);
  }, [current.id, activeTab]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const q = new URLSearchParams(window.location.search).get("brief");
      if (!q) return;
      setBrief(q.slice(0, 500));
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.hash}`);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((p) => !p);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const commands: Command[] = useMemo(
    () =>
      visible.flatMap((s) => [
        { label: s.label, hint: s.blurb, run: () => go(s.id) },
        ...(role === "owner" ? s.tabs : []).flatMap((t) => [
          { label: `${s.label}: ${t.label}`, hint: t.table?.action ?? "Open", run: () => go(s.id, t.id) },
          ...(t.setup?.flatMap((g) => g.items.map(([title, detail]) => ({ label: title, hint: `${s.label}, ${t.label}. ${detail}`, run: () => go(s.id, t.id) }))) ?? []),
        ]),
        ...(role !== "owner"
          ? []
          : s.id === "files"
            ? [
                { label: "Upload files", hint: "Files", run: () => { go("files"); openForm("files/upload"); } },
                { label: "New folder", hint: "Files", run: () => { go("files"); openForm("files/folder"); } },
              ]
            : s.tabs
                .filter((t) => forms[`${s.id}/${t.id}`])
                .map((t) => ({
                  label: forms[`${s.id}/${t.id}`].title,
                  hint: `${s.label}, ${t.label}`,
                  run: () => {
                    go(s.id, t.id);
                    openForm(`${s.id}/${t.id}`);
                  },
                }))),
      ]),
    [visible, role],
  );

  const name = role === "owner" ? workspace.owner : workspace.staff;
  const title = current.id === "today" ? `Good morning, ${name.split(" ")[0]}` : current.label;
  const blurb = current.id === "today" ? "Tuesday 13 October" : current.blurb;

  function body() {
    if (current.id === "today") {
      return role === "staff" ? <MyDay bookings={bookings} setStatus={setStatus} /> : <Today go={go} openForm={openForm} bookings={bookings} claimsLeft={claimsLeft} caps={caps} />;
    }
    if (current.id === "files") return <Files mobile={mobile} extra={uploads} onUpload={() => openForm("files/upload")} onNewFolder={() => openForm("files/folder")} />;
    if (!activeTab) return null;
    switch (activeTab.view) {
      case "calendar":
        return mobile ? (
          <Agenda bookings={bookings} setStatus={setStatus} onlyResource={role === "staff" ? "kevin" : undefined} />
        ) : (
          <CalendarDay bookings={bookings} setStatus={setStatus} onlyResource={role === "staff" ? "kevin" : undefined} onNew={() => openForm("bookings/list")} />
        );
      case "to-confirm":
        return <ToConfirm claimsLeft={claimsLeft} decide={(id) => setDecided((d) => [...d, id])} />;
      case "pages":
        return <Pages key={extraPages.length} extra={extraPages} onAdd={() => openForm("website/pages")} />;
      case "appearance":
        return <Appearance />;
      case "report":
        return <ReportView id={activeTab.id} />;
      case "theme":
        return <ThemeSettings mode={mode} accent={accent} setMode={setMode} setAccent={setAccent} reset={resetTheme} />;
      case "workspace":
        return <WorkspaceSettings caps={caps} toggle={(c) => setCaps((v) => ({ ...v, [c]: !v[c] }))} />;
    }
    if (activeTab.table) {
      const key = `${current.id}/${activeTab.id}`;
      const added = ops[key];
      const def = added ? { ...activeTab.table, rows: added.reduce((rows, op) => op(rows), activeTab.table.rows) } : activeTab.table;
      const open = detail && detail.key === key ? def.rows.find((r) => r[0] === detail.id) : undefined;
      if (open && def.detail) {
        const booking = key === "bookings/list" ? bookings.find((b) => b.ref === open[0]) : undefined;
        return (
          <RecordView
            key={`${key}/${open[0]}`}
            backLabel={activeTab.label}
            cols={def.cols}
            row={open}
            pills={def.pills}
            statusOptions={def.filters}
            detail={def.detail}
            onBack={() => setDetail(null)}
            onSave={(next) => {
              replaceRow(key, open[0], next);
              setDetail(null);
              flash(`${next[0]} saved.`);
            }}
            onAction={(a) => {
              if (a.form) openForm(a.form);
              if (a.set) {
                const next = [...open];
                next[a.set[0]] = a.set[1];
                replaceRow(key, open[0], next);
                flash(a.done ?? "Updated.");
              }
            }}
          >
            {booking ? (
              <>
                <p className="s-label">{booking.ref}</p>
                <h2>{booking.customer}</h2>
                <BookingFacts b={booking} />
                <BookingActions b={booking} setStatus={setStatus} />
              </>
            ) : undefined}
          </RecordView>
        );
      }
      return (
        <DataTable
          key={key}
          def={def}
          query={mobile ? query : undefined}
          onOpen={def.detail ? (row) => setDetail({ key, id: row[0] }) : undefined}
          onAction={forms[key] ? () => openForm(key) : undefined}
        />
      );
    }
    if (activeTab.setup) return <SetupList def={activeTab.setup} />;
    return null;
  }

  function railItem(s: SectionDef) {
    const Icon = icons[s.id];
    const badge = role === "owner" ? badges[s.id] : s.id === "bookings" ? bookings.filter((b) => b.resource === "kevin" && b.status === "Pending").length : 0;
    return (
      <button key={s.id} type="button" className="s-nav" aria-current={current.id === s.id ? "page" : undefined} onClick={() => go(s.id)}>
        <Icon size={18} aria-hidden="true" />
        <span>{role === "staff" && s.id === "today" ? "My day" : role === "staff" && s.id === "bookings" ? "My bookings" : s.label}</span>
        {badge ? <b>{badge}</b> : null}
      </button>
    );
  }

  const formDef = formKey ? forms[formKey] : null;
  const layer = (
    <>
      {formDef && formKey && <FormPanel key={formKey} def={formDef} mobile={mobile} ctx={{ bookings, folders: folderNames }} close={() => setFormKey(null)} submit={submitForm} />}
      <Toast message={toast} />
    </>
  );

  if (mobile) {
    const staffBadges = { bookings: bookings.filter((b) => b.resource === "kevin" && b.status === "Pending").length };
    // The round button in the header opens the form for what this screen lists.
    const tabKey = activeTab ? `${current.id}/${activeTab.id}` : "";
    const actionKey =
      current.id === "files"
        ? "files/upload"
        : activeTab?.view === "calendar"
          ? role === "owner"
            ? "bookings/list"
            : undefined
          : activeTab?.view === "pages"
            ? "website/pages"
            : activeTab?.table?.action && activeTab.table.action !== "Export" && forms[tabKey]
              ? tabKey
              : undefined;
    const action = actionKey ? forms[actionKey].title : undefined;
    return (
      <MobileShell
        workspace={workspace.name}
        name={name}
        title={title}
        kicker={current.id === "today" ? blurb : workspace.name}
        current={current}
        visible={visible}
        tabs={detail ? [] : tabs}
        query={query}
        setQuery={setQuery}
        listName={activeTab?.table && !detail ? activeTab.label : undefined}
        activeTab={activeTab}
        tabBadges={current.id === "payments" ? { confirm: claimsLeft.length } : {}}
        action={detail ? undefined : action}
        onAction={actionKey ? () => openForm(actionKey) : undefined}
        overlay={layer}
        icons={icons}
        badges={role === "owner" ? badges : staffBadges}
        siteUrl={caps.website ? workspace.site : undefined}
        siteHref={workspace.sitePath}
        brief={brief ?? undefined}
        commands={commands}
        role={role}
        dark={dark}
        themeStyle={themeStyle}
        go={go}
        setTab={pickTab}
        setRole={setRole}
        setDark={setDark}
      >
        {body()}
      </MobileShell>
    );
  }

  return (
    <div className="studio" data-theme={dark ? "dark" : "light"} style={themeStyle}>
      <aside className="s-rail">
        <div className="s-ws">
          <span className="s-ws-mark">{workspace.initials}</span>
          <span>
            <strong>{workspace.name}</strong>
            <small>{workspace.place}</small>
          </span>
        </div>

        <button type="button" className="s-jump" onClick={() => setPalette(true)}>
          <Search size={15} aria-hidden="true" />
          <span>Search or jump to</span>
          <kbd>⌘K</kbd>
        </button>

        <nav aria-label="Studio">
          {railGroups.map((group) => {
            const items = group.map((id) => visible.find((s) => s.id === id)).filter((s): s is SectionDef => Boolean(s));
            return items.length ? (
              <div key={group.join()} className="s-nav-group">
                {items.map(railItem)}
              </div>
            ) : null;
          })}
        </nav>

        <div className="s-rail-foot">
          {role === "owner" && railItem(sections.find((s) => s.id === "settings")!)}
          <div className="s-viewas">
            <span className="s-label">Viewing as</span>
            <div className="s-seg" role="group" aria-label="Viewing as">
              <button type="button" aria-pressed={role === "owner"} onClick={() => setRole("owner")}>
                Owner
              </button>
              <button
                type="button"
                aria-pressed={role === "staff"}
                onClick={() => {
                  setRole("staff");
                  go("today");
                }}
              >
                Barber
              </button>
            </div>
          </div>
          <div className="s-me">
            <span className="s-avatar">{name[0]}</span>
            <span>
              <strong>{name}</strong>
              <small>{role === "owner" ? "Owner" : "Barber, own bookings only"}</small>
            </span>
            <button type="button" className="s-icon-btn" onClick={() => setDark(!dark)} aria-label={dark ? "Use the light theme" : "Use the dark theme"}>
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </aside>

      <main className="s-main">
        <header className="s-head">
          <div className="s-head-row">
            <div>
              <h1>{title}</h1>
              <p>{blurb}</p>
            </div>
            {caps.website && (
              <a className="s-btn s-site" href={workspace.sitePath} target="_blank" rel="noopener noreferrer">
                View site
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            )}
          </div>
          {tabs.length > 0 && (
            <div className="s-tabs" role="tablist" aria-label={current.label}>
              {tabs.map((t) => (
                <button key={t.id} type="button" role="tab" aria-selected={activeTab?.id === t.id} onClick={() => pickTab(t.id)}>
                  {t.label}
                  {current.id === "payments" && t.id === "confirm" && claimsLeft.length > 0 && <b>{claimsLeft.length}</b>}
                </button>
              ))}
            </div>
          )}
        </header>
        <div className="s-body">{body()}</div>
      </main>

      <Assistant key={brief ?? "none"} brief={brief ?? undefined} section={current.id} sectionLabel={current.id === "today" ? "Today" : current.label} />
      {palette && <CommandPalette commands={commands} close={() => setPalette(false)} />}
      {layer}
    </div>
  );
}
