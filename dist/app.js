(() => {
  'use strict';
  if (window.__heloSportBooted) return;
  window.__heloSportBooted = true;
  const config = window.HELO_SPORT_CONFIG || {};
  const cta = document.getElementById('ctaPrincipal');
  const status = document.getElementById('invite-status');
  if (!cta) return;
  let destination = '';
  try {
    const url = new URL(config.groupUrl);
    if (url.protocol === 'https:' && url.hostname === 'chat.whatsapp.com' && !url.username && !url.password && /^\/[A-Za-z0-9]{10,}\/?$/.test(url.pathname)) destination = url.href;
  } catch (_) {}
  if (destination) {
    cta.href = destination;
    cta.removeAttribute('aria-disabled');
    status.textContent = 'Abrir convite no WhatsApp';
  }
  function permitted() {
    try { return navigator.doNotTrack !== '1' && navigator.globalPrivacyControl !== true && localStorage.getItem('helo_meta_consent') !== 'denied'; }
    catch (_) { return false; }
  }
  const enabled = config.trackingEnabled === true && /^\d{10,20}$/.test(config.pixelId || '') &&
    Array.isArray(config.trackingHosts) && config.trackingHosts.includes(location.hostname) &&
    !['localhost', '127.0.0.1'].includes(location.hostname);
  function track(name) {
    if (!enabled || !permitted() || typeof window.fbq !== 'function') return;
    try {
      const eventId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sport-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      window.fbq('trackSingle', config.pixelId, name, { content_name: config.brand || 'Achadinhos esportivos' }, { eventID: eventId });
    } catch (_) { /* Tracking must not interfere with the real invitation. */ }
  }
  if (enabled && permitted()) {
    try {
      if (!window.fbq) {
        const fbq = window.fbq = function () { fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments); };
        window._fbq = fbq; fbq.push = fbq; fbq.loaded = true; fbq.version = '2.0'; fbq.queue = [];
        const script = document.createElement('script'); script.async = true;
        script.src = 'https://connect.facebook.net/en_US/fbevents.js'; document.head.appendChild(script);
      }
      window.fbq('set', 'autoConfig', false, config.pixelId);
      window.fbq('init', config.pixelId);
      track('PageView');
    } catch (_) {}
  }
  let lastClick = -Infinity;
  cta.addEventListener('click', event => {
    if (!destination) {
      event.preventDefault();
      status.textContent = 'O convite do grupo esportivo será liberado em breve.';
      return;
    }
    const now = Date.now();
    if (now - lastClick < 2500) { event.preventDefault(); return; }
    lastClick = now;
    if (['Lead', 'CompleteRegistration', 'Contact'].includes(config.conversionEvent)) track(config.conversionEvent);
    // Real anchor navigation remains native, including when Meta is blocked.
  });
  window.addEventListener('pageshow', () => { lastClick = -Infinity; });
})();
