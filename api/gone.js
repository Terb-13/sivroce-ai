import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let html;

function goneHtml() {
  if (!html) {
    html = readFileSync(join(process.cwd(), 'gone.html'), 'utf8');
  }
  return html;
}

export default function handler(req, res) {
  res.statusCode = 410;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.end(goneHtml());
}
