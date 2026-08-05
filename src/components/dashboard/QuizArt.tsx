/**
 * Stand-in for the 3D clipboard render in the mockup.
 *
 * The comp uses a rendered 3D asset I do not have; this is a flat SVG built to
 * the same silhouette, footprint and placement so the card's proportions are
 * right. Drop the real artwork in and swap this for an <img>.
 */
export function QuizArt() {
  return (
    <div class="pointer-events-none absolute -right-2 bottom-0 hidden h-full w-[40%] items-center justify-center sm:flex" aria-hidden="true">
      <svg viewBox="0 0 220 190" class="h-[150px] w-auto" fill="none">
        {/* clipboard body */}
        <rect x="38" y="18" width="128" height="160" rx="10" fill="#e9edf2" />
        <rect x="50" y="30" width="104" height="136" rx="6" fill="#ffffff" />
        {/* clip */}
        <rect x="84" y="8" width="36" height="20" rx="6" fill="#3f4550" />
        <rect x="92" y="2" width="20" height="12" rx="4" fill="#5a6270" />

        {/* four ticked rows */}
        {[0, 1, 2, 3].map((i) => (
          <>
            <circle cx="68" cy={54 + i * 27} r="9" fill="#09b34f" />
            <path
              d={`M63.5 ${54 + i * 27} l3.2 3.2 5.8 -5.8`}
              stroke="#ffffff"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <rect x="84" y={48 + i * 27} width="54" height="4.5" rx="2.25" fill="#f0b8b0" />
            <rect x="84" y={57 + i * 27} width="34" height="4.5" rx="2.25" fill="#16a34a" />
          </>
        ))}

        {/* pencil */}
        <g transform="rotate(38 168 92)">
          <rect x="160" y="24" width="15" height="104" rx="4" fill="#16a34a" />
          <rect x="160" y="24" width="15" height="16" rx="4" fill="#0f7a37" />
          <path d="M160 128 l7.5 18 7.5 -18 z" fill="#f5d6b0" />
          <path d="M164 137 l3.5 9 3.5 -9 z" fill="#3f4550" />
        </g>

        {/* question bubble */}
        <circle cx="188" cy="150" r="26" fill="#ffffff" />
        <path d="M170 168 l-8 14 18 -6 z" fill="#ffffff" />
        <text
          x="188"
          y="160"
          text-anchor="middle"
          font-size="30"
          font-weight="700"
          fill="#3f4550"
          font-family="system-ui, sans-serif"
        >
          ?
        </text>
      </svg>
    </div>
  );
}

export default QuizArt;
