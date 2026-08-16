const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX = {
  name: 120,
  company: 160,
  title: 160,
  email: 254,
  phone: 40,
  bottleneck: 4000,
};

const LEAD_TO = 'hello@sirvoce.com';
const LEAD_FROM = 'Sirvoce Website <hello@sirvoce.com>';

export function trimField(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function parseLeadBody(body) {
  const source = body && typeof body === 'object' ? body : {};
  return {
    name: trimField(source.name),
    company: trimField(source.company),
    title: trimField(source.title),
    email: trimField(source.email),
    phone: trimField(source.phone),
    bottleneck: trimField(source.bottleneck),
    website: trimField(source.website),
  };
}

export function validateLead(lead) {
  const errors = {};

  if (!lead.name) errors.name = 'Name is required.';
  else if (lead.name.length > MAX.name) errors.name = 'Name is too long.';

  if (!lead.company) errors.company = 'Company is required.';
  else if (lead.company.length > MAX.company) errors.company = 'Company is too long.';

  if (!lead.title) errors.title = 'Title / role is required.';
  else if (lead.title.length > MAX.title) errors.title = 'Title / role is too long.';

  if (!lead.email) errors.email = 'Email is required.';
  else if (lead.email.length > MAX.email || !EMAIL_RE.test(lead.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (lead.phone.length > MAX.phone) errors.phone = 'Phone is too long.';

  if (!lead.bottleneck) errors.bottleneck = 'Tell us about your biggest bottleneck workflow.';
  else if (lead.bottleneck.length > MAX.bottleneck) {
    errors.bottleneck = 'Bottleneck description is too long.';
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
  };
}

export function isHoneypot(lead) {
  return Boolean(lead.website);
}

export function buildLeadEmail(lead) {
  const submittedAt = new Date().toISOString();
  const text = [
    'New Strategy Alignment Workshop request',
    '',
    `Name: ${lead.name}`,
    `Company: ${lead.company}`,
    `Title / role: ${lead.title}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone || '(not provided)'}`,
    '',
    'Biggest bottleneck workflow:',
    lead.bottleneck,
    '',
    `Submitted: ${submittedAt}`,
  ].join('\n');

  return {
    from: LEAD_FROM,
    to: [LEAD_TO],
    reply_to: lead.email,
    subject: `Workshop request — ${lead.name} at ${lead.company}`,
    text,
  };
}

export async function sendLeadEmail(lead, { apiKey, fetchImpl = fetch } = {}) {
  if (!apiKey) {
    const error = new Error('RESEND_API_KEY is not configured.');
    error.code = 'NOT_CONFIGURED';
    throw error;
  }

  const payload = buildLeadEmail(lead);
  const response = await fetchImpl('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const raw = await response.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = { message: raw };
  }

  if (!response.ok) {
    const error = new Error(data.message || 'Resend rejected the email.');
    error.code = 'DELIVERY_FAILED';
    error.status = response.status;
    throw error;
  }

  return data;
}
