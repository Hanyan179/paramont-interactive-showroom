// Gesture classification is shared; each scene supplies its own movement and raycast actions.
export function bindScenePointer(host, {
  enabled = () => true, threshold = 7, includeControls = false, claimClick = false, now = () => performance.now(),
  onStart = () => {}, onMove = () => {}, onTap = () => {}, onEnd = () => {},
}) {
  let gesture = null, moved = false, claimedPointer = null;
  const windowTarget = host.ownerDocument.defaultView;
  const markMoved = event => {
    if (Math.hypot(event.clientX - gesture.startX, event.clientY - gesture.startY) > threshold) moved = true;
  };
  function down(event) {
    if (!enabled() || gesture || event.isPrimary === false || event.button > 0 || (!includeControls && event.target.closest?.('button,a,input,select,textarea'))) return;
    gesture = { pointerId: event.pointerId, target: event.target, x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY, time: now() };
    claimedPointer = claimClick ? event.pointerId : null;
    moved = false;
    host.setPointerCapture(event.pointerId);
    onStart(event, gesture);
  }
  function move(event) {
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    if (!enabled()) { finish(true); return; }
    markMoved(event);
    const time = now(), dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
    const elapsed = Math.max(8, time - gesture.time);
    gesture = { ...gesture, x: event.clientX, y: event.clientY, time };
    onMove(event, { dx, dy, elapsed, gesture });
  }
  function finish(cancelled, event) {
    if (!gesture) return;
    const completed = gesture, pointerId = gesture.pointerId;
    if (event) markMoved(event);
    const tap = !cancelled && !moved && enabled();
    gesture = null;
    if (host.hasPointerCapture(pointerId)) host.releasePointerCapture(pointerId);
    onEnd({ cancelled });
    if (tap) onTap(event, completed);
  }
  function up(event) {
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    finish(event.type !== 'pointerup', event);
  }
  const cancelGesture = () => finish(true);
  const lost = event => { if (gesture?.pointerId === event.pointerId) cancelGesture(); };
  // Pointer taps are handled once by onTap. Keep keyboard/assistive clicks intact.
  // A browser click emitted after dragging must never activate a moving hotspot.
  const click = event => {
    if (claimedPointer === null || event.detail === 0) return;
    if (event.pointerId !== undefined && event.pointerId !== claimedPointer) return;
    claimedPointer = null;
    event.preventDefault();event.stopImmediatePropagation();
  };
  host.addEventListener('click', click, true);
  host.addEventListener('pointerdown', down);
  host.addEventListener('pointermove', move);
  host.addEventListener('pointerup', up);
  host.addEventListener('pointercancel', up);
  host.addEventListener('lostpointercapture', lost);
  windowTarget.addEventListener('blur', cancelGesture);
  return {
    cancel: cancelGesture,
    dispose() {
      cancelGesture();
      claimedPointer = null;
      host.removeEventListener('click', click, true);
      host.removeEventListener('pointerdown', down);
      host.removeEventListener('pointermove', move);
      host.removeEventListener('pointerup', up);
      host.removeEventListener('pointercancel', up);
      host.removeEventListener('lostpointercapture', lost);
      windowTarget.removeEventListener('blur', cancelGesture);
    },
  };
}
