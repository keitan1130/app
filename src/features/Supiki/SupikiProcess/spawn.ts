export const SUPIKI_SPAWN_EVENT = 'supiki:spawn'

export default function spawnSupiki(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(SUPIKI_SPAWN_EVENT))
}
