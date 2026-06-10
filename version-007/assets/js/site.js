(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupCarousel() {
    var root = document.querySelector("[data-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });
    show(0);
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function setupSearch() {
    var input = document.querySelector("[data-search-input]");
    var type = document.querySelector("[data-type-filter]");
    var category = document.querySelector("[data-category-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
    if (!cards.length) {
      return;
    }
    function value(el) {
      return el ? el.value.trim().toLowerCase() : "";
    }
    function apply() {
      var q = value(input);
      var t = value(type);
      var c = value(category);
      cards.forEach(function (card) {
        var hay = (card.getAttribute("data-title") + " " + card.getAttribute("data-tags") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-year")).toLowerCase();
        var ok = true;
        if (q && hay.indexOf(q) === -1) {
          ok = false;
        }
        if (t && card.getAttribute("data-type") !== t) {
          ok = false;
        }
        if (c && card.getAttribute("data-category") !== c) {
          ok = false;
        }
        card.style.display = ok ? "" : "none";
      });
    }
    [input, type, category].forEach(function (el) {
      if (el) {
        el.addEventListener("input", apply);
        el.addEventListener("change", apply);
      }
    });
    apply();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (box) {
      var video = box.querySelector("video");
      var cover = box.querySelector(".player-cover");
      var button = box.querySelector(".play-button");
      if (!video) {
        return;
      }
      var stream = video.getAttribute("data-stream");
      var loaded = false;
      var hls;
      function load() {
        if (!stream) {
          return;
        }
        if (!loaded) {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(stream);
            hls.attachMedia(video);
          } else {
            video.src = stream;
          }
          video.controls = true;
          loaded = true;
        }
        if (cover) {
          cover.classList.add("is-hidden");
        }
        var playResult = video.play();
        if (playResult && typeof playResult.catch === "function") {
          playResult.catch(function () {});
        }
      }
      if (cover) {
        cover.addEventListener("click", load);
      }
      if (button) {
        button.addEventListener("click", function (event) {
          event.stopPropagation();
          load();
        });
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          load();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupCarousel();
    setupSearch();
    setupPlayers();
  });
})();
