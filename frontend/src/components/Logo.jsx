export default function Logo({ size = 36, showWordmark = true, className = "" }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="mark-grad" x1="2" y1="2" x2="38" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#5eead4" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="38" height="38" rx="10" fill="#131a28" stroke="url(#mark-grad)" strokeWidth="1.5" />
        {/* routing graph glyph: one root node branching into a retrieved path and a direct path */}
        <circle cx="20" cy="11" r="3.1" fill="url(#mark-grad)" />
        <path d="M20 14 L12 22" stroke="url(#mark-grad)" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M20 14 L28 22" stroke="url(#mark-grad)" strokeWidth="1.6" strokeLinecap="round" opacity="0.55" />
        <circle cx="12" cy="24.5" r="2.6" fill="#5eead4" />
        <circle cx="28" cy="24.5" r="2.6" fill="#6366f1" opacity="0.75" />
        <path d="M12 27 L12 30.5" stroke="#5eead4" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="12" cy="32.6" r="2" fill="#5eead4" opacity="0.85" />
      </svg>
      {showWordmark && (
        <div className="leading-none">
          <div className="font-extrabold tracking-tight text-[17px] text-white">
            Meridian<span className="text-brand-400">AI</span>
          </div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-ink-500 font-medium mt-0.5">
            Agentic RAG · FinRegs
          </div>
        </div>
      )}
    </div>
  );
}
