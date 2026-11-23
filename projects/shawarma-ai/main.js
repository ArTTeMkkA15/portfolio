// Menu list + filters, rendered from menu.js so the page, the demo bot and the AI prompt never disagree.
import { MENU, ALLERGEN_NAMES } from "./menu.js";
import "./chat-widget.js";

const list = document.querySelector("[data-menu-grid]");
const filters = document.querySelector("[data-menu-filters]");
let active = "all";

const TAG_KEYS = { spicy: "menu.tagSpicy", vegan: "menu.tagVegan", vegetarian: "menu.tagVegetarian", bestseller: "menu.tagBest" };

function matches(item) {
  if (active === "all") return true;
  if (active === "spicy" || active === "vegan") return item.tags.includes(active);
  return item.category === active;
}

function render() {
  const lang = window.i18n ? window.i18n.lang : "en";
  const t = (k) => (window.i18n ? window.i18n.t(k) : k);
  list.innerHTML = "";
  MENU.filter(matches).forEach((item) => {
    const row = document.createElement("article");
    row.className = "dish";
    const tags = item.tags.map((tag) => `<span class="tag tag-${tag}">${t(TAG_KEYS[tag])}</span>`).join("");
    const allergens = item.allergens.length ? item.allergens.map((a) => ALLERGEN_NAMES[a][lang]).join(", ") : t("menu.none");
    row.innerHTML = `
      <div class="dish-top"><h3></h3><span class="dots" aria-hidden="true"></span><span class="price">${item.price} zł</span></div>
      <p class="dish-desc"></p>
      <div class="dish-meta">${tags}<span>${t("menu.allergens")}: ${allergens}</span></div>`;
    row.querySelector("h3").textContent = item.name[lang];
    row.querySelector(".dish-desc").textContent = item.desc[lang];
    list.appendChild(row);
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
