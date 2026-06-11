/* ============================================================
   ATV ARENA — support.js
   1. Accent Switcher (A — RED / B — LIME)
   2. Menu mobilne (hamburger)
   3. Animacje "reveal" przy scrollu
   4. Galeria — system podglądu maszyn (tylko galeria.html)
   ============================================================ */

(function () {
  "use strict";

  /* ------------------------------------------------------------
     1. ACCENT SWITCHER
     Przełącza klasę .theme-lime na <body> i zapamiętuje wybór
     w localStorage, aby utrzymać go między podstronami.
  ------------------------------------------------------------ */
  var ACCENT_KEY = "atv-arena-accent";

  function applyAccent(accent) {
    var isLime = accent === "lime";
    document.body.classList.toggle("theme-lime", isLime);

    var buttons = document.querySelectorAll("[data-accent]");
    for (var i = 0; i < buttons.length; i++) {
      var isActive = buttons[i].getAttribute("data-accent") === (isLime ? "lime" : "red");
      buttons[i].classList.toggle("is-active", isActive);
      buttons[i].setAttribute("aria-pressed", isActive ? "true" : "false");
    }
  }

  function initAccentSwitcher() {
    var saved = null;
    try { saved = localStorage.getItem(ACCENT_KEY); } catch (e) { /* tryb prywatny */ }
    applyAccent(saved === "lime" ? "lime" : "red");

    document.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-accent]");
      if (!btn) return;
      var accent = btn.getAttribute("data-accent");
      applyAccent(accent);
      try { localStorage.setItem(ACCENT_KEY, accent); } catch (e) { /* ignoruj */ }
    });
  }

  /* ------------------------------------------------------------
     2. MENU MOBILNE (hamburger, < 768px)
  ------------------------------------------------------------ */
  function initMobileNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    /* Zamknij menu po kliknięciu w link (np. kotwice na stronie głównej) */
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        nav.classList.remove("is-open");
        toggle.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ------------------------------------------------------------
     3. REVEAL ON SCROLL
  ------------------------------------------------------------ */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      for (var i = 0; i < items.length; i++) items[i].classList.add("in");
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    for (var j = 0; j < items.length; j++) observer.observe(items[j]);
  }

  /* ------------------------------------------------------------
     4. GALERIA — SYSTEM PODGLĄDU MASZYN
     Dane przykładowe (DEMO). Uruchamia się tylko, jeśli na
     stronie istnieje element #viewer.
  ------------------------------------------------------------ */
  var MACHINES = [
    { id: "AA-001", name: "AA STORM 250",   cat: "ATV",      engine: "250 ccm / 4T", year: "2026", power: 17, torque: 18, weight: 168, status: "DOSTĘPNY" },
    { id: "AA-002", name: "AA HUNTER 200",  cat: "ATV",      engine: "200 ccm / 4T", year: "2026", power: 13, torque: 14, weight: 152, status: "DOSTĘPNY" },
    { id: "AA-003", name: "AA TERRAIN 450", cat: "ATV",      engine: "450 ccm / 4T", year: "2026", power: 27, torque: 32, weight: 215, status: "DOSTĘPNY" },
    { id: "AA-004", name: "AA MX 250",      cat: "MOTOCYKL", engine: "249 ccm / 4T", year: "2026", power: 28, torque: 24, weight: 108, status: "DOSTĘPNY" },
    { id: "AA-005", name: "AA ENDURO 300",  cat: "MOTOCYKL", engine: "292 ccm / 4T", year: "2026", power: 25, torque: 26, weight: 118, status: "NA ZAMÓWIENIE" },
    { id: "AA-006", name: "AA UTV 550 4X4", cat: "SSV",      engine: "546 ccm / 4T", year: "2026", power: 38, torque: 48, weight: 420, status: "DOSTĘPNY" },
    { id: "AA-007", name: "AA SIDE 800",    cat: "SSV",      engine: "800 ccm / 4T", year: "2025", power: 62, torque: 65, weight: 485, status: "NA ZAMÓWIENIE" },
    { id: "AA-008", name: "AA KIDS 110",    cat: "ATV",      engine: "107 ccm / 4T", year: "2026", power: 7,  torque: 7,  weight: 78,  status: "DOSTĘPNY" }
  ];

  /* Wartości maksymalne do pasków specyfikacji */
  var MAX = { power: 70, torque: 70, weight: 500 };

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function initViewer() {
    var viewer = document.getElementById("viewer");
    if (!viewer) return;

    var current = 0;

    var el = {
      counterCurrent: document.getElementById("viewerCurrent"),
      counterTotal: document.getElementById("viewerTotal"),
      stageId: document.getElementById("stageId"),
      stageYear: document.getElementById("stageYear"),
      stagePhoto: document.getElementById("stagePhoto"),
      stageName: document.getElementById("stageName"),
      stageStatus: document.getElementById("stageStatus"),
      specId: document.getElementById("specId"),
      specModel: document.getElementById("specModel"),
      specEngine: document.getElementById("specEngine"),
      specYear: document.getElementById("specYear"),
      specCat: document.getElementById("specCat"),
      barPower: document.getElementById("barPower"),
      barTorque: document.getElementById("barTorque"),
      barWeight: document.getElementById("barWeight"),
      valPower: document.getElementById("valPower"),
      valTorque: document.getElementById("valTorque"),
      valWeight: document.getElementById("valWeight"),
      prev: document.getElementById("btnPrev"),
      next: document.getElementById("btnNext"),
      thumbs: document.getElementById("thumbs")
    };

    function renderThumbs() {
      var html = "";
      for (var i = 0; i < MACHINES.length; i++) {
        var m = MACHINES[i];
        html +=
          '<button class="thumb" type="button" data-index="' + i + '" aria-label="Pokaż ' + m.name + '">' +
            '<div class="ph"><span class="ph__label">[ FOTO ]</span></div>' +
            '<div class="thumb__body">' +
              '<div class="thumb__meta"><span>' + m.id + "</span><span>" + m.engine.split(" ")[0] + "cc</span></div>" +
              '<div class="thumb__name">' + m.name + "</div>" +
            "</div>" +
          "</button>";
      }
      el.thumbs.innerHTML = html;
    }

    function render() {
      var m = MACHINES[current];

      el.counterCurrent.textContent = pad(current + 1);
      el.counterTotal.textContent = pad(MACHINES.length);

      el.stageId.textContent = "ID: " + m.id + " // CAM-01";
      el.stageYear.textContent = m.year + " · " + m.cat;
      el.stagePhoto.textContent = "[ ZDJĘCIE: " + m.name + " ]";
      el.stageName.textContent = m.name;
      el.stageStatus.textContent = m.status;

      el.specId.textContent = "SPECYFIKACJA // " + m.id;
      el.specModel.textContent = m.name;
      el.specEngine.textContent = m.engine;
      el.specYear.textContent = m.year;
      el.specCat.textContent = m.cat;

      el.valPower.textContent = m.power + " KM";
      el.valTorque.textContent = m.torque + " Nm";
      el.valWeight.textContent = m.weight + " kg";

      /* Reset + animacja pasków */
      el.barPower.style.width = "0%";
      el.barTorque.style.width = "0%";
      el.barWeight.style.width = "0%";
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          el.barPower.style.width = Math.round((m.power / MAX.power) * 100) + "%";
          el.barTorque.style.width = Math.round((m.torque / MAX.torque) * 100) + "%";
          el.barWeight.style.width = Math.round((m.weight / MAX.weight) * 100) + "%";
        });
      });

      /* Aktywna miniatura */
      var thumbs = el.thumbs.querySelectorAll(".thumb");
      for (var i = 0; i < thumbs.length; i++) {
        thumbs[i].classList.toggle("is-active", i === current);
      }
    }

    function goTo(index) {
      var total = MACHINES.length;
      current = ((index % total) + total) % total;
      render();
    }

    el.prev.addEventListener("click", function () { goTo(current - 1); });
    el.next.addEventListener("click", function () { goTo(current + 1); });

    el.thumbs.addEventListener("click", function (event) {
      var thumb = event.target.closest(".thumb");
      if (!thumb) return;
      goTo(parseInt(thumb.getAttribute("data-index"), 10));
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") goTo(current - 1);
      if (event.key === "ArrowRight") goTo(current + 1);
    });

    renderThumbs();
    render();
  }

  /* ------------------------------------------------------------
     START
  ------------------------------------------------------------ */
  function init() {
    initAccentSwitcher();
    initMobileNav();
    initReveal();
    initViewer();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
