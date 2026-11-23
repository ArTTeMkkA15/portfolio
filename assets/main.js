// ============================================================
// Your public contact links. Leave a value empty ("") to hide that button.
// Where form messages go is set on the server (Vercel env vars), see README.
// ============================================================
var CONTACT = {
  email: "", // e.g. "hello@yourdomain.com"
  telegram: "", // username without @
  whatsapp: "", // country code + number, digits only, e.g. "48500100200"
};

(function () {
  "use strict";
  var t = function (k) {
    return window.i18n ? window.i18n.t(k) : k;
  };

  // Contact buttons: only the ones that are filled in are shown ----------------
  var links = {
    email: CONTACT.email && "mailto:" + CONTACT.email,
    telegram: CONTACT.telegram && "https://t.me/" + CONTACT.telegram,
    whatsapp: CONTACT.whatsapp && "https://wa.me/" + CONTACT.whatsapp,
  };
  Object.keys(links).forEach(function (key) {
    var item = document.querySelector('[data-contact-item="' + key + '"]');
    if (!item || !links[key]) return;
    item.hidden = false;
    item.querySelector("a").href = links[key];
  });

  // "Ask about this package" pre-fills the message --------------------------
  var form = document.querySelector("[data-contact-form]");
  document.querySelectorAll("[data-plan]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var msg = form && form.querySelector("textarea");
      var label = window.i18n && window.i18n.lang === "pl" ? "Pakiet: " : "Package: ";
      if (msg && !msg.value) msg.value = label + btn.getAttribute("data-plan") + "\n";
    });
  });

  // Contact form: sends through /api/contact (no email app needed) ------------
  if (form) {
    var status = form.querySelector("[data-form-status]");
    var button = form.querySelector('button[type="submit"]');
    var setStatus = function (text, kind) {
      status.textContent = text;
      status.className = "form-status" + (kind ? " is-" + kind : "");
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        var bad = form.querySelector(":invalid");
        if (bad) bad.focus();
        setStatus(t("_formInvalid"), "error");
        return;
      }
      var data = Object.fromEntries(new FormData(form).entries());
      button.disabled = true;
      setStatus(t("contact.sending"));

      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then(function (res) {
          if (res.ok) return "sent";
          if (res.status === 503) return "not-configured";
          throw new Error("HTTP " + res.status);
        })
        .then(function (result) {
          if (result === "sent") {
            form.reset();
            form.classList.remove("was-validated");
            setStatus(t("contact.sent"), "ok");
          } else if (CONTACT.email) {
            // Form delivery isn't set up yet: fall back to the visitor's email app.
            var subject = "Website enquiry — " + data.name;
            var body = data.message + "\n\n— " + data.name + " (" + data.contact + ")";
            window.location.href = "mailto:" + CONTACT.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
            setStatus("");
          } else {
            setStatus(t("contact.failed"), "error");
          }
        })
        .catch(function () {
          setStatus(t("contact.failed"), "error");
        })
        .finally(function () {
          button.disabled = false;
        });
    });
  }

  // Pricing feature lists ("a|b|c" in translations) ---------------------------
  function renderLists() {
    document.querySelectorAll("[data-list]").forEach(function (ul) {
      ul.innerHTML = "";
      String(t(ul.getAttribute("data-list"))).split("|").forEach(function (item) {
        var li = document.createElement("li");
        li.textContent = item;
        ul.appendChild(li);
      });
    });
  }
  document.addEventListener("langchange", renderLists);
  renderLists();
})();
