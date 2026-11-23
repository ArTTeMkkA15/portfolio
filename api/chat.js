// Vercel serverless function: POST /api/chat
// Body: { provider: "claude" | "openai", messages: [{ role: "user" | "assistant", content: string }] }
// Streams the assistant's reply as plain text.
// Without an API key for the chosen provider it answers 503 { demo: true } and the widget
// falls back to its built-in demo answers.
import { menuAsText } from "../projects/shawarma-ai/menu.js";

const MAX_MESSAGES = 20;
const MAX_CHARS = 500;

const SYSTEM_PROMPT = `You are the friendly online assistant of Wrap Lab, a shawarma restaurant. You answer customers' questions on the restaurant's website chat.

Rules:
- Reply in the language the customer writes in (usually English or Polish).
- Keep answers short: 1–4 sentences, or a short list when comparing dishes. Plain text, no markdown headings.
- Only talk about Wrap Lab: menu, prices, ingredients, allergens, spiciness, opening hours, delivery, payment and location. Politely steer other topics back to food.
- Use only the facts below. Never invent dishes, prices, discounts or opening hours. If something is not listed, say you are not sure and suggest calling the restaurant.
- For allergies, list the allergens from the menu and remind the customer to tell staff about severe allergies, because the kitchen handles all allergens.
- You cannot place orders or take payments in this chat. To order, the customer can call or come in.
- Be warm and a little playful, like a good cashier who loves the food.

${menuAsText()}`;

function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  let raw = "";
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

function cleanMessages(input) {
  if (!Array.isArray(input)) return null;
  const messages = input
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, MAX_CHARS) }))
    .filter((m) => m.content.length > 0)
    .slice(-MAX_MESSAGES);
  // The conversation must start with a user turn and end with one.
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") return null;
  return messages;
}

async function streamClaude(messages, res) {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const model = process.env.CLAUDE_MODEL || "claude-opus-5-5";

  const params = {
    model,
    max_tokens: 4000,
    output_config: { effort: "low" },
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages,
  };

  // Server-side fallback: if the model declines a request, the API retries on a suitable model.
  // Supported on Opus / Sonnet / Fable; Haiku has no server-side fallback.
  const useFallback = /^claude-(opus|sonnet|fable)/.test(model);
  const stream = useFallback
    ? client.beta.messages.stream({ ...params, betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" })
    : client.messages.stream(params);

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      res.write(event.delta.text);
    }
  }
  const final = await stream.finalMessage();
  if (final.stop_reason === "refusal") {
    res.write("\n\nSorry, I can't help with that one — but I'm happy to talk about our menu!");
  }
}

async function streamOpenAI(messages, res) {
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const stream = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-5-mini",
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    stream: true,
  });
  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) res.write(text);
  }
}

function friendlyError(err) {
  const status = err?.status;
  if (status === 401 || status === 403) return "The AI key is not valid. The site owner needs to check the API key settings.";
  if (status === 429) return "The assistant is very busy right now. Please try again in a minute.";
  return "The assistant is temporarily unavailable. Please try again shortly or call us.";
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    // Lets the widget know which providers are live without sending a message.
    return sendJson(res, 200, {
      claude: Boolean(process.env.ANTHROPIC_API_KEY),
      openai: Boolean(process.env.OPENAI_API_KEY),
      defaultProvider: process.env.DEFAULT_PROVIDER === "openai" ? "openai" : "claude",
    });
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  let body;
  try {
    body = await readBody(req);
  } catch {
    return sendJson(res, 400, { error: "Invalid JSON" });
  }

  const provider = body.provider === "openai" ? "openai" : "claude";
  const messages = cleanMessages(body.messages);
  if (!messages) return sendJson(res, 400, { error: "Send at least one user message." });

  const hasKey = provider === "claude" ? process.env.ANTHROPIC_API_KEY : process.env.OPENAI_API_KEY;
  if (!hasKey) return sendJson(res, 503, { demo: true, error: "No API key configured for this provider." });

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Accel-Buffering", "no");

  try {
    if (provider === "claude") await streamClaude(messages, res);
    else await streamOpenAI(messages, res);
  } catch (err) {
    console.error(`[chat] ${provider} error:`, err?.status, err?.message);
    // If part of the answer already streamed, put the notice on a new paragraph.
    res.write((res.headersSent ? "\n\n" : "") + friendlyError(err));
  }
  res.end();
}
