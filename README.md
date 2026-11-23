# Portfolio — websites & AI integrations for small businesses

A portfolio home page plus five working demo landing pages in different styles. Every page is responsive and switches between **English and Polish**.

| Demo | Style | Highlights |
|---|---|---|
| [`projects/shawarma-ai`](projects/shawarma-ai/) | Bold street food | **AI chat assistant** (Claude or ChatGPT), streamed replies, menu filters |
| [`projects/studio-sage`](projects/studio-sage/) | Calm, rounded, sage + beige | Design studio, soft cards, enquiry form |
| [`projects/vet-clinic`](projects/vet-clinic/) | Friendly, green + beige | Vet clinic, SVG illustration, online booking with time slots |
| [`projects/law-firm`](projects/law-firm/) | Navy + gold, serif | Law firm, animated counters, consultation form with consent |
| [`projects/medical-consulting`](projects/medical-consulting/) | Clean white + teal | Healthcare consulting, KPI dashboard hero, case studies |

All businesses are fictional. Each demo shows a small "Demo project · Back to portfolio" badge.

## Tech

- Plain HTML, CSS and JavaScript — no build step.
- `shared/i18n.js` — EN/PL switcher. Texts live in each page's `translations.js`.
- `shared/common.js` — demo badge, mobile menu, scroll animations, counters, demo forms.
- `api/chat.js` — Vercel serverless function for the AI chat. Uses the official `@anthropic-ai/sdk` and `openai` packages and streams the answer.
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

- `CLAUDE_MODEL` — default `claude-opus-5-5`. A much cheaper option for a simple FAQ bot is `claude-haiku-5-5`.
- `OPENAI_MODEL` — default `gpt-5-mini`.
- `DEFAULT_PROVIDER` — `claude` or `openai`.

Keys stay on the server and are never sent to the browser. `.env` is in `.gitignore`.

## Deploy (GitHub → Vercel)

1. Push this repository to GitHub.
2. On [vercel.com](https://vercel.com): **Add New → Project → Import** the repository. Framework preset: **Other**. No build command is needed. Click **Deploy**.
3. For real AI answers: **Project → Settings → Environment Variables**, add `ANTHROPIC_API_KEY` and/or `OPENAI_API_KEY`, then **Deployments → Redeploy**.

After that, every `git push` to `main` deploys automatically.

## Personalise

- Your name and role: `owner` in [`assets/translations.js`](assets/translations.js).
- Email, Telegram and WhatsApp: `CONTACT` at the top of [`assets/main.js`](assets/main.js).
- Package prices: `pricing.p1price` … `p3price` in [`assets/translations.js`](assets/translations.js).
