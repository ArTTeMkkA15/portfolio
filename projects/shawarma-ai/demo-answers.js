// Demo mode: keyword-based answers (EN/PL) used when no AI key is configured.
import { MENU, RESTAURANT, COMBO, ALLERGEN_NAMES } from "./menu.js";

const PL_HINT = /[ąćęłńóśźż]|\b(czy|jest|macie|ile|jak|gdzie|kiedy|dzień|cześć|hej|prosz|dzięk|polec|ostr|wegań|dostaw|otwar)/i;

// Checked in order: specific topics first, greetings last.
const INTENTS = [
  { id: "spicy", re: /(spic|hot|chil|harissa|ostr|pikant)/i },
  { id: "vegan", re: /(vegan|vege|vegetar|plant|meat.?free|without meat|weg|bez mi[ęe]s|ro[śs]linn)/i },
  { id: "allergy", re: /(allerg|alergi|alergen|gluten|\bnut|orzech|lactos|laktoz|dairy|mleko|milk|sesam|sezam|egg|jaj)/i },
  { id: "delivery", re: /(deliver|dostaw|dow[oó]z|przywie|courier|kurier|takeaway|na wynos|pick.?up|odbi[oó]r)/i },
  { id: "hours", re: /(open|close|hour|when|godzin|otwar|czynne|zamyk|kiedy)/i },
  { id: "payment", re: /(pay|card|blik|cash|p[łl]ac|p[łl]atno|kart|got[oó]wk)/i },
  { id: "where", re: /(where|address|location|gdzie|adres|lokal|dojazd)/i },
  { id: "combo", re: /(combo|deal|promo|discount|zestaw|promocj|taniej|rabat)/i },
  { id: "recommend", re: /(recommend|best|popular|suggest|what should|polec|najlep|co wzi|bestseller|hit)/i },
  { id: "menu", re: /(menu|price|cost|how much|cen|ile kosztuj|koszt|z[łl]|karta)/i },
  { id: "thanks", re: /(thank|thx|dzi[ęe]k)/i },
  { id: "greet", re: /\b(hi|hello|hey|yo|cze[śs][ćc]|hej|dzie[ńn] dobry|siema|witam)\b/i },
];

const fmt = (item, lang) => `${item.name[lang]} — ${item.price} zł`;
const list = (items, lang) => items.map((i) => "• " + fmt(i, lang)).join("\n");

function findDish(text) {
  const t = text.toLowerCase();
  return MENU.find((item) =>
    [item.id, item.name.en, item.name.pl].some((n) => {
      const key = n.toLowerCase().split(" ")[0];
      return key.length > 3 && t.includes(key);
    })
  );
}

function answer(intent, lang, text) {
  const pl = lang === "pl";
  switch (intent) {
    case "greet":
      return pl ? "Cześć! Jestem asystentem Wrap Lab. Zapytaj o menu, ostre dania, opcje wegańskie, dostawę albo godziny otwarcia." : "Hi! I'm the Wrap Lab assistant. Ask me about the menu, spicy dishes, vegan options, delivery or opening hours.";
    case "thanks":
      return pl ? "Proszę bardzo! Smacznego!" : "You're welcome! Enjoy your meal!";
    case "spicy": {
      const items = MENU.filter((i) => i.tags.includes("spicy"));
      return (pl ? "Dla fanów ostrego:\n" : "For spice lovers:\n") + list(items, lang) + (pl ? "\nMożesz też dodać do dowolnego dania sos harissa — naprawdę pali." : "\nYou can also add harissa sauce to any dish — it's properly hot.");
    }
    case "vegan": {
      const vegan = MENU.filter((i) => i.tags.includes("vegan"));
      const veg = MENU.filter((i) => i.tags.includes("vegetarian"));
      return (pl ? "Opcje wegańskie:\n" : "Vegan options:\n") + list(vegan, lang) + (pl ? "\n\nWegetariańskie:\n" : "\n\nVegetarian:\n") + list(veg, lang);
    }
    case "allergy": {
      const dish = findDish(text);
      if (dish) {
        const a = dish.allergens.map((x) => ALLERGEN_NAMES[x][lang]).join(", ");
        return pl ? `${dish.name.pl} zawiera: ${a || "brak głównych alergenów"}. Przy poważnej alergii powiedz o tym obsłudze — w kuchni pracujemy ze wszystkimi alergenami.` : `${dish.name.en} contains: ${a || "no major allergens"}. If your allergy is severe, please tell our staff — the kitchen handles all allergens.`;
      }
      const glutenFree = MENU.filter((i) => !i.allergens.includes("gluten"));
      return (pl ? "Bez glutenu:\n" : "Gluten-free:\n") + list(glutenFree, lang) + (pl ? "\nKażdy wrap możemy podać jako talerz z ryżem zamiast pity. Napisz nazwę dania, a podam jego alergeny." : "\nAny wrap can be served as a plate with rice instead of bread. Tell me a dish name and I'll list its allergens.");
    }
    case "delivery":
      return RESTAURANT.delivery[lang] + (pl ? ` Zamówienia: ${RESTAURANT.phone}.` : ` To order, call ${RESTAURANT.phone}.`);
    case "hours":
      return (pl ? "Godziny otwarcia: " : "Opening hours: ") + RESTAURANT.hours[lang] + ".";
    case "payment":
      return (pl ? "Płatności: " : "We accept: ") + RESTAURANT.payment[lang];
    case "where":
      return (pl ? "Znajdziesz nas tu: " : "You'll find us at: ") + RESTAURANT.address + ".";
    case "combo":
      return COMBO[lang];
    case "recommend": {
      const best = MENU.filter((i) => i.tags.includes("bestseller"));
      return (pl ? "Ulubione dania gości:\n" : "Our guests' favourites:\n") + list(best, lang) + (pl ? "\nZ frytkami i napojem w zestawie Lab tylko +12 zł." : "\nMake it a Lab Combo with fries and a drink for just +12 zł.");
    }
    case "menu": {
      const dish = findDish(text);
      if (dish) return `${fmt(dish, lang)}. ${dish.desc[lang]}`;
      const wraps = MENU.filter((i) => i.category === "wraps");
      return (pl ? "Nasze wrapy:\n" : "Our wraps:\n") + list(wraps, lang) + (pl ? "\nCałe menu znajdziesz na stronie powyżej." : "\nThe full menu is on the page above.");
    }
    default:
      return pl ? "Hmm, w trybie demo znam tylko podstawy. Zapytaj o menu, ceny, ostre lub wegańskie dania, alergeny, dostawę albo godziny otwarcia." : "Hmm, in demo mode I only know the basics. Ask about the menu, prices, spicy or vegan dishes, allergens, delivery or opening hours.";
  }
}

export function demoReply(text, uiLang) {
  const lang = PL_HINT.test(text) ? "pl" : uiLang === "pl" ? "pl" : "en";
  const intent = INTENTS.find((i) => i.re.test(text));
  return answer(intent ? intent.id : null, lang, text);
}
