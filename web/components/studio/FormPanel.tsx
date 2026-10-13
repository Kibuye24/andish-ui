"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Check, ChevronDown, Upload, X } from "lucide-react";
import { sizeLabel, type Field, type FormCtx, type FormDef, type Value, type Values } from "@/lib/studio-forms";
import Sheet from "./Sheet";

type Named = Extract<Field, { name: string }>;

const optionsOf = (f: Extract<Named, { kind: "select" }>, ctx: FormCtx) => (typeof f.options === "function" ? f.options(ctx) : f.options);

function startValues(def: FormDef, ctx: FormCtx): Values {
  const v: Values = {};
  for (const f of def.fields) {
    if (!("name" in f)) continue;
    if (f.kind === "toggle") v[f.name] = false;
    else if (f.kind === "multi" || f.kind === "file") v[f.name] = [];
    else if (f.kind === "pills") v[f.name] = f.options[0];
    else if (f.kind === "select") v[f.name] = optionsOf(f, ctx)[0] ?? "";
    else v[f.name] = "";
  }
  return { ...v, ...def.initial };
}

const isEmpty = (v: Value | undefined) => (Array.isArray(v) ? v.length === 0 : typeof v === "string" ? v.trim() === "" : false);

/** A confirmation that appears briefly after a form is saved. */
export function Toast({ message }: { message: string | null }) {
  return (
    <div className="s-toast-layer" role="status" aria-live="polite">
      {message && (
        <p className="s-toast">
          <Check size={16} aria-hidden="true" />
          {message}
        </p>
      )}
    </div>
  );
}

