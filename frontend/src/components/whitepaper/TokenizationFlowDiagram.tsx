export function TokenizationFlowDiagram() {
  return (
    <svg
      viewBox="0 0 640 120"
      className="w-full h-auto"
      aria-label="Tokenization flow: wstETH deposit to YieldVault mints PT and YT"
    >
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#71717A" />
        </marker>
      </defs>

      <rect x="8" y="36" width="100" height="48" rx="10" fill="#151515" stroke="rgba(255,255,255,0.08)" />
      <text x="58" y="58" textAnchor="middle" fill="#F6F5F2" fontSize="11" fontFamily="monospace">wstETH</text>
      <text x="58" y="72" textAnchor="middle" fill="#71717A" fontSize="9">underlying</text>

      <line x1="108" y1="60" x2="148" y2="60" stroke="#71717A" strokeWidth="1.5" markerEnd="url(#arrow)" />
      <text x="128" y="50" textAnchor="middle" fill="#71717A" fontSize="8">deposit()</text>

      <rect x="148" y="28" width="120" height="64" rx="10" fill="#151515" stroke="rgba(255,146,179,0.35)" />
      <text x="208" y="52" textAnchor="middle" fill="#FF92B3" fontSize="11" fontFamily="monospace">YieldVault</text>
      <text x="208" y="68" textAnchor="middle" fill="#71717A" fontSize="9">mint 1:1</text>

      <line x1="268" y1="60" x2="308" y2="60" stroke="#71717A" strokeWidth="1.5" markerEnd="url(#arrow)" />

      <rect x="308" y="20" width="88" height="40" rx="8" fill="#151515" stroke="rgba(166,217,91,0.4)" />
      <text x="352" y="45" textAnchor="middle" fill="#A6D95B" fontSize="11" fontFamily="monospace">PT</text>

      <text x="352" y="72" textAnchor="middle" fill="#71717A" fontSize="14">+</text>

      <rect x="308" y="80" width="88" height="40" rx="8" fill="#151515" stroke="rgba(255,146,179,0.4)" />
      <text x="352" y="105" textAnchor="middle" fill="#FF92B3" fontSize="11" fontFamily="monospace">YT</text>

      <line x1="396" y1="40" x2="448" y2="40" stroke="#71717A" strokeWidth="1" strokeDasharray="4 3" markerEnd="url(#arrow)" />
      <line x1="396" y1="100" x2="448" y2="100" stroke="#71717A" strokeWidth="1" strokeDasharray="4 3" markerEnd="url(#arrow)" />

      <rect x="448" y="16" width="180" height="88" rx="10" fill="#101010" stroke="rgba(255,255,255,0.06)" />
      <text x="538" y="44" textAnchor="middle" fill="#F6F5F2" fontSize="10">Uniswap v4 pools</text>
      <text x="538" y="62" textAnchor="middle" fill="#71717A" fontSize="9">PT/WETH · YT/WETH</text>
      <text x="538" y="82" textAnchor="middle" fill="#71717A" fontSize="9">MochiYieldHook</text>
    </svg>
  )
}
