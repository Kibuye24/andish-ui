"use client";

import { Fragment, useMemo, useState } from "react";
import { ArrowRight, Check, ChevronDown, ChevronLeft, ChevronRight, Monitor, Plus, Search, Smartphone, TrendingDown, TrendingUp, X } from "lucide-react";
import {
  capabilities,
  pages,
  pillTone,
  reports,
  resources,
  workspace,
  type Booking,
  type BookingStatus,
  type Capability,
  type Claim,
  type Role,
  type SectionId,
  type SetupDef,
  type TableDef,
} from "@/lib/studio-data";

import Icon3D, { type Icon3DName } from "./Icon3D";
import Sheet from "./Sheet";

export type Go = (section: SectionId, tab?: string) => void;

const NOW = "11:20";
const DAY_START = 9 * 60;
const DAY_END = 18 * 60;
const HOUR_PX = 64;

const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
const endTime = (b: Booking) => {
  const m = toMin(b.start) + b.mins;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};
const kes = (n: number) => `KES ${n.toLocaleString("en-KE")}`;
const who = (id: string) => resources.find((r) => r.id === id)?.name ?? "";

export function Pill({ value }: { value: string }) {
  return <span className={`s-pill is-${pillTone(value)}`}>{value}</span>;
}

/* ───────── Today ───────── */

