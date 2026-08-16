import { mock, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import handler from '../api/lead.js';
import goneHandler from '../api/gone.js';
import {
  buildLeadEmail,
  isHoneypot,
  parseLeadBody,
  sendLeadEmail,
  validateLead,
} from '../lib/lead.js';

const validLead = {
  name: 'Alex Rivera',
  company: 'Midsize Metals',
  title: 'VP Operations',
  email: 'alex@example.com',
  phone: '555-0100',
  bottleneck: 'Manual quoting takes three days.',
  website: '',
};

function invoke(fn, { method = 'GET', body } = {}) {
  return new Promise((resolve) => {
    const req = { method, body };
    const res = {
      statusCode: 200,
      headers: {},
      setHeader(key, value) {
        this.headers[key] = value;
      },
      end(payload) {
        resolve({
          status: this.statusCode,
          headers: this.headers,
          body: payload ? JSON.parse(payload) : null,
          raw: payload,
        });
      },
    };
    Promise.resolve(fn(req, res)).catch((err) => {
      resolve({ status: 500, error: err });
    });
  });
}

test('validateLead accepts a complete request', () => {
  const result = validateLead(validLead);
  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, {});
});

test('validateLead rejects missing and invalid fields', () => {
  const result = validateLead(parseLeadBody({ email: 'not-an-email' }));
  assert.equal(result.ok, false);
  assert.equal(result.errors.name, 'Name is required.');
  assert.equal(result.errors.email, 'Enter a valid email address.');
  assert.match(result.errors.bottleneck, /bottleneck/i);
});

test('honeypot is treated as a bot fill', () => {
  assert.equal(isHoneypot({ ...validLead, website: 'https://spam.example' }), true);
  assert.equal(isHoneypot(validLead), false);
});

test('buildLeadEmail addresses hello@sirvoce.com', () => {
  const email = buildLeadEmail(validLead);
  assert.deepEqual(email.to, ['hello@sirvoce.com']);
  assert.match(email.from, /hello@sirvoce.com/);
  assert.equal(email.reply_to, validLead.email);
  assert.match(email.text, /Manual quoting/);
});

test('sendLeadEmail fails honestly without an API key', async () => {
  await assert.rejects(() => sendLeadEmail(validLead, { apiKey: '' }), {
    code: 'NOT_CONFIGURED',
  });
});

test('sendLeadEmail posts to Resend when configured', async () => {
  const fetchImpl = mock.fn(async () => ({
    ok: true,
    status: 200,
    text: async () => JSON.stringify({ id: 'email_123' }),
  }));

  const result = await sendLeadEmail(validLead, {
    apiKey: 're_test',
    fetchImpl,
  });

  assert.equal(result.id, 'email_123');
  assert.equal(fetchImpl.mock.calls.length, 1);
  const [url, options] = fetchImpl.mock.calls[0].arguments;
  assert.equal(url, 'https://api.resend.com/emails');
  assert.equal(options.headers.Authorization, 'Bearer re_test');
  const payload = JSON.parse(options.body);
  assert.deepEqual(payload.to, ['hello@sirvoce.com']);
});

test('POST /api/lead returns 503 when Resend is not configured', async () => {
  const previous = process.env.RESEND_API_KEY;
  delete process.env.RESEND_API_KEY;

  const response = await invoke(handler, { method: 'POST', body: validLead });
  assert.equal(response.status, 503);
  assert.equal(response.body.ok, false);
  assert.match(response.body.error, /hello@sirvoce.com/);

  if (previous === undefined) delete process.env.RESEND_API_KEY;
  else process.env.RESEND_API_KEY = previous;
});

test('POST /api/lead does not claim success on validation failure', async () => {
  const response = await invoke(handler, {
    method: 'POST',
    body: { name: 'Only a name' },
  });
  assert.equal(response.status, 400);
  assert.equal(response.body.ok, false);
});

test('POST /api/lead returns 502 when Resend rejects delivery', async () => {
  const previous = process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY = 're_test';
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: false,
    status: 403,
    text: async () => JSON.stringify({ message: 'domain not verified' }),
  });

  try {
    const response = await invoke(handler, { method: 'POST', body: validLead });
    assert.equal(response.status, 502);
    assert.equal(response.body.ok, false);
    assert.match(response.body.error, /hello@sirvoce.com/);
  } finally {
    globalThis.fetch = originalFetch;
    if (previous === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = previous;
  }
});

test('POST /api/lead honeypot does not send mail', async () => {
  const previous = process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY = 're_should_not_be_used';

  const response = await invoke(handler, {
    method: 'POST',
    body: { ...validLead, website: 'http://bots.test' },
  });
  assert.equal(response.status, 200);
  assert.equal(response.body.ok, true);

  if (previous === undefined) delete process.env.RESEND_API_KEY;
  else process.env.RESEND_API_KEY = previous;
});

test('legacy process-serving handler returns 410 HTML', async () => {
  const server = createServer((req, res) => goneHandler(req, res));
  server.listen(0);
  await once(server, 'listening');
  const { port } = server.address();

  const response = await fetch(`http://127.0.0.1:${port}/pages/serveai`);
  const body = await response.text();
  server.close();

  assert.equal(response.status, 410);
  assert.match(body, /practical AI for manufacturers/i);
});
