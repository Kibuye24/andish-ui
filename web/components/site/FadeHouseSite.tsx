"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Brush, Check, Droplet, Scissors, Sparkles, type LucideIcon } from "lucide-react";

// An example of the kind of site the AI builder produces. Everything here is
// made up, and the forms only pretend: nothing is sent anywhere.

const services = [
  { name: "Haircut", mins: 30, price: 500 },
  { name: "Beard trim", mins: 20, price: 300 },
  { name: "Haircut and beard", mins: 45, price: 800 },
  { name: "Kids cut", mins: 30, price: 350 },
  { name: "Hot towel shave", mins: 30, price: 800 },
];

const barbers = [
  { name: "Kevin", craft: "Fades and line-ups", years: 9 },
  { name: "Achieng", craft: "Beard design and hot towel shaves", years: 7 },
  { name: "Brian", craft: "Kids and classic cuts", years: 5 },
];

const slots = [
  { time: "14:30", who: "Kevin" },
  { time: "15:15", who: "Achieng" },
  { time: "15:45", who: "Kevin" },
  { time: "16:30", who: "Brian" },
];

type Product = { id: string; name: string; note: string; price: number; icon: LucideIcon; left: number };

const products: Product[] = [
  { id: "oil", name: "Beard oil 30 ml", note: "Cedar and bergamot", price: 1200, icon: Droplet, left: 3 },
  { id: "pomade", name: "Matte pomade", note: "Strong hold, no shine", price: 1400, icon: Sparkles, left: 22 },
  { id: "comb", name: "Comb set", note: "Black or tortoise", price: 900, icon: Scissors, left: 14 },
  { id: "balm", name: "Aftershave balm", note: "Calms razor burn", price: 1100, icon: Brush, left: 0 },
];

const posts = [
  { title: "How to ask for a fade", tag: "Guide", date: "6 Oct" },
  { title: "Beard oil or balm?", tag: "Guide", date: "29 Sep" },
  { title: "Meet Achieng", tag: "Team", date: "Today" },
];

const kes = (n: number) => `KES ${n.toLocaleString("en-KE")}`;

