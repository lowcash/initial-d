/** Prefer touch controls when the device has touch / coarse pointer (iPad desktop-mode safe). */
export function isTouchPreferred(): boolean {
  if (typeof navigator === 'undefined') {
    return false
  }
  if (navigator.maxTouchPoints > 0) {
    return true
  }
  if (typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches) {
    return true
  }
  return false
}
