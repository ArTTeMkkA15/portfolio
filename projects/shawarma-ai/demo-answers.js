// Demo mode: keyword-based answers (EN / PL / RU) used when the AI assistant isn't connected.
import { MENU, RESTAURANT, COMBO, ALLERGEN_NAMES } from "./menu.js?v=20261124";

const PL_HINT = /[ąćęłńóśźż]|\b(czy|jest|macie|ile|jak|gdzie|kiedy|dzień|cześć|hej|prosz|dzięk|polec|ostr|wegań|dostaw|otwar)/i;
const RU_HINT = /[а-яё]/i;

// Checked in order: specific topics first, greetings last.
const INTENTS = [
  { id: "spicy", re: /(spic|hot|chil|harissa|ostr|pikant|остр|остен|перец|чили|харис)/i },
  { id: "vegan", re: /(vegan|vege|vegetar|plant|meat.?free|without meat|weg|bez mi[ęe]s|ro[śs]linn|веган|вегет|без мяс|постн|растител)/i },
  { id: "allergy", re: /(allerg|alergi|alergen|gluten|\bnut|orzech|lactos|laktoz|dairy|mleko|milk|sesam|sezam|egg|jaj|аллерг|глютен|орех|лактоз|молок|кунжут|яйц)/i },
  { id: "delivery", re: /(deliver|dostaw|dow[oó]z|przywie|courier|kurier|takeaway|na wynos|pick.?up|odbi[oó]r|достав|привез|курьер|самовывоз|на вынос)/i },
  { id: "hours", re: /(open|close|hour|when|godzin|otwar|czynne|zamyk|kiedy|работаете|открыт|закрыва|часы|когда|до скольки)/i },
  { id: "payment", re: /(pay|card|blik|cash|p[łl]ac|p[łl]atno|kart|got[oó]wk|оплат|карт|наличн|плат)/i },
  { id: "where", re: /(where|address|location|gdzie|adres|lokal|dojazd|где|адрес|находит|добрат)/i },
  { id: "combo", re: /(combo|deal|promo|discount|zestaw|promocj|taniej|rabat|комбо|акци|скидк|набор)/i },
  { id: "recommend", re: /(recommend|best|popular|suggest|what should|polec|najlep|co wzi|bestseller|hit|посоветуй|порекоменд|лучш|популярн|что взять|вкусн)/i },
  { id: "menu", re: /(menu|price|cost|how much|cen|ile kosztuj|koszt|z[łl]|karta|меню|цен|сколько стоит|стоимост|что есть|что у вас)/i },
  { id: "thanks", re: /(thank|thx|dzi[ęe]k|спасиб|благодар)/i },
  { id: "greet", re: /(\b(hi|hello|hey|yo|cze[śs][ćc]|hej|dzie[ńn] dobry|siema|witam)\b|привет|здравств|добрый день|хай)/i },
];

