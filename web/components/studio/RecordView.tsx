"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Check, ChevronDown, ChevronLeft } from "lucide-react";
import { pillTone, type RecordDetail } from "@/lib/studio-data";
import { Pill } from "./views";

/**
 * One record on its own page. Things you maintain (a product, a service, a
 * customer) open as an edit form. Things that happened (a refund, a ledger
 * entry, a payment) open as a read-only page with their steps and actions.
 */
export default function RecordView({
  backLabel,
  cols,
  row,
  pills = [],
  statusOptions = [],
  detail,
  onBack,
  onSave,
  onAction,
  children,
}: {
  backLabel: string;
  cols: string[];
  row: string[];
  pills?: number[];
  statusOptions?: string[];
  detail: RecordDetail;
  onBack: () => void;
  onSave: (next: string[]) => void;
  onAction: (action: NonNullable<RecordDetail["actions"]>[number]) => void;
  /** Replaces the generic body, for records with their own layout. */
  children?: ReactNode;
}) {
  const [draft, setDraft] = useState(row);
  const statusCol = pills[pills.length - 1];
  const status = statusCol === undefined ? "" : row[statusCol];

  const back = (
    <button type="button" className="s-back" onClick={onBack}>
      <ChevronLeft size={16} aria-hidden="true" />
      {backLabel}
    </button>
  );

  if (children) {
    return (
      <div className="s-record">
        {back}
        <div className="s-card s-record-card">{children}</div>
      </div>
    );
  }

  if (detail.edit) {
    const submit = (e: FormEvent) => {
      e.preventDefault();
      if (draft[0].trim()) onSave(draft.map((v) => v.trim()));
    };
    return (
      <form className="s-record" onSubmit={submit}>
        {back}
        <header className="s-record-head">
          <div>
            <p className="s-label">{detail.noun}</p>
            <h2>{row[0]}</h2>
          </div>
        </header>
        <div className="s-card s-record-card s-record-form">
          {cols.map((col, i) => {
            const id = `rec-${i}`;
            const options = pills.includes(i) ? Array.from(new Set([...statusOptions, row[i]].filter(Boolean))) : null;
            return (
              <div key={col} className="s-field">
                <label className="s-field-label" htmlFor={id}>
                  {col}
                </label>
                {options ? (
                  <div className="s-input s-select">
                    <select id={id} value={draft[i]} onChange={(e) => setDraft(draft.map((v, j) => (j === i ? e.target.value : v)))}>
                      {options.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} aria-hidden="true" />
                  </div>
                ) : (
                  <div className="s-input">
                    <input id={id} type="text" value={draft[i]} autoComplete="off" onChange={(e) => setDraft(draft.map((v, j) => (j === i ? e.target.value : v)))} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="s-record-acts">
          <button type="submit" className="s-btn is-primary">
            Save changes
          </button>
          <button type="button" className="s-btn" onClick={onBack}>
            Cancel
          </button>
        </div>
      </form>
    );
  }

  // How far along the record is, read from its status.
  const steps = detail.steps ?? [];
  const tone = status ? pillTone(status) : "ok";
  const done = tone === "ok" || tone === "plain" ? steps.length : tone === "warn" ? Math.max(0, steps.length - 1) : Math.min(1, steps.length);

  return (
    <div className="s-record">
      {back}
      <header className="s-record-head">
        <div>
          <p className="s-label">{detail.noun}</p>
          <h2>{row[0]}</h2>
        </div>
        {status && <Pill value={status} />}
      </header>

      <dl className="s-card s-record-card s-facts">
        {cols.map((col, i) =>
          i === 0 || i === statusCol || !row[i] ? null : (
            <div key={col}>
              <dt>{col}</dt>
              <dd>{pills.includes(i) ? <Pill value={row[i]} /> : row[i]}</dd>
            </div>
          ),
        )}
      </dl>

      {steps.length > 0 && (
        <section className="s-card s-record-card">
          <h3>What happened</h3>
          <ol className="s-timeline">
            {steps.map((step, i) => (
              <li key={step} className={i < done ? "is-done" : ""}>
                <span className="s-tick">{i < done && <Check size={11} aria-hidden="true" />}</span>
                {step}
                {i >= done && <small>Not yet</small>}
              </li>
            ))}
          </ol>
        </section>
      )}

      {detail.actions && detail.actions.length > 0 && (
        <div className="s-record-acts">
          {detail.actions
            .filter((a) => !a.set || row[a.set[0]] !== a.set[1])
            .map((a) => (
              <button key={a.label} type="button" className={`s-btn${a.primary ? " is-primary" : ""}`} onClick={() => onAction(a)}>
                {a.label}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
