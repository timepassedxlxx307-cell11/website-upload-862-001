(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-hero-tab]'));
  var activeSlide = 0;
  var slideTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });

    tabs.forEach(function (tab, tabIndex) {
      tab.classList.toggle('is-active', tabIndex === activeSlide);
    });
  }

  function scheduleSlides() {
    if (slides.length < 2) {
      return;
    }

    slideTimer = window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () {
      if (slideTimer) {
        window.clearInterval(slideTimer);
      }

      showSlide(index);
      scheduleSlides();
    });
  });

  showSlide(0);
  scheduleSlides();

  var searchInput = document.querySelector('[data-search-input]');
  var typeFilter = document.querySelector('[data-type-filter]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var emptyState = document.querySelector('[data-empty-state]');

  function normalizeText(value) {
    return String(value || '').trim().toLowerCase();
  }

  function filterCards() {
    if (!cards.length) {
      return;
    }

    var keyword = normalizeText(searchInput ? searchInput.value : '');
    var typeValue = normalizeText(typeFilter ? typeFilter.value : '');
    var yearValue = normalizeText(yearFilter ? yearFilter.value : '');
    var shown = 0;

    cards.forEach(function (card) {
      var haystack = normalizeText(card.getAttribute('data-title') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-region'));
      var cardType = normalizeText(card.getAttribute('data-type'));
      var cardYear = normalizeText(card.getAttribute('data-year'));
      var matched = true;

      if (keyword && haystack.indexOf(keyword) === -1) {
        matched = false;
      }

      if (typeValue && cardType !== typeValue) {
        matched = false;
      }

      if (yearValue && cardYear !== yearValue) {
        matched = false;
      }

      card.style.display = matched ? '' : 'none';

      if (matched) {
        shown += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', shown === 0);
    }
  }

  [searchInput, typeFilter, yearFilter].forEach(function (element) {
    if (element) {
      element.addEventListener('input', filterCards);
      element.addEventListener('change', filterCards);
    }
  });

  filterCards();

  var player = document.querySelector('[data-player]');

  if (player) {
    var video = player.querySelector('video');
    var playLayer = player.querySelector('[data-play]');
    var streamUrl = player.getAttribute('data-stream');
    var hasLoaded = false;
    var hlsInstance = null;

    function startVideo() {
      if (!video || !streamUrl) {
        return;
      }

      if (!hasLoaded) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = streamUrl;
        }

        hasLoaded = true;
      }

      player.classList.add('is-playing');
      video.controls = true;

      var playResult = video.play();

      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {});
      }
    }

    if (playLayer) {
      playLayer.addEventListener('click', startVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!hasLoaded) {
          startVideo();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
