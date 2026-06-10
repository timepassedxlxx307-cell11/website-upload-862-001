document.addEventListener("DOMContentLoaded", function () {
  var menuToggle = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var backToTop = document.querySelector("[data-back-to-top]");

  if (backToTop) {
    window.addEventListener("scroll", function () {
      backToTop.classList.toggle("is-visible", window.scrollY > 360);
    });

    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5600);
  }

  var queryParams = new URLSearchParams(window.location.search);
  var initialQuery = queryParams.get("q") || "";
  var filterPanels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));

  filterPanels.forEach(function (panel) {
    var input = panel.querySelector(".js-filter-input");
    var genreSelect = panel.querySelector(".js-filter-genre");
    var yearSelect = panel.querySelector(".js-filter-year");
    var regionSelect = panel.querySelector(".js-filter-region");
    var scope = panel.closest(".page-shell") || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
    var emptyState = scope.querySelector(".empty-state");

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function normalize(value) {
      return (value || "").toString().trim().toLowerCase();
    }

    function applyFilters() {
      var query = normalize(input ? input.value : "");
      var genre = normalize(genreSelect ? genreSelect.value : "");
      var year = normalize(yearSelect ? yearSelect.value : "");
      var region = normalize(regionSelect ? regionSelect.value : "");
      var visibleCount = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.dataset.title,
          card.dataset.genre,
          card.dataset.year,
          card.dataset.region,
          card.textContent
        ].join(" "));
        var matchesQuery = !query || text.indexOf(query) !== -1;
        var matchesGenre = !genre || normalize(card.dataset.genre).indexOf(genre) !== -1;
        var matchesYear = !year || normalize(card.dataset.year) === year;
        var matchesRegion = !region || normalize(card.dataset.region).indexOf(region) !== -1;
        var visible = matchesQuery && matchesGenre && matchesYear && matchesRegion;

        card.style.display = visible ? "" : "none";

        if (visible) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("is-visible", visibleCount === 0);
      }
    }

    [input, genreSelect, yearSelect, regionSelect].forEach(function (element) {
      if (element) {
        element.addEventListener("input", applyFilters);
        element.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  });
});
