import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const BRAND_PATHS = ['/', '/about', '/approach', '/challenge', '/engage', '/proof', '/solutions'];
const LEGAL_PATHS = ['/privacy', '/terms'];
const SITEMAP_PATHS = [...BRAND_PATHS, ...LEGAL_PATHS];
const DISALLOW_PATHS = [
  '/cart',
  '/account',
  '/collections',
  '/policies',
  '/blogs',
  '/search',
  '/gone',
  '/contact',
  '/who-we-are',
  '/handoff',
  '/demos',
  '/refund',
  '/shipping',
  '/legal',
];
const CRAWLABLE_GONE_PATHS = [
  '/pages',
  '/products',
  '/serveai',
  '/process',
  '/process-serving',
  '/serve',
  '/utah-process-service',
  '/standard-serve',
  '/rush-serve',
];

test('robots.txt allows brand pages and disallows gone paths', () => {
  const robots = readFileSync(join(root, 'robots.txt'), 'utf8');

  assert.match(robots, /^User-agent: \*$/m);
  assert.match(robots, /^Sitemap: https:\/\/www\.sirvoce\.com\/sitemap\.xml$/m);

  for (const path of [...BRAND_PATHS, ...LEGAL_PATHS]) {
    const allow = path === '/' ? 'Allow: /' : `Allow: ${path}`;
    assert.ok(robots.includes(allow), `missing ${allow}`);
  }

  for (const path of DISALLOW_PATHS) {
    assert.ok(robots.includes(`Disallow: ${path}`), `missing Disallow: ${path}`);
  }

  for (const path of [...CRAWLABLE_GONE_PATHS, ...LEGAL_PATHS]) {
    assert.equal(robots.includes(`Disallow: ${path}`), false, `must not Disallow: ${path}`);
  }
});

test('sitemap.xml lists brand pages plus privacy and terms', () => {
  const sitemap = readFileSync(join(root, 'sitemap.xml'), 'utf8');
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const expected = SITEMAP_PATHS.map((path) =>
    path === '/' ? 'https://www.sirvoce.com/' : `https://www.sirvoce.com${path}`
  );

  assert.deepEqual(locs, expected);
  assert.equal(locs.length, 9);
  assert.doesNotMatch(sitemap, /\/pages|\/products|\/serveai|\/gone|\/contact|\/process/);
});

test('vercel.json does not rewrite live privacy or terms to gone', () => {
  const config = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'));
  const sources = config.rewrites.map((rule) => rule.source);
  assert.equal(sources.includes('/privacy'), false);
  assert.equal(sources.includes('/terms'), false);
  assert.ok(sources.includes('/refund'));
  assert.ok(sources.includes('/pages'));
});
