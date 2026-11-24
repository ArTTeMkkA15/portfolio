/*
 * Shared behaviour for the demo landing pages:
 *  - portfolio navigation: fixed demo bar on top (all projects / DEMO label / prev / next)
 *    (data-home on the script tag = path to the portfolio root)
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
    // Portfolio navigation: fixed demo bar at the top of every demo page --------
    // Always visible, so visitors know this is a portfolio demo and can get back.
    // Not shown on the portfolio itself or inside its live previews (iframes).
    // "?preview" in the URL hides it too (used to take the cover screenshots).
    var inFrame = window.self !== window.top;
    var preview = /[?&]preview\b/.test(location.search);
    if (!inFrame && !preview && !document.querySelector("[data-no-badge]")) {
      // Same order as the project grid on the portfolio home page.
      var PROJECTS = [
        { slug: "shawarma-ai", name: "Wrap Lab" },
        { slug: "studio-sage", name: "Sage & Linen" },
        { slug: "vet-clinic", name: "Paws & Meadow" },
        { slug: "law-firm", name: "Aldermont Legal" },
        { slug: "medical-consulting", name: "Clarity Health" },
      ];
      var hub = home + "#work";
      var index = -1;
      PROJECTS.forEach(function (p, i) {
        if (location.pathname.indexOf("/" + p.slug + "/") !== -1) index = i;
      });
      var esc = function (s) {
        return s.replace(/&/g, "&amp;");
      };

      var style = document.createElement("style");
      style.textContent =
        ":root{--demo-bar-h:48px}" +
        // Make room for the fixed bar: push the page and the sites' sticky headers down.
        "body{padding-top:var(--demo-bar-h)}.site-header{top:var(--demo-bar-h)}" +
        "html{scroll-padding-top:calc(var(--demo-bar-h) + 80px)}" +
        ".demo-bar{position:fixed;top:0;left:0;right:0;z-index:9050;height:var(--demo-bar-h);display:flex;align-items:center;gap:12px;padding:0 12px;" +
        "background:#0d0d10;color:#fff;font:500 13px/1.2 system-ui,-apple-system,'Segoe UI',sans-serif;box-shadow:0 2px 14px rgba(0,0,0,.25)}" +
        ".demo-bar a{color:#fff;text-decoration:none;display:inline-flex;align-items:center;gap:8px;border-radius:999px;white-space:nowrap}" +
        ".demo-bar a:focus-visible{outline:2px solid #fff;outline-offset:2px}" +
        ".demo-bar .db-home{padding:8px 16px 8px 12px;font-weight:700;font-size:13.5px;background:#e8572a;" +
        "transition:background .2s}" +
        ".demo-bar .db-home:hover{background:#cf4519}" +
        ".demo-bar .db-arrow{display:grid;place-items:center;width:20px;height:20px;border-radius:50%;background:rgba(255,255,255,.22);font-size:13px}" +
        ".demo-bar .db-chip{flex:none;font-weight:800;font-size:11px;letter-spacing:.12em;color:#111;background:#ffd84d;padding:4px 8px;border-radius:6px}" +
        ".demo-bar .db-note{flex:1;min-width:0;opacity:.75;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
        ".demo-bar .db-note b{color:#fff;font-weight:600}" +
        ".demo-bar .db-nav{display:flex;gap:4px;flex:none}" +
        ".demo-bar .db-nav a{min-width:40px;min-height:34px;justify-content:center;padding:7px 12px;font-size:13px;transition:background .2s}" +
        ".demo-bar .db-nav a:hover{background:rgba(255,255,255,.12)}" +
        "@media (max-width:860px){.demo-bar .db-label{display:none}}" +
        "@media (max-width:640px){.demo-bar .db-note{display:none}.demo-bar .db-chip{margin-right:auto}}";
      document.head.appendChild(style);

      var bar = document.createElement("nav");
      bar.className = "demo-bar";
      bar.setAttribute("aria-label", "Portfolio");
      var html =
        '<a class="db-home" href="' + hub + '"><span class="db-arrow" aria-hidden="true">←</span><span data-i18n="_allProjects">' + t("_allProjects") + "</span></a>" +
        '<span class="db-chip">DEMO</span>' +
        '<span class="db-note"><span data-i18n="_demoNotice">' + t("_demoNotice") + "</span>" +
        (index !== -1 ? " · <b>" + esc(PROJECTS[index].name) + "</b>" : "") +
        "</span>";
      if (index !== -1) {
        var prev = PROJECTS[(index - 1 + PROJECTS.length) % PROJECTS.length];
        var next = PROJECTS[(index + 1) % PROJECTS.length];
        html +=
          '<span class="db-nav">' +
          '<a href="' + home + "projects/" + prev.slug + '/" title="' + esc(prev.name) + '">‹ <span class="db-label" data-i18n="_prev">' + t("_prev") + "</span></a>" +
          '<a href="' + home + "projects/" + next.slug + '/" title="' + esc(next.name) + '"><span class="db-label" data-i18n="_next">' + t("_next") + "</span> ›</a>" +
          "</span>";
      }
      bar.innerHTML = html;
      document.body.insertBefore(bar, document.body.firstChild);
    }

    // Demo buttons ---------------------------------------------------------
    // On demo pages, buttons that would act in the real world (call, email, open a
    // sub-page...) are placeholders: they show a short note instead of doing anything.
    // Mark extra ones with data-stub. Navigation inside the page keeps working.
    if (!document.querySelector("[data-no-badge]")) {
      var toastStyle = document.createElement("style");
      toastStyle.textContent =
        ".demo-toast{position:fixed;left:50%;bottom:24px;z-index:9200;max-width:min(440px,calc(100vw - 32px));transform:translate(-50%,16px);opacity:0;" +
        "padding:12px 18px;border-radius:12px;background:#111;color:#fff;font:500 14px/1.45 system-ui,-apple-system,'Segoe UI',sans-serif;" +
        "box-shadow:0 14px 34px rgba(0,0,0,.3);pointer-events:none;transition:opacity .25s,transform .25s;text-align:center}" +
        ".demo-toast.is-shown{opacity:1;transform:translate(-50%,0)}";
      document.head.appendChild(toastStyle);
      var toast = document.createElement("div");
      toast.className = "demo-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
      var toastTimer;
      document.addEventListener("click", function (e) {
        var el = e.target.closest && e.target.closest('a[href^="tel:"], a[href^="mailto:"], [data-stub]');
        if (!el || el.closest(".demo-bar")) return;
        e.preventDefault();
        toast.textContent = t("_stub");
        toast.classList.add("is-shown");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () {
          toast.classList.remove("is-shown");
        }, 3200);
      });
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

    // Smooth accordions (<details>) ------------------------------------------
    // Animates the height of one element plus opacity/transform of its content,
    // can be re-clicked mid-animation, and is skipped for prefers-reduced-motion.
    document.querySelectorAll("details").forEach(function (d) {
      var summary = d.querySelector("summary");
      if (!summary || reduceMotion || !d.animate) return;
      var anim = null;
      var closing = false;
      function heightWhen(open) {
        var was = d.open;
        d.open = open;
        var h = d.offsetHeight;
        d.open = was;
        return h;
      }
      summary.addEventListener("click", function (e) {
        e.preventDefault();
        var start = d.offsetHeight; // current height, even mid-animation
        if (anim) anim.cancel();
        var wantOpen = closing || !d.open;
        d.open = true;
        var end = heightWhen(wantOpen);
        closing = !wantOpen;
        d.classList.toggle("is-closing", closing);
        d.style.overflow = "hidden";
        var timing = { duration: 340, easing: "cubic-bezier(0.22, 0.7, 0.2, 1)" };
        var current = (anim = d.animate({ height: [start + "px", end + "px"] }, timing));
        Array.prototype.forEach.call(d.children, function (child) {
          if (child === summary) return;
          child.animate(
            wantOpen
              ? { opacity: [0, 1], transform: ["translateY(-6px)", "none"] }
              : { opacity: [1, 0], transform: ["none", "translateY(-6px)"] },
            { duration: wantOpen ? 340 : 200, easing: "ease-out", fill: "none" }
          );
        });
        current.finished.then(
          function () {
            if (anim !== current) return; // a newer click took over
            anim = null;
            closing = false;
            d.open = wantOpen;
            d.classList.remove("is-closing");
            d.style.overflow = "";
          },
          function () {} // cancelled by a newer click
        );
      });
    });

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
