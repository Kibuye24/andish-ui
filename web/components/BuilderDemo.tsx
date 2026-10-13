"use client";

import { useEffect, useRef, useState } from "react";
import { setups, type Setup } from "@/lib/content";

const OFF_NOTE = "Not needed for this business. Switch it on the day you are.";

function Column({ name, items, start }: { name: string; items: string[] | null; start: number }) {
  const on = items !== null;
  return (
    <div className={`demo-col ${on ? "is-on" : "is-off"}`}>
      <h3>
        {name}
        <span className="demo-state">{on ? "On" : "Off"}</span>
      </h3>
      {on ? (
        <ul>
          {items.map((item, i) => (
            <li key={item} style={{ animationDelay: `${(start + i) * 70}ms` }}>
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ animationDelay: `${start * 70}ms` }}>{OFF_NOTE}</p>
      )}
    </div>
  );
}

export default function BuilderDemo() {
  const [active, setActive] = useState<Setup>(setups[0]);
  // The first render shows the full prompt so the page is complete without JS.
  const [typed, setTyped] = useState(setups[0].prompt.length);
  const [run, setRun] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  function pick(setup: Setup) {
    if (timer.current) clearInterval(timer.current);
    setActive(setup);
    setRun((n) => n + 1);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setTyped(setup.prompt.length);
      return;
    }
    setTyped(0);
    timer.current = setInterval(() => {
      setTyped((n) => {
        if (n >= setup.prompt.length) {
          if (timer.current) clearInterval(timer.current);
          return n;
        }
        return n + 2;
      });
    }, 16);
  }

  const typing = typed < active.prompt.length;
  const storeStart = active.sites.length;
  const opsStart = storeStart + (active.store ? active.store.length : 1);

  return (
    <div className="demo">
      <div className="demo-ask">
        <p className="eyebrow">Describe your business</p>
        <p className="demo-prompt" aria-live="polite">
          {active.prompt.slice(0, typed)}
          <span className={`caret ${typing ? "is-typing" : ""}`} aria-hidden="true" />
        </p>
        <div className="demo-picks" role="group" aria-label="Pick an example business">
          {setups.map((s) => (
            <button key={s.id} type="button" aria-pressed={s.id === active.id} onClick={() => pick(s)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="demo-out" key={`${active.id}-${run}`}>
        <div className="demo-bar" aria-hidden="true" />
        <div className="demo-head">
          <h2>
            The AI builder sets up <strong>{active.name}</strong>
          </h2>
          <p>Available on every plan</p>
        </div>
        <div className="demo-cols">
          <Column name="Sites" items={active.sites} start={0} />
          <Column name="Store" items={active.store} start={storeStart} />
          <Column name="Operations" items={active.ops} start={opsStart} />
        </div>
      </div>
      <p className="demo-note">Example setups. Yours comes from your own answers, and you can change anything afterwards.</p>
    </div>
  );
}
