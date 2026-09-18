// The Rexran "Regalia Crest" — two mirrored high-contrast R's sharing a central
// spine, with a four-point gold spark at the heart (the mark that "stops the
// scroll"). Pure vector, outlined from Bodoni Moda so it is font-independent
// and infinitely scalable. Sized in em, so callers control it with font-size
// (nav, hero, footer all set their own). Keeps the same import surface as the
// previous logo component, so every usage updates at once.

// Outlined capital-R path (font units, y-up); drawn twice — once mirrored — inside
// a group that flips to SVG space. Geometry baked by scripts/brand vectorizer.
export const R_PATH =
  'M413 758V781H706Q802 781 868.0 818.0Q934 855 967.5 930.5Q1001 1006 1001 1121Q1001 1236 967.5 1311.5Q934 1387 868.0 1424.0Q802 1461 706 1461H52V1500H736Q896 1500 1017.0 1459.5Q1138 1419 1205.5 1335.0Q1273 1251 1273 1121Q1273 991 1209.5 911.0Q1146 831 1026.0 794.5Q906 758 736 758ZM52 0V39H731V0ZM260 21V1476H522V21ZM1226 -13Q1130 -13 1076.0 19.0Q1022 51 996.5 105.0Q971 159 964.0 226.0Q957 293 956.0 364.5Q955 436 949.0 503.0Q943 570 920.5 624.0Q898 678 846.0 710.0Q794 742 702 742H413V763H814Q955 763 1037.0 723.5Q1119 684 1160.5 619.0Q1202 554 1215.5 477.0Q1229 400 1230.0 323.0Q1231 246 1234.0 181.0Q1237 116 1256.0 76.5Q1275 37 1326 37Q1358 37 1383.0 44.0Q1408 51 1429 61L1442 23Q1418 10 1360.5 -1.5Q1303 -13 1226 -13Z'
// Slit "pupil" centred in the eye — turns the interlock into a dragon/cat eye.
export const PUPIL = 'M 1183 862 Q 1229 780 1183 698 Q 1137 780 1183 862 Z'

export default function RexMark({ className = '', glow = true }: { className?: string; glow?: boolean }) {
  return (
    <svg
      className={className}
      viewBox="0 0 2442 1693"
      width="1.442em"
      height="1em"
      fill="none"
      role="img"
      aria-label="Rexran"
      style={{ overflow: 'visible', filter: glow ? 'drop-shadow(0 0 28px rgba(212,175,55,.28))' : undefined }}
    >
      <defs>
        <linearGradient id="rex-grad" x1="0" y1="1693" x2="2442" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8A6D1F" />
          <stop offset="0.34" stopColor="#D4AF37" />
          <stop offset="0.62" stopColor="#F8EBBE" />
          <stop offset="1" stopColor="#D9B24C" />
        </linearGradient>
      </defs>
      <g fill="url(#rex-grad)" transform="translate(38 1590) scale(1 -1)">
        <path d={R_PATH} />
        <path d={R_PATH} transform="translate(2366 0) scale(-1 1)" />
        <path d={PUPIL} />
      </g>
    </svg>
  )
}
