// Single source of truth for the Wrap Lab menu.
// Used by the page (menu cards), the demo chat answers and the AI system prompt (api/chat.js).

export const RESTAURANT = {
  name: "Wrap Lab",
  address: "ul. Przykładowa 12, Kraków (demo address)",
  phone: "+48 000 000 000",
  hours: {
    en: "Mon–Thu 11:00–22:00, Fri–Sat 11:00–02:00, Sun 12:00–22:00",
    pl: "pn–czw 11:00–22:00, pt–sob 11:00–02:00, nd 12:00–22:00",
    ru: "пн–чт 11:00–22:00, пт–сб 11:00–02:00, вс 12:00–22:00",
  },
  delivery: {
    en: "Own delivery within 4 km, usually 30–45 minutes. Free over 60 zł, otherwise 7 zł. Pick-up is always free.",
    pl: "Własna dostawa do 4 km, zwykle 30–45 minut. Darmowa od 60 zł, poniżej 7 zł. Odbiór osobisty zawsze za darmo.",
    ru: "Своя доставка в радиусе 4 км, обычно 30–45 минут. Бесплатно от 60 zł, иначе 7 zł. Самовывоз всегда бесплатный.",
  },
  payment: {
    en: "Card, BLIK, Apple Pay / Google Pay and cash.",
    pl: "Karta, BLIK, Apple Pay / Google Pay i gotówka.",
    ru: "Карта, BLIK, Apple Pay / Google Pay и наличные.",
  },
};

// tags: spicy | vegan | vegetarian | bestseller ; allergens use EU names
export const MENU = [
  {
    id: "classic", category: "wraps", price: 26, tags: ["bestseller"],
    name: { en: "Classic Chicken Wrap", pl: "Klasyczna z kurczakiem", ru: "Классическая с курицей" },
    desc: { en: "Marinated chicken, garlic sauce, pickles, tomato, cabbage, fries inside.", pl: "Marynowany kurczak, sos czosnkowy, ogórek kiszony, pomidor, kapusta, frytki w środku.", ru: "Маринованная курица, чесночный соус, маринованные огурцы, помидор, капуста, картошка фри внутри." },
    allergens: ["gluten", "egg", "milk"],
  },
  {
    id: "beef", category: "wraps", price: 29, tags: [],
    name: { en: "Beef Shawarma", pl: "Szawarma wołowa", ru: "Шаурма с говядиной" },
    desc: { en: "Slow-roasted beef, tahini, parsley, red onion, sumac and tomato.", pl: "Wolno pieczona wołowina, tahini, pietruszka, czerwona cebula, sumak i pomidor.", ru: "Говядина медленного запекания, тахини, петрушка, красный лук, сумах и помидор." },
    allergens: ["gluten", "sesame"],
  },
  {
    id: "harissa", category: "wraps", price: 28, tags: ["spicy"],
    name: { en: "Harissa Fire Chicken", pl: "Ostry kurczak harissa", ru: "Острая курица харисса" },
    desc: { en: "Chicken in harissa, jalapeños, chilli mayo, pickled red onion. Properly hot.", pl: "Kurczak w harissie, jalapeño, majonez chilli, marynowana czerwona cebula. Naprawdę ostra.", ru: "Курица в харисе, халапеньо, острый майонез, маринованный красный лук. По-настоящему острая." },
    allergens: ["gluten", "egg"],
  },
  {
    id: "falafel", category: "wraps", price: 24, tags: ["vegan"],
    name: { en: "Falafel Wrap", pl: "Wrap z falafelem", ru: "Ролл с фалафелем" },
    desc: { en: "Crispy falafel, hummus, tahini, pickled turnip, salad. 100% plant-based.", pl: "Chrupiący falafel, hummus, tahini, marynowana rzepa, sałata. W 100% roślinny.", ru: "Хрустящий фалафель, хумус, тахини, маринованная репа, салат. На 100% растительный." },
    allergens: ["gluten", "sesame"],
  },
  {
    id: "halloumi", category: "wraps", price: 27, tags: ["vegetarian"],
    name: { en: "Grilled Halloumi Wrap", pl: "Wrap z grillowanym halloumi", ru: "Ролл с халуми на гриле" },
    desc: { en: "Grilled halloumi, roasted peppers, mint yoghurt, rocket.", pl: "Grillowane halloumi, pieczona papryka, jogurt miętowy, rukola.", ru: "Халуми на гриле, запечённый перец, мятный йогурт, руккола." },
    allergens: ["gluten", "milk"],
  },
  {
    id: "plate", category: "plates", price: 36, tags: [],
    name: { en: "Shawarma Plate", pl: "Talerz szawarmy", ru: "Тарелка шаурмы" },
    desc: { en: "Chicken or beef with saffron rice, hummus, salad, pickles and warm pita.", pl: "Kurczak lub wołowina z ryżem szafranowym, hummusem, sałatką, piklami i ciepłą pitą.", ru: "Курица или говядина с шафрановым рисом, хумусом, салатом, соленьями и тёплой питой." },
    allergens: ["gluten", "sesame", "milk"],
  },
  {
    id: "box", category: "plates", price: 31, tags: ["bestseller"],
    name: { en: "Lab Box", pl: "Lab Box", ru: "Lab Box" },
    desc: { en: "Shawarma meat over fries with garlic and chilli sauce. Pick chicken or beef.", pl: "Mięso z szawarmy na frytkach z sosem czosnkowym i chilli. Kurczak lub wołowina.", ru: "Мясо шаурмы на картошке фри с чесночным и острым соусом. Курица или говядина." },
    allergens: ["egg", "milk"],
  },
  {
    id: "fries", category: "sides", price: 9, tags: ["vegan"],
    name: { en: "Fries with za'atar", pl: "Frytki z za'atarem", ru: "Картофель фри с затаром" },
    desc: { en: "Crispy fries with za'atar salt.", pl: "Chrupiące frytki z solą za'atar.", ru: "Хрустящий картофель фри с солью затар." },
    allergens: ["sesame"],
  },
  {
    id: "hummus", category: "sides", price: 14, tags: ["vegan"],
    name: { en: "Hummus & pita", pl: "Hummus z pitą", ru: "Хумус с питой" },
    desc: { en: "Creamy hummus, olive oil, paprika and warm pita.", pl: "Kremowy hummus, oliwa, papryka i ciepła pita.", ru: "Нежный хумус, оливковое масло, паприка и тёплая пита." },
    allergens: ["gluten", "sesame"],
  },
  {
    id: "soup", category: "sides", price: 12, tags: ["vegan"],
    name: { en: "Red lentil soup", pl: "Zupa z czerwonej soczewicy", ru: "Суп из красной чечевицы" },
    desc: { en: "Lentils, cumin and lemon. Warming and gluten-free.", pl: "Soczewica, kmin rzymski i cytryna. Rozgrzewająca i bezglutenowa.", ru: "Чечевица, кумин и лимон. Согревающий и без глютена." },
    allergens: [],
  },
  {
    id: "ayran", category: "drinks", price: 7, tags: ["vegetarian"],
    name: { en: "Ayran", pl: "Ayran", ru: "Айран" },
    desc: { en: "Salted yoghurt drink.", pl: "Słony napój jogurtowy.", ru: "Солёный йогуртовый напиток." },
    allergens: ["milk"],
  },
  {
    id: "lemonade", category: "drinks", price: 9, tags: ["vegan"],
    name: { en: "Mint lemonade", pl: "Lemoniada miętowa", ru: "Мятный лимонад" },
    desc: { en: "House lemonade with fresh mint.", pl: "Domowa lemoniada ze świeżą miętą.", ru: "Домашний лимонад со свежей мятой." },
    allergens: [],
  },
];

