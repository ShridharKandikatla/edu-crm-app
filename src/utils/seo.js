import { useEffect } from 'react';
import { APP_NAME } from '../constants/app';

const PAGE_TITLE_SUFFIX = APP_NAME;

function setMeta(attr, key, content) {
  const selector = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector(selector);
  if (content) {
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  } else if (el) {
    el.remove();
  }
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!href) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function setJsonLd(jsonLd) {
  const id = 'page-jsonld';
  let script = document.getElementById(id);
  if (!jsonLd) {
    if (script) script.remove();
    return;
  }
  if (!script) {
    script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(jsonLd);
}

/**
 * Client-side SEO hook. Upserts the document title, meta description/keywords/
 * robots, Open Graph + Twitter tags, canonical link, and a single JSON-LD node.
 * Call once per page; pass a memoized `jsonLd` for structured data.
 */
export function useSeo({ title, description, keywords, canonical, jsonLd, noindex } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} · ${PAGE_TITLE_SUFFIX}` : PAGE_TITLE_SUFFIX;
    document.title = fullTitle;

    setMeta('name', 'description', description);
    setMeta('name', 'keywords', keywords);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:url', canonical);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);

    setCanonical(canonical);
    setJsonLd(jsonLd);
  }, [title, description, keywords, canonical, noindex, jsonLd]);
}
