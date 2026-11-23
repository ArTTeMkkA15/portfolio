// ============================================================
// Your contact details — edit these three lines.
// ============================================================
var CONTACT = {
  email: "you@example.com",
  telegram: "your_username", // without @
  whatsapp: "48000000000", // country code + number, digits only
};

(function () {
  "use strict";

  // Contact links ------------------------------------------------------------
  var links = {
    email: "mailto:" + CONTACT.email,
    telegram: "https://t.me/" + CONTACT.telegram,
    whatsapp: "https://wa.me/" + CONTACT.whatsapp,
  };
  document.querySelectorAll("[data-contact]").forEach(function (a) {
    a.href = links[a.getAttribute("data-contact")];
  });

  // Contact form opens the visitor's email app with the message filled in ----
  var form = document.querySelector("[data-mailto-form]");
  var selectedPlan = "";
  document.querySelectorAll("[data-plan]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      selectedPlan = btn.getAttribute("data-plan");
      var msg = form && form.querySelector("textarea");
      if (msg && !msg.value) msg.value = (window.i18n && window.i18n.lang === "pl" ? "Pakiet: " : "Package: ") + selectedPlan + "\n";
    });
  });
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var data = new FormData(form);
      var subject = "Website enquiry — " + data.get("name");
      var body = data.get("message") + "\n\n— " + data.get("name") + " (" + data.get("contact") + ")";
      window.location.href = "mailto:" + CONTACT.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    });
  }

  // Pricing feature lists ("a|b|c" in translations) ---------------------------
  function renderLists() {
    document.querySelectorAll("[data-list]").forEach(function (ul) {
      var raw = window.i18n ? window.i18n.t(ul.getAttribute("data-list")) : "";
      ul.innerHTML = "";
      String(raw).split("|").forEach(function (item) {
        var li = document.createElement("li");
        li.textContent = item;
        ul.appendChild(li);
      });
    });
  }
  document.addEventListener("langchange", renderLists);
  renderLists();

  // Live previews: load each demo in a scaled-down iframe when it scrolls into view.
  var DESIGN_WIDTH = 1280;
  function fit(frame) {
    var box = frame.parentElement;
    var scale = box.clientWidth / DESIGN_WIDTH;
    frame.style.transform = "scale(" + scale + ")";
    frame.style.height = box.clientHeight / scale + "px";
  }
  var frames = document.querySelectorAll("iframe[data-src]");
  var load = function (frame) {
    if (!frame.src) frame.src = frame.getAttribute("data-src");
    fit(frame);
  };
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            load(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "300px" }
    );
    frames.forEach(function (f) {
      io.observe(f);
    });
  } else {
    frames.forEach(load);
  }
  window.addEventListener("resize", function () {
    frames.forEach(fit);
  });

  // Keep the previews in the same language as the portfolio.
  document.addEventListener("langchange", function (e) {
    frames.forEach(function (frame) {
      try {
        var w = frame.contentWindow;
        if (w && w.i18n && w.i18n.lang !== e.detail.lang) w.i18n.set(e.detail.lang);
      } catch (err) {}
    });
  });
})();
