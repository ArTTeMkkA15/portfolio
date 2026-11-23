/*
 * Tiny EN/PL switcher shared by every page.
 *
 * Usage:
 *   1. Define window.I18N = { en: {...}, pl: {...} } (nested keys allowed) before this script.
 *   2. Mark elements: <h1 data-i18n="hero.title"></h1>
 *      Attributes:   <input data-i18n-attr="placeholder:form.name; aria-label:form.nameLabel">
 *   3. Language buttons: <button data-set-lang="en">EN</button> <button data-set-lang="pl">PL</button>
 *
 * The choice is saved in localStorage; the first visit uses the browser language.
 * Other scripts can call window.i18n.t("key") and listen for the "langchange" event.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "portfolio-lang";
  var LANGS = ["en", "pl"];

  // Strings used by shared UI (demo badge, demo forms) on every page.
  var SHARED = {
    en: {
      _demo: "Demo project",
      _back: "Back to portfolio",
      _allProjects: "All projects",
      _demoNotice: "This is a demo website from my portfolio — the business is fictional",
      _prev: "Previous",
      _next: "Next project",
      _formSent: "Thank you! This is a demo form, so nothing was sent — but on a real site your message would land in the owner's inbox.",
      _formInvalid: "Please fill in the required fields.",
    },
    pl: {
      _demo: "Projekt demonstracyjny",
      _back: "Wróć do portfolio",
      _allProjects: "Wszystkie projekty",
      _demoNotice: "To strona demonstracyjna z mojego portfolio — firma jest fikcyjna",
      _prev: "Poprzedni",
      _next: "Następny projekt",
      _formSent: "Dziękujemy! To formularz demonstracyjny, więc nic nie zostało wysłane — na prawdziwej stronie wiadomość trafiłaby do skrzynki właściciela.",
      _formInvalid: "Uzupełnij wymagane pola.",
    },
  };

  var dict = window.I18N || {};

  function lookup(lang, key) {
    var parts = key.split(".");
    var node = dict[lang];
    for (var i = 0; i < parts.length && node != null; i++) node = node[parts[i]];
    if (node == null && SHARED[lang]) node = SHARED[lang][key];
    return node;
  }

  function detect() {
    var saved = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch (e) {}
    if (LANGS.indexOf(saved) !== -1) return saved;
    var nav = (navigator.language || "en").toLowerCase();
    return nav.indexOf("pl") === 0 ? "pl" : "en";
  }

  var current = detect();

  function t(key) {
    var v = lookup(current, key);
    if (v == null) v = lookup("en", key);
    return v == null ? key : v;
  }

  function apply(lang) {
    current = lang;
    document.documentElement.lang = lang;

    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      var v = lookup(lang, nodes[i].getAttribute("data-i18n"));
      if (v != null) nodes[i].innerHTML = v;
    }

    var attrNodes = document.querySelectorAll("[data-i18n-attr]");
    for (var j = 0; j < attrNodes.length; j++) {
      var pairs = attrNodes[j].getAttribute("data-i18n-attr").split(";");
      for (var k = 0; k < pairs.length; k++) {
        var pair = pairs[k].split(":");
        if (pair.length < 2) continue;
        var val = lookup(lang, pair[1].trim());
        if (val != null) attrNodes[j].setAttribute(pair[0].trim(), val);
      }
    }

    var buttons = document.querySelectorAll("[data-set-lang]");
    for (var b = 0; b < buttons.length; b++) {
      var active = buttons[b].getAttribute("data-set-lang") === lang;
      buttons[b].setAttribute("aria-pressed", active ? "true" : "false");
      buttons[b].classList.toggle("is-active", active);
    }

    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang: lang } }));
  }

  function set(lang) {
    if (LANGS.indexOf(lang) === -1) return;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}
    apply(lang);
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest("[data-set-lang]");
    if (btn) set(btn.getAttribute("data-set-lang"));
  });

  window.i18n = {
    t: t,
    set: set,
    get lang() {
      return current;
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      apply(current);
    });
  } else {
    apply(current);
  }
})();