const T = {
  greet: {
    en: "Hi! I'm the Wrap Lab assistant. Ask me about the menu, spicy dishes, vegan options, delivery or opening hours.",
    pl: "Cześć! Jestem asystentem Wrap Lab. Zapytaj o menu, ostre dania, opcje wegańskie, dostawę albo godziny otwarcia.",
    ru: "Привет! Я ассистент Wrap Lab. Спросите о меню, острых блюдах, веганских вариантах, доставке или часах работы.",
  },
  thanks: { en: "You're welcome! Enjoy your meal!", pl: "Proszę bardzo! Smacznego!", ru: "Пожалуйста! Приятного аппетита!" },
  spicyHead: { en: "For spice lovers:\n", pl: "Dla fanów ostrego:\n", ru: "Для любителей острого:\n" },
  spicyTail: {
    en: "\nYou can also add harissa sauce to any dish — it's properly hot.",
    pl: "\nMożesz też dodać do dowolnego dania sos harissa — naprawdę pali.",
    ru: "\nК любому блюду можно добавить соус харисса — он по-настоящему острый.",
  },
  veganHead: { en: "Vegan options:\n", pl: "Opcje wegańskie:\n", ru: "Веганские блюда:\n" },
  vegHead: { en: "\n\nVegetarian:\n", pl: "\n\nWegetariańskie:\n", ru: "\n\nВегетарианские:\n" },
  contains: { en: "contains", pl: "zawiera", ru: "содержит" },
  noAllergens: { en: "no major allergens", pl: "brak głównych alergenów", ru: "основных аллергенов нет" },
  allergyNote: {
    en: "If your allergy is severe, please tell our staff — the kitchen handles all allergens.",
    pl: "Przy poważnej alergii powiedz o tym obsłudze — w kuchni pracujemy ze wszystkimi alergenami.",
    ru: "Если аллергия серьёзная, скажите об этом персоналу — на кухне есть все аллергены.",
  },
  glutenHead: { en: "Gluten-free:\n", pl: "Bez glutenu:\n", ru: "Без глютена:\n" },
  glutenTail: {
    en: "\nAny wrap can be served as a plate with rice instead of bread. Tell me a dish name and I'll list its allergens.",
    pl: "\nKażdy wrap możemy podać jako talerz z ryżem zamiast pity. Napisz nazwę dania, a podam jego alergeny.",
    ru: "\nЛюбой ролл можем подать тарелкой с рисом вместо питы. Напишите название блюда — перечислю его аллергены.",
  },
  order: { en: " To order, call ", pl: " Zamówienia: ", ru: " Для заказа звоните: " },
  hours: { en: "Opening hours: ", pl: "Godziny otwarcia: ", ru: "Часы работы: " },
  pay: { en: "We accept: ", pl: "Płatności: ", ru: "Оплата: " },
  where: { en: "You'll find us at: ", pl: "Znajdziesz nas tu: ", ru: "Мы находимся здесь: " },
  bestHead: { en: "Our guests' favourites:\n", pl: "Ulubione dania gości:\n", ru: "Любимое у наших гостей:\n" },
  bestTail: {
    en: "\nMake it a Lab Combo with fries and a drink for just +12 zł.",
    pl: "\nZ frytkami i napojem w zestawie Lab tylko +12 zł.",
    ru: "\nС картошкой фри и напитком в комбо Lab — всего +12 zł.",
  },
  wrapsHead: { en: "Our wraps:\n", pl: "Nasze wrapy:\n", ru: "Наши роллы:\n" },
  wrapsTail: { en: "\nThe full menu is on the page above.", pl: "\nCałe menu znajdziesz na stronie powyżej.", ru: "\nПолное меню — на странице выше." },
  fallback: {
    en: "Hmm, in demo mode I only know the basics. Ask about the menu, prices, spicy or vegan dishes, allergens, delivery or opening hours.",
    pl: "Hmm, w trybie demo znam tylko podstawy. Zapytaj o menu, ceny, ostre lub wegańskie dania, alergeny, dostawę albo godziny otwarcia.",
    ru: "Хм, в демо-режиме я знаю только основное. Спросите о меню, ценах, острых или веганских блюдах, аллергенах, доставке или часах работы.",
  },
};

const fmt = (item, lang) => `${item.name[lang]} — ${item.price} zł`;
const list = (items, lang) => items.map((i) => "• " + fmt(i, lang)).join("\n");

function findDish(text) {
  const t = text.toLowerCase();
  return MENU.find((item) =>
    [item.id, item.name.en, item.name.pl, item.name.ru].some((n) => {
      const words = n.toLowerCase().split(" ").filter((w) => w.length > 3);
      return words.some((w) => t.includes(w.slice(0, Math.max(4, w.length - 2))));
    })
  );
}

function answer(intent, lang, text) {
  switch (intent) {
    case "greet":
    case "thanks":
      return T[intent][lang];
    case "spicy":
      return T.spicyHead[lang] + list(MENU.filter((i) => i.tags.includes("spicy")), lang) + T.spicyTail[lang];
    case "vegan":
      return T.veganHead[lang] + list(MENU.filter((i) => i.tags.includes("vegan")), lang) + T.vegHead[lang] + list(MENU.filter((i) => i.tags.includes("vegetarian")), lang);
    case "allergy": {
      const dish = findDish(text);
      if (dish) {
        const a = dish.allergens.map((x) => ALLERGEN_NAMES[x][lang]).join(", ");
        return `${dish.name[lang]} ${T.contains[lang]}: ${a || T.noAllergens[lang]}. ${T.allergyNote[lang]}`;
      }
      return T.glutenHead[lang] + list(MENU.filter((i) => !i.allergens.includes("gluten")), lang) + T.glutenTail[lang];
    }
    case "delivery":
      return RESTAURANT.delivery[lang] + T.order[lang] + RESTAURANT.phone + ".";
    case "hours":
      return T.hours[lang] + RESTAURANT.hours[lang] + ".";
    case "payment":
      return T.pay[lang] + RESTAURANT.payment[lang];
    case "where":
      return T.where[lang] + RESTAURANT.address + ".";
    case "combo":
      return COMBO[lang];
    case "recommend":
      return T.bestHead[lang] + list(MENU.filter((i) => i.tags.includes("bestseller")), lang) + T.bestTail[lang];
    case "menu": {
      const dish = findDish(text);
      if (dish) return `${fmt(dish, lang)}. ${dish.desc[lang]}`;
      return T.wrapsHead[lang] + list(MENU.filter((i) => i.category === "wraps"), lang) + T.wrapsTail[lang];
    }
    default:
      return T.fallback[lang];
  }
}

export function demoReply(text, uiLang) {
  const lang = RU_HINT.test(text) ? "ru" : PL_HINT.test(text) ? "pl" : ["pl", "ru"].includes(uiLang) ? uiLang : "en";
  const intent = INTENTS.find((i) => i.re.test(text));
  return answer(intent ? intent.id : null, lang, text);
}
