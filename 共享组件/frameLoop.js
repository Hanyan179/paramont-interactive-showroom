// A renderer owns one loop. Visibility and route/overlay activity are independent gates.
export function createFrameLoop({ render, request = requestAnimationFrame, cancel = cancelAnimationFrame }) {
  let active = false, visible = true, disposed = false, pending = null, previous = null;
  const running = () => active && visible && !disposed;
  const schedule = () => { if (running() && pending === null) pending = request(frame); };
  function frame(now) {
    pending = null;
    if (!running()) return;
    const dt = previous === null ? 0 : Math.max(0, Math.min(.05, (now - previous) / 1000));
    previous = now;
    render(now, dt);
    schedule();
  }
  function reconcile() {
    if (running()) schedule();
    else {
      if (pending !== null) cancel(pending);
      pending = null;
      previous = null;
    }
  }
  return {
    setActive(value) { active = value; reconcile(); },
    setVisible(value) { visible = value; reconcile(); },
    dispose() { disposed = true; reconcile(); },
    get running() { return running(); },
  };
}
