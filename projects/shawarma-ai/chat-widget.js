// AI chat widget for Wrap Lab.
// Talks to /api/chat (Claude or OpenAI, streamed). Falls back to demo answers when no key is set.
import { demoReply } from "./demo-answers.js";

const API_URL = "/api/chat";
const MAX_HISTORY = 20;
const t = (key) => (window.i18n ? window.i18n.t(key) : key);
const lang = () => (window.i18n ? window.i18n.lang : "en");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const state = {
  open: false,
  busy: false,
  provider: "claude",
  live: { claude: false, openai: false },
  history: [], // { role, content } sent to the API
};

const root = document.createElement("div");
root.className = "chat";
root.innerHTML = `
  <button class="chat-fab" type="button" aria-expanded="false" aria-controls="chat-panel">
    <span class="chat-fab-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A1.5 1.5 0 0 1 4 14.5z"/><path d="M8.5 8.5h7M8.5 11.5h4.5"/></svg></span>
    <span class="chat-fab-label" data-i18n="chat.open">${t("chat.open")}</span>
  </button>
  <section class="chat-panel" id="chat-panel" role="dialog" aria-label="${t("chat.title")}" hidden>
    <header class="chat-head">
      <div class="chat-avatar" aria-hidden="true">WL</div>
      <div class="chat-head-text">
        <strong data-i18n="chat.title">${t("chat.title")}</strong>
        <span class="chat-status"><i></i><span data-i18n="chat.online">${t("chat.online")}</span></span>
      </div>
      <button class="chat-close" type="button" data-i18n-attr="aria-label:chat.close" aria-label="${t("chat.close")}">×</button>
    </header>
    <div class="chat-toolbar">
      <span class="chat-toolbar-label" data-i18n="chat.provider">${t("chat.provider")}</span>
      <div class="chat-provider" role="radiogroup">
        <button type="button" role="radio" data-provider="claude">Claude</button>
        <button type="button" role="radio" data-provider="openai">ChatGPT</button>
      </div>
      <span class="chat-demo" hidden data-i18n-attr="title:chat.demoTip" title="${t("chat.demoTip")}"><span data-i18n="chat.demo">${t("chat.demo")}</span></span>
    </div>
    <div class="chat-log" aria-live="polite"></div>
    <div class="chat-chips">
      <button type="button" data-i18n="chat.q1">${t("chat.q1")}</button>
      <button type="button" data-i18n="chat.q2">${t("chat.q2")}</button>
      <button type="button" data-i18n="chat.q3">${t("chat.q3")}</button>
      <button type="button" data-i18n="chat.q4">${t("chat.q4")}</button>
    </div>
    <form class="chat-form">
      <input type="text" maxlength="500" autocomplete="off" data-i18n-attr="placeholder:chat.placeholder" placeholder="${t("chat.placeholder")}" aria-label="${t("chat.placeholder")}" />
      <button type="submit" data-i18n-attr="aria-label:chat.send" aria-label="${t("chat.send")}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12l16-8-6 16-2-6z"/></svg>
      </button>
    </form>
  </section>`;
document.body.appendChild(root);

const fab = root.querySelector(".chat-fab");
const panel = root.querySelector(".chat-panel");
const log = root.querySelector(".chat-log");
const form = root.querySelector(".chat-form");
const input = form.querySelector("input");
const demoBadge = root.querySelector(".chat-demo");
const chips = root.querySelector(".chat-chips");

function addMessage(role, text = "") {
  const el = document.createElement("div");
  el.className = `msg msg-${role}`;
  el.textContent = text;
  log.appendChild(el);
  log.scrollTop = log.scrollHeight;
  return el;
}

function addTyping() {
  const el = document.createElement("div");
  el.className = "msg msg-assistant msg-typing";
  el.innerHTML = "<i></i><i></i><i></i>";
  log.appendChild(el);
  log.scrollTop = log.scrollHeight;
  return el;
}

