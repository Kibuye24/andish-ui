"use client";

import { useState } from "react";
import { included, tiers, YEARLY_DISCOUNT } from "@/lib/content";

const kes = (n: number) => n.toLocaleString("en-KE");

export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  const price = (monthly: number) => Math.round(yearly ? monthly * (1 - YEARLY_DISCOUNT) : monthly);

  return (
    <>
      <div className="bill-toggle" role="group" aria-label="Billing period">
        <button type="button" aria-pressed={!yearly} onClick={() => setYearly(false)}>
          Monthly
        </button>
        <button type="button" aria-pressed={yearly} onClick={() => setYearly(true)}>
          Yearly, 25% off
        </button>
      </div>

      <div className="tiers">
        {tiers.map((tier) => (
          <article key={tier.id} className="tier">
            <h3>{tier.name}</h3>
            <p className="tier-price">
              <span className="tier-currency">KES</span>
              {kes(price(tier.monthly))}
              <small>per month{yearly ? ", billed yearly" : ""}</small>
            </p>
            <p className="tier-blurb">{tier.blurb}</p>
            <dl className="tier-limits">
              {tier.limits.map((l) => (
                <div key={l.label}>
                  <dt>{l.label}</dt>
                  <dd>{l.value}</dd>
                </div>
              ))}
              <div>
                <dt>Team members</dt>
                <dd>Unlimited</dd>
              </div>
            </dl>
            <a className={tier.id === "pro" ? "pill" : "pill is-ghost"} href="#top">
              Start 14-day trial
            </a>
          </article>
        ))}
      </div>

      <h3 className="included-head">Included on every plan</h3>
      <div className="included">
        {included.map((group) => (
          <div key={group.group}>
            <p className="eyebrow">{group.group}</p>
            <ul>
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="fine">
        Prices are in Kenya shillings. Every plan includes Sites, Store and Operations. Need more AI credits? Add a credit pack to any plan. The trial includes 500 AI credits and 1 GB of storage.
      </p>
    </>
  );
}
