(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function setupLocalFilter() {
    var input = document.querySelector("[data-local-filter]");
    if (!input) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search-text") || "").toLowerCase();
        card.classList.toggle("is-hidden", query && text.indexOf(query) === -1);
      });
    });
  }

  function setupVideoPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-video-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play-button]");
      var status = player.querySelector("[data-video-status]");
      var stream = player.getAttribute("data-stream");
      var loaded = false;
      var hlsInstance = null;

      function setStatus(text) {
        if (!status) {
          return;
        }
        status.textContent = text || "";
        status.classList.toggle("is-visible", Boolean(text));
      }

      function loadStream() {
        if (loaded || !video || !stream) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              setStatus("播放暂不可用");
            }
          });
        } else {
          video.src = stream;
        }
        loaded = true;
      }

      function start() {
        if (!video) {
          return;
        }
        player.classList.add("is-active");
        setStatus("加载中...");
        loadStream();
        var promise = video.play();
        if (promise && typeof promise.then === "function") {
          promise.then(function () {
            setStatus("");
          }).catch(function () {
            setStatus("点击播放");
          });
        } else {
          setStatus("");
        }
      }

      if (button) {
        button.addEventListener("click", start);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            start();
          }
        });
        video.addEventListener("playing", function () {
          setStatus("");
        });
        video.addEventListener("error", function () {
          setStatus("播放暂不可用");
        });
      }
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  function setupSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var summary = document.querySelector("[data-search-summary]");
    var searchInput = document.getElementById("search-input");
    if (!results || !window.SITE_SEARCH) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    if (searchInput) {
      searchInput.value = query;
    }
    var normalized = query.toLowerCase();
    var items = window.SITE_SEARCH.filter(function (item) {
      if (!normalized) {
        return item.hot;
      }
      return item.text.toLowerCase().indexOf(normalized) !== -1;
    }).slice(0, normalized ? 240 : 60);
    if (summary) {
      summary.textContent = normalized ? "搜索结果：" + query : "热门内容推荐";
    }
    if (!items.length) {
      results.innerHTML = "<p class=\"empty-result\">未找到相关内容</p>";
      return;
    }
    results.innerHTML = items.map(function (item) {
      return [
        "<article class=\"movie-card movie-card-small\">",
        "<a class=\"poster-link\" href=\"" + item.url + "\">",
        "<img src=\"" + item.img + "\" alt=\"" + item.title + "\" loading=\"lazy\" decoding=\"async\" />",
        "<span class=\"poster-badge\">" + item.type + "</span>",
        "<span class=\"poster-play\">▶</span>",
        "</a>",
        "<div class=\"card-content\">",
        "<h3><a href=\"" + item.url + "\">" + item.title + "</a></h3>",
        "<p>" + item.line + "</p>",
        "<div class=\"card-meta\"><span>" + item.region + "</span><span>" + item.year + "</span></div>",
        "</div>",
        "</article>"
      ].join("");
    }).join("");
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupLocalFilter();
    setupVideoPlayers();
    setupSearchPage();
  });
})();
