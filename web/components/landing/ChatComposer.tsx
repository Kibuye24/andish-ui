"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { cases } from "@/lib/content";
import Bot from "./Bot";

/**
 * The landing page's chat. Sending a message, or picking an example, goes
 * straight into the studio with that message as the brief.
 */
export default function ChatComposer({ variant = "hero" }: { variant?: "hero" | "closing" }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    router.prefetch("/studio");
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [router]);

  function open(brief: string) {
    const clean = brief.trim();
    if (!clean || sent) return;
    setSent(clean);
    const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timer.current = window.setTimeout(() => router.push(`/studio?brief=${encodeURIComponent(clean)}`), instant ? 0 : 1200);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    open(text);
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      open(text);
    }
  }

  const hero = variant === "hero";

  return (
    <div className={`chat is-${variant}`} id={hero ? "start" : undefined}>
      {hero && (
        <>
          <div className="chat-head">
            <Bot size={34} />
            <span>
              <strong>The AI builder</strong>
              <small>Andishi</small>
            </span>
            <span className="chat-status">Ready</span>
          </div>
          <div className="chat-log" aria-live="polite">
            <div className="msg">
              <Bot size={38} />
              <p className="bubble">What does your business do? Tell me in a sentence and I will set up your website, your store and your back office.</p>
            </div>
            {sent && (
              <div className="msg is-me">
                <p className="bubble">{sent}</p>
              </div>
            )}
            {sent && (
              <div className="msg">
                <Bot size={38} />
                <p className="bubble">Got it. Opening your studio and starting the build.</p>
              </div>
            )}
          </div>
        </>
      )}

      <div className="chips" role="group" aria-label="Or start from an example">
        {cases.map((c) => (
          <button key={c.id} type="button" disabled={Boolean(sent)} onClick={() => open(c.brief)}>
            {c.name}
          </button>
        ))}
      </div>

      <form className="composer" onSubmit={onSubmit}>
        <textarea
          id={`brief-${variant}`}
          rows={2}
          value={text}
          disabled={Boolean(sent)}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKey}
          placeholder="I run a barbershop in Nairobi. Customers book online and I sell grooming products."
          aria-label="Describe your business"
        />
        <button className="send" type="submit" disabled={!text.trim() || Boolean(sent)} aria-label="Send and open the studio">
          <ArrowUp size={22} />
        </button>
      </form>
    </div>
  );
}
