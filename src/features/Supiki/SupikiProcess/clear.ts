export const SUPIKI_CLEAR_EVENT = 'supiki:clear'

export default function clearSupikis(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(SUPIKI_CLEAR_EVENT))
}
