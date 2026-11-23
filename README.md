# Portfolio — websites & AI integrations for small businesses

A portfolio home page plus five working demo landing pages in different styles. Every page is responsive and switches between **English and Polish**.

| Demo | Style | Highlights |
|---|---|---|
| [`projects/shawarma-ai`](projects/shawarma-ai/) | Bold street food | **AI chat assistant** (Claude or ChatGPT), streamed replies, menu filters |
| [`projects/studio-sage`](projects/studio-sage/) | Calm, rounded, sage + beige | Design studio, soft cards, enquiry form |
| [`projects/vet-clinic`](projects/vet-clinic/) | Friendly, green + beige | Vet clinic, SVG illustration, online booking with time slots |
| [`projects/law-firm`](projects/law-firm/) | Navy + gold, serif | Law firm, animated counters, consultation form with consent |
| [`projects/medical-consulting`](projects/medical-consulting/) | Clean white + teal | Healthcare consulting, KPI dashboard hero, case studies |

All businesses are fictional. Each demo has a fixed top bar with a DEMO label, "All projects" and previous/next links.

## Tech

- Plain HTML, CSS and JavaScript — no build step.
- `shared/i18n.js` — EN/PL switcher. Texts live in each page's `translations.js`.
- `shared/common.js` — demo bar, mobile menu, scroll animations, counters, demo forms.
- `api/chat.js` — Vercel serverless function for the AI chat. Uses the official `@anthropic-ai/sdk` and `openai` packages and streams the answer.
- `api/contact.js` — delivers the home page contact form to your inbox via [Resend](https://resend.com).
- Photos live in each demo's `img/` folder. Home page project covers are screenshots of each demo's first screen (`assets/covers/`); set `COVER_MODE = "photos"` in `assets/main.js` to use the photos instead.
- `projects/shawarma-ai/menu.js` — one menu file used by the page, the demo answers and the AI system prompt.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Without API keys the chat runs in **demo mode** (keyword-based answers in EN/PL). To use real AI, copy `.env.example` to `.env` and add a key:

```bash
ANTHROPIC_API_KEY=...   # Claude
OPENAI_API_KEY=...      # ChatGPT
```

Optional settings:

- `CLAUDE_MODEL` — default `claude-haiku-5-5`, the cheapest Claude model (about $0.0004 per answer, so $5 of credit covers roughly ten thousand messages). Stronger options: `claude-sonnet-5-5`, `claude-opus-5-5`.
- Each visitor can send 15 messages per 10 minutes; history is capped at 12 messages to keep requests small.
- `OPENAI_MODEL` — default `gpt-5-mini`.
- `DEFAULT_PROVIDER` — `claude` or `openai`.

Keys stay on the server and are never sent to the browser. `.env` is in `.gitignore`.

## Deploy (GitHub → Vercel)

1. Push this repository to GitHub.
2. On [vercel.com](https://vercel.com): **Add New → Project → Import** the repository. Framework preset: **Other**. No build command is needed. Click **Deploy**.
3. For real AI answers: **Project → Settings → Environment Variables**, add `ANTHROPIC_API_KEY` and/or `OPENAI_API_KEY`, then **Deployments → Redeploy**.
4. For the contact form: create a free account at resend.com, create an API key and add `RESEND_API_KEY` and `CONTACT_TO_EMAIL` (your Resend account email) the same way, then redeploy. Until then the form shows an error, or opens the visitor's email app if you filled in `CONTACT.email`.

After that, every `git push` to `main` deploys automatically.

## Protection against abuse

The repository is public, so nothing private lives in the code:

- API keys and the inbox address (`CONTACT_TO_EMAIL`) exist only in Vercel's environment variables.
- `/api/chat` and `/api/contact` only accept requests from this site's own pages, and are rate-limited
  per visitor (chat: 15 messages / 10 min; form: 3 messages / hour) plus a daily cap for the whole site
  (`CHAT_DAILY_LIMIT`, default 300; form: 50). Shared logic: `api/_guard.js`.
- The chat's system prompt keeps the model on topic, history is capped at 12 messages and answers at 1,500 tokens.
- Use prepaid Anthropic credit with auto-reload **off** and a monthly spend limit in the Console:
  the worst case is then the credit you loaded, never a surprise bill.

## Personalise

- Name and role: `owner` in [`assets/translations.js`](assets/translations.js) (currently **ArTT**).
- Public email, Telegram and WhatsApp buttons: `CONTACT` at the top of [`assets/main.js`](assets/main.js). Empty values are hidden.
- Package prices: `pricing.p1price` … `p3price` in [`assets/translations.js`](assets/translations.js).
