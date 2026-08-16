import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const BRAND_PATHS = ['/', '/about', '/approach', '/challenge', '/engage', '/proof', '/solutions'];
const DISALLOW_PATHS = [
  '/pages',
  '/products',
  '/serveai',
  '/cart',
  '/account',
  '/collections',
  '/policies',
  '/blogs',
  '/search',
  '/gone',
  '/contact',
  '/process',
  '/who-we-are',
  '/handoff',
  '/demos',
];

test('robots.txt allows brand pages and disallows gone paths', () => {
  const robots = readFileSync(join(root, 'robots.txt'), 'utf8');

  assert.match(robots, /^User-agent: \*$/m);
  assert.match(robots, /^Sitemap: https:\/\/www\.sirvoce\.com\/sitemap\.xml$/m);

  for (const path of BRAND_PATHS) {
    const allow = path === '/' ? 'Allow: /' : `Allow: ${path}`;
    assert.ok(robots.includes(allow), `missing ${allow}`);
  }

  for (const path of DISALLOW_PATHS) {
    assert.ok(robots.includes(`Disallow: ${path}`), `missing Disallow: ${path}`);
  }

});

test('sitemap.xml lists only the seven brand pages', () => {
  const sitemap = readFileSync(join(root, 'sitemap.xml'), 'utf8');
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const expected = BRAND_PATHS.map((path) =>
    path === '/' ? 'https://www.sirvoce.com/' : `https://www.sirvoce.com${path}`
  );

  assert.deepEqual(locs, expected);
  assert.equal(locs.length, 7);
  assert.doesNotMatch(sitemap, /\/pages|\/products|\/serveai|\/gone|\/contact|\/process/);
});