function renderProvider() {
  // Once any real AI is connected, only show the providers that actually have a key.
  const anyLive = state.live.claude || state.live.openai;
  root.querySelectorAll("[data-provider]").forEach((btn) => {
    const active = btn.dataset.provider === state.provider;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-checked", String(active));
    btn.hidden = anyLive && !state.live[btn.dataset.provider];
  });
  demoBadge.hidden = state.live[state.provider];
}

function setOpen(open) {
  state.open = open;
  panel.hidden = !open;
  fab.setAttribute("aria-expanded", String(open));
  root.classList.toggle("is-open", open);
  if (open) {
    if (!log.children.length) addMessage("assistant", t("chat.welcome"));
    setTimeout(() => input.focus(), 50);
  }
}

// Calls onText(fullTextSoFar) for every streamed chunk. Returns null in demo mode.
async function streamFromApi(messages, onText) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider: state.provider, messages }),
  });
  if (res.status === 503) return null; // no key → demo mode
  if (res.status === 429) {
    const note = await res.text(); // too many messages from this visitor
    onText(note);
    return note;
  }
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
    if (text) onText(text);
  }
  return text;
}

async function send(text) {
  text = text.trim().slice(0, 500);
  if (!text || state.busy) return;
  state.busy = true;
  chips.hidden = true;
  addMessage("user", text);
  state.history.push({ role: "user", content: text });
  state.history = state.history.slice(-MAX_HISTORY);

  const typing = addTyping();
  let reply = null;
  try {
    if (state.live[state.provider]) {
      const bubble = document.createElement("div");
      bubble.className = "msg msg-assistant";
      reply = await streamFromApi(state.history, (soFar) => {
        if (typing.isConnected) typing.replaceWith(bubble); // first token: swap the dots for the bubble
        bubble.textContent = soFar;
        log.scrollTop = log.scrollHeight;
      });
      if (reply === null) {
        state.live[state.provider] = false;
        renderProvider();
      } else if (typing.isConnected) {
        typing.replaceWith(bubble); // empty reply
      }
    }
    if (reply === null) {
      await sleep(500 + Math.random() * 500);
      reply = demoReply(text, lang());
      typing.replaceWith(addMessage("assistant", reply));
    }
  } catch (err) {
    console.error(err);
    reply = t("chat.error");
    typing.replaceWith(addMessage("assistant", reply));
  }
  if (typing.isConnected) typing.remove();
  state.history.push({ role: "assistant", content: reply || "" });
  log.scrollTop = log.scrollHeight;
  state.busy = false;
}

fab.addEventListener("click", () => setOpen(!state.open));
root.querySelector(".chat-close").addEventListener("click", () => {
  setOpen(false);
  fab.focus();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && state.open) setOpen(false);
});
document.addEventListener("click", (e) => {
  const opener = e.target.closest("[data-open-chat]");
  if (!opener) return;
  e.preventDefault();
  setOpen(true);
  const q = opener.getAttribute("data-question-key");
  if (q) send(t(q));
});
root.querySelectorAll("[data-provider]").forEach((btn) =>
  btn.addEventListener("click", () => {
    state.provider = btn.dataset.provider;
    renderProvider();
  })
);
chips.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (btn) send(btn.textContent);
});
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = input.value;
  input.value = "";
  send(value);
});

// Ask the server which providers have keys configured.
(async () => {
  try {
    const res = await fetch(API_URL, { method: "GET" });
    if (res.ok) {
      const info = await res.json();
      state.live = { claude: Boolean(info.claude), openai: Boolean(info.openai) };
      state.provider = info.defaultProvider === "openai" ? "openai" : "claude";
      if (!state.live[state.provider] && state.live.claude !== state.live.openai) {
        state.provider = state.live.claude ? "claude" : "openai";
      }
    }
  } catch {
    // Static hosting without the API: stay in demo mode.
  }
  renderProvider();
})();
renderProvider();
