// Analytics loader — single shared module so the snippet lives in one place.
//
// Primary tool: Google Analytics 4 (free, no traffic cap that would ever cost
// money for a project this size). Set GA_MEASUREMENT_ID below to enable.
// Until then, nothing is loaded and the site stays fully ad/tracker-free.
//
// Vercel Web Analytics (also free on the Hobby plan) requires NO code — just
// enable it in the Vercel dashboard; it is edge-injected. Recommended as a
// quick secondary view alongside GA4 + Google Search Console.
//
// To enable GA4: paste your Measurement ID (starts with "G-") below.
const GA_MEASUREMENT_ID = ''; // e.g. 'G-XXXXXXXXXX'

export function initAnalytics() {
  if (!GA_MEASUREMENT_ID || !GA_MEASUREMENT_ID.startsWith('G-')) return;

  // gtag.js snippet
  const s1 = document.createElement('script');
  s1.async = true;
  s1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(s1);

  const s2 = document.createElement('script');
  s2.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_MEASUREMENT_ID}');
  `;
  document.head.appendChild(s2);
}
