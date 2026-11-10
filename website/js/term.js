// Small terminal touches: tmux clock, "last login" date, 404 path.
(function () {
  var months = ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"];
  var days = ["nie", "pon", "wto", "śro", "czw", "pią", "sob"];
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  var clock = document.querySelector(".tmux .clock");
  function tick() {
    var d = new Date();
    clock.textContent = '"warsztat" ' + pad(d.getHours()) + ":" + pad(d.getMinutes()) +
      " " + pad(d.getDate()) + "-" + months[d.getMonth()] + "-" + String(d.getFullYear()).slice(2);
  }
  if (clock) { tick(); setInterval(tick, 10000); }

  var login = document.querySelector("[data-last-login]");
  if (login) {
    var d = new Date();
    login.textContent = days[d.getDay()] + " " + d.getDate() + " " + months[d.getMonth()] + " " +
      d.getFullYear() + " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
  }

  var paths = document.querySelectorAll("[data-path]");
  for (var i = 0; i < paths.length; i++) paths[i].textContent = location.pathname;
})();
