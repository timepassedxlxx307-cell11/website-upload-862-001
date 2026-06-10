(function () {
  function initMoviePlayer(sourceUrl) {
    var video = document.getElementById('movieVideo');
    var overlay = document.getElementById('moviePlayOverlay');
    var playButton = document.getElementById('moviePlayButton');
    var muteButton = document.getElementById('movieMuteButton');
    var fullscreenButton = document.getElementById('movieFullscreenButton');
    var progress = document.getElementById('movieProgress');
    var timeText = document.getElementById('movieTime');
    var loading = document.getElementById('movieLoading');
    var controls = document.getElementById('movieControls');
    var readyPromise = null;
    var hls = null;

    if (!video) {
      return;
    }

    function formatTime(value) {
      if (!Number.isFinite(value)) {
        return '00:00';
      }
      var total = Math.max(0, Math.floor(value));
      var minutes = String(Math.floor(total / 60)).padStart(2, '0');
      var seconds = String(total % 60).padStart(2, '0');
      return minutes + ':' + seconds;
    }

    function setLoading(active) {
      if (loading) {
        loading.classList.toggle('is-active', active);
      }
    }

    function prepare() {
      if (readyPromise) {
        return readyPromise;
      }
      setLoading(true);
      readyPromise = new Promise(function (resolve) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = sourceUrl;
          video.addEventListener('loadedmetadata', function () {
            setLoading(false);
            resolve();
          }, { once: true });
          video.addEventListener('error', function () {
            setLoading(false);
            resolve();
          }, { once: true });
          video.load();
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(sourceUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setLoading(false);
            resolve();
          });
          hls.on(window.Hls.Events.ERROR, function () {
            setLoading(false);
            resolve();
          });
          return;
        }
        video.src = sourceUrl;
        video.addEventListener('loadedmetadata', function () {
          setLoading(false);
          resolve();
        }, { once: true });
        video.addEventListener('error', function () {
          setLoading(false);
          resolve();
        }, { once: true });
        video.load();
      });
      return readyPromise;
    }

    function updateButtons() {
      if (playButton) {
        playButton.textContent = video.paused ? '播放' : '暂停';
      }
      if (overlay) {
        overlay.classList.toggle('is-hidden', !video.paused);
      }
      if (controls) {
        controls.classList.toggle('is-visible', !video.paused);
      }
    }

    function play() {
      prepare().then(function () {
        video.play().then(updateButtons).catch(updateButtons);
      });
    }

    function toggle() {
      if (video.paused) {
        play();
      } else {
        video.pause();
        updateButtons();
      }
    }

    function updateProgress() {
      var duration = video.duration || 0;
      var current = video.currentTime || 0;
      if (progress && duration) {
        progress.value = String(Math.floor(current / duration * 1000));
      }
      if (timeText) {
        timeText.textContent = formatTime(current) + ' / ' + formatTime(duration);
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }
    if (playButton) {
      playButton.addEventListener('click', toggle);
    }
    video.addEventListener('click', toggle);
    video.addEventListener('play', updateButtons);
    video.addEventListener('pause', updateButtons);
    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', updateProgress);
    video.addEventListener('waiting', function () { setLoading(true); });
    video.addEventListener('playing', function () { setLoading(false); });
    if (progress) {
      progress.addEventListener('input', function () {
        var duration = video.duration || 0;
        if (duration) {
          video.currentTime = Number(progress.value) / 1000 * duration;
        }
      });
    }
    if (muteButton) {
      muteButton.addEventListener('click', function () {
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? '取消静音' : '静音';
      });
    }
    if (fullscreenButton) {
      fullscreenButton.addEventListener('click', function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (video.requestFullscreen) {
          video.requestFullscreen();
        }
      });
    }
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
    updateButtons();
    updateProgress();
  }

  window.initMoviePlayer = initMoviePlayer;
})();
