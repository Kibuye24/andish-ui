"use client";

import { useState } from "react";
import { ChevronRight, Inbox, type LucideIcon } from "lucide-react";
import type { Notice, SectionId } from "@/lib/studio-data";

/**
 * Notifications, grouped by where they came from. The cards on top are the
 * sources, each with its unread count, and double as the filter for the list.
 */
export default function Notifications({
  items,
  read,
  markRead,
  open,
  icons,
  labels,
}: {
  items: Notice[];
  read: string[];
  markRead: (ids: string[]) => void;
  open: (n: Notice) => void;
  icons: Record<SectionId, LucideIcon>;
  labels: Partial<Record<SectionId, string>>;
}) {
  const [source, setSource] = useState<SectionId | "all">("all");
  const sources = Array.from(new Set(items.map((n) => n.source)));
  const unread = (list: Notice[]) => list.filter((n) => !read.includes(n.id)).length;
  const shown = source === "all" ? items : items.filter((n) => n.source === source);

  return (
    <div className="s-notices">
      <div className="s-sources" role="group" aria-label="Where notifications come from">
        <button type="button" className="s-source" aria-pressed={source === "all"} onClick={() => setSource("all")}>
          <span className="s-source-icon">
            <Inbox size={18} aria-hidden="true" />
          </span>
          <strong>Everything</strong>
          <small>{unread(items) ? `${unread(items)} new` : "All read"}</small>
        </button>
        {sources.map((id) => {
          const Icon = icons[id];
          const list = items.filter((n) => n.source === id);
          const fresh = unread(list);
          return (
            <button key={id} type="button" className="s-source" aria-pressed={source === id} onClick={() => setSource(source === id ? "all" : id)}>
              <span className="s-source-icon">
                <Icon size={18} aria-hidden="true" />
                {fresh ? <b>{fresh}</b> : null}
              </span>
              <strong>{labels[id] ?? id}</strong>
              <small>{fresh ? `${fresh} new of ${list.length}` : `${list.length} read`}</small>
            </button>
          );
        })}
      </div>

      <div className="s-notices-bar">
        <p className="s-label">{source === "all" ? "Latest" : `From ${labels[source] ?? source}`}</p>
        {unread(shown) > 0 && (
          <button type="button" className="s-link" onClick={() => markRead(shown.map((n) => n.id))}>
            Mark {source === "all" ? "all" : "these"} as read
          </button>
        )}
      </div>

      <ul className="s-notice-list">
        {shown.map((n) => {
          const Icon = icons[n.source];
          const fresh = !read.includes(n.id);
          return (
            <li key={n.id}>
              <button type="button" className={`s-notice${fresh ? " is-new" : ""}`} onClick={() => open(n)}>
                <span className="s-source-icon is-small">
                  <Icon size={16} aria-hidden="true" />
                </span>
                <span className="s-notice-text">
                  <small>
                    {labels[n.source] ?? n.source} · {n.when}
                  </small>
                  <strong>{n.title}</strong>
                  <span>{n.detail}</span>
                </span>
                {fresh && <i className="s-dot" aria-label="Unread" />}
                <ChevronRight size={16} aria-hidden="true" className="s-notice-go" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
