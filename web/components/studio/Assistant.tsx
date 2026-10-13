"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUp, Check, X } from "lucide-react";
import { workspace, type SectionId } from "@/lib/studio-data";
import Sheet from "./Sheet";

/**
 * Andishi's bot, redrawn from client/components/Mascot.tsx: the antenna ends
 * in the plumb-bob dot from the Andishi mark. The eyes follow the pointer.
 */
export function Mascot({ size = 56, track = false }: { size?: number; track?: boolean }) {
  const svg = useRef<SVGSVGElement>(null);
  const eyes = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!track || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    function look(e: PointerEvent) {
      if (!svg.current || !eyes.current) return;
      const box = svg.current.getBoundingClientRect();
      const dx = e.clientX - (box.left + box.width / 2);
      const dy = e.clientY - (box.top + box.height / 2);
      const reach = Math.min(1, Math.hypot(dx, dy) / 260);
      const angle = Math.atan2(dy, dx);
      eyes.current.style.transform = `translate(${Math.cos(angle) * reach * 3}px, ${Math.sin(angle) * reach * 2.4}px)`;
    }
    window.addEventListener("pointermove", look);
    return () => window.removeEventListener("pointermove", look);
  }, [track]);

  return (
    <svg ref={svg} className="s-mascot" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <g className="s-mascot-antenna">
        <line x1="32" y1="19" x2="32" y2="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <circle cx="32" cy="7" r="4.5" fill="currentColor" />
      </g>
      <rect x="5" y="31" width="6" height="12" rx="3" fill="currentColor" opacity="0.8" />
      <rect x="53" y="31" width="6" height="12" rx="3" fill="currentColor" opacity="0.8" />
      <rect x="9" y="18" width="46" height="36" rx="15" fill="currentColor" />
      <rect x="14" y="24" width="36" height="24" rx="11" fill="#14101f" />
      <g ref={eyes} className="s-mascot-eyes">
        <ellipse className="s-mascot-eye" cx="25" cy="35" rx="4.2" ry="5.4" fill="#fff" />
        <ellipse className="s-mascot-eye" cx="39" cy="35" rx="4.2" ry="5.4" fill="#fff" />
      </g>
      <path d="M27 43.5 Q32 47 37 43.5" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

const prompts: Record<SectionId, string[]> = {
  today: ["What should I deal with first?", "How did yesterday compare?"],
  bookings: ["Who is booked this afternoon?", "Move Peter Mwangi to 2 pm"],
  store: ["Draft a product for aftershave balm", "What should I restock?"],
  payments: ["Which payments are still waiting?", "How much came in this week?"],
  customers: ["Who has not been in for a month?", "Draft a reply to Caroline"],
  website: ["Write an article introducing Achieng", "Add Sunday hours to the Home page"],
  files: ["Make an A3 poster for the beard care evening", "Find photos that are not used anywhere"],
  reports: ["Why are sales down this week?", "Which barber is busiest?"],
  settings: ["Who can see payments?", "How many credits have I used?"],
};

const REPLY = "This is a design prototype, so I cannot answer yet. In the studio I would reply here, using only the data your role is allowed to see.";

type Message = { from: "me" | "bot"; text: string };

const BUILD_STEPS = ["Reading your brief", "Choosing a look", "Writing your pages", "Setting up bookings", "Adding your store", "Publishing a preview"];

export default function Assistant({ section, sectionLabel, mobile = false, brief }: { section: SectionId; sectionLabel: string; mobile?: boolean; brief?: string }) {
  // Arriving from the landing page chat opens the assistant and builds the site in front of you.
  const [open, setOpen] = useState(Boolean(brief));
  const [stage, setStage] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [proposal, setProposal] = useState<"open" | "saved" | "gone">(brief ? "gone" : "open");
  const log = useRef<HTMLDivElement>(null);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight });
  }, [messages, open, stage]);

  useEffect(() => {
    if (!brief) return;
    const timers = BUILD_STEPS.map((_, i) => window.setTimeout(() => setStage(i + 1), 1000 * (i + 1)));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [brief]);

  const built = Boolean(brief) && stage >= BUILD_STEPS.length;
  const isBarber = /barber|salon|haircut|shave|fade/i.test(brief ?? "");

  function send(text: string) {
    const clean = text.trim();
    if (!clean) return;
    setMessages((m) => [...m, { from: "me", text: clean }, { from: "bot", text: REPLY }]);
    setDraft("");
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    send(draft);
  }

  const chat = (
    <>
      <div className="s-chat-log" ref={log}>
        {brief ? (
          <>
            <p className="s-bubble is-me">{brief}</p>
            <article className="s-build" aria-live="polite">
              <p className="s-label">{built ? "Built" : "Building your site"}</p>
              <ul>
                {BUILD_STEPS.map((label, i) => (
                  <li key={label} className={i < stage ? "is-done" : i === stage ? "is-now" : ""}>
                    <span className="s-tick">{i < stage && <Check size={11} aria-hidden="true" />}</span>
                    {label}
                  </li>
                ))}
              </ul>
            </article>
            {built && (
              <>
                <p className="s-bubble is-bot">
                  {isBarber ? "Here is Fade House, built from your description. " : "This demo uses an example business, a barbershop that also sells products, so you can see every part of the studio. "}
                  It has six pages, online booking, a shop with M-Pesa checkout and your first tables. Have a look.
                </p>
                <div className="s-build-acts">
                  <a className="s-btn is-primary" href={workspace.sitePath} target="_blank" rel="noopener noreferrer">
                    Open my site
                  </a>
                  <button type="button" className="s-btn" onClick={() => setOpen(false)}>
                    Show me around
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <p className="s-bubble is-bot">You are in {sectionLabel}. Ask me a question about the business, or have me draft a change for you to check.</p>
        )}

        {proposal !== "gone" && (
          <article className="s-proposal">
            <p className="s-label">{proposal === "saved" ? "Saved to Services" : "Draft for you to check"}</p>
            <h3>New service: Hot towel shave and haircut</h3>
            <dl>
              <div>
                <dt>Length</dt>
                <dd>60 minutes</dd>
              </div>
              <div>
                <dt>Price</dt>
                <dd>KES 1,300</dd>
              </div>
              <div>
                <dt>Needs</dt>
                <dd>1 barber, 1 shaving chair</dd>
              </div>
            </dl>
            {proposal === "open" && (
              <div className="s-proposal-acts">
                <button type="button" className="s-btn is-primary is-small" onClick={() => setProposal("saved")}>
                  Save
                </button>
                <button type="button" className="s-btn is-small">
                  Edit first
                </button>
                <button type="button" className="s-btn is-small is-quiet" onClick={() => setProposal("gone")}>
                  Discard
                </button>
              </div>
            )}
          </article>
        )}

        {messages.map((m, i) => (
          <p key={i} className={`s-bubble is-${m.from}`}>
            {m.text}
          </p>
        ))}
      </div>

      <div className="s-chat-prompts">
        {prompts[section].map((p) => (
          <button key={p} type="button" onClick={() => send(p)}>
            {p}
          </button>
        ))}
      </div>

      <form className="s-chat-form" onSubmit={submit}>
        <input id="assistant-input" type="text" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Ask or tell me what to draft" aria-label="Message the assistant" />
        <button type="submit" className="s-send" aria-label="Send" disabled={!draft.trim()}>
          <ArrowUp size={16} />
        </button>
      </form>
    </>
  );

  return (
    <>
      {open && mobile && (
        <Sheet title="Assistant" tall flush onClose={() => setOpen(false)}>
          <div className="m-chat">{chat}</div>
        </Sheet>
      )}
      <div className={`s-assistant ${mobile ? "is-mobile" : ""}`}>
      {open && !mobile && (
        <section className="s-chat" aria-label="Assistant">
          <header>
            <Mascot size={34} />
            <div>
              <h2>Assistant</h2>
              <p>Sees what your role can see</p>
            </div>
            <button type="button" className="s-icon-btn" onClick={() => setOpen(false)} aria-label="Close the assistant">
              <X size={16} />
            </button>
          </header>

          {chat}
        </section>
      )}

      <button type="button" className={`s-mascot-btn ${open ? "is-open" : ""}`} onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Close the assistant" : "Open the assistant"}>
        {!open && !mobile && <span className="s-mascot-hint">Ask me anything</span>}
        <Mascot size={mobile ? 50 : 56} track />
        {!open && proposal === "open" && <span className="s-mascot-badge">1</span>}
      </button>
    </div>
    </>
  );
}
