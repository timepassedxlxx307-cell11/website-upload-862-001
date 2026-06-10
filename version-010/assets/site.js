(function () {
    "use strict";

    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var button = document.querySelector(".menu-toggle");
        var menu = document.querySelector(".mobile-nav");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            var open = menu.classList.toggle("open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initHero() {
        var slides = selectAll("[data-hero-slide]");
        if (!slides.length) {
            return;
        }
        var dots = selectAll("[data-hero-dot]");
        var current = 0;
        var timer;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
        }

        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        show(0);
        start();
    }

    function initFilters() {
        selectAll(".movie-filter").forEach(function (bar) {
            var scope = bar.parentElement || document;
            var input = bar.querySelector(".movie-search");
            var type = bar.querySelector(".type-filter");
            var cards = selectAll(".movie-card", scope);

            function value(node) {
                return node ? node.value.trim().toLowerCase() : "";
            }

            function apply() {
                var keyword = value(input);
                var selectedType = value(type);
                cards.forEach(function (card) {
                    var title = (card.getAttribute("data-title") || "").toLowerCase();
                    var tags = (card.getAttribute("data-tags") || "").toLowerCase();
                    var region = (card.getAttribute("data-region") || "").toLowerCase();
                    var year = (card.getAttribute("data-year") || "").toLowerCase();
                    var cardType = (card.getAttribute("data-type") || "").toLowerCase();
                    var haystack = title + " " + tags + " " + region + " " + year + " " + cardType;
                    var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchedType = !selectedType || cardType.indexOf(selectedType) !== -1;
                    card.classList.toggle("hidden-card", !(matchedKeyword && matchedType));
                });
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            if (type) {
                type.addEventListener("change", apply);
            }
        });
    }

    function initPlayers() {
        selectAll(".player-card").forEach(function (card) {
            var video = card.querySelector("video");
            var button = card.querySelector(".player-overlay");
            var src = card.getAttribute("data-player-src");
            var hlsInstance;
            var ready = false;

            function bind() {
                if (ready || !video || !src) {
                    return;
                }
                ready = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = src;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(src);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = src;
                }
            }

            function play() {
                bind();
                card.classList.add("is-playing");
                if (video) {
                    var attempt = video.play();
                    if (attempt && typeof attempt.catch === "function") {
                        attempt.catch(function () {});
                    }
                }
            }

            if (button) {
                button.addEventListener("click", play);
            }
            if (video) {
                video.addEventListener("play", function () {
                    card.classList.add("is-playing");
                });
                video.addEventListener("click", function () {
                    if (!ready) {
                        play();
                    }
                });
            }
            window.addEventListener("beforeunload", function () {
                if (hlsInstance && typeof hlsInstance.destroy === "function") {
                    hlsInstance.destroy();
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
