import { isHoneypot, parseLeadBody, sendLeadEmail, validateLead } from '../lib/lead.js';

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

function parseRawBody(text) {
  const trimmed = String(text || '').trim();
  if (!trimmed) return {};
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }
  return Object.fromEntries(new URLSearchParams(trimmed));
}

export async function readBody(req) {
  if (req.body != null) {
    if (Buffer.isBuffer(req.body)) return parseRawBody(req.body.toString('utf8'));
    if (typeof req.body === 'string') return parseRawBody(req.body);
    if (typeof req.body === 'object') {
      if (typeof req.body.get === 'function' && typeof req.body.entries === 'function') {
        return Object.fromEntries(req.body.entries());
      }
      return req.body;
    }
  }

  if (typeof req[Symbol.asyncIterator] === 'function') {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    if (chunks.length) return parseRawBody(Buffer.concat(chunks).toString('utf8'));
  }

  return {};
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, {
      ok: false,
      error: 'Use POST to submit a workshop request.',
    });
  }

  try {
    const lead = parseLeadBody(await readBody(req));

    if (isHoneypot(lead)) {
      return json(res, 400, {
        ok: false,
        error: 'We could not deliver your request. Please email hello@sirvoce.com and try again.',
      });
    }

    const validation = validateLead(lead);
    if (!validation.ok) {
      return json(res, 400, {
        ok: false,
        error: Object.values(validation.errors)[0],
        errors: validation.errors,
      });
    }

    await sendLeadEmail(lead, { apiKey: process.env.RESEND_API_KEY });
    return json(res, 200, { ok: true });
  } catch (err) {
    console.error('Lead submit failed:', err.code || err.message);

    if (err.code === 'NOT_CONFIGURED') {
      return json(res, 503, {
        ok: false,
        error:
          'Workshop requests are not configured on this deployment yet. Email hello@sirvoce.com directly.',
      });
    }

    return json(res, 502, {
      ok: false,
      error: 'We could not deliver your request. Please email hello@sirvoce.com and try again.',
    });
  }
}
