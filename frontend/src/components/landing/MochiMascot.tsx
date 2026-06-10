interface MochiMascotProps {
  className?: string
  size?: number
}

export function MochiMascot({ className = '', size = 160 }: MochiMascotProps) {
  return (
    <svg
      viewBox="0 0 200 220"
      width={size}
      height={size * 1.1}
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="mochi-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#FFF7F0" />
          <stop offset="100%" stopColor="#FFD6E0" />
        </linearGradient>
        <filter id="mochi-shadow" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="12" stdDeviation="14" floodColor="#FF92B3" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Body */}
      <ellipse
        cx="100"
        cy="138"
        rx="72"
        ry="68"
        fill="url(#mochi-body)"
        filter="url(#mochi-shadow)"
      />

      {/* Sprout stem */}
      <path d="M100 58 Q100 48 100 42" stroke="#8BCF65" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Sprout leaves */}
      <ellipse cx="88" cy="50" rx="14" ry="8" fill="#A6D95B" transform="rotate(-35 88 50)" />
      <ellipse cx="112" cy="50" rx="14" ry="8" fill="#8BCF65" transform="rotate(35 112 50)" />

      {/* Eyes */}
      <circle cx="78" cy="125" r="6" fill="#1C1C1C" />
      <circle cx="122" cy="125" r="6" fill="#1C1C1C" />
      <circle cx="80" cy="123" r="2" fill="#FFFFFF" />
      <circle cx="124" cy="123" r="2" fill="#FFFFFF" />

      {/* Smile */}
      <path
        d="M82 148 Q100 162 118 148"
        stroke="#1C1C1C"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* Cheek blush */}
      <ellipse cx="62" cy="140" rx="10" ry="6" fill="#FFD6E0" opacity="0.6" />
      <ellipse cx="138" cy="140" rx="10" ry="6" fill="#FFD6E0" opacity="0.6" />

      {/* Waving arm */}
      <ellipse cx="158" cy="118" rx="16" ry="12" fill="#FFF7F0" transform="rotate(-20 158 118)" />
    </svg>
  )
}
