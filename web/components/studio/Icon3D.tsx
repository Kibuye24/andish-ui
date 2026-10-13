// Small 3D-style icons for the quick actions. Each is drawn with a darker
// copy underneath for depth, a gradient face and a soft ground shadow.

export type Icon3DName = "booking" | "order" | "product" | "article" | "upload";

const art: Record<Icon3DName, React.ReactNode> = {
  booking: (
    <>
      <defs>
        <linearGradient id="i3-cal-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e7e3f6" />
        </linearGradient>
        <linearGradient id="i3-cal-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff7b7b" />
          <stop offset="1" stopColor="#dc2f3f" />
        </linearGradient>
      </defs>
      <rect x="7" y="12" width="34" height="30" rx="7" fill="#aaa3cc" />
      <rect x="7" y="8" width="34" height="30" rx="7" fill="url(#i3-cal-body)" />
      <path d="M7 15a7 7 0 0 1 7-7h20a7 7 0 0 1 7 7v4H7z" fill="url(#i3-cal-top)" />
      <rect x="14" y="4" width="4" height="9" rx="2" fill="#4a4560" />
      <rect x="30" y="4" width="4" height="9" rx="2" fill="#4a4560" />
      <rect x="12" y="23" width="6" height="5" rx="1.5" fill="#cfcae6" />
      <rect x="21" y="23" width="6" height="5" rx="1.5" fill="#7c3aed" />
      <rect x="30" y="23" width="6" height="5" rx="1.5" fill="#cfcae6" />
      <rect x="12" y="30" width="6" height="5" rx="1.5" fill="#cfcae6" />
      <rect x="21" y="30" width="6" height="5" rx="1.5" fill="#cfcae6" />
    </>
  ),
  order: (
    <>
      <defs>
        <linearGradient id="i3-bag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffc46b" />
          <stop offset="1" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <path d="M17 18v-4a7 7 0 0 1 14 0v4" fill="none" stroke="#9a3f0a" strokeWidth="3" strokeLinecap="round" />
      <path d="M10.5 21a4 4 0 0 1 4-4h19a4 4 0 0 1 4 4l2 16.5a4 4 0 0 1-4 4.5h-23a4 4 0 0 1-4-4.5z" fill="#b9500b" />
      <path d="M10.5 18a4 4 0 0 1 4-4h19a4 4 0 0 1 4 4l2 16.5a4 4 0 0 1-4 4.5h-23a4 4 0 0 1-4-4.5z" fill="url(#i3-bag)" />
      <path d="M15 18.5h8" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
      <circle cx="17" cy="21" r="1.7" fill="#7c2d12" />
      <circle cx="31" cy="21" r="1.7" fill="#7c2d12" />
    </>
  ),
  product: (
    <>
      <polygon points="24,6 41,14 24,22 7,14" fill="#ffe1a1" />
      <polygon points="7,14 24,22 24,42 7,34" fill="#f5a524" />
      <polygon points="41,14 24,22 24,42 41,34" fill="#c96a06" />
      <polygon points="15.5,10 32.5,18 32.5,24 29,22.4 29,19.6 12,11.6" fill="#fff4d6" opacity="0.9" />
      <path d="M7 14l17 8 17-8" fill="none" stroke="#fff" strokeWidth="1" opacity="0.5" />
    </>
  ),
  article: (
    <>
      <defs>
        <linearGradient id="i3-doc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e3e9fb" />
        </linearGradient>
        <linearGradient id="i3-pen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#74b0ff" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <rect x="8" y="10" width="26" height="33" rx="5" fill="#a9b7e4" />
      <rect x="8" y="6" width="26" height="33" rx="5" fill="url(#i3-doc)" />
      <rect x="13" y="13" width="16" height="3" rx="1.5" fill="#93a8e8" />
      <rect x="13" y="20" width="16" height="3" rx="1.5" fill="#c3cff2" />
      <rect x="13" y="27" width="10" height="3" rx="1.5" fill="#c3cff2" />
      <g transform="rotate(38 34 28)">
        <rect x="30.5" y="9" width="7" height="6" rx="2" fill="#f472b6" />
        <rect x="30.5" y="13" width="7" height="22" fill="url(#i3-pen)" />
        <polygon points="30.5,35 37.5,35 34,42" fill="#fbd9a8" />
        <polygon points="32.8,39.5 35.2,39.5 34,42" fill="#3b3550" />
      </g>
    </>
  ),
  upload: (
    <>
      <defs>
        <linearGradient id="i3-cloud" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c4b5fd" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <path d="M14 38a8 8 0 0 1-1-15.9A11 11 0 0 1 34.5 19 9 9 0 0 1 35 38z" fill="#5530b8" />
      <path d="M14 34a8 8 0 0 1-1-15.9A11 11 0 0 1 34.5 15 9 9 0 0 1 35 34z" fill="url(#i3-cloud)" />
      <path d="M16 20a8 8 0 0 1 7-6" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M24 30V20m0 0l-5 5m5-5l5 5" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
};

export default function Icon3D({ name, size = 44 }: { name: Icon3DName; size?: number }) {
  return (
    <svg className="s-icon3d" width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <ellipse cx="24" cy="44.5" rx="13" ry="2.6" fill="#000" opacity="0.16" />
      {art[name]}
    </svg>
  );
}
