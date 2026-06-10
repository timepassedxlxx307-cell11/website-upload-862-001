(function () {
  const menuButton = document.querySelector('.mobile-menu-button');
  const mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      const opened = mobileNav.classList.toggle('open');
      document.body.classList.toggle('menu-open', opened);
      menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  const carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
    const dots = Array.from(carousel.querySelectorAll('.hero-dot'));
    let current = 0;
    let timer = null;

    function showSlide(index) {
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

    function startTimer() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        showSlide(index);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  const filterPanels = Array.from(document.querySelectorAll('.filter-panel'));
  filterPanels.forEach(function (panel) {
    const scope = panel.parentElement ? panel.parentElement.querySelector('.filter-scope') : null;
    const cards = scope ? Array.from(scope.querySelectorAll('.movie-card, .ranking-row')) : [];
    const searchInput = panel.querySelector('.movie-search');
    const typeFilter = panel.querySelector('.type-filter');
    const yearFilter = panel.querySelector('.year-filter');

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
      const keyword = normalize(searchInput ? searchInput.value : '');
      const type = normalize(typeFilter ? typeFilter.value : '');
      const year = normalize(yearFilter ? yearFilter.value : '');

      cards.forEach(function (card) {
        const text = normalize([
          card.dataset.title,
          card.dataset.genre,
          card.dataset.region,
          card.dataset.year,
          card.dataset.type
        ].join(' '));
        const cardType = normalize(card.dataset.type);
        const cardYear = normalize(card.dataset.year);
        const matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        const matchedType = !type || cardType === type;
        const matchedYear = !year || cardYear === year;
        card.classList.toggle('is-filter-hidden', !(matchedKeyword && matchedType && matchedYear));
      });
    }

    [searchInput, typeFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
  });
}());
