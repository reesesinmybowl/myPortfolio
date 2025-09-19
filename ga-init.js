(function(){
  if (window.__gaInitLoaded) return;
  window.__gaInitLoaded = true;

  const MEASUREMENT_ID = 'G-BN9QSX45R8';
  window.GA_MEASUREMENT_ID = MEASUREMENT_ID;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };

  if (document.getElementById('ga-gtag-loader')) return;
  const script = document.createElement('script');
  script.id = 'ga-gtag-loader';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
  document.head.appendChild(script);
})();
