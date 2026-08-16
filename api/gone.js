import { GONE_HTML } from '../lib/gone-page.js';

export default function handler(req, res) {
  res.statusCode = 410;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.end(GONE_HTML);
}
