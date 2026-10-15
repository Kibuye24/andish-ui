"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ExternalLink, LogOut, Moon, Settings, Sun, Undo2 } from "lucide-react";
import type { Role } from "@/lib/studio-data";

/**
 * The signed-in person, as a pill. It opens a short menu: settings, the
 * theme, and the way back when the owner is previewing someone else's view.
 */
export default function UserMenu({
  name,
  role,
  dark,
  setDark,
  openSettings,
  backToOwner,
  siteHref,
  compact = false,
}: {
  name: string;
  role: Role;
  dark: boolean;
  setDark: (d: boolean) => void;
  openSettings?: () => void;
  backToOwner: () => void;
  /** Shown in the menu on a phone, where the header has no room for it. */
  siteHref?: string;
  /** Just the avatar, for the phone header. */
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const roleLabel = role === "owner" ? "Owner" : "Barber";

  useEffect(() => {
    if (!open) return;
    function away(e: PointerEvent) {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("pointerdown", away);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", away);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (run: () => void) => () => {
    setOpen(false);
    run();
  };

  return (
    <div className={`s-user${compact ? " is-compact" : ""}`} ref={box}>
      <button type="button" className="s-user-pill" aria-haspopup="menu" aria-expanded={open} aria-label={compact ? `${name}, ${roleLabel}` : undefined} onClick={() => setOpen(!open)}>
        <span className="s-avatar">{name[0]}</span>
        {!compact && (
          <>
            <span className="s-user-name">
              <strong>{name}</strong>
              <small>{roleLabel}</small>
            </span>
            <ChevronDown size={14} aria-hidden="true" />
          </>
        )}
        {role === "staff" && <i className="s-user-flag" aria-hidden="true" />}
      </button>

      {open && (
        <div className="s-user-menu" role="menu">
          <div className="s-user-head">
            <span className="s-avatar">{name[0]}</span>
            <span>
              <strong>{name}</strong>
              <small>{role === "owner" ? "Owner of Fade House" : "Previewing as a barber"}</small>
            </span>
          </div>
          {role === "staff" && (
            <button type="button" role="menuitem" className="is-accent" onClick={pick(backToOwner)}>
              <Undo2 size={16} aria-hidden="true" />
              Back to the owner view
            </button>
          )}
          {openSettings && (
            <button type="button" role="menuitem" onClick={pick(openSettings)}>
              <Settings size={16} aria-hidden="true" />
              Settings
            </button>
          )}
          {siteHref && (
            <a role="menuitem" href={siteHref} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
              <ExternalLink size={16} aria-hidden="true" />
              View site
            </a>
          )}
          <button type="button" role="menuitemcheckbox" aria-checked={dark} onClick={() => setDark(!dark)}>
            {dark ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
            {dark ? "Light theme" : "Dark theme"}
          </button>
          <button type="button" role="menuitem" className="is-quiet" onClick={() => setOpen(false)}>
            <LogOut size={16} aria-hidden="true" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
