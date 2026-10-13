"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Check, Pause, Play, RotateCcw } from "lucide-react";
import Bot from "./Bot";
import MiniSite from "./MiniSite";

// A scripted walkthrough, drawn live in the page. It plays like a video:
// play and pause, scrub, jump by chapter, with a caption for each part.

const DURATION = 50;
const BRIEF = "I run a barbershop in Nairobi. Customers book online and I sell grooming products.";
const POSTER_ASK = "Make a poster for Saturday's beard care evening.";
const BARBER = { bg: "#ffffff", ink: "#111214", accent: "#d62839", soft: "#e9ebef" };

const chapters = [
  { id: "describe", title: "Describe it", blurb: "Say what you do, in a sentence.", start: 0, caption: "Describe your business in a sentence." },
  { id: "plan", title: "Check the plan", blurb: "Pages, tables and fields, ready to change.", start: 9, caption: "The AI builder proposes what to set up. You can change any of it." },
  { id: "build", title: "Watch it build", blurb: "Site, bookings and store go live.", start: 19, caption: "Your pages, bookings and store are built and published." },
  { id: "run", title: "Run the day", blurb: "Bookings, orders and payments in one place.", start: 31, caption: "Bookings, payments and stock land in one studio." },
  { id: "more", title: "Ask for more", blurb: "Posters, PDFs and changes from the same chat.", start: 41, caption: "Posters, PDFs and changes come from the same chat." },
];

const plan = [
  { name: "Sites", items: ["Home and opening hours", "Price list", "Online booking", "Our barbers"] },
  { name: "Store", items: ["Grooming products", "M-Pesa checkout", "Stock counts"] },
  { name: "Operations", items: ["Staff and services", "Customers", "Payments and reports"] },
];

const buildSteps = ["Choosing a look", "Writing your pages", "Setting up bookings", "Adding your store", "Publishing a preview"];

const clamp = (n: number) => Math.min(1, Math.max(0, n));
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/* ───────── scenes ───────── */

function Describe({ p }: { p: number }) {
  const typed = Math.floor(clamp((p - 0.12) / 0.6) * BRIEF.length);
  const sent = p > 0.8;
  return (
    <div className="sc sc-chat">
      <div className="sc-row">
        <Bot size={28} />
        <p className="sc-bubble">What does your business do? Say it in a sentence.</p>
      </div>
      {sent && <p className="sc-bubble is-me">{BRIEF}</p>}
      {sent && p > 0.9 && (
        <div className="sc-row">
          <Bot size={28} />
          <p className="sc-bubble sc-typing">
            <i />
            <i />
            <i />
          </p>
        </div>
      )}
      <div className="sc-composer">
        <span className="sc-input">
          {!sent && typed === 0 && <span className="sc-ph">Describe your business</span>}
          {!sent && BRIEF.slice(0, typed)}
          {!sent && <i className="sc-caret" />}
        </span>
        <span className={`sc-send${typed > 0 ? " is-on" : ""}`}>
          <ArrowUp size={14} />
        </span>
      </div>
    </div>
  );
}

