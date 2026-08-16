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

The `/engage` form POSTs to `/api/lead`. Success is shown only after that function accepts the request.

Required environment variable (set in the Vercel project):

```
RESEND_API_KEY
```

Create a [Resend](https://resend.com) account, verify the `sirvoce.com` domain, and add the API key for Production, Preview, and Development. The function emails `hello@sirvoce.com`. If the key is missing or delivery fails, the form shows an error and asks the visitor to email `hello@sirvoce.com` — it does not fake success.

Copy `.env.example` to `.env.local` for local `vercel dev`.

## Legacy URLs

Old Shopify process-serving paths (`/pages/*`, `/products/*`, `/serveai`, and similar) rewrite to `/api/gone` and return **410** with a short note: Sirvoce is now practical AI for manufacturers. Earlier marketing paths (`/contact`, `/process`, `/who-we-are`) redirect to the current pages.

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

Configured for [Vercel](https://vercel.com) with `cleanUrls`, security headers, legacy redirects, and serverless functions in `api/`.
