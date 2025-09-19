(function(){
  if (window.__gaAnalyticsLoaded) return;
  window.__gaAnalyticsLoaded = true;

  const MEASUREMENT_ID = window.GA_MEASUREMENT_ID;
  if (!window.gtag || !MEASUREMENT_ID) {
    console.warn('Google Analytics is disabled. Measurement ID missing.');
    return;
  }

  if (!window.__gaConfigured) {
    window.__gaConfigured = true;
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID, { send_page_view: false });
  }

  const currentPath = () => window.location.pathname + window.location.search + window.location.hash;
  const pageLocation = path => window.location.origin + path;

  let lastTrackedPath = currentPath();
  let visibleStart = document.visibilityState === 'visible' ? performance.now() : null;
  let accumulatedVisible = 0;

  function sendPageView(path) {
    window.gtag('event', 'page_view', {
      send_to: MEASUREMENT_ID,
      page_title: document.title,
      page_path: path,
      page_location: pageLocation(path)
    });
  }

  function markVisibleStart() {
    visibleStart = performance.now();
  }

  function accumulateHidden() {
    if (visibleStart === null) return;
    accumulatedVisible += performance.now() - visibleStart;
    visibleStart = null;
  }

  function sendEngagement(path) {
    if (accumulatedVisible < 1000) {
      accumulatedVisible = 0;
      return;
    }
    window.gtag('event', 'page_engagement', {
      send_to: MEASUREMENT_ID,
      engagement_time_msec: Math.round(accumulatedVisible),
      page_path: path,
      page_location: pageLocation(path),
      non_interaction: true
    });
    accumulatedVisible = 0;
  }

  function normalizePath(input) {
    if (!input) return currentPath();
    try {
      const url = new URL(input, window.location.href);
      return url.pathname + url.search + url.hash;
    } catch (err) {
      return currentPath();
    }
  }

  function handleNavigation(nextPath) {
    const targetPath = normalizePath(nextPath);
    if (targetPath === lastTrackedPath) {
      if (document.visibilityState === 'visible' && visibleStart === null) markVisibleStart();
      return;
    }
    accumulateHidden();
    sendEngagement(lastTrackedPath);
    lastTrackedPath = targetPath;
    sendPageView(lastTrackedPath);
    if (document.visibilityState === 'visible') {
      markVisibleStart();
    } else {
      visibleStart = null;
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      accumulateHidden();
      sendEngagement(lastTrackedPath);
    } else if (document.visibilityState === 'visible') {
      markVisibleStart();
    }
  }, { passive: true });

  const flush = () => {
    accumulateHidden();
    sendEngagement(lastTrackedPath);
  };

  window.addEventListener('pagehide', flush);
  window.addEventListener('beforeunload', flush);

  if (!window.__gaPatchedHistory) {
    window.__gaPatchedHistory = true;
    const originalPushState = history.pushState;
    history.pushState = function(state, title, url) {
      const result = originalPushState.apply(this, arguments);
      handleNavigation(url);
      return result;
    };

    const originalReplaceState = history.replaceState;
    history.replaceState = function(state, title, url) {
      const result = originalReplaceState.apply(this, arguments);
      if (typeof url !== 'undefined' && url !== null) {
        handleNavigation(url);
      }
      return result;
    };

    window.addEventListener('popstate', () => handleNavigation());
  }

  document.addEventListener('click', (evt) => {
    if (evt.defaultPrevented || evt.button !== 0 || evt.metaKey || evt.ctrlKey || evt.shiftKey || evt.altKey) return;
    const link = evt.target.closest && evt.target.closest('a[href]');
    if (!link) return;
    if (link.target && link.target !== '_self') return;
    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin) return;
    if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash === window.location.hash) return;
    requestAnimationFrame(() => handleNavigation(url.pathname + url.search + url.hash));
  }, true);

  sendPageView(lastTrackedPath);
  if (document.visibilityState === 'visible' && visibleStart === null) markVisibleStart();
})();
