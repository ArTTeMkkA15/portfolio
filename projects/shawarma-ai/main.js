// Menu cards + filters, rendered from menu.js so the page, the demo bot and the AI prompt never disagree.
import { MENU, ALLERGEN_NAMES } from "./menu.js";
import "./chat-widget.js";

const grid = document.querySelector("[data-menu-grid]");
const filters = document.querySelector("[data-menu-filters]");
let active = "all";

const EMOJI = { classic: "🌯", beef: "🥙", harissa: "🌶️", falafel: "🧆", halloumi: "🧀", plate: "🍛", box: "🍟", fries: "🍟", hummus: "🫓", soup: "🥣", ayran: "🥛", lemonade: "🍋" };
const TAG_KEYS = { spicy: "menu.tagSpicy", vegan: "menu.tagVegan", vegetarian: "menu.tagVegetarian", bestseller: "menu.tagBest" };

function matches(item) {
  if (active === "all") return true;
  if (active === "spicy" || active === "vegan") return item.tags.includes(active);
  return item.category === active;
}

function render() {
  const lang = window.i18n ? window.i18n.lang : "en";
  const t = (k) => (window.i18n ? window.i18n.t(k) : k);
  grid.innerHTML = "";
  MENU.filter(matches).forEach((item) => {
    const card = document.createElement("article");
    card.className = "dish";
    const tags = item.tags.map((tag) => `<span class="pill pill-${tag}">${t(TAG_KEYS[tag])}</span>`).join("");
    const allergens = item.allergens.length ? item.allergens.map((a) => ALLERGEN_NAMES[a][lang]).join(", ") : t("menu.none");
    card.innerHTML = `
      <div class="dish-art" aria-hidden="true">${EMOJI[item.id] || "🍽️"}</div>
      <div class="dish-body">
        <div class="dish-top"><h3></h3><span class="price">${item.price} zł</span></div>
        <p class="dish-desc"></p>
        <div class="dish-foot"><div class="pills">${tags}</div><small>${t("menu.allergens")}: ${allergens}</small></div>
      </div>`;
    card.querySelector("h3").textContent = item.name[lang];
    card.querySelector(".dish-desc").textContent = item.desc[lang];
    grid.appendChild(card);
  });
}

filters.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-filter]");
  if (!btn) return;
  active = btn.dataset.filter;
  filters.querySelectorAll("[data-filter]").forEach((b) => b.classList.toggle("is-active", b === btn));
  render();
});

document.addEventListener("langchange", render);
render();
