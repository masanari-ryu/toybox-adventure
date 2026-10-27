import advertisement from './affiliate.html?raw';

const AD_SECONDS = 5;

/** Show a sponsor screen at a natural break, then continue after five seconds. */
export function showInterstitial(after: () => void): void {
  if (new URLSearchParams(location.search).get('bot') === '1') { after(); return; }
  const backdrop = document.createElement('section');
  backdrop.className = 'sponsor-screen';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-label', 'こうこく');
  const panel = document.createElement('div');
  panel.className = 'sponsor-panel';
  const label = document.createElement('p');
  label.className = 'sponsor-label';
  label.textContent = 'こうこく';
  const material = document.createElement('iframe');
  material.className = 'sponsor-material';
  material.title = 'こうこく';
  // The A8 code stays intact; the surrounding document opens its links separately
  // so leaving for an advertiser does not replace an in-progress game.
  material.srcdoc = '<!doctype html><html><head><base target="_blank"></head><body>' + advertisement + '</body></html>';
  const close = document.createElement('button');
  close.type = 'button';
  close.disabled = true;
  close.setAttribute('aria-live', 'polite');
  close.textContent = `あと ${AD_SECONDS} びょう`;
  let closed = false;
  const deadline = performance.now() + AD_SECONDS * 1000;
  const dismiss = () => {
    if (closed) return;
    closed = true;
    clearInterval(timer);
    document.removeEventListener('visibilitychange', tick);
    backdrop.remove();
    after();
  };
  const tick = () => {
    const remaining = Math.max(0, Math.ceil((deadline - performance.now()) / 1000));
    close.textContent = remaining ? `あと ${remaining} びょう` : 'つづける';
    if (!remaining && !document.hidden) dismiss();
  };
  const timer = window.setInterval(tick, 250);
  document.addEventListener('visibilitychange', tick);
  backdrop.addEventListener('keydown', (event) => { if (event.key === 'Escape') event.preventDefault(); });
  panel.append(label, material, close);
  backdrop.append(panel);
  document.body.append(backdrop);
  backdrop.tabIndex = -1;
  backdrop.focus();
}
