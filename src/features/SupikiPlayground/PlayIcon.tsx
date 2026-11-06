const paths = {
  add: 'M12 5v14M5 12h14',
  snack:
    'M8 8c2-2 6-2 8 0s2 6 0 8-6 2-8 0-2-6 0-8ZM7 9 3 7l1 5-1 5 4-2m10-6 4-2-1 5 1 5-4-2M9 9l6 6',
  jump: 'M5 18c0-3 14-3 14 0s-14 3-14 0ZM7 20v2m10-2v2M12 13V2m-4 4 4-4 4 4',
  float:
    'M15 3c-6 0-9 4-9 9l6 6c5 0 9-3 9-9V3h-6ZM9 9l-6 2v5l4-1m8 2-1 4h-5l2-6M3 21l3-3M14 8a2 2 0 1 0 4 0 2 2 0 1 0-4 0',
  radio:
    'M5 8h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Zm0 0 13-5M6 15a3 3 0 1 0 6 0 3 3 0 1 0-6 0m10-3h2m-2 4h2',
  camera:
    'M8 7 10 4h4l2 3h4a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h4Zm0 6a4 4 0 1 0 8 0 4 4 0 1 0-8 0',
  reset: 'M4 10a8 8 0 1 1 1 8M4 4v6h6',
  sound: 'M4 9h4l5-4v14l-5-4H4V9Zm12 0a5 5 0 0 1 0 6m3-9a9 9 0 0 1 0 12',
  muted: 'M4 9h4l5-4v14l-5-4H4V9Zm13 0 5 6m0-6-5 6',
  sun: 'M8 12a4 4 0 1 0 8 0 4 4 0 1 0-8 0m4-10v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2',
  moon: 'M20 15a8 8 0 0 1-11-11 9 9 0 1 0 11 11Z',
  help: 'M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0m6-3a3 3 0 1 1 5 2c-2 1-2 1-2 3m0 3v.1',
  back: 'M19 12H5m6-6-6 6 6 6',
  close: 'M6 6l12 12M6 18 18 6',
  star: 'm12 3 3 6 6 1-4.5 4.5 1 6.5-5.5-3-5.5 3 1-6.5L3 10l6-1 3-6Z',
  download: 'M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4',
  hand: 'M8 13V5a2 2 0 0 1 4 0v6-2a2 2 0 0 1 4 0v2-1a2 2 0 0 1 4 0v5c0 4-2 6-6 6h-1c-2 0-4-1-5-3l-4-5a2 2 0 0 1 3-2l1 2Z',
}

export type PlayIconName = keyof typeof paths

export const PlayIcon = ({ name, className }: { name: PlayIconName; className?: string }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={paths[name]} />
  </svg>
)
