import type { CSSProperties } from "react";
import type { Palette } from "@/lib/content";

export type Variant = "barber" | "bakery" | "news" | "band";

/**
 * A small drawn website, used as a picture of what gets built. With
 * `progress` it appears block by block, like a page being assembled.
 */
export default function MiniSite({ palette, variant, progress, url }: { palette: Palette; variant: Variant; progress?: number; url?: string }) {
  const hide = (at: number) => (progress === undefined || progress >= at ? "" : " is-hidden");
  const style = { "--ms-bg": palette.bg, "--ms-ink": palette.ink, "--ms-accent": palette.accent, "--ms-soft": palette.soft } as CSSProperties;

  return (
    <div className="ms" data-v={variant} style={style} aria-hidden="true">
      <div className="ms-bar">
        <i />
        <i />
        <i />
        {url && <span>{url}</span>}
      </div>
      <div className={`ms-nav ms-block${hide(0.06)}`}>
        <b className="ms-logo" />
        <span className="ms-links">
          <i />
          <i />
          <i />
        </span>
        <b className="ms-cta" />
      </div>
      <div className={`ms-hero ms-block${hide(0.2)}`}>
        <span className="ms-copy">
          <b className="ms-h1" />
          <b className="ms-h1 is-short" />
          <i className="ms-p" />
          <i className="ms-p is-short" />
          <b className="ms-btn" />
        </span>
        <span className="ms-art" />
      </div>
      <div className={`ms-row ms-block${hide(0.45)}`}>
        <span>
          <i />
          <b />
        </span>
        <span>
          <i />
          <b />
        </span>
        <span>
          <i />
          <b />
        </span>
      </div>
      <div className={`ms-row is-four ms-block${hide(0.68)}`}>
        <span>
          <i />
        </span>
        <span>
          <i />
        </span>
        <span>
          <i />
        </span>
        <span>
          <i />
        </span>
      </div>
      <div className={`ms-foot ms-block${hide(0.88)}`} />
    </div>
  );
}
