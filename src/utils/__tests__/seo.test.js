import { describe, it, expect, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSeo } from '../seo';

function getMetaContent(attr, key) {
  const el = document.querySelector(`meta[${attr}="${key}"]`);
  return el ? el.getAttribute('content') : null;
}

function getLinkHref(rel) {
  const el = document.querySelector(`link[rel="${rel}"]`);
  return el ? el.getAttribute('href') : null;
}

function getJsonLd() {
  const el = document.getElementById('page-jsonld');
  if (!el) return null;
  try {
    return JSON.parse(el.textContent);
  } catch {
    return null;
  }
}

afterEach(() => {
  document.querySelectorAll('meta[name], meta[property], link[rel="canonical"]').forEach((el) => el.remove());
  document.getElementById('page-jsonld')?.remove();
});

describe('useSeo', () => {
  it('sets document title with Eportal suffix', () => {
    renderHook(() => useSeo({ title: 'Home' }));
    expect(document.title).toBe('Home · Eportal');
  });

  it('falls back to Eportal suffix when no title provided', () => {
    renderHook(() => useSeo({}));
    expect(document.title).toBe('Eportal');
  });

  it('upserts meta description', () => {
    const { rerender } = renderHook(
      ({ desc }) => useSeo({ description: desc }),
      { initialProps: { desc: 'First desc' } },
    );
    expect(getMetaContent('name', 'description')).toBe('First desc');

    rerender({ desc: 'Updated desc' });
    expect(getMetaContent('name', 'description')).toBe('Updated desc');
  });

  it('removes meta description when set to undefined', () => {
    const { rerender } = renderHook(
      ({ desc }) => useSeo({ description: desc }),
      { initialProps: { desc: 'Some desc' } },
    );
    expect(getMetaContent('name', 'description')).toBe('Some desc');

    rerender({ desc: undefined });
    expect(getMetaContent('name', 'description')).toBeNull();
  });

  it('sets robots noindex when noindex is true', () => {
    renderHook(() => useSeo({ noindex: true }));
    expect(getMetaContent('name', 'robots')).toBe('noindex, nofollow');
  });

  it('sets robots index,follow when noindex is false', () => {
    renderHook(() => useSeo({ noindex: false }));
    expect(getMetaContent('name', 'robots')).toBe('index, follow');
  });

  it('sets Open Graph tags', () => {
    renderHook(() => useSeo({ title: 'Test Page', description: 'Test desc', canonical: 'https://eportal.in/test' }));
    expect(getMetaContent('property', 'og:title')).toBe('Test Page · Eportal');
    expect(getMetaContent('property', 'og:description')).toBe('Test desc');
    expect(getMetaContent('property', 'og:type')).toBe('website');
    expect(getMetaContent('property', 'og:url')).toBe('https://eportal.in/test');
  });

  it('sets canonical link', () => {
    renderHook(() => useSeo({ canonical: 'https://eportal.in/canonical' }));
    expect(getLinkHref('canonical')).toBe('https://eportal.in/canonical');
  });

  it('removes canonical when not provided', () => {
    const { rerender } = renderHook(
      ({ c }) => useSeo({ canonical: c }),
      { initialProps: { c: 'https://eportal.in/old' } },
    );
    expect(getLinkHref('canonical')).toBe('https://eportal.in/old');

    rerender({ c: undefined });
    expect(getLinkHref('canonical')).toBeNull();
  });

  it('injects JSON-LD script node', () => {
    const jsonLd = { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Eportal' };
    renderHook(() => useSeo({ jsonLd }));
    const parsed = getJsonLd();
    expect(parsed).toEqual(jsonLd);
  });

  it('updates JSON-LD when jsonLd changes', () => {
    const { rerender } = renderHook(
      ({ j }) => useSeo({ jsonLd: j }),
      { initialProps: { j: { name: 'V1' } } },
    );
    expect(getJsonLd()).toEqual({ name: 'V1' });

    rerender({ j: { name: 'V2' } });
    expect(getJsonLd()).toEqual({ name: 'V2' });
  });

  it('removes JSON-LD when jsonLd set to null', () => {
    const { rerender } = renderHook(
      ({ j }) => useSeo({ jsonLd: j }),
      { initialProps: { j: { name: 'X' } } },
    );
    expect(getJsonLd()).not.toBeNull();

    rerender({ j: null });
    expect(getJsonLd()).toBeNull();
  });
});
