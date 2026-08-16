# Sirvoce

Static marketing site for Sirvoce — practical AI for mid-sized manufacturers.

## Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Landing page and primary narrative |
| Challenge | `challenge.html` | Problem framing and operational pain points |
| Approach | `approach.html` | Methodology and how we work |
| Solutions | `solutions.html` | Product and service offerings; **interactive demos live here** |
| Proof | `proof.html` | Illustrative prototypes and live demos (not client case studies) |
| About | `about.html` | Team and company background |
| Engage | `engage.html` | Strategy Alignment Workshop request |
| Gone | `gone.html` | Note for leftover legal / process-serving URLs |

## Lead capture

The `/engage` form POSTs JSON to `/api/lead`. That function calls the Resend HTTP API and emails **hello@sirvoce.com**. The thank-you state is shown only after the function returns `{ ok: true }`. Missing configuration, validation errors, and delivery failures show an error and a `mailto:hello@sirvoce.com` fallback.

### Environment variables

| Name | Required | Used by | Notes |
|------|----------|---------|-------|
| `RESEND_API_KEY` | **Yes** (to deliver leads) | `/api/lead` | Resend secret API key. Mark **Sensitive**. |

No other environment variables are read by this site. There is no `RESEND_FROM`, CRM key, or Formspree ID.

Set `RESEND_API_KEY` in the Vercel project for **Production**, **Preview**, and **Development**.

### Resend account (outside Vercel)

These are not Vercel settings, but the function will fail honestly until they are done:

1. Create a [Resend](https://resend.com) account.
2. **Domains → Add domain → `sirvoce.com`** and complete the DNS records Resend shows.
3. Wait until the domain is **Verified**.
4. The function sends **from** `Sirvoce Website <hello@sirvoce.com>` **to** `hello@sirvoce.com`. That from-address only works after the domain is verified.

Out of scope for this repo: pasting the key into Vercel and completing DNS.

### Vercel project settings

| Setting | Required value |
|---------|----------------|
| Framework Preset | **Other** (static HTML + `/api` functions; not Next.js) |
| Root Directory | Repository root (`.`) |
| Build Command | Empty / none |
| Output Directory | Empty / none (files are served from the repo root) |
| Install Command | `npm install` is fine; there are no production dependencies |
| Node.js Version | Default (20+) |
| Environment Variables | `RESEND_API_KEY` on Production, Preview, and Development |

`vercel.json` already enables `cleanUrls`, security headers, legacy redirects, and rewrites of old process-serving paths to `/api/gone`.

Copy `.env.example` to `.env.local` for local `vercel dev`.

## Legacy URLs

Old Shopify process-serving paths (`/pages/*`, `/products/*`, `/serveai`, `/cart`, and similar) rewrite to `/api/gone` and return **410** with the heading: “Sirvoce is now practical AI for manufacturers.” Earlier marketing paths (`/contact`, `/process`, `/who-we-are`) redirect to the current pages.

## Demos

Interactive demos (portal and agent experiences) are implemented as **inline JavaScript** on `solutions.html`, backed by scripts in `assets/js/` (`portal-demo.js`, `agent-demo.js`, and shared `site.js`).

## Local development

```bash
npm test
npx vercel dev
```

Or serve the static files only (the lead API will not run):

```bash
python3 -m http.server 3000
```

## Deploy

Configured for [Vercel](https://vercel.com) with `cleanUrls`, security headers, legacy redirects, and serverless functions in `api/`. After merge, leads stay undelivered until `RESEND_API_KEY` is set and `sirvoce.com` is verified in Resend — the form will show that failure instead of a fake thank-you.