function Plan({ p }: { p: number }) {
  let n = 0;
  return (
    <div className="sc">
      <p className="sc-title">Here is what I will set up</p>
      <div className="sc-plan">
        {plan.map((col) => (
          <div key={col.name} className="sc-col">
            <h4>{col.name}</h4>
            <ul>
              {col.items.map((item) => {
                const at = 0.1 + n++ * 0.065;
                return (
                  <li key={item} className={p > at ? "is-on" : ""}>
                    <Check size={12} aria-hidden="true" />
                    {item}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <p className={`sc-approve${p > 0.82 ? " is-on" : ""}`}>
        <span>Approve and build</span>
        <span className="is-quiet">Change something</span>
      </p>
    </div>
  );
}

function Build({ p }: { p: number }) {
  const done = Math.floor(p * (buildSteps.length + 0.4));
  return (
    <div className="sc sc-build">
      <div>
        <ul className="sc-steps">
          {buildSteps.map((label, i) => (
            <li key={label} className={i < done ? "is-done" : i === done ? "is-now" : ""}>
              <span className="sc-tick">{i < done ? <Check size={11} aria-hidden="true" /> : null}</span>
              {label}
            </li>
          ))}
        </ul>
        <span className="sc-bar">
          <span style={{ width: `${Math.min(100, p * 112)}%` }} />
        </span>
      </div>
      <div className="sc-site">
        <MiniSite palette={BARBER} variant="barber" progress={p} url={p > 0.9 ? "fadehouse.andishi.site" : undefined} />
        <span className={`sc-live${p > 0.9 ? " is-on" : ""}`}>Live</span>
      </div>
    </div>
  );
}

function Run({ p }: { p: number }) {
  return (
    <div className="sc sc-run">
      <div className={`sc-tile${p > 0.08 ? " is-on" : ""}`}>
        <small>New booking</small>
        <strong>Ali Hassan</strong>
        <span>Haircut, 14:30 with Kevin</span>
      </div>
      <div className={`sc-tile${p > 0.38 ? " is-on" : ""}`}>
        <small>M-Pesa received</small>
        <strong>KES 2,500</strong>
        <span>Order #1046, paid</span>
      </div>
      <div className={`sc-tile${p > 0.6 ? " is-on" : ""}`}>
        <small>Beard oil 30 ml</small>
        <strong>{p > 0.72 ? 11 : 12}</strong>
        <span>on the shelf</span>
      </div>
    </div>
  );
}

function More({ p }: { p: number }) {
  const typed = Math.floor(clamp((p - 0.04) / 0.34) * POSTER_ASK.length);
  return (
    <div className="sc sc-more">
      <div className="sc-chat">
        <p className="sc-bubble is-me">{POSTER_ASK.slice(0, typed)}</p>
        {p > 0.45 && (
          <div className="sc-row">
            <Bot size={28} />
            <p className="sc-bubble">Done. It is saved in Files, Documents, in your colours.</p>
          </div>
        )}
      </div>
      <div className={`sc-poster${p > 0.55 ? " is-on" : ""}`}>
        <i />
        <strong>Beard care evening</strong>
        <span>Saturday 17 October, 18:30</span>
        <small>Fade House, Nairobi</small>
      </div>
    </div>
  );
}

const scenes = [Describe, Plan, Build, Run, More];

/* ───────── player ───────── */

export default function DemoPlayer() {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const tRef = useRef(0);
  const box = useRef<HTMLDivElement>(null);
  const seen = useRef(false);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      tRef.current = Math.min(DURATION, tRef.current + 0.1);
      setT(tRef.current);
      if (tRef.current >= DURATION) setPlaying(false);
    }, 100);
    return () => window.clearInterval(id);
  }, [playing]);

  // Starts by itself the first time it is half on screen, unless motion is reduced.
  useEffect(() => {
    const el = box.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !seen.current) {
          seen.current = true;
          setStarted(true);
          setPlaying(true);
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function seek(to: number) {
    tRef.current = Math.min(DURATION, Math.max(0, to));
    setT(tRef.current);
  }

  function toggle() {
    seen.current = true;
    setStarted(true);
    if (tRef.current >= DURATION) seek(0);
    setPlaying((p) => (tRef.current >= DURATION ? true : !p));
  }

  function jump(to: number) {
    seen.current = true;
    setStarted(true);
    seek(to);
    setPlaying(true);
  }

  let idx = 0;
  chapters.forEach((c, i) => {
    if (t >= c.start) idx = i;
  });
  const chapter = chapters[idx];
  const end = chapters[idx + 1]?.start ?? DURATION;
  const p = clamp((t - chapter.start) / (end - chapter.start));
  const Scene = scenes[idx];
  const ended = t >= DURATION && !playing;

  return (
    <div className="player-wrap">
      <div className="player" ref={box} role="region" aria-label="Andishi demo video, 50 seconds">
        <div className="player-ui">
          <div className="screen" onClick={toggle}>
            <div className="scene" key={chapter.id}>
              <Scene p={p} />
            </div>
          </div>
          <p className="player-caption">{chapter.caption}</p>

          {!started && (
            <button type="button" className="player-big" onClick={toggle} aria-label="Play the demo">
              <span>
                <Play size={22} />
              </span>
              Watch it work, 50 seconds
            </button>
          )}

          {ended && (
            <div className="player-end">
              <strong>That took one sentence.</strong>
              <span>
                <button type="button" className="pill is-small" onClick={toggle}>
                  <RotateCcw size={14} aria-hidden="true" /> Watch again
                </button>
                <a className="pill is-small is-ghost" href="#start">
                  Try it with your business
                </a>
              </span>
            </div>
          )}

          <div className="player-bar">
            <button type="button" className="player-btn" onClick={toggle} aria-label={playing ? "Pause" : "Play"}>
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <input type="range" min={0} max={DURATION} step={0.1} value={t} onChange={(e) => seek(Number(e.target.value))} aria-label="Seek" />
            <span className="player-time">
              {clock(t)} / {clock(DURATION)}
            </span>
          </div>
        </div>
      </div>

      <ol className="chapters">
        {chapters.map((c, i) => (
          <li key={c.id}>
            <button type="button" aria-current={i === idx} onClick={() => jump(c.start)}>
              <strong>{c.title}</strong>
              <small>{c.blurb}</small>
              <span className="chapter-fill" style={{ width: `${i < idx ? 100 : i === idx ? p * 100 : 0}%` }} />
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
