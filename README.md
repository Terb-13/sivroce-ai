# Sirvoce AI

Multi-page marketing site for Sirvoce — a boutique AI consulting firm for mid-sized manufacturers.

## Pages

| Route | Page |
|-------|------|
| `/` | Home |
| `/challenge` | The Challenge |
| `/who-we-are` | Who We Are |
| `/process` | Our Process |
| `/proof` | Proof & interactive demos |
| `/handoff` | Handoff |
| `/contact` | Book a Workshop |

## Demos

The Proof page embeds two interactive demos with fake data:

- `/demos/customer-portal.html` — order & proof tracking portal
- `/demos/quoting-agent.html` — quoting & scheduling chat assistant

## Local development

```bash
npx serve .
```

Then open [http://localhost:3000](http://localhost:3000).

## Deploy

Configured for [Vercel](https://vercel.com) static hosting. No build command required.