export default function FadeHouseSite() {
  const [bag, setBag] = useState<Record<string, number>>({});
  const [form, setForm] = useState({ service: services[0].name, who: "Kevin", time: "14:30", name: "", phone: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [booked, setBooked] = useState<string | null>(null);
  const [pay, setPay] = useState<"idle" | "asking" | "sent">("idle");
  const [mpesa, setMpesa] = useState("");
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  const count = Object.values(bag).reduce((a, b) => a + b, 0);
  const total = products.reduce((sum, p) => sum + p.price * (bag[p.id] ?? 0), 0);
  const service = services.find((s) => s.name === form.service) ?? services[0];

  function pick(time: string, who: string) {
    setForm((f) => ({ ...f, time, who }));
    setBooked(null);
  }

  function book(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Enter your name.";
    if (!/^\+?[0-9 ]{9,16}$/.test(form.phone.trim())) next.phone = "Enter a phone number like 0700 000 000.";
    setErrors(next);
    if (Object.keys(next).length === 0) setBooked(`${form.name.trim()}, you are booked for ${form.service.toLowerCase()} at ${form.time} with ${form.who}.`);
  }

  return (
    <div className="fx" id="top">
      <header className="fx-header">
        <div className="fx-wrap fx-header-in">
          <a className="fx-logo" href="#top" aria-label="Fade House, home">
            <span className="fx-pole-icon" aria-hidden="true" />
            Fade House
          </a>
          <nav aria-label="Site">
            <a href="#services">Prices</a>
            <a href="#barbers">Barbers</a>
            <a href="#shop">Shop</a>
            <a href="#journal">Journal</a>
            <a href="#contact">Visit</a>
          </nav>
          <span className="fx-header-acts">
            <a className="fx-bag" href="#shop" aria-label={`Bag, ${count} ${count === 1 ? "item" : "items"}`}>
              Bag <b>{count}</b>
            </a>
            <a className="fx-btn" href="#book">
              Book a chair
            </a>
          </span>
        </div>
      </header>

      <section className="fx-hero">
        <div className="fx-wrap fx-hero-in">
          <div>
            <p className="fx-kicker">Barbers in Nairobi, since 2019</p>
            <h1>
              Sharp cuts.
              <span>No waiting.</span>
            </h1>
            <p className="fx-lede">Pick your barber, pick your time, and walk in when it is your turn. Pay at the chair or by M-Pesa.</p>
            <p className="fx-hero-acts">
              <a className="fx-btn" href="#book">
                Book a chair
              </a>
              <a className="fx-btn is-ghost" href="#services">
                See prices
              </a>
            </p>
          </div>
          <aside className="fx-open" aria-label="Openings today">
            <p className="fx-open-head">
              <span className="fx-live" aria-hidden="true" />
              Open today, 09:00 to 18:00
            </p>
            <p className="fx-open-sub">Free chairs this afternoon</p>
            <ul>
              {slots.map((s) => (
                <li key={s.time}>
                  <a href="#book" onClick={() => pick(s.time, s.who)}>
                    <strong>{s.time}</strong>
                    <span>with {s.who}</span>
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
        <div className="fx-pole" aria-hidden="true" />
      </section>

      <section className="fx-section" id="services">
        <div className="fx-wrap fx-split">
          <div>
            <h2>Prices</h2>
            <p className="fx-intro">Every cut includes a neck shave and a hot towel. Prices are in Kenya shillings.</p>
          </div>
          <ul className="fx-prices">
            {services.map((s) => (
              <li key={s.name}>
                <span>
                  <strong>{s.name}</strong>
                  <small>{s.mins} minutes</small>
                </span>
                <b>{kes(s.price)}</b>
                <a href="#book" onClick={() => setForm((f) => ({ ...f, service: s.name }))}>
                  Book
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="fx-section is-white" id="barbers">
        <div className="fx-wrap">
          <h2>Your barbers</h2>
          <ul className="fx-team">
            {barbers.map((b) => (
              <li key={b.name}>
                <span className="fx-avatar" aria-hidden="true">
                  {b.name[0]}
                </span>
                <h3>{b.name}</h3>
                <p>{b.craft}</p>
                <small>{b.years} years behind the chair</small>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="fx-section" id="book">
        <div className="fx-wrap fx-split">
          <div>
            <h2>Book a chair</h2>
            <p className="fx-intro">We hold your slot for ten minutes. Some services ask for a small deposit by M-Pesa.</p>
            <p className="fx-summary">
              {service.name}, {service.mins} minutes, {kes(service.price)}
            </p>
          </div>
          {booked ? (
            <div className="fx-done" role="status">
              <Check size={22} aria-hidden="true" />
              <h3>You are booked</h3>
              <p>{booked}</p>
              <p className="fx-small">A confirmation is on its way by SMS. This is an example, so nothing was sent.</p>
              <button type="button" className="fx-btn is-ghost" onClick={() => setBooked(null)}>
                Make another booking
              </button>
            </div>
          ) : (
            <form className="fx-form" onSubmit={book} noValidate>
              <label>
                Service
                <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>
                  {services.map((s) => (
                    <option key={s.name}>{s.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Barber
                <select value={form.who} onChange={(e) => setForm({ ...form, who: e.target.value })}>
                  {barbers.map((b) => (
                    <option key={b.name}>{b.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Time today
                <select value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}>
                  {["14:30", "15:15", "15:45", "16:30", "17:00"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label>
                Your name
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-invalid={Boolean(errors.name)} placeholder="Daniel Otieno" autoComplete="off" />
                {errors.name && <em>{errors.name}</em>}
              </label>
              <label className="is-wide">
                Phone
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} aria-invalid={Boolean(errors.phone)} placeholder="0700 000 000" inputMode="tel" autoComplete="off" />
                {errors.phone && <em>{errors.phone}</em>}
              </label>
              <button type="submit" className="fx-btn is-wide">
                Book {form.time} with {form.who}
              </button>
            </form>
          )}
        </div>
      </section>

      <section className="fx-section is-white" id="shop">
        <div className="fx-wrap">
          <div className="fx-shop-head">
            <h2>The shop</h2>
            <p className="fx-intro">What we use in the chair, to take home.</p>
          </div>
          <ul className="fx-products">
            {products.map((p) => {
              const Icon = p.icon;
              const out = p.left === 0;
              return (
                <li key={p.id}>
                  <span className="fx-product-art" aria-hidden="true">
                    <Icon size={34} />
                  </span>
                  <h3>{p.name}</h3>
                  <p>{p.note}</p>
                  <div>
                    <b>{kes(p.price)}</b>
                    <button type="button" className="fx-btn is-small" disabled={out} onClick={() => setBag((b) => ({ ...b, [p.id]: (b[p.id] ?? 0) + 1 }))}>
                      {out ? "Sold out" : bag[p.id] ? `Add another (${bag[p.id]})` : "Add to bag"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          {count > 0 && (
            <div className="fx-bagbar" role="region" aria-label="Your bag">
              <p>
                <strong>
                  {count} {count === 1 ? "item" : "items"}
                </strong>
                <span>{kes(total)}</span>
              </p>
              {pay === "idle" && (
                <button type="button" className="fx-btn" onClick={() => setPay("asking")}>
                  Pay with M-Pesa
                </button>
              )}
              {pay === "asking" && (
                <form
                  className="fx-mpesa"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (mpesa.trim().length >= 9) setPay("sent");
                  }}
                >
                  <label className="fx-sr" htmlFor="fx-mpesa">
                    M-Pesa number
                  </label>
                  <input id="fx-mpesa" value={mpesa} onChange={(e) => setMpesa(e.target.value)} placeholder="0700 000 000" inputMode="tel" autoComplete="off" />
                  <button type="submit" className="fx-btn">
                    Send prompt
                  </button>
                </form>
              )}
              {pay === "sent" && <p className="fx-sent">Check your phone for the M-Pesa prompt. This is an example, so no money moves.</p>}
            </div>
          )}
        </div>
      </section>

      <section className="fx-section" id="journal">
        <div className="fx-wrap">
          <h2>Journal</h2>
          <ul className="fx-posts">
            {posts.map((p) => (
              <li key={p.title}>
                <a href="#journal">
                  <small>
                    {p.tag}, {p.date}
                  </small>
                  <h3>{p.title}</h3>
                  <span>Read</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="fx-footer" id="contact">
        <div className="fx-pole" aria-hidden="true" />
        <div className="fx-wrap fx-footer-in">
          <div>
            <h2>Visit</h2>
            <p>Moi Avenue, Nairobi</p>
            <p>Monday to Saturday, 09:00 to 18:00</p>
            <p>0700 000 000</p>
          </div>
          <form
            className="fx-news"
            onSubmit={(e) => {
              e.preventDefault();
              if (/\S+@\S+\.\S+/.test(email)) setJoined(true);
            }}
          >
            <h3>Get the monthly note</h3>
            {joined ? (
              <p role="status">You are on the list.</p>
            ) : (
              <>
                <label className="fx-sr" htmlFor="fx-email">
                  Email
                </label>
                <span>
                  <input id="fx-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" inputMode="email" autoComplete="off" />
                  <button type="submit" className="fx-btn">
                    Join
                  </button>
                </span>
              </>
            )}
          </form>
        </div>
        <p className="fx-credit">
          Example site, made with <Link href="/">Andishi</Link>
        </p>
      </footer>
    </div>
  );
}
