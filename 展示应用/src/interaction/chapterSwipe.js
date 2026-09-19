// A deliberate single-finger swipe advances one chapter. Mouse drags retain
// the existing scene controls; the distance is measured in CSS pixels.
export function chapterSwipeDirection({ cancelled, event, gesture }, width) {
  if (cancelled || !event || !gesture || !['touch', 'pen'].includes(gesture.pointerType)) return 0;
  const dx = event.clientX - gesture.startX, dy = event.clientY - gesture.startY;
  const distance = Math.max(64, Math.min(150, width * .055));
  if (Math.abs(dx) < distance || Math.abs(dx) < Math.abs(dy) * 1.6) return 0;
  return dx < 0 ? 1 : -1;
}
