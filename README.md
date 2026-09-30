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

The `/engage` form POSTs JSON to `/api/lead`. That function calls the AgentMail HTTP API and emails **hello@agents.sirvoce.com**. The thank-you state is shown only after the function returns `{ ok: true }`. Missing configuration, validation errors, and delivery failures show an error and a `mailto:hello@sirvoce.com` fallback.

### Environment variables

| Name | Required | Used by | Notes |
|------|----------|---------|-------|
| `AGENTMAIL_API_KEY` | **Yes** (to deliver leads) | `/api/lead` | AgentMail secret API key. Mark **Sensitive**. |
| `AGENTMAIL_INBOX_ID` | No | `/api/lead` | Sending inbox. Defaults to `hello@agents.sirvoce.com`. |

No other environment variables are read by this site. There is no Resend key, CRM key, or Formspree ID.

Set `AGENTMAIL_API_KEY` in the Vercel project for **Production**, **Preview**, and **Development**. Do not invent or commit a key.

Internal notify is sent to the AgentMail inbox only (`hello@agents.sirvoce.com`), not Google `hello@sirvoce.com`. Agents own this inbox.

Copy `.env.example` to `.env.local` for local `vercel dev`.

## Indexing

`robots.txt` allows the seven brand pages and disallows retired ServeAI / Shopify / marketing paths. `sitemap.xml` lists only `/`, `/about`, `/approach`, `/challenge`, `/engage`, `/proof`, and `/solutions`.

## Legacy URLs

Only the pages in the table above render. Leftover legal, Shopify, ServeAI, and retired marketing paths rewrite to `/api/gone` and return **410** with: “Sirvoce is now practical AI for manufacturers.” That includes `/pages/*`, `/products/*`, `/serveai`, `/gone`, `/contact`, `/process`, `/privacy`, `/terms`, and similar. Those URLs are not restored and are not turned into 404s. The 410 response also sends `X-Robots-Tag: noindex, nofollow`.

## Demos

Interactive demos (portal and agent experiences) are implemented as **inline JavaScript** on `solutions.html`, backed by scripts in `assets/js/` (`portal-demo.js`, `agent-demo.js`, and shared `site.js`).

### Pyvot packaging order demo

`/pyvot` is a separate five-step customer demo: sign in, order, artwork upload, 3D softproof, and approval. It is not a live ordering system. The product catalog is `pyvot/products.json`. Visual tokens are `pyvot/theme.css`. Brand files live in `pyvot/assets/`. Pages send `noindex` and `robots.txt` disallows `/pyvot`.

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

Configured for [Vercel](https://vercel.com) with `cleanUrls`, security headers, legacy 410 rewrites, and serverless functions in `api/`. After merge, leads stay undelivered until `AGENTMAIL_API_KEY` is set — the form will show that failure instead of a fake thank-you.
