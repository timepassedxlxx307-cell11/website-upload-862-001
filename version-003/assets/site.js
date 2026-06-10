(function () {
  var body = document.body;
  var toggle = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var current = 0;
  var heroTimer = null;

  function showHero(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  function restartHero() {
    if (heroTimer) {
      window.clearInterval(heroTimer);
    }

    if (slides.length > 1) {
      heroTimer = window.setInterval(function () {
        showHero(current + 1);
      }, 6200);
    }
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
      restartHero();
    });
  });

  if (prev) {
    prev.addEventListener('click', function () {
      showHero(current - 1);
      restartHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showHero(current + 1);
      restartHero();
    });
  }

  restartHero();

  var queryParams = new URLSearchParams(window.location.search);
  var incomingKeyword = queryParams.get('q') || '';
  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach(function (panel) {
    var root = panel.parentElement || document;
    var input = panel.querySelector('.movie-search');
    var type = panel.querySelector('.type-filter');
    var year = panel.querySelector('.year-filter');
    var region = panel.querySelector('.region-filter');
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card]'));
    var empty = root.querySelector('.empty-state');

    if (input && incomingKeyword) {
      input.value = incomingKeyword;
    }

    function filterCards() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var typeValue = type ? type.value : '';
      var yearValue = year ? year.value : '';
      var regionValue = region ? region.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }

        if (typeValue && card.getAttribute('data-type') !== typeValue) {
          matched = false;
        }

        if (yearValue && card.getAttribute('data-year') !== yearValue) {
          matched = false;
        }

        if (regionValue && card.getAttribute('data-region') !== regionValue) {
          matched = false;
        }

        card.hidden = !matched;

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, type, year, region].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });

    filterCards();
  });

  var playerShell = document.querySelector('.player-shell');
  var playerVideo = document.querySelector('.player-video');
  var playerStart = document.querySelector('.player-start');
  var hlsInstance = null;
  var playerReady = false;

  function attachStream() {
    if (!playerShell || !playerVideo || playerReady) {
      return;
    }

    var stream = playerShell.getAttribute('data-stream');

    if (!stream) {
      return;
    }

    if (playerVideo.canPlayType('application/vnd.apple.mpegurl')) {
      playerVideo.src = stream;
      playerReady = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(stream);
      hlsInstance.attachMedia(playerVideo);
      playerReady = true;
      return;
    }

    playerVideo.src = stream;
    playerReady = true;
  }

  function startPlayer() {
    if (!playerShell || !playerVideo) {
      return;
    }

    attachStream();
    playerShell.classList.add('playing');

    var playback = playerVideo.play();

    if (playback && typeof playback.catch === 'function') {
      playback.catch(function () {
        playerShell.classList.remove('playing');
      });
    }
  }

  if (playerStart) {
    playerStart.addEventListener('click', startPlayer);
  }

  if (playerVideo) {
    playerVideo.addEventListener('click', function () {
      if (playerVideo.paused) {
        startPlayer();
      }
    });

    playerVideo.addEventListener('play', function () {
      if (playerShell) {
        playerShell.classList.add('playing');
      }
    });

    playerVideo.addEventListener('pause', function () {
      if (playerShell && playerVideo.currentTime === 0) {
        playerShell.classList.remove('playing');
      }
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
