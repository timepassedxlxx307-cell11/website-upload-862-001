(function () {
    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupMenu() {
        var button = document.querySelector('.menu-button');
        var links = document.querySelector('.nav-links');
        if (!button || !links) {
            return;
        }
        button.addEventListener('click', function () {
            links.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        if (!slides.length || !dots.length) {
            return;
        }
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === active);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(Number(dot.getAttribute('data-slide')) || 0);
                start();
            });
        });

        start();
    }

    function setupFilters() {
        var input = document.getElementById('page-filter');
        var region = document.getElementById('region-filter');
        var type = document.getElementById('type-filter');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title][data-region][data-type]'));
        if (!cards.length || (!input && !region && !type)) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query && input) {
            input.value = query;
        }

        function apply() {
            var text = normalize(input ? input.value : '');
            var regionValue = normalize(region ? region.value : '');
            var typeValue = normalize(type ? type.value : '');

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var matchText = !text || haystack.indexOf(text) !== -1;
                var matchRegion = !regionValue || normalize(card.getAttribute('data-region')) === regionValue;
                var matchType = !typeValue || normalize(card.getAttribute('data-type')) === typeValue;
                card.classList.toggle('hidden-card', !(matchText && matchRegion && matchType));
            });
        }

        [input, region, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        apply();
    }

    window.setupMoviePlayer = function (videoId, buttonId, streamUrl) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        if (!video || !button || !streamUrl) {
            return;
        }

        var prepared = false;

        function prepare() {
            if (prepared) {
                return;
            }
            prepared = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls();
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function play() {
            prepare();
            button.classList.add('is-hidden');
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }

        button.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            button.classList.add('is-hidden');
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
