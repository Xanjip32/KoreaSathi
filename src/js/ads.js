// ============================================================
// Advertisement & Sponsorship configuration
// ------------------------------------------------------------
// Everything here is DISABLED by default. The site renders exactly as
// before (no empty whitespace, no ads) until you intentionally turn a
// slot on and give it content.
//
// To enable an ad slot: set its `enabled` to true and provide `html`
// (raw HTML for the ad/sponsor) or a `src` (external ad script, loaded
// async). Empty/disabled slots stay hidden, so layout never shifts.
//
// Sponsors: add entries to SPONSORS. They render in any container marked
// data-sponsor-slot. Each gets a clear "Sponsored"/"Partner" badge.
// ============================================================

import DOMPurify from 'dompurify';
import { escapeHtml } from './api.js';

export const AD_SLOTS = {
  top:       { enabled: false, html: '', src: '' },   // below navbar
  sidebar:   { enabled: false, html: '', src: '' },   // desktop only
  inarticle: { enabled: false, html: '', src: '' },   // between content sections
  footer:    { enabled: false, html: '', src: '' },   // footer sponsor section
};

export const SPONSORS = [
  // Example (disabled until you fill it in):
  // {
  //   name: 'Example Partner',
  //   logo: 'https://example.com/logo.png',
  //   description: 'Short description of the partner.',
  //   cta: { label: 'Learn More', url: 'https://example.com' },
  //   badge: 'Partner',            // or 'Sponsored'
  //   expires: '2026-12-31',       // optional ISO date; past-dated sponsors hide automatically
  //   slot: 'footer',              // which container to render in
  // },
];

function isExpired(sponsor) {
  if (!sponsor.expires) return false;
  try { return new Date(sponsor.expires).getTime() < Date.now(); } catch { return false; }
}

function renderAdSlot(key, slot) {
  const el = document.querySelector(`[data-ad-slot="${key}"]`);
  if (!el) return;
  if (!slot.enabled || (!slot.html && !slot.src)) {
    el.classList.remove('is-active');
    el.innerHTML = '';
    return;
  }
  el.classList.add('is-active');
  if (slot.src) {
    // External ad script — always async, never blocks render
    const s = document.createElement('script');
    s.async = true;
    s.src = slot.src;
    el.innerHTML = '<div class="ad-slot__inner"></div>';
    el.querySelector('.ad-slot__inner').appendChild(s);
  } else {
    el.innerHTML = `<div class="ad-slot__inner">${DOMPurify.sanitize(slot.html)}</div>`;
  }
}

function renderSponsor(sponsor) {
  if (isExpired(sponsor)) return;
  const slot = sponsor.slot || 'footer';
  const el = document.querySelector(`[data-sponsor-slot="${slot}"]`);
  if (!el) return;
  el.classList.add('is-active');
  const badge = sponsor.badge ? `<span class="sponsor-badge">${sponsor.badge}</span>` : '';
  const logo = sponsor.logo ? `<img class="sponsor-card__logo" src="${escapeHtml(sponsor.logo)}" alt="${escapeHtml(sponsor.name)} logo" loading="lazy">` : '';
  const cta = sponsor.cta
    ? `<a class="sponsor-card__cta" href="${escapeHtml(sponsor.cta.url)}" target="_blank" rel="noopener sponsored">${escapeHtml(sponsor.cta.label)}</a>`
    : '';
  const card = document.createElement('div');
  card.className = 'sponsor-card';
  card.innerHTML = `
    ${logo}
    <div>
      <div class="sponsor-card__name">${escapeHtml(sponsor.name)}${badge}</div>
      <div class="sponsor-card__desc">${escapeHtml(sponsor.description || '')}</div>
    </div>
    ${cta}`;
  el.appendChild(card);
}

export function initAds() {
  // Ad slots
  Object.entries(AD_SLOTS).forEach(([key, slot]) => renderAdSlot(key, slot));
  // Sponsors
  SPONSORS.forEach(renderSponsor);
}
