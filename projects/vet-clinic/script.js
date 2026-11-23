// Booking form helpers: no past dates, 30-minute time slots, Sundays closed.
(function () {
  var date = document.querySelector("[data-min-today]");
  var time = document.querySelector("[data-time-slots]");
  if (!date || !time) return;

  var today = new Date();
  var iso = function (d) {
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  };
  date.min = iso(today);
  date.value = iso(today);

  function fillSlots() {
    var picked = date.value ? new Date(date.value + "T00:00") : today;
    var day = picked.getDay(); // 0 = Sunday, 6 = Saturday
    var open = 8, close = 20;
    if (day === 6) { open = 9; close = 15; }
    time.innerHTML = "";
    if (day === 0) {
      var closed = document.createElement("option");
      closed.value = "";
      closed.textContent = document.documentElement.lang === "pl" ? "Niedziela — nieczynne" : "Sunday — closed";
      time.appendChild(closed);
      return;
    }
    for (var h = open; h < close; h++) {
      ["00", "30"].forEach(function (m) {
        var o = document.createElement("option");
        o.textContent = h + ":" + m;
        time.appendChild(o);
      });
    }
  }

  date.addEventListener("change", fillSlots);
  document.addEventListener("langchange", fillSlots);
  fillSlots();
})();
