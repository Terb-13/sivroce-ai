# SIVROCE AI

Static multi-page marketing site for SIVROCE AI.

## Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Landing page and primary narrative |
| Challenge | `challenge.html` | Problem framing and operational pain points |
| Approach | `approach.html` | Methodology and how we work |
| Solutions | `solutions.html` | Product and service offerings; **interactive demos live here** |
| Proof | `proof.html` | Results, case context, and credibility |
| About | `about.html` | Team and company background |
| Engage | `engage.html` | Contact and next steps |

## Demos

Interactive demos (portal and agent experiences) are implemented as **inline JavaScript** on `solutions.html`, backed by scripts in `assets/js/` (`portal-demo.js`, `agent-demo.js`, and shared `site.js`).

## Deploy

Configured for [Vercel](https://vercel.com) with `cleanUrls` and security headers in `vercel.json`.
