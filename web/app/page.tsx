import Link from "next/link";
import Bot from "@/components/landing/Bot";
import ChatComposer from "@/components/landing/ChatComposer";
import DemoPlayer from "@/components/landing/DemoPlayer";
import MiniSite from "@/components/landing/MiniSite";
import Pricing from "@/components/Pricing";
import { cases } from "@/lib/content";
import "./landing.css";

const doors = [
  {
    name: "Sites",
    kind: "Websites, blogs and newsrooms",
    body: "Pages designed around your business, with content sections built for what you publish. A sports blog gets authors and match reports. A careers page gets open positions.",
    extra: "Sign-up forms feed your newsletter list",
  },
  {
    name: "Store",
    kind: "Sell online and at the counter, paid by M-Pesa",
    body: "A storefront on your own link, with your catalogue, sizes and options, checkout and an order list, plus a point of sale for the counter. It sits inside your website, so merchandise is a page, not another subscription.",
    extra: "Stock counts update with every order",
  },
  {
    name: "Operations",
    kind: "Stock, purchases, production and books",
    body: "The back office for businesses that make, pack or stock what they sell. Recipes, suppliers, packaging and books that add up, with tables shaped to your trade.",
    extra: "KRA eTIMS submission is in development",
  },
];

const shared = [
  { title: "One file library", body: "Photos, logos and documents in one place, used on your site, in your store and on your records." },
  { title: "Posters, PDFs and documents", body: "Ask the AI builder for a price list, an event poster or a quotation. It comes out in your colours and is saved to your files." },
  { title: "One wallet for AI work", body: "Building, redesigning and generating documents all draw on the same credits. Your plan includes a monthly allowance." },
  { title: "One bill", body: "Every plan includes all three services and unlimited team members. Plans differ only in how much you use." },
];

export default function Home() {
  return (
    <>
      <header className="site-header">
        <div className="wrap site-header-in">
          <a className="brand" href="#top">
            <Bot size={30} />
            Andishi
          </a>
          <nav aria-label="Page">
            <a href="#about">About</a>
            <a href="#doors">What you get</a>
            <a href="#examples">Examples</a>
            <a href="#pricing">Pricing</a>
          </nav>
          <Link className="pill is-small" href="/studio">
            Open the studio
          </Link>
        </div>
      </header>

      <main>
        <section className="hero" id="top">
          <div className="wrap">
            <div className="hero-top">
              <div>
                <p className="eyebrow">Andishi, by Nexus Labs</p>
                <h1>
                  Describe your business.
                  <span className="outline">The AI builder</span>
                  builds it.
                </h1>
              </div>
              <p className="hero-lede">
                One account for your website, your online store and your back office. Say what you do and you land in a working studio, with your site already built.
              </p>
            </div>
            <ChatComposer />
            <p className="hero-note">This demo needs no sign-up. You go straight into a studio filled with example data.</p>
          </div>
        </section>

        <section className="band" id="about">
          <div className="wrap">
            <div className="band-head">
              <div>
                <p className="eyebrow">About Andishi</p>
                <h2>
                  Watch a business
                  <span className="outline">get built.</span>
                </h2>
              </div>
              <p>
                Andishi sets up your website, your store and your back office from a conversation, then keeps them in one place. One login, one file library, one bill. This is the whole journey in under a minute.
              </p>
            </div>
            <DemoPlayer />
          </div>
        </section>

        <section className="band is-black" id="doors">
          <div className="wrap">
            <div className="band-head">
              <div>
                <p className="eyebrow">What you get</p>
                <h2>
                  Three doors,
                  <span className="outline">one account.</span>
                </h2>
              </div>
              <p>Come in for the one you need today. Every plan includes all three, so switching another on keeps your login, your files and your data.</p>
            </div>
            <ol className="services">
              {doors.map((d, i) => (
                <li key={d.name}>
                  <span className="num">0{i + 1}</span>
                  <div className="service-name">
                    <h3>{d.name}</h3>
                    <p className="eyebrow">{d.kind}</p>
                  </div>
                  <p className="service-body">{d.body}</p>
                  <p className="service-extra">
                    <span aria-hidden="true">✦</span>
                    {d.extra}
                  </p>
                </li>
              ))}
            </ol>
            <ul className="shared">
              {shared.map((s) => (
                <li key={s.title}>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="band" id="examples">
          <div className="wrap">
            <div className="band-head">
              <div>
                <p className="eyebrow">Examples</p>
                <h2>
                  Start from a business
                  <span className="outline">like yours.</span>
                </h2>
              </div>
              <p>Pick one and the AI builder starts with that description. You go straight into the studio, and you can change everything afterwards.</p>
            </div>
            <ul className="cases">
              {cases.map((c) => (
                <li key={c.id}>
                  <Link className="case" href={`/studio?brief=${encodeURIComponent(c.brief)}`}>
                    <span className="case-art">
                      <MiniSite palette={c.palette} variant={c.variant} />
                    </span>
                    <h3>{c.name}</h3>
                    <p>{c.about}</p>
                    <span className="arrow-link">
                      Start with this <span aria-hidden="true">→</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="band is-black" id="pricing">
          <div className="wrap">
            <div className="band-head">
              <div>
                <p className="eyebrow">Pricing</p>
                <h2>
                  Every service.
                  <span className="outline">On every plan.</span>
                </h2>
              </div>
              <p>Sites, Store and Operations are switched on for everyone, with unlimited team members. Plans differ only in how much you use: storage, AI credits, emails and orders.</p>
            </div>
            <Pricing />
          </div>
        </section>

        <section className="band closing">
          <div className="wrap">
            <div className="closing-head">
              <h2>
                Start with
                <span className="outline">one sentence</span>
                about your business.
              </h2>
              <p>Fourteen days free, with every service switched on. Or try the demo now and see it before you decide.</p>
            </div>
            <ChatComposer variant="closing" />
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="wrap">
          <span className="brand">
            <Bot size={26} />
            Andishi
          </span>
          <span>A Nexus Labs product. Website, store and back office in one account.</span>
        </div>
      </footer>
    </>
  );
}
