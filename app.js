/* Glass Dashboard — ES5 for Chromium 47. Promise + fetch only. */
(function () {
  "use strict";
  function $(id) { return document.getElementById(id); }

  /* ---------- icons ---------- */
  var ICONS = {
    stremio: '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#6f5bd8"/><path d="M19 15l14 9-14 9z" fill="#fff"/></svg>',
    youtube: '<svg viewBox="0 0 48 48"><rect x="4" y="10" width="40" height="28" rx="8" fill="#ff0000"/><path d="M20 17l12 7-12 7z" fill="#fff"/></svg>',
    netflix: '<svg viewBox="0 0 48 48"><path d="M14 6h7l13 36V6h7v36h-7L21 6v36h-7z" fill="#e50914"/></svg>',
    spotify: '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#1db954"/><path d="M13 19c8-2 16-1 22 3M14 26c7-2 13-1 18 2M15 32c6-1 10-1 14 1" stroke="#0b2b16" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
    disney: '<svg viewBox="0 0 48 48"><text x="24" y="31" text-anchor="middle" font-size="20" font-weight="700" fill="#cfe8ff" font-family="Arial">D+</text></svg>',
    appletv: '<svg viewBox="0 0 48 48"><text x="24" y="31" text-anchor="middle" font-size="18" font-weight="600" fill="#ffffff" font-family="Arial">tv+</text></svg>',
    plex: '<svg viewBox="0 0 48 48"><path d="M14 6h9l11 18-11 18h-9l11-18z" fill="#e5a00d"/></svg>',
    tubi: '<svg viewBox="0 0 48 48"><text x="24" y="31" text-anchor="middle" font-size="16" font-weight="800" fill="#ff6a00" font-family="Arial">tubi</text></svg>'
  };
  function wIcon(code) {
    var sun = '<circle cx="24" cy="24" r="9" fill="#ffd60a"/>';
    var cloud = '<path d="M14 30a8 8 0 0 1 1-16 11 11 0 0 1 21 3 7 7 0 0 1-1 13z" fill="#cfd8e3"/>';
    if (code === 0) return '<svg viewBox="0 0 48 48">' + sun + '</svg>';
    if (code === 1 || code === 2) return '<svg viewBox="0 0 48 48"><circle cx="18" cy="18" r="8" fill="#ffd60a"/>' + cloud + '</svg>';
    if (code === 3) return '<svg viewBox="0 0 48 48">' + cloud + '</svg>';
    if (code === 45 || code === 48) return '<svg viewBox="0 0 48 48">' + cloud + '<path d="M12 36h24M16 41h16" stroke="#9fb0c3" stroke-width="3" stroke-linecap="round"/></svg>';
    if (code >= 51 && code <= 67 || code >= 80 && code <= 82) return '<svg viewBox="0 0 48 48">' + cloud + '<path d="M18 34l-2 6M26 34l-2 6M34 34l-2 6" stroke="#4aa3ff" stroke-width="3" stroke-linecap="round"/></svg>';
    if (code >= 71 && code <= 77 || code === 85 || code === 86) return '<svg viewBox="0 0 48 48">' + cloud + '<path d="M18 36h.1M26 38h.1M34 36h.1" stroke="#eaf4ff" stroke-width="4" stroke-linecap="round"/></svg>';
    if (code >= 95) return '<svg viewBox="0 0 48 48">' + cloud + '<path d="M24 32l-4 7h5l-3 7 8-9h-5l3-5z" fill="#ffd60a"/></svg>';
    return '<svg viewBox="0 0 48 48">' + cloud + '</svg>';
  }
  function wLabel(code) {
    if (code === 0) return "Clear";
    if (code === 1 || code === 2) return "Partly cloudy";
    if (code === 3) return "Overcast";
    if (code === 45 || code === 48) return "Fog";
    if (code >= 51 && code <= 57) return "Drizzle";
    if (code >= 61 && code <= 67 || code >= 80 && code <= 82) return "Rain";
    if (code >= 71 && code <= 77 || code === 85 || code === 86) return "Snow";
    if (code >= 95) return "Thunderstorm";
    return "—";
  }

  /* ---------- clock ---------- */
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function tick() {
    var d = new Date();
    var h = d.getHours();
    var ap = h >= 12 ? "PM" : "AM";
    var h12 = h % 12; if (h12 === 0) h12 = 12;
    $("time").textContent = h12 + ":" + pad(d.getMinutes());
    $("ampm").textContent = ap;
    $("date").textContent = DAYS[d.getDay()] + ", " + MONTHS[d.getMonth()] + " " + d.getDate();
  }
  tick(); setInterval(tick, 1000);

  /* ---------- toast ---------- */
  var toastTimer = null;
  function toast(msg) {
    var t = $("toast");
    t.textContent = msg; t.className = "toast";
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.className = "toast hidden"; }, 3000);
  }

  /* ---------- weather ---------- */
  function geo() {
    return fetch("https://ipwho.is/").then(function (r) { return r.json(); }).then(function (j) {
      if (j && j.latitude != null) return { lat: j.latitude, lon: j.longitude, city: j.city };
      throw new Error("no geo");
    }).catch(function () {
      return fetch("https://freeipapi.com/api/json").then(function (r) { return r.json(); }).then(function (j) {
        return { lat: j.latitude, lon: j.longitude, city: j.cityName };
      });
    });
  }
  function loadWeather() {
    geo().then(function (g) {
      $("wcity").textContent = g.city || "";
      var url = "https://api.open-meteo.com/v1/forecast?latitude=" + g.lat + "&longitude=" + g.lon +
        "&current=temperature_2m,weather_code&temperature_unit=fahrenheit";
      return fetch(url).then(function (r) { return r.json(); }).then(function (w) {
        var c = w.current || {};
        $("wtemp").innerHTML = Math.round(c.temperature_2m) + "&deg;";
        $("wcond").textContent = wLabel(c.weather_code);
        $("wicon").innerHTML = wIcon(c.weather_code);
      });
    }).catch(function () { $("wcond").textContent = "Weather unavailable"; });
  }
  loadWeather(); setInterval(loadWeather, 600000);

  /* ---------- apps ---------- */
  var APPS = [
    { name: "Stremio", id: "newslO9NqF.stremio", icon: "stremio" },
    { name: "YouTube", id: "9Ur5IzDKqV.TizenYouTube", icon: "youtube" },
    { name: "Netflix", id: "RN1MCdNq8t.Netflix", icon: "netflix" },
    { name: "Spotify", id: "rJeHak5zRg.Spotify", icon: "spotify" },
    { name: "Disney+", id: "MCmYXNxgcu.DisneyPlus", icon: "disney" },
    { name: "Apple TV+", id: "Y6A54cEa22.AppleTV", icon: "appletv" },
    { name: "Plex", id: "kIciSQlYEM.plex", icon: "plex" },
    { name: "Tubi", id: "3KA0pm7a7V.TubiTV", icon: "tubi" }
  ];
  function restLaunch(id) {
    fetch("http://127.0.0.1:8001/api/v2/applications/" + encodeURIComponent(id), { method: "POST" })
      .then(function (r) { if (!r.ok) throw new Error("http " + r.status); })
      .catch(function () { toast("Could not launch app"); });
  }
  function launchApp(id) {
    if (window.tizen && tizen.application && tizen.application.launch) {
      tizen.application.launch(id, function () { }, function () { restLaunch(id); });
    } else { restLaunch(id); }
  }
  var appEls = [];
  APPS.forEach(function (a) {
    var el = document.createElement("div");
    el.className = "tile glass";
    el.innerHTML = '<div class="ticon">' + ICONS[a.icon] + '</div><div class="tlabel">' + a.name + "</div>";
    el.addEventListener("click", function () { launchApp(a.id); });
    $("apps").appendChild(el);
    appEls.push(el);
  });

  /* ---------- stremio suggestions ---------- */
  var CINEMA = "https://v3-cinemeta.strem.io/catalog/";
  var movieEls = [], seriesEls = [];
  var currentMeta = null;
  function posterRow(container, metas, store) {
    metas.slice(0, 12).forEach(function (m) {
      var el = document.createElement("div");
      el.className = "poster";
      var img = document.createElement("img");
      img.src = m.poster; img.alt = m.name;
      var t = document.createElement("div");
      t.className = "ptitle"; t.textContent = m.name;
      el.appendChild(img); el.appendChild(t);
      el.addEventListener("click", function () { openDetail(m); });
      container.appendChild(el);
      store.push(el);
    });
  }
  function loadCatalogs() {
    Promise.all([
      fetch(CINEMA + "movie/top.json").then(function (r) { return r.json(); }),
      fetch(CINEMA + "series/top.json").then(function (r) { return r.json(); })
    ]).then(function (res) {
      posterRow($("movies"), (res[0] && res[0].metas) || [], movieEls);
      posterRow($("series"), (res[1] && res[1].metas) || [], seriesEls);
      buildRows();
      setFocus(0, 0);
    }).catch(function () { toast("Could not load Stremio suggestions"); });
  }

  /* ---------- detail overlay ---------- */
  var overlayOpen = false, overlayBtn = 0;
  function openDetail(m) {
    currentMeta = m;
    $("dposter").src = m.poster;
    $("dtitle").textContent = m.name;
    var meta = [];
    if (m.year) meta.push(m.year);
    if (m.imdbRating) meta.push('<span class="star">&#9733;</span> ' + m.imdbRating);
    if (m.genres && m.genres.length) meta.push(m.genres.join(" · "));
    $("dmeta").innerHTML = meta.join(" &nbsp;·&nbsp; ");
    $("ddesc").textContent = m.description || "";
    $("overlay").className = "overlay";
    overlayOpen = true; overlayBtn = 0;
    paintOverlayFocus();
  }
  function closeDetail() { $("overlay").className = "overlay hidden"; overlayOpen = false; setFocus(fr, fc); }
  function paintOverlayFocus() {
    $("dopen").className = "btn primary" + (overlayBtn === 0 ? " focused" : "");
    $("dclose").className = "btn" + (overlayBtn === 1 ? " focused" : "");
  }
  $("dopen").addEventListener("click", function () { launchApp("newslO9NqF.stremio"); });
  $("dclose").addEventListener("click", closeDetail);

  /* ---------- focus / remote navigation ---------- */
  var rows = [], fr = 0, fc = 0;
  function buildRows() { rows = [appEls, movieEls, seriesEls].filter(function (r) { return r.length; }); }
  function scrollIntoRow(container, el) {
    var cr = container.getBoundingClientRect(), er = el.getBoundingClientRect();
    if (er.left < cr.left) container.scrollLeft -= (cr.left - er.left) + 24;
    else if (er.right > cr.right) container.scrollLeft += (er.right - cr.right) + 24;
  }
  function setFocus(r, c) {
    if (!rows.length) return;
    r = Math.max(0, Math.min(rows.length - 1, r));
    c = Math.max(0, Math.min(rows[r].length - 1, c));
    fr = r; fc = c;
    var all = document.querySelectorAll(".focused");
    for (var i = 0; i < all.length; i++) all[i].className = all[i].className.replace(/\s*focused/g, "");
    var el = rows[r][c];
    el.className += " focused";
    if (r > 0) scrollIntoRow(el.parentNode, el);
  }
  buildRows();

  document.addEventListener("keydown", function (e) {
    var k = e.keyCode;
    if (overlayOpen) {
      if (k === 37) { overlayBtn = 0; paintOverlayFocus(); }
      else if (k === 39) { overlayBtn = 1; paintOverlayFocus(); }
      else if (k === 13) { (overlayBtn === 0 ? $("dopen") : $("dclose")).click(); }
      else if (k === 10009 || k === 8 || k === 27) { closeDetail(); }
      e.preventDefault(); return;
    }
    if (k === 37) setFocus(fr, fc - 1);
    else if (k === 39) setFocus(fr, fc + 1);
    else if (k === 38) setFocus(fr - 1, fc);
    else if (k === 40) setFocus(fr + 1, fc);
    else if (k === 13) { if (rows[fr] && rows[fr][fc]) rows[fr][fc].click(); }
    else if (k === 10009 || k === 8) { if (window.history.length > 1) window.history.back(); }
    else return;
    e.preventDefault();
  });

  loadCatalogs();
  setFocus(0, 0);
})();
