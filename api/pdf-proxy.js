// ============================================================
// Same-origin PDF proxy
// ------------------------------------------------------------
// Problem: embedding a PDF via <iframe src="https://external.host/file.pdf">
// fails with "This content is blocked" when the host sends
// X-Frame-Options / Content-Security-Policy: frame-ancestors, or when the
// host is unreachable on the visitor's network.
//
// Fix: fetch the PDF on the server and stream it back from OUR OWN domain
// (https://koreasathi.com/pdf-proxy?url=...). Because it's same-origin, no
// external framing policy can block it, and the CSP frame-src 'self' allows it.
// ============================================================

import { checkRateLimit } from './rate-limit.js';

// Only allow PDFs from trusted WordPress media hosts.
const ALLOWED_HOSTS = [
  'koreasathi.wordpress.com',
  'koreasathi.files.wordpress.com',
  'csjibu.files.wordpress.com',
  'wordpress.com',
  'files.wordpress.com',
];

function isAllowed(url) {
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:') return false;
    return ALLOWED_HOSTS.some(h => u.hostname === h || u.hostname.endsWith('.' + h));
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  // CORS / method
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    res.end('Method Not Allowed');
    return;
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  if (!checkRateLimit(ip)) {
    res.statusCode = 429;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Too many requests. Please try again later.');
    return;
  }

  const target = req.query.url;
  if (!target || !isAllowed(target)) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Invalid or disallowed PDF URL.');
    return;
  }

  try {
    const upstream = await fetch(target, {
      headers: { 'User-Agent': 'KoreaSathi-PDF-Proxy/1.0' },
    });
    if (!upstream.ok) {
      res.statusCode = upstream.status;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Failed to fetch PDF (upstream ' + upstream.status + ').');
      return;
    }
    const contentType = upstream.headers.get('content-type') || 'application/pdf';
    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', 'inline; filename="guide.pdf"');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Explicitly allow framing from our own site (same-origin already does).
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.end(buffer);
  } catch (e) {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Proxy error: ' + (e?.message || 'unknown'));
  }
}
