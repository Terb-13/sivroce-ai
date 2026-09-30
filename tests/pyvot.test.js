import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pyvot = join(root, 'pyvot');

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    if (entry === '.git' || entry === 'node_modules') continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) files.push(...walk(path));
    else files.push(path);
  }
  return files;
}

test('product catalog is one data file with the four formats', () => {
  const catalog = JSON.parse(readFileSync(join(pyvot, 'products.json'), 'utf8'));
  assert.equal(Array.isArray(catalog.products), true);
  const ids = catalog.products.map((product) => product.id);
  assert.deepEqual(ids, ['pouch', 'stickpack', 'sachet', 'rollstock']);
  const byId = Object.fromEntries(catalog.products.map((product) => [product.id, product]));
  const specIds = (product) => product.specs.map((spec) => spec.id);

  assert.deepEqual(specIds(byId.pouch), ['dimensions', 'film', 'finish', 'opening']);
  assert.deepEqual(specIds(byId.stickpack), ['dimensions', 'film', 'finish', 'opening']);
  assert.deepEqual(specIds(byId.sachet), ['dimensions', 'film', 'finish', 'opening']);
  assert.deepEqual(specIds(byId.rollstock), ['film', 'finish', 'webWidth', 'repeatLength']);

  const opening = (product) => product.specs.find((spec) => spec.id === 'opening');
  assert.ok(opening(byId.pouch).options.includes('Zipper'));
  assert.ok(opening(byId.pouch).options.includes('Tear notch'));
  assert.ok(opening(byId.stickpack).options.every((option) => !/zipper/i.test(option)));
  assert.ok(opening(byId.sachet).options.every((option) => !/zipper/i.test(option)));
  assert.equal(byId.rollstock.specs.some((spec) => spec.id === 'opening'), false);

  for (const product of catalog.products) {
    assert.equal(typeof product.name, 'string');
    assert.equal(typeof product.summary, 'string');
    assert.equal(product.shape, product.id);
    assert.ok(product.preview.width && product.preview.height && product.preview.depth);
    for (const spec of product.specs) {
      assert.equal(typeof spec.name, 'string');
      assert.ok(spec.options.length >= 2);
    }
  }
});

test('order page does not hardcode the catalog', () => {
  const orderHtml = readFileSync(join(pyvot, 'order.html'), 'utf8');
  const orderJs = readFileSync(join(pyvot, 'js', 'order.js'), 'utf8');
  assert.match(orderJs, /loadProducts\(/);
  assert.doesNotMatch(orderHtml, /Stand-up pouch|Rollstock/);
  assert.doesNotMatch(orderJs, /Stand-up pouch|Rollstock|PET\/PE|Tear notch|Web width/);
});

test('theme tokens and logo live with the demo', () => {
  const theme = readFileSync(join(pyvot, 'theme.css'), 'utf8');
  assert.match(theme, /--color-accent:\s*#ef5b2e/);
  assert.match(theme, /--font-display:\s*"Jost"/);
  assert.match(theme, /--font-body:\s*"Open Sans"/);
  const logo = readFileSync(join(pyvot, 'assets', 'logo.svg'), 'utf8');
  assert.match(logo, /<svg/i);
});

test('each step is a page with a demo label and no live-order indexing', () => {
  const pages = ['index.html', 'order.html', 'artwork.html', 'softproof.html', 'approve.html'];
  for (const page of pages) {
    const html = readFileSync(join(pyvot, page), 'utf8');
    assert.match(html, /name="robots" content="noindex, nofollow"/);
    assert.match(html, /data-shell/);
  }
  const portal = readFileSync(join(pyvot, 'js', 'portal.js'), 'utf8');
  assert.match(portal, /Demo — this is not a live ordering system/);
  assert.match(portal, /textContent = 'Demo'/);
  assert.doesNotMatch(readFileSync(join(pyvot, 'index.html'), 'utf8'), /sign up|create account/i);
});

test('handoff copy names the print partner only on the approve step', () => {
  const partner = String.fromCharCode(70, 111, 114, 116, 105, 115);
  const html = readFileSync(join(pyvot, 'approve.html'), 'utf8');
  assert.match(html, new RegExp(`Sent to ${partner} for flexible packaging production`));
  assert.match(html, /Approve and send/);

  const pattern = new RegExp(partner, 'i');
  for (const file of walk(root)) {
    if (file === join(pyvot, 'approve.html')) continue;
    if (!/\.(html|js|css|json|md|txt|xml|svg)$/.test(file)) continue;
    const text = readFileSync(file, 'utf8');
    assert.doesNotMatch(text, pattern, file);
  }
});

test('pyvot copy talks about flexible packaging, not a printed label job', () => {
  for (const file of walk(pyvot)) {
    if (file.endsWith('.svg')) continue;
    const text = readFileSync(file, 'utf8');
    assert.doesNotMatch(text, /label production/i, file);
  }
  const softproof = readFileSync(join(pyvot, 'js', 'softproof.js'), 'utf8');
  assert.match(softproof, /new THREE\.BoxGeometry\(width, height, depth\), art\)/);
  assert.match(softproof, /CylinderGeometry\(radius, radius, height, 72\)/);
});

test('robots.txt keeps the demo out of the crawl', () => {
  const robots = readFileSync(join(root, 'robots.txt'), 'utf8');
  assert.match(robots, /^Disallow: \/pyvot$/m);
});
