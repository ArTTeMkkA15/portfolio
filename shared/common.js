/*
 * Shared behaviour for the demo landing pages:
 *  - "Demo project / back to portfolio" badge (data-home on the script tag = path to the portfolio root)
 *  - mobile navigation toggle:   <button data-nav-toggle>, closes on link click
 *  - reveal-on-scroll:           <section data-reveal>
 *  - animated counters:          <span data-count="250" data-suffix="+">0</span>
 *  - demo forms:                 <form data-demo-form> … <p data-form-status></p>
 */
(function () {
  "use strict";

  var script = document.currentScript;
  var home = (script && script.getAttribute("data-home")) || "/";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  function t(key) {
    return window.i18n ? window.i18n.t(key) : key;
  }

  ready(function () {
    // Badge -----------------------------------------------------------------
    // No badge inside the portfolio's live previews (iframes).
    var inFrame = window.self !== window.top;
    if (!inFrame && !document.querySelector("[data-no-badge]")) {
      var style = document.createElement("style");
      style.textContent =
        ".demo-badge{position:fixed;left:16px;bottom:16px;z-index:9000;display:flex;align-items:center;gap:10px;" +
        "padding:8px 14px 8px 10px;border-radius:999px;background:rgba(17,17,17,.86);color:#fff;font:500 13px/1.2 system-ui,-apple-system,'Segoe UI',sans-serif;" +
        "box-shadow:0 8px 24px rgba(0,0,0,.25);backdrop-filter:blur(6px);text-decoration:none;transition:transform .2s}" +
        ".demo-badge:hover{transform:translateY(-2px)}.demo-badge:focus-visible{outline:2px solid #fff;outline-offset:3px}" +
        ".demo-badge .dot{width:8px;height:8px;border-radius:50%;background:#7CF29C;box-shadow:0 0 0 3px rgba(124,242,156,.25)}" +
        ".demo-badge .sep{opacity:.45}@media (max-width:560px){.demo-badge .lbl{display:none}.demo-badge .sep{display:none}}";
      document.head.appendChild(style);

      var badge = document.createElement("a");
      badge.className = "demo-badge";
      badge.href = home;
      badge.innerHTML =
        '<span class="dot" aria-hidden="true"></span><span class="lbl" data-i18n="_demo">' +
        t("_demo") +
        '</span><span class="sep" aria-hidden="true">·</span><span>← <span data-i18n="_back">' +
        t("_back") +
        "</span></span>";
      document.body.appendChild(badge);
    }

    // Mobile nav ------------------------------------------------------------
    var toggle = document.querySelector("[data-nav-toggle]");
    if (toggle) {
      var header = toggle.closest("header") || document.body;
      toggle.addEventListener("click", function () {
        var open = header.classList.toggle("nav-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      header.addEventListener("click", function (e) {
        if (e.target.closest("nav a")) {
          header.classList.remove("nav-open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    }

    // Reveal on scroll -------------------------------------------------------
    var revealEls = document.querySelectorAll("[data-reveal]");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) {
        el.classList.add("is-visible");
      });
    } else {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
      revealEls.forEach(function (el) {
        io.observe(el);
      });
    }

    // Counters ---------------------------------------------------------------
    var counters = document.querySelectorAll("[data-count]");
    function runCounter(el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var suffix = el.getAttribute("data-suffix") || "";
      var decimals = (el.getAttribute("data-count").split(".")[1] || "").length;
      if (reduceMotion) {
        el.textContent = target.toFixed(decimals) + suffix;
        return;
      }
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / 1400, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if ("IntersectionObserver" in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            cio.unobserve(entry.target);
          }
        });
      });
      counters.forEach(function (el) {
        cio.observe(el);
      });
    } else {
      counters.forEach(runCounter);
    }

    // Demo forms -------------------------------------------------------------
    document.querySelectorAll("form[data-demo-form]").forEach(function (form) {
      form.setAttribute("novalidate", "");
      var status = form.querySelector("[data-form-status]");
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!form.checkValidity()) {
          form.classList.add("was-validated");
          var firstInvalid = form.querySelector(":invalid");
          if (firstInvalid) firstInvalid.focus();
          if (status) {
            status.textContent = t("_formInvalid");
            status.className = "form-status is-error";
          }
          return;
        }
        form.classList.remove("was-validated");
        form.reset();
        if (status) {
          status.textContent = t("_formSent");
          status.className = "form-status is-ok";
        }
      });
    });
  });
})();
