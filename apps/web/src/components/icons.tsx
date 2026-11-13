import type { ReactNode, SVGProps } from 'react'

// 24×24 line icons, 1.8px stroke. Add new ones here so every screen draws from one set.
const PATHS = {
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M10 21v-6h4v6" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </>
  ),
  cap: (
    <>
      <path d="M2 9.5 12 5l10 4.5-10 4.5L2 9.5Z" />
      <path d="M6 11.3V16c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.7" />
      <path d="M22 9.5V15" />
    </>
  ),
  document: (
    <>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" />
      <path d="M14 3v6h6" />
      <path d="M8 13h8M8 17h5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  bookmark: <path d="M6 4h12v17l-6-4-6 4V4Z" />,
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" />
    </>
  ),
  award: (
    <>
      <circle cx="12" cy="9" r="5" />
      <path d="m8.5 13-1.5 8 5-3 5 3-1.5-8" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  wallet: (
    <>
      <path d="M4 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a1 1 0 0 1-1-1V7Z" />
      <path d="M4 7V6a2 2 0 0 1 2-2h10v3M16 13.5h2" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  pencil: <path d="M4 20h4L19 9l-4-4L4 16v4ZM13 7l4 4" />,
  refresh: (
    <>
      <path d="M20 12a8 8 0 1 1-2.34-5.66" />
      <path d="M20 4v5h-5" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13.5" r="3.5" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  path: <path d="M5 20c0-4 4-4 7-6s7-2 7-6M5 4h4" />,
  download: <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />,
  trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />,
  eye: (
    <>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  code: <path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" />,
  chart: <path d="M4 20h16M7 16v-5M12 16V7M17 16v-8" />,
  server: (
    <>
      <rect x="4" y="4" width="16" height="7" rx="2" />
      <rect x="4" y="13" width="16" height="7" rx="2" />
      <path d="M8 7.5h.01M8 16.5h.01" />
    </>
  ),
  shield: <path d="M12 3 5 6v6c0 4.4 3 7.7 7 9 4-1.3 7-4.6 7-9V6l-7-3Z" />,
  signal: <path d="M12 20v-6M8.5 10.5a5 5 0 0 1 7 0M5.5 7.5a9 9 0 0 1 13 0M12 14h.01" />,
  megaphone: <path d="M4 10v4h3l7 4V6L7 10H4ZM18 9a4 4 0 0 1 0 6" />,
  heart: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />,
  flask: <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3M7.5 14h9" />,
  pill: <path d="m10.5 20.5 10-10a4.95 4.95 0 0 0-7-7l-10 10a4.95 4.95 0 0 0 7 7ZM8.5 8.5l7 7" />,
  tooth: (
    <path d="M7 3C5 3 4 5 4 7c0 3 1 5 2 8s1 6 2 6 2-3 2-5 1-2 2-2 2 0 2 2 1 5 2 5 1-3 2-6 2-5 2-8c0-2-1-4-3-4s-3 1-5 1-3-1-5-1Z" />
  ),
  brain: (
    <path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a2 2 0 0 0-3-1ZM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1" />
  ),
  bell: (
    <>
      <path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 6 2.5 7h-17C4.5 15 6 13 6 9Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </>
  ),
  landmark: (
    <>
      <path d="M3 9.5 12 4l9 5.5" />
      <path d="M5.5 10.5v7M10 10.5v7M14 10.5v7M18.5 10.5v7" />
      <path d="M3 20.5h18" />
    </>
  ),
  building: (
    <>
      <path d="M5 21V4h10v17M15 9h4v12M3 21h18" />
      <path d="M8.5 8h3M8.5 12h3M8.5 16h3" />
    </>
  ),
  newspaper: (
    <>
      <path d="M4 5h13v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5Z" />
      <path d="M17 9h3v10a2 2 0 0 1-2 2M7.5 9h6M7.5 13h6M7.5 17h3" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17.5h.01" />
    </>
  ),
  sliders: (
    <>
      <path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1" />
      <circle cx="15" cy="6" r="2" />
      <circle cx="9" cy="12" r="2" />
      <circle cx="17" cy="18" r="2" />
    </>
  ),
  panel: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M9 4v16" />
    </>
  ),
  scale: (
    <>
      <path d="M12 3v17M7 20h10M5 7h14" />
      <path d="M2 14l3-7 3 7a3 3 0 0 1-6 0ZM16 14l3-7 3 7a3 3 0 0 1-6 0Z" />
    </>
  ),
  gavel: (
    <>
      <path d="M9 8 15 2l6 6-6 6Z" />
      <path d="m12 11-8 8M3 21h10" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5" />
    </>
  ),
  book: <path d="M12 6c-2-1.5-5-2-9-2v14c4 0 7 .5 9 2 2-1.5 5-2 9-2V4c-4 0-7 .5-9 2Zm0 0v14" />,
  message: <path d="M4 4h16v12H10l-6 4Z M8 9h8M8 12h5" />,
  palette: (
    <>
      <path d="M12 3a9 9 0 0 0 0 18c1.5 0 2-1 2-2s-1-1.5-1-2.5 1-1.5 2-1.5h2a4 4 0 0 0 4-4c0-4.5-4-8-9-8Z" />
      <circle cx="7.5" cy="11" r="1" />
      <circle cx="10" cy="7" r="1" />
      <circle cx="15" cy="7.5" r="1" />
    </>
  ),
  leaf: <path d="M4 20c1-9 7-14 16-16-1 9-6 15-14 15M4 20l8-8" />,
  atom: (
    <>
      <circle cx="12" cy="12" r="1.5" />
      <ellipse cx="12" cy="12" rx="10" ry="4" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
    </>
  ),
  chalkboard: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="1" />
      <path d="M8 20l2-4M16 20l-2-4M7 9h6M7 12h4" />
    </>
  ),
  helmet: <path d="M3 18h18M5 18v-2a7 7 0 0 1 14 0v2M10 9V6h4v3" />,
  ruler: <path d="M3 17 17 3l4 4L7 21Zm4-4 2 2m1-5 2 2m1-5 2 2" />,
  gear: (
    <>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" />
    </>
  ),
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7Z" />,
  drop: <path d="M12 3s-6 7-6 11a6 6 0 0 0 12 0c0-4-6-11-6-11Z" />,
  mountain: <path d="m2 20 7-12 4 6 3-4 6 10Z" />,
  sprout: <path d="M12 21v-9m0 0c0-4-3-7-8-7 0 5 3 7 8 7Zm0 0c0-3 2-6 7-6 0 4-2 6-7 6Z" />,
  paw: (
    <>
      <circle cx="7" cy="9" r="1.8" />
      <circle cx="12" cy="6.5" r="1.8" />
      <circle cx="17" cy="9" r="1.8" />
      <path d="M8 17c0-3 2-5 4-5s4 2 4 5a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2Z" />
    </>
  ),
  fish: <path d="M3 12c3-4 7-5 10-5s6 2 8 5c-2 3-5 5-8 5s-7-1-10-5Zm0 0-1-3m1 3-1 3m14-4h.01" />,
  tree: <path d="M12 22v-6M12 2 5 12h4l-3 4h12l-3-4h4Z" />,
  truck: (
    <>
      <path d="M2 6h11v10H2ZM13 10h5l3 3v3h-8" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </>
  ),
  plane: <path d="M10 3h2l3 7h5a1.5 1.5 0 0 1 0 3h-5l-3 7h-2l1.5-7H7l-1.5 2H3l1-3.5L3 8h2.5L7 10h4.5Z" />,
  bed: <path d="M3 6v13M3 15h18v4M21 15v-3a3 3 0 0 0-3-3h-7v6M7 12.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />,
  volume: (
    <>
      <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5Z" />
      <path d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" />
    </>
  ),
  volumeOff: (
    <>
      <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5Z" />
      <path d="m16 9.5 5 5M21 9.5l-5 5" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7" />
    </>
  ),
  external: (
    <>
      <path d="M14 4h6v6M20 4l-9 9" />
      <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </>
  ),
  star: <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z" />,
  share: (
    <>
      <path d="M12 15V3M7.5 7.5 12 3l4.5 4.5" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </>
  ),
  phone: (
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
} satisfies Record<string, ReactNode>

export type IconName = keyof typeof PATHS

type IconProps = SVGProps<SVGSVGElement> & { name: IconName }

export function Icon({ name, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {PATHS[name]}
    </svg>
  )
}
