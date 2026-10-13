// Andishi's bot, drawn to take its colour from the surrounding text colour.
export default function Bot({ size = 44, className = "" }: { size?: number; className?: string }) {
  return (
    <svg className={`bot ${className}`.trim()} width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <g className="bot-antenna">
        <line x1="32" y1="19" x2="32" y2="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <circle cx="32" cy="7" r="4.5" fill="currentColor" />
      </g>
      <rect x="5" y="31" width="6" height="12" rx="3" fill="currentColor" opacity="0.8" />
      <rect x="53" y="31" width="6" height="12" rx="3" fill="currentColor" opacity="0.8" />
      <rect x="9" y="18" width="46" height="36" rx="15" fill="currentColor" />
      <rect x="14" y="24" width="36" height="24" rx="11" fill="#14101f" />
      <ellipse className="bot-eye" cx="25" cy="35" rx="4.2" ry="5.4" fill="#fff" />
      <ellipse className="bot-eye" cx="39" cy="35" rx="4.2" ry="5.4" fill="#fff" />
      <path d="M27 43.5 Q32 47 37 43.5" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