export default function FormPanel({
  def,
  mobile,
  ctx,
  close,
  submit,
}: {
  def: FormDef;
  mobile: boolean;
  ctx: FormCtx;
  close: () => void;
  submit: (v: Values) => void;
}) {
  const uid = useId();
  const [values, setValues] = useState<Values>(() => startValues(def, ctx));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [over, setOver] = useState<string | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const idOf = (name: string) => `${uid}-${name}`;
  const titleId = `${uid}-title`;
  const visible = (f: Field) => !f.showIf || f.showIf(values);

  // A phone would cover the form with the keyboard, so only a computer focuses the first field.
  useEffect(() => {
    if (mobile) return;
    form.current?.querySelector<HTMLElement>("input:not([type=file]), select, textarea")?.focus();
  }, [mobile]);

  useEffect(() => {
    if (mobile) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobile, close]);

  function set(name: string, value: Value) {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!(name in prev)) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  function take(f: Extract<Named, { kind: "file" }>, list: File[]) {
    set(f.name, f.multiple ? list : list.slice(0, 1));
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const found: Record<string, string> = {};
    for (const f of def.fields) {
      if (!("name" in f) || !visible(f) || !f.required) continue;
      if (isEmpty(values[f.name])) found[f.name] = f.kind === "file" ? "Choose at least one file." : `${f.label} is needed.`;
    }
    for (const [name, message] of Object.entries(def.validate?.(values, ctx) ?? {})) {
      if (!found[name]) found[name] = message;
    }
    if (Object.keys(found).length > 0) {
      setErrors(found);
      const first = def.fields.find((f) => "name" in f && found[f.name]);
      const el = first && "name" in first ? document.getElementById(idOf(first.name)) : null;
      (el?.matches("input, select, textarea, button") ? el : el?.querySelector<HTMLElement>("button"))?.focus();
      return;
    }
    submit(values);
  }

  function renderField(f: Field, i: number): ReactNode {
    if (!visible(f)) return null;
    if (f.kind === "heading") {
      return (
        <p key={i} className="s-form-heading">
          {f.label}
        </p>
      );
    }
    if (f.kind === "note") {
      return (
        <p key={i} className="s-callout s-form-note">
          {f.text}
        </p>
      );
    }

    const id = idOf(f.name);
    const err = errors[f.name];
    const hintId = f.hint ? `${id}-hint` : undefined;
    const describedBy = [hintId, err ? `${id}-err` : undefined].filter(Boolean).join(" ") || undefined;
    const value = values[f.name];
    const str = typeof value === "string" ? value : "";
    const cls = `s-field${f.half ? " is-half" : ""}${err ? " has-error" : ""}`;
    const optional = !f.required && f.kind !== "select" && f.kind !== "pills" && f.kind !== "multi" && f.kind !== "toggle";
    const foot = (
      <>
        {f.hint && (
          <small id={hintId} className="s-hint">
            {f.hint}
          </small>
        )}
        {err && (
          <small id={`${id}-err`} className="s-error">
            {err}
          </small>
        )}
      </>
    );
    const label = (group: boolean) =>
      group ? (
        <span className="s-field-label" id={`${id}-label`}>
          {f.label}
        </span>
      ) : (
        <label className="s-field-label" htmlFor={id}>
          {f.label}
          {optional && <em>optional</em>}
        </label>
      );

    switch (f.kind) {
      case "text":
      case "phone":
      case "email":
      case "number":
      case "date":
      case "time":
        return (
          <div key={i} className={cls}>
            {label(false)}
            <div className="s-input">
              {f.prefix && <span className="s-affix">{f.prefix}</span>}
              <input
                id={id}
                type={f.kind === "phone" ? "tel" : f.kind}
                inputMode={f.kind === "number" ? "numeric" : undefined}
                step={f.kind === "time" ? 300 : undefined}
                min={f.kind === "number" ? 0 : undefined}
                value={str}
                placeholder={f.placeholder}
                autoComplete="off"
                aria-invalid={Boolean(err)}
                aria-describedby={describedBy}
                onChange={(e) => set(f.name, e.target.value)}
              />
              {f.suffix && <span className="s-affix">{f.suffix}</span>}
            </div>
            {foot}
          </div>
        );
      case "money":
        return (
          <div key={i} className={cls}>
            {label(false)}
            <div className="s-input">
              <span className="s-affix">KES</span>
              <input
                id={id}
                type="text"
                inputMode="numeric"
                value={str}
                placeholder={f.placeholder}
                autoComplete="off"
                aria-invalid={Boolean(err)}
                aria-describedby={describedBy}
                onChange={(e) => set(f.name, e.target.value.replace(/[^0-9.]/g, ""))}
              />
            </div>
            {foot}
          </div>
        );
      case "textarea":
        return (
          <div key={i} className={cls}>
            {label(false)}
            <div className="s-input">
              <textarea id={id} rows={3} value={str} placeholder={f.placeholder} aria-invalid={Boolean(err)} aria-describedby={describedBy} onChange={(e) => set(f.name, e.target.value)} />
            </div>
            {foot}
          </div>
        );
      case "select":
        return (
          <div key={i} className={cls}>
            {label(false)}
            <div className="s-input s-select">
              <select id={id} value={str} aria-invalid={Boolean(err)} aria-describedby={describedBy} onChange={(e) => set(f.name, e.target.value)}>
                {optionsOf(f, ctx).map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} aria-hidden="true" />
            </div>
            {foot}
          </div>
        );
      case "pills":
        return (
          <div key={i} className={cls}>
            {label(true)}
            <div className="s-choice" id={id} role="radiogroup" aria-labelledby={`${id}-label`} aria-describedby={describedBy}>
              {f.options.map((o) => (
                <button key={o} type="button" role="radio" aria-checked={value === o} onClick={() => set(f.name, o)}>
                  {o}
                </button>
              ))}
            </div>
            {foot}
          </div>
        );
      case "multi": {
        const list = Array.isArray(value) ? (value as string[]) : [];
        return (
          <div key={i} className={cls}>
            {label(true)}
            <div className="s-choice" id={id} role="group" aria-labelledby={`${id}-label`} aria-describedby={describedBy}>
              {f.options.map((o) => (
                <button key={o} type="button" aria-pressed={list.includes(o)} onClick={() => set(f.name, list.includes(o) ? list.filter((x) => x !== o) : [...list, o])}>
                  {o}
                </button>
              ))}
            </div>
            {foot}
          </div>
        );
      }
      case "toggle":
        return (
          <div key={i} className={`${cls} is-toggle`}>
            <span>
              <strong id={`${id}-label`}>{f.label}</strong>
              {f.hint && <small className="s-hint">{f.hint}</small>}
            </span>
            <button id={id} type="button" role="switch" aria-checked={value === true} aria-labelledby={`${id}-label`} className="s-switch" onClick={() => set(f.name, value !== true)}>
              <span />
            </button>
          </div>
        );
      case "file": {
        const picked = Array.isArray(value) ? (value as File[]) : [];
        return (
          <div key={i} className={cls}>
            {label(true)}
            <label
              className={`s-drop${over === f.name ? " is-over" : ""}`}
              htmlFor={id}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(f.name);
              }}
              onDragLeave={() => setOver(null)}
              onDrop={(e) => {
                e.preventDefault();
                setOver(null);
                take(f, Array.from(e.dataTransfer.files));
              }}
            >
              <Upload size={20} aria-hidden="true" />
              <strong>{picked.length ? `${picked.length} ${picked.length === 1 ? "file" : "files"} chosen` : f.multiple ? "Choose files" : "Choose a file"}</strong>
              <small>{mobile ? "Tap to browse" : "or drop them here"}</small>
              <input id={id} type="file" className="s-sr" multiple={f.multiple} accept={f.accept} aria-describedby={describedBy} onChange={(e) => take(f, Array.from(e.target.files ?? []))} />
            </label>
            {picked.length > 0 && (
              <ul className="s-picked">
                {picked.map((file) => (
                  <li key={`${file.name}-${file.size}`}>
                    <span>{file.name}</span>
                    <small>{sizeLabel(file.size)}</small>
                  </li>
                ))}
              </ul>
            )}
            {foot}
          </div>
        );
      }
    }
  }

  const count = Object.keys(errors).length;
  const body = (
    <form ref={form} className="s-form" aria-label={def.title} noValidate onSubmit={onSubmit}>
      <div className="s-form-fields">
        {mobile && def.blurb && <p className="s-form-blurb">{def.blurb}</p>}
        {count > 0 && (
          <p className="s-form-summary" role="alert">
            Fix {count} {count === 1 ? "thing" : "things"} to continue.
          </p>
        )}
        {def.fields.map(renderField)}
      </div>
      <footer className="s-form-foot">
        <button type="button" className="s-btn" onClick={close}>
          Cancel
        </button>
        <button type="submit" className="s-btn is-primary">
          {def.submit}
        </button>
      </footer>
    </form>
  );

  if (mobile) {
    return (
      <Sheet title={def.title} tall flush onClose={close}>
        {body}
      </Sheet>
    );
  }

  return (
    <div className="s-panel-back" onClick={close}>
      <aside className="s-panel" role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(e) => e.stopPropagation()}>
        <header>
          <div>
            <h2 id={titleId}>{def.title}</h2>
            {def.blurb && <p>{def.blurb}</p>}
          </div>
          <button type="button" className="s-icon-btn" onClick={close} aria-label="Close">
            <X size={18} />
          </button>
        </header>
        {body}
      </aside>
    </div>
  );
}
