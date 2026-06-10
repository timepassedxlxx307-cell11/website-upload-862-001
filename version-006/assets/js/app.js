(function () {
  function $(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function $all(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupNavigation() {
    var toggle = $('[data-nav-toggle]');
    var panel = $('[data-nav-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var slider = $('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = $all('[data-hero-slide]', slider);
    var dots = $all('[data-hero-dot]', slider);
    var prev = $('[data-hero-prev]', slider);
    var next = $('[data-hero-next]', slider);
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupSearch() {
    var inputs = $all('[data-live-search]');
    if (!inputs.length) {
      return;
    }
    var cards = $all('[data-card]');
    var clearButtons = $all('[data-clear-search]');
    var regionFilter = $('[data-filter-region]');
    var typeFilter = $('[data-filter-type]');
    var genreFilter = $('[data-filter-genre]');
    var sortSelect = $('[data-sort-cards]');
    var list = $('[data-card-list]');
    var emptyState = $('[data-empty-state]');
    var activeValue = '';

    function currentInputValue() {
      return normalize(activeValue || inputs.map(function (input) { return input.value; }).join(' '));
    }

    function applyFilters() {
      var q = currentInputValue();
      var region = normalize(regionFilter && regionFilter.value);
      var type = normalize(typeFilter && typeFilter.value);
      var genre = normalize(genreFilter && genreFilter.value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search-text'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardGenre = normalize(card.getAttribute('data-genre'));
        var matched = (!q || text.indexOf(q) !== -1) &&
          (!region || cardRegion.indexOf(region) !== -1) &&
          (!type || cardType.indexOf(type) !== -1) &&
          (!genre || cardGenre.indexOf(genre) !== -1);
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    function sortCards() {
      if (!list || !sortSelect) {
        return;
      }
      var mode = sortSelect.value;
      var sorted = cards.slice();
      if (mode === 'year-desc') {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
        });
      }
      if (mode === 'title-asc') {
        sorted.sort(function (a, b) {
          return normalize(a.getAttribute('data-title')).localeCompare(normalize(b.getAttribute('data-title')), 'zh-Hans-CN');
        });
      }
      sorted.forEach(function (card) {
        list.appendChild(card);
      });
      applyFilters();
    }

    inputs.forEach(function (input) {
      input.addEventListener('input', function () {
        activeValue = input.value;
        inputs.forEach(function (peer) {
          if (peer !== input) {
            peer.value = input.value;
          }
        });
        applyFilters();
      });
    });
    clearButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeValue = '';
        inputs.forEach(function (input) {
          input.value = '';
        });
        applyFilters();
      });
    });
    [regionFilter, typeFilter, genreFilter].forEach(function (select) {
      if (select) {
        select.addEventListener('change', applyFilters);
      }
    });
    if (sortSelect) {
      sortSelect.addEventListener('change', sortCards);
    }
    applyFilters();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
    setupHero();
    setupSearch();
  });
})();