export const COMBO = {
  price: 12,
  en: "Lab Combo: add fries + any drink to any wrap for +12 zł.",
  pl: "Zestaw Lab: do dowolnego wrapa dobierz frytki + napój za +12 zł.",
  ru: "Комбо Lab: к любому роллу картошка фри и напиток за +12 zł.",
};

export const ALLERGEN_NAMES = {
  gluten: { en: "gluten", pl: "gluten", ru: "глютен" },
  egg: { en: "egg", pl: "jaja", ru: "яйца" },
  milk: { en: "milk", pl: "mleko", ru: "молоко" },
  sesame: { en: "sesame", pl: "sezam", ru: "кунжут" },
};

// Plain-text menu for the AI system prompt (English; the model answers in the customer's language).
export function menuAsText() {
  const lines = MENU.map((item) => {
    const tags = item.tags.length ? ` [${item.tags.join(", ")}]` : "";
    const allergens = item.allergens.length ? item.allergens.join(", ") : "none";
    return `- [EN] ${item.name.en} | [PL] ${item.name.pl} | [RU] ${item.name.ru} — ${item.price} zł${tags}. ${item.desc.en} Allergens: ${allergens}.`;
  });
  return [
    `Restaurant: ${RESTAURANT.name}, ${RESTAURANT.address}, phone ${RESTAURANT.phone}.`,
    `Opening hours: ${RESTAURANT.hours.en}.`,
    `Delivery: ${RESTAURANT.delivery.en}`,
    `Payment: ${RESTAURANT.payment.en}`,
    `Combo: ${COMBO.en}`,
    "Sauces (free): garlic, tahini (vegan), chilli, harissa (very hot). Gluten-free option: any wrap can be served as a plate with rice instead of bread.",
    "Menu:",
    ...lines,
  ].join("\n");
}