export function Today({
  go,
  openForm,
  bookings,
  claimsLeft,
  caps,
}: {
  go: Go;
  openForm: (key: string) => void;
  bookings: Booking[];
  claimsLeft: Claim[];
  caps: Record<Capability, boolean>;
}) {
  const pending = bookings.filter((b) => b.status === "Pending").length;
  const claimed = claimsLeft.reduce((sum, c) => sum + c.amount, 0);

  const needs = [
    caps.payments && claimsLeft.length > 0 && { text: `${claimsLeft.length} payment${claimsLeft.length === 1 ? "" : "s"} to confirm`, detail: `${kes(claimed)} that customers say they have paid`, to: ["payments", "confirm"] as const, cta: "Check them" },
    caps.bookings && pending > 0 && { text: `${pending} booking request${pending === 1 ? "" : "s"} to answer`, detail: "Accept or decline so the customer knows", to: ["bookings", "list"] as const, cta: "Answer" },
    caps.store && { text: "3 orders to pack", detail: "The oldest was placed yesterday", to: ["store", "orders"] as const, cta: "See orders" },
    caps.store && { text: "Beard oil 30 ml is running low", detail: "3 left to sell", to: ["store", "inventory"] as const, cta: "Check stock" },
    { text: "2 new messages from your website", detail: "One asks about a wedding party booking", to: ["customers", "messages"] as const, cta: "Read" },
    caps.website && { text: "Your website has changes that are not live", detail: "Home and Shop were edited", to: ["website", "pages"] as const, cta: "Review" },
  ].filter((n) => n !== false);

  const next = bookings
    .filter((b) => toMin(b.start) >= toMin(NOW) && b.status !== "Cancelled")
    .sort((a, b) => toMin(a.start) - toMin(b.start))
    .slice(0, 6);

  const quick: [label: string, form: string, icon: Icon3DName][] = [
    ["New booking", "bookings/list", "booking"],
    ["New order", "store/orders", "order"],
    ["Add a product", "store/products", "product"],
    ["Write an article", "website/articles", "article"],
    ["Upload files", "files/upload", "upload"],
  ];

  const stats = [
    caps.bookings && { label: "Bookings", value: String(bookings.filter((b) => b.status !== "Cancelled").length), up: true, note: "2 more than last Tuesday" },
    caps.store && { label: "Sales", value: "KES 6,400", up: false, note: "5% less than last Tuesday" },
    caps.payments && { label: "Received", value: "KES 5,700", up: true, note: "12% more than last Tuesday" },
    caps.website && { label: "Website visitors", value: "312", up: true, note: "19% more than last Tuesday" },
  ].filter((s) => s !== false);

  return (
    <div className="s-today">
      <section className="s-card s-needs">
        <h2>Needs you</h2>
        {needs.length === 0 ? (
          <p className="s-empty">Nothing is waiting on you.</p>
        ) : (
          <ul>
            {needs.map((n) => (
              <li key={n.text}>
                <button type="button" onClick={() => go(n.to[0], n.to[1])}>
                  <span className="s-dot" aria-hidden="true" />
                  <span className="s-needs-text">
                    <strong>{n.text}</strong>
                    <small>{n.detail}</small>
                  </span>
                  <span className="s-needs-cta">
                    {n.cta}
                    <ChevronRight size={15} aria-hidden="true" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {caps.bookings && (
        <section className="s-card s-next">
          <header>
            <h2>Coming up</h2>
            <button type="button" className="s-link" onClick={() => go("bookings", "calendar")}>
              Open calendar
            </button>
          </header>
          <ol>
            {next.map((b) => (
              <li key={b.id}>
                <time>{b.start}</time>
                <span>
                  <strong>{b.customer}</strong>
                  <small>
                    {b.service} with {who(b.resource)}
                  </small>
                </span>
                {b.status === "Pending" && <Pill value="Pending" />}
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="s-quick" aria-label="Quick actions">
        {quick
          .filter(([, form]) => caps[form.split("/")[0] as Capability] !== false)
          .map(([label, form, icon]) => (
            <button key={label} type="button" onClick={() => openForm(form)}>
              <Icon3D name={icon} />
              <span>{label}</span>
            </button>
          ))}
      </section>

      {stats.length > 0 && (
        <section className="s-card s-stats" aria-label="Today so far">
          <header>
            <h2>Today so far</h2>
            <button type="button" className="s-btn is-small" onClick={() => go("reports", "overview")}>
              Open reports
              <ArrowRight size={14} aria-hidden="true" />
            </button>
          </header>
          <dl>
            {stats.map((st) => (
              <div key={st.label}>
                <dt>{st.label}</dt>
                <dd>{st.value}</dd>
                <small className={`s-delta ${st.up ? "is-up" : "is-down"}`}>
                  {st.up ? <TrendingUp size={14} aria-hidden="true" /> : <TrendingDown size={14} aria-hidden="true" />}
                  {st.note}
                </small>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}

/* ───────── A barber's own day ───────── */

export function MyDay({ bookings, setStatus }: { bookings: Booking[]; setStatus: (id: string, s: BookingStatus) => void }) {
  const mine = bookings.filter((b) => b.resource === "kevin").sort((a, b) => toMin(a.start) - toMin(b.start));
  const upcoming = mine.find((b) => toMin(b.start) >= toMin(NOW) && b.status !== "Cancelled");

  return (
    <div className="s-myday">
      {upcoming && (
        <section className="s-card s-upnext">
          <p className="s-label">Your next customer</p>
          <h2>
            {upcoming.customer}, {upcoming.start}
          </h2>
          <p>
            {upcoming.service}, {upcoming.mins} minutes. {upcoming.payment}.
          </p>
          {upcoming.note && <p className="s-note">{upcoming.note}</p>}
        </section>
      )}
      <section className="s-card">
        <h2>My appointments today</h2>
        <ul className="s-appts">
          {mine.map((b) => (
            <li key={b.id}>
              <time>
                {b.start}
                <small>to {endTime(b)}</small>
              </time>
              <span>
                <strong>{b.customer}</strong>
                <small>{b.service}</small>
              </span>
              <Pill value={b.status} />
              <span className="s-row-acts">
                {b.status === "Confirmed" && (
                  <>
                    <button type="button" className="s-btn is-small" onClick={() => setStatus(b.id, "Completed")}>
                      Done
                    </button>
                    <button type="button" className="s-btn is-small is-quiet" onClick={() => setStatus(b.id, "No-show")}>
                      No-show
                    </button>
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/* ───────── Calendar ───────── */

export function CalendarDay({
  bookings,
  setStatus,
  onlyResource,
  onNew,
}: {
  bookings: Booking[];
  setStatus: (id: string, s: BookingStatus) => void;
  onlyResource?: string;
  onNew?: () => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const cols = onlyResource ? resources.filter((r) => r.id === onlyResource) : resources;
  const open = bookings.find((b) => b.id === openId) ?? null;
  const hours = Array.from({ length: (DAY_END - DAY_START) / 60 }, (_, i) => 9 + i);
  const nowTop = ((toMin(NOW) - DAY_START) / 60) * HOUR_PX;

  return (
    <div className={`s-cal-wrap ${open ? "has-detail" : ""}`}>
      <div className="s-cal-main">
        <div className="s-toolbar">
          <div className="s-stepper">
            <button type="button" aria-label="Previous day">
              <ChevronLeft size={16} />
            </button>
            <button type="button" className="is-label">
              Today
            </button>
            <button type="button" aria-label="Next day">
              <ChevronRight size={16} />
            </button>
          </div>
          <strong className="s-cal-date">Tuesday 13 October</strong>
          <div className="s-seg" role="group" aria-label="Calendar range">
            <button type="button" aria-pressed="true">
              Day
            </button>
            <button type="button" aria-pressed="false">
              Week
            </button>
          </div>
          {!onlyResource && (
            <button type="button" className="s-btn is-primary" onClick={onNew}>
              <Plus size={15} aria-hidden="true" />
              New booking
            </button>
          )}
        </div>

        <div className="s-cal-scroll">
          <div className="s-cal" style={{ gridTemplateColumns: `52px repeat(${cols.length}, minmax(170px, 1fr))` }}>
            <div className="s-cal-corner" />
            {cols.map((r) => (
              <div key={r.id} className="s-cal-head">
                <span className="s-avatar">{r.name[0]}</span>
                {r.name}
                <small>{bookings.filter((b) => b.resource === r.id && b.status !== "Cancelled").length} today</small>
              </div>
            ))}

            <div className="s-cal-times" style={{ height: hours.length * HOUR_PX }}>
              {hours.map((h) => (
                <span key={h} style={{ top: (h - 9) * HOUR_PX }}>
                  {String(h).padStart(2, "0")}:00
                </span>
              ))}
            </div>
            {cols.map((r) => (
              <div key={r.id} className="s-cal-col" style={{ height: hours.length * HOUR_PX }}>
                <span className="s-cal-now" style={{ top: nowTop }} aria-hidden="true" />
                {bookings
                  .filter((b) => b.resource === r.id)
                  .map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      className={`s-slot is-${b.status.toLowerCase()} ${openId === b.id ? "is-open" : ""}`}
                      style={{ top: ((toMin(b.start) - DAY_START) / 60) * HOUR_PX, height: (b.mins / 60) * HOUR_PX - 3 }}
                      onClick={() => setOpenId(b.id)}
                    >
                      <strong>{b.customer}</strong>
                      {b.mins >= 45 && (
                        <small>
                          {b.start}, {b.service}
                        </small>
                      )}
                    </button>
                  ))}
              </div>
            ))}
          </div>
        </div>
        <p className="s-legend">
          <span className="is-confirmed">Confirmed</span>
          <span className="is-pending">Waiting for your answer</span>
          <span className="is-completed">Completed</span>
          <span className="is-no-show">No-show</span>
        </p>
      </div>

      {open && (
        <aside className="s-detail" aria-label="Booking details">
          <header>
            <div>
              <p className="s-label">{open.ref}</p>
              <h2>{open.customer}</h2>
            </div>
            <button type="button" className="s-icon-btn" onClick={() => setOpenId(null)} aria-label="Close details">
              <X size={16} />
            </button>
          </header>
          <BookingFacts b={open} />
          <BookingActions b={open} setStatus={setStatus} />
        </aside>
      )}
    </div>
  );
}

/* ───────── Booking details, shared by the desktop panel and the mobile drawer ───────── */

export function BookingFacts({ b }: { b: Booking }) {
  const rows: [string, string][] = [
    ["When", `Today, ${b.start} to ${endTime(b)}`],
    ["Service", `${b.service}, ${kes(b.price)}`],
    ["With", who(b.resource)],
    ["Phone", b.phone],
    ["Payment", b.payment],
  ];
  if (b.note) rows.push(["Note", b.note]);
  return (
    <>
      <Pill value={b.status} />
      <dl className="s-facts">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}

export function BookingActions({ b, setStatus }: { b: Booking; setStatus: (id: string, s: BookingStatus) => void }) {
  return (
    <div className="s-detail-acts">
      {b.status === "Pending" && (
        <>
          <button type="button" className="s-btn is-primary" onClick={() => setStatus(b.id, "Confirmed")}>
            Accept
          </button>
          <button type="button" className="s-btn" onClick={() => setStatus(b.id, "Cancelled")}>
            Decline
          </button>
        </>
      )}
      {b.status === "Confirmed" && (
        <>
          <button type="button" className="s-btn is-primary" onClick={() => setStatus(b.id, "Completed")}>
            Mark completed
          </button>
          <button type="button" className="s-btn">
            Reschedule
          </button>
          <button type="button" className="s-btn" onClick={() => setStatus(b.id, "No-show")}>
            No-show
          </button>
          <button type="button" className="s-btn is-danger" onClick={() => setStatus(b.id, "Cancelled")}>
            Cancel booking
          </button>
        </>
      )}
      {(b.status === "Completed" || b.status === "No-show" || b.status === "Cancelled") && (
        <button type="button" className="s-btn">
          Book again
        </button>
      )}
    </div>
  );
}

/* ───────── Mobile calendar: a day agenda with a week strip ───────── */

const week: [string, number][] = [["Mon", 12], ["Tue", 13], ["Wed", 14], ["Thu", 15], ["Fri", 16], ["Sat", 17], ["Sun", 18]];
const TODAY = 13;

export function Agenda({
  bookings,
  setStatus,
  onlyResource,
}: {
  bookings: Booking[];
  setStatus: (id: string, s: BookingStatus) => void;
  onlyResource?: string;
}) {
  const [day, setDay] = useState(TODAY);
  const [picked, setPicked] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const resource = onlyResource ?? picked;
  const open = bookings.find((b) => b.id === openId) ?? null;
  const list = day === TODAY ? bookings.filter((b) => !resource || b.resource === resource).sort((a, b) => toMin(a.start) - toMin(b.start)) : [];
  const nowAt = list.findIndex((b) => toMin(b.start) >= toMin(NOW));

  return (
    <div className="m-agenda">
      <div className="m-week" role="group" aria-label="Day">
        {week.map(([name, n]) => (
          <button key={n} type="button" aria-pressed={day === n} className={n === TODAY ? "is-today" : undefined} onClick={() => setDay(n)}>
            <small>{name}</small>
            <strong>{n}</strong>
          </button>
        ))}
      </div>

      {!onlyResource && (
        <FilterRow
          label="Show bookings for"
          groups={[{ label: "Barber", options: resources.map((r) => r.name) }]}
          chips
          values={{ Barber: picked ? who(picked) : null }}
          onChange={(_, v) => setPicked(resources.find((r) => r.name === v)?.id ?? null)}
        />
      )}

      {list.length === 0 ? (
        <p className="s-empty">Nothing is booked on this day.</p>
      ) : (
        <ol className="m-slots">
          {list.map((b, i) => (
            <Fragment key={b.id}>
              {i === nowAt && (
                <li className="m-now" aria-label={`The time is ${NOW}`}>
                  <span>Now, {NOW}</span>
                </li>
              )}
              <li>
                <button type="button" className={`m-slot is-${b.status.toLowerCase()}`} onClick={() => setOpenId(b.id)}>
                  <time>
                    {b.start}
                    <small>{endTime(b)}</small>
                  </time>
                  <span>
                    <strong>{b.customer}</strong>
                    <small>
                      {b.service}
                      {resource ? "" : ` with ${who(b.resource)}`}
                    </small>
                  </span>
                  {b.status !== "Confirmed" && <Pill value={b.status} />}
                </button>
              </li>
            </Fragment>
          ))}
        </ol>
      )}

      {open && (
        <Sheet title={open.customer} onClose={() => setOpenId(null)}>
          <p className="s-label">{open.ref}</p>
          <BookingFacts b={open} />
          <BookingActions b={open} setStatus={setStatus} />
        </Sheet>
      )}
    </div>
  );
}

/* ───────── Generic table and setup list ───────── */

/* ───────── filters: pills when there are few options, a compact dropdown when there are many ───────── */

export type FilterGroup = { label: string; options: string[] };
const PILLS_MAX = 4;

/** One filter as a dropdown chip, the same look on a phone's tab row and in the table toolbar. */
export function FilterSelect({ group, value, onChange }: { group: FilterGroup; value: string | null; onChange: (value: string | null) => void }) {
  return (
    <label className={`s-filter-select${value ? " is-set" : ""}`}>
      <span>
        {group.label}: <strong>{value ?? "All"}</strong>
      </span>
      <ChevronDown size={14} aria-hidden="true" />
      <select aria-label={group.label} value={value ?? ""} onChange={(e) => onChange(e.target.value || null)}>
        <option value="">All</option>
        {group.options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

/** The filters a table offers, as groups for FilterRow and the phone tab row. */
export function groupsOf(def: TableDef): FilterGroup[] {
  return [...(def.filters ? [{ label: "Status", options: def.filters }] : []), ...(def.moreFilters ?? [])];
}

export function FilterRow({
  groups,
  values,
  onChange,
  label,
  chips = false,
}: {
  groups: FilterGroup[];
  values: Record<string, string | null>;
  onChange: (group: string, value: string | null) => void;
  label: string;
  /** Always dropdown chips, never pills. The phone uses this everywhere. */
  chips?: boolean;
}) {
  // Pills only make sense for one short list. Several filters, or a long list, become dropdowns.
  const asPills = (g: FilterGroup) => !chips && groups.length === 1 && g.options.length <= PILLS_MAX;
  return (
    <div className="s-chips" role="group" aria-label={label}>
      {groups.map((g) => {
        const value = values[g.label] ?? null;
        if (asPills(g)) {
          return (
            <Fragment key={g.label}>
              <button type="button" aria-pressed={value === null} onClick={() => onChange(g.label, null)}>
                All
              </button>
              {g.options.map((o) => (
                <button key={o} type="button" aria-pressed={value === o} onClick={() => onChange(g.label, o)}>
                  {o}
                </button>
              ))}
            </Fragment>
          );
        }
        return <FilterSelect key={g.label} group={g} value={value} onChange={(v) => onChange(g.label, v)} />;
      })}
    </div>
  );
}

const squash = (s: string) => s.replace(/[^a-z0-9]/g, "");

export function DataTable({
  def,
  onAction,
  onOpen,
  query: outer,
  marks = {},
  picked: pickedProp,
  onPick,
  filtersInBar = false,
}: {
  def: TableDef;
  /** Unread notices on rows, by the row's first cell. */
  marks?: Record<string, string>;
  /** Filters owned by the screen, so they can sit in the phone's tab row. */
  picked?: Record<string, string | null>;
  onPick?: (group: string, value: string | null) => void;
  /** The filters are shown elsewhere (the phone tab row), so the table skips its own row. */
  filtersInBar?: boolean;
  onAction?: () => void;
  /** Opens one row on its own page. */
  onOpen?: (row: string[]) => void;
  /** Search text owned by the screen's header. When given, the list has no search box of its own. */
  query?: string;
}) {
  const [own, setQuery] = useState("");
  const query = outer ?? own;
  const [ownPicked, setOwnPicked] = useState<Record<string, string | null>>({});
  const picked = pickedProp ?? ownPicked;
  const setPicked = (group: string, value: string | null) => (onPick ? onPick(group, value) : setOwnPicked((p) => ({ ...p, [group]: value })));
  const groups: FilterGroup[] = groupsOf(def);

  const rows = useMemo(() => {
    // Every word has to match somewhere in the row; spaces and dashes are ignored, so "mpesa" finds "M-Pesa".
    const words = query.toLowerCase().split(/\s+/).map(squash).filter(Boolean);
    return def.rows.filter((row) => {
      for (const v of Object.values(picked)) if (v && !row.includes(v)) return false;
      const text = squash(row.join(" ").toLowerCase());
      return words.every((w) => text.includes(w));
    });
  }, [def.rows, query, picked]);

  const statusCol = def.pills?.[def.pills.length - 1];

  return (
    <div className="s-table-wrap">
      <div className="s-toolbar">
        {outer === undefined && (
          <label className="s-search">
            <Search size={15} aria-hidden="true" />
            <input type="search" placeholder="Search this list" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search this list" />
          </label>
        )}
        {groups.length > 0 && !filtersInBar && <FilterRow groups={groups} values={picked} onChange={setPicked} label="Filters" />}
        {def.action && (
          <button type="button" className="s-btn is-primary s-push" onClick={onAction}>
            <Plus size={15} aria-hidden="true" />
            {def.action}
          </button>
        )}
      </div>
      {def.note && <p className="s-callout">{def.note}</p>}
      <div className="s-scroll-x">
        <table className="s-table">
          <thead>
            <tr>
              {def.cols.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={def.cols.length} className="s-empty">
                  Nothing matches. Clear the search or pick another filter.
                </td>
              </tr>
            ) : (
              rows.map((row, ri) => (
                <tr key={`${row.join("|")}:${ri}`} className={[onOpen ? "is-link" : "", marks[row[0]] ? "is-new" : ""].join(" ").trim() || undefined} onClick={onOpen ? () => onOpen(row) : undefined}>
                  {row.map((cell, i) => (
                    <td key={i} data-label={def.cols[i]} className={i === statusCol ? "is-status" : undefined}>
                      {def.pills?.includes(i) && cell ? (
                        <Pill value={cell} />
                      ) : i === 0 && onOpen ? (
                        <button type="button" className="s-rowlink" aria-label={`Open ${cell}`}>
                          {cell}
                        </button>
                      ) : (
                        cell
                      )}
                      {i === 0 && marks[row[0]] && (
                        <span className="s-rowmark">
                          <i className="s-dot" aria-hidden="true" />
                          {marks[row[0]]}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="s-count">
        {rows.length} of {def.rows.length} shown
      </p>
    </div>
  );
}

export function SetupList({ def }: { def: SetupDef }) {
  return (
    <div className="s-setup">
      {def.map((group) => (
        <section key={group.title}>
          <h2>{group.title}</h2>
          <ul className="s-card">
            {group.items.map(([title, detail, value]) => (
              <li key={title}>
                <button type="button">
                  <span>
                    <strong>{title}</strong>
                    <small>{detail}</small>
                  </span>
                  {value && <em>{value}</em>}
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/* ───────── Payments to confirm ───────── */

export function ToConfirm({ claimsLeft, decide }: { claimsLeft: Claim[]; decide: (id: string) => void }) {
  if (claimsLeft.length === 0) {
    return (
      <div className="s-card s-done">
        <Check size={22} aria-hidden="true" />
        <h2>All payments are confirmed</h2>
        <p>When a customer says they have paid by till, paybill or bank transfer, it appears here for you to check.</p>
      </div>
    );
  }
  return (
    <div className="s-claims">
      <p className="s-callout">These customers say they have paid. Check your M-Pesa or bank statement, then confirm or reject each one.</p>
      {claimsLeft.map((c) => (
        <article key={c.id} className="s-card s-claim">
          <div>
            <p className="s-label">
              {c.method}, {c.when}
            </p>
            <h2>
              {c.from} says they paid {kes(c.amount)}
            </h2>
            <p>For {c.purpose}.</p>
            <p className="s-muted">{c.detail}.</p>
          </div>
          <div className="s-claim-acts">
            <button type="button" className="s-btn is-primary" onClick={() => decide(c.id)}>
              Confirm payment
            </button>
            <button type="button" className="s-btn" onClick={() => decide(c.id)}>
              Reject
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

/* ───────── Website ───────── */

export type PageItem = (typeof pages)[number];

// Where each page starts in the example site.
const siteAnchors: Record<string, string> = { home: "top", services: "services", book: "book", shop: "shop", journal: "journal", contact: "contact" };

export function Pages({ extra = [], onAdd }: { extra?: PageItem[]; onAdd?: () => void }) {
  // The parent remounts this when a page is added, so the new page starts selected.
  const [current, setCurrent] = useState(extra.at(-1)?.id ?? pages[0].id);
  const [phone, setPhone] = useState(false);
  const [view, setView] = useState<"blocks" | "site">("blocks");
  const [live, setLive] = useState(false);
  const list = [...pages, ...extra];
  const page = list.find((p) => p.id === current) ?? list[0];
  const waiting = list.filter((p) => p.status === "Changes not published").length;
  const status = (s: string) => (live && s === "Changes not published" ? "Published" : s);

  return (
    <div className="s-pages">
      <div className={`s-publish ${live ? "is-live" : ""}`}>
        <span>{live ? "Everything is live." : `${waiting} pages have changes that are not live yet.`}</span>
        {!live && (
          <span className="s-publish-acts">
            <a className="s-btn s-site" href={workspace.sitePath} target="_blank" rel="noopener noreferrer">
              Preview the site
            </a>
            <button type="button" className="s-btn is-primary" onClick={() => setLive(true)}>
              Publish
            </button>
          </span>
        )}
      </div>

      <div className="s-pages-grid">
        <nav className="s-card s-page-list" aria-label="Pages">
          {list.map((p) => (
            <button key={p.id} type="button" aria-current={p.id === current} onClick={() => setCurrent(p.id)}>
              <span>
                <strong>{p.name}</strong>
                <small>{p.path}</small>
              </span>
              <Pill value={status(p.status)} />
            </button>
          ))}
          <button type="button" className="s-page-add" onClick={onAdd}>
            <Plus size={15} aria-hidden="true" />
            Add a page
          </button>
        </nav>

        <div className="s-preview">
          <div className="s-preview-bar">
            <span className="s-url">fadehouse.example{page.path}</span>
            <div className="s-seg" role="group" aria-label="Preview mode">
              <button type="button" aria-pressed={view === "blocks"} onClick={() => setView("blocks")}>
                Blocks
              </button>
              <button type="button" aria-pressed={view === "site"} onClick={() => setView("site")}>
                Live site
              </button>
            </div>
            <div className="s-seg" role="group" aria-label="Preview size">
              <button type="button" aria-pressed={!phone} onClick={() => setPhone(false)} aria-label="Computer">
                <Monitor size={15} />
              </button>
              <button type="button" aria-pressed={phone} onClick={() => setPhone(true)} aria-label="Phone">
                <Smartphone size={15} />
              </button>
            </div>
          </div>
          {view === "site" ? (
            <div className={`s-site-wrap ${phone ? "is-phone" : ""}`}>
              <iframe className="s-site-frame" src={`${workspace.sitePath}#${siteAnchors[page.id] ?? "top"}`} title="Your site, live preview" loading="lazy" />
            </div>
          ) : (
            <div className={`s-canvas ${phone ? "is-phone" : ""}`}>
              {page.sections.map((s, i) => (
                <button key={s} type="button" className={`s-block is-${i === 0 ? "header" : i === page.sections.length - 1 ? "footer" : "body"}`}>
                  <span>{s}</span>
                  <em>Edit</em>
                </button>
              ))}
            </div>
          )}
          <label className="s-ask">
            <span>Ask for a change to this page</span>
            <input type="text" placeholder="Make the opening hours banner bigger" />
          </label>
        </div>
      </div>
    </div>
  );
}

// Template and theme names are placeholders for the prototype.
const themes = [
  { name: "Charcoal", swatch: ["#1c1c1f", "#f4f1ea", "#c8a25a"] },
  { name: "Chalk", swatch: ["#f7f7f5", "#1d1d1b", "#2f6f5e"] },
  { name: "Clay", swatch: ["#efe4d8", "#2a1c14", "#b4502f"] },
  { name: "Night blue", swatch: ["#0f1b2d", "#eef3fa", "#5ea0ff"] },
  { name: "Mint", swatch: ["#e9f5ef", "#143026", "#1f9d6a"] },
];
const templates = ["Barber and salon", "Shop front", "Studio", "Clinic", "Restaurant", "Newsroom"];

export function Appearance() {
  const [theme, setTheme] = useState(themes[0].name);
  const [template, setTemplate] = useState(templates[0]);
  return (
    <div className="s-setup">
      <section>
        <h2>Theme</h2>
        <p className="s-muted">Changing the theme recolours the whole site at once and uses no AI credits.</p>
        <div className="s-swatches" role="group" aria-label="Theme">
          {themes.map((t) => (
            <button key={t.name} type="button" aria-pressed={theme === t.name} onClick={() => setTheme(t.name)}>
              <span className="s-swatch">
                {t.swatch.map((c) => (
                  <i key={c} style={{ background: c }} />
                ))}
              </span>
              {t.name}
            </button>
          ))}
        </div>
      </section>
      <section>
        <h2>Template</h2>
        <p className="s-muted">Switching template rebuilds your pages with the AI builder, keeping your content. 15 templates are available.</p>
        <div className="s-templates" role="group" aria-label="Template">
          {templates.map((t) => (
            <button key={t} type="button" aria-pressed={template === t} onClick={() => setTemplate(t)}>
              <span className="s-thumb" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <strong>{t}</strong>
              <small>{template === t ? "In use" : "Switch to this"}</small>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ───────── Reports ───────── */

export function ReportView({ id }: { id: string }) {
  const r = reports[id] ?? reports.overview;
  return (
    <div className="s-report">
      <div className="s-toolbar">
        <div className="s-seg" role="group" aria-label="Period">
          <button type="button" aria-pressed="false">
            Today
          </button>
          <button type="button" aria-pressed="true">
            Last 7 days
          </button>
          <button type="button" aria-pressed="false">
            Last 30 days
          </button>
        </div>
        <span className="s-muted">Compared with the 7 days before</span>
      </div>
      <dl className="s-tiles">
        {r.tiles.map(([label, value, change]) => (
          <div key={label} className="s-card">
            <dt>{label}</dt>
            <dd>{value}</dd>
            <small>{change}</small>
          </div>
        ))}
      </dl>
      <div className="s-lists">
        {r.lists.map((list) => (
          <section key={list.title} className="s-card">
            <h2>{list.title}</h2>
            <ol>
              {list.rows.map(([name, value]) => (
                <li key={name}>
                  <span>{name}</span>
                  <strong>{value}</strong>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}

/* ───────── Workspace settings ───────── */

export function WorkspaceSettings({ caps, toggle, viewAs }: { caps: Record<Capability, boolean>; toggle: (c: Capability) => void; viewAs: (r: Role) => void }) {
  return (
    <div className="s-setup">
      <section>
        <h2>Preview the studio as</h2>
        <p className="s-muted">See exactly what someone on your team sees. You can come back from the menu under your name.</p>
        <ul className="s-card s-caps">
          <li>
            <span>
              <strong>Owner</strong>
              <small>Everything, including payments, billing and settings</small>
            </span>
            <span className="s-pill is-ok">You</span>
          </li>
          <li>
            <span>
              <strong>Barber</strong>
              <small>Kevin M. Their own day and bookings only</small>
            </span>
            <button type="button" className="s-btn" onClick={() => viewAs("staff")}>
              Preview
            </button>
          </li>
        </ul>
      </section>
      <section>
        <h2>What this workspace does</h2>
        <p className="s-muted">Switch on only what the business needs. Your menu follows these.</p>
        <ul className="s-card s-caps">
          {capabilities.map((c) => (
            <li key={c.id}>
              <span>
                <strong>{c.label}</strong>
                <small>{c.detail}</small>
              </span>
              <button type="button" role="switch" aria-checked={caps[c.id]} aria-label={c.label} className="s-switch" onClick={() => toggle(c.id)}>
                <span />
              </button>
            </li>
          ))}
        </ul>
      </section>
      <SetupList
        def={[
          {
            title: "About the business",
            items: [
              ["Name", "Shown on your site, receipts and messages", workspace.name],
              ["Time zone", "Used for bookings and reports", "Nairobi, East Africa Time"],
              ["Business verification", "Needed before you can take card payments", "Verified"],
            ],
          },
        ]}
      />
    </div>
  );
}
