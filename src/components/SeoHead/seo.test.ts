import { describe, expect, it } from 'vitest';
import { buildCanonical, buildOgImage } from './seo';

const SITE = 'https://austin.komeijyuku.com';

describe('buildCanonical', () => {
  it('keeps the root trailing slash', () => {
    expect(buildCanonical('/', SITE)).toBe('https://austin.komeijyuku.com/');
  });

  it('normalizes /index.html to the root', () => {
    expect(buildCanonical('/index.html', SITE)).toBe('https://austin.komeijyuku.com/');
  });

  it('leaves an extensionless path untouched', () => {
    expect(buildCanonical('/iaijutsu', SITE)).toBe('https://austin.komeijyuku.com/iaijutsu');
  });

  it('strips a .html extension', () => {
    expect(buildCanonical('/iaijutsu.html', SITE)).toBe('https://austin.komeijyuku.com/iaijutsu');
  });

  it('strips /index.html and the resulting trailing slash on nested paths', () => {
    expect(buildCanonical('/a/index.html', SITE)).toBe('https://austin.komeijyuku.com/a');
  });
});

describe('buildOgImage', () => {
  it('returns an absolute URL for the default when no image given', () => {
    expect(buildOgImage(undefined, '/default-ogp.png', SITE)).toBe(
      'https://austin.komeijyuku.com/default-ogp.png',
    );
  });

  it('returns an absolute URL for a provided image', () => {
    expect(buildOgImage('/custom.jpg', '/default-ogp.png', SITE)).toBe(
      'https://austin.komeijyuku.com/custom.jpg',
    );
  });
});
