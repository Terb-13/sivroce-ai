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

Out of scope for this repo: pasting the key into Vercel and completing DNS. Do not change apex MX for this form.

Copy `.env.example` to `.env.local` for local `vercel dev`.

## Indexing

`robots.txt` allows the seven brand pages and disallows retired ServeAI / Shopify / marketing paths. `sitemap.xml` lists only `/`, `/about`, `/approach`, `/challenge`, `/engage`, `/proof`, and `/solutions`.

## Legacy URLs

Only the pages in the table above render. Leftover legal, Shopify, ServeAI, and retired marketing paths rewrite to `/api/gone` and return **410** with: “Sirvoce is now practical AI for manufacturers.” That includes `/pages/*`, `/products/*`, `/serveai`, `/gone`, `/contact`, `/process`, `/privacy`, `/terms`, and similar. Those URLs are not restored and are not turned into 404s. The 410 response also sends `X-Robots-Tag: noindex, nofollow`.

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

Configured for [Vercel](https://vercel.com) with `cleanUrls`, security headers, legacy 410 rewrites, and serverless functions in `api/`. After merge, leads stay undelivered until `RESEND_API_KEY` is set and `sirvoce.com` is verified in Resend — the form will show that failure instead of a fake thank-you.
