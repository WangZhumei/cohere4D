(() => {
  'use strict';

  const root = document.documentElement;
  const opening = document.querySelector('.opening');
  const scene = document.querySelector('.scene');
  const paper = document.querySelector('.paper');
  const header = document.querySelector('.paper-header');
  const slot = document.querySelector('.video-slot');
  const stage = document.querySelector('.video-stage');
  const video = document.querySelector('#teaser-video');
  const brand = document.querySelector('.hero-brand');
  const heroUI = [...document.querySelectorAll('.hero-ui')];
  const paperDetails = [...document.querySelectorAll('.opening-footer')];
  const playToggle = document.querySelector('#play-toggle');
  const soundToggle = document.querySelector('#sound-toggle');
  const fullscreenToggle = document.querySelector('#fullscreen-toggle');
  const playPrompt = document.querySelector('#play-prompt');
  const seekBar = document.querySelector('#video-seek');
  const playbackTime = document.querySelector('#playback-time');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (n, min = 0, max = 1) => Math.max(min, Math.min(max, n));
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = t => t * t * (3 - 2 * t);
  let bounds = {};
  let introduced = false;
  let requestedFrame = 0;
  let introTimer;
  let isSeeking = false;
  let resumeAfterSeek = false;
  let controlsTimer;
  let teaserVisible = false;
  let teaserWantsPlay = true;

  function hideControls() {
    clearTimeout(controlsTimer);
    if (!isSeeking) stage.classList.remove('controls-visible');
  }

  function showControls() {
    clearTimeout(controlsTimer);
    stage.classList.add('controls-visible');
    controlsTimer = setTimeout(hideControls, 2500);
  }

  // Both the fullscreen opening and the embedded player use the same controls:
  // show on interaction, hide on pointer exit or after a short idle period.
  stage.addEventListener('pointerenter', showControls);
  stage.addEventListener('pointermove', showControls);
  stage.addEventListener('pointerdown', showControls);
  stage.addEventListener('pointerleave', hideControls);

  // All geometry is measured only on layout changes. Scrolling never seeks,
  // replaces, or reparents the video, so its playback remains uninterrupted.
  function measure() {
    // Match the actual media, including future crops, without cropping its contents.
    if (video.videoWidth > 0 && video.videoHeight > 0) {
      slot.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`;
    }
    const viewportHeight = window.innerHeight;
    const viewportWidth = document.documentElement.clientWidth;
    scene.style.setProperty('--viewport-height', `${viewportHeight}px`);
    const sceneRect = scene.getBoundingClientRect();
    const target = slot.getBoundingClientRect();
    bounds = {
      width: viewportWidth,
      height: viewportHeight,
      distance: Math.round(viewportHeight * 1.05),
      start: opening.getBoundingClientRect().top + window.scrollY,
      x: target.left - sceneRect.left,
      y: target.top - sceneRect.top,
      targetWidth: target.width,
      targetHeight: target.height,
    };
    opening.style.height = `${scene.offsetHeight + bounds.distance}px`;
    brand.style.setProperty('--brand-small-x', viewportWidth <= 600 ? '18px' : '28px');
    brand.style.setProperty('--brand-scale', `${(viewportWidth <= 600 ? 115 : 134) / brand.offsetWidth}`);
    render();
  }

  function render() {
    requestedFrame = 0;
    const raw = clamp((window.scrollY - bounds.start) / bounds.distance);
    const progress = reducedMotion.matches ? (raw > 0.12 ? 1 : 0) : smooth(raw);
    const paperOpacity = reducedMotion.matches ? progress : smooth(clamp((raw - 0.16) / 0.6));
    const uiOpacity = reducedMotion.matches ? 1 - progress : 1 - clamp(raw / 0.24);
    scene.style.setProperty('--progress', progress.toFixed(4));
    stage.style.width = `${mix(bounds.width, bounds.targetWidth, progress)}px`;
    stage.style.height = `${mix(bounds.height, bounds.targetHeight, progress)}px`;
    stage.style.transform = `translate3d(${bounds.x * progress}px, ${bounds.y * progress}px, 0)`;
    stage.style.borderRadius = `${10 * progress}px`;
    stage.style.setProperty('--video-inset', `${56 * (1 - progress)}px`);
    stage.classList.toggle('is-docked', progress >= .999);
    header.style.opacity = paperOpacity;
    header.style.visibility = paperOpacity > .02 ? 'visible' : 'hidden';
    header.style.transform = `translateY(${18 * (1 - paperOpacity)}px)`;
    paperDetails.forEach(el => {
      el.style.opacity = paperOpacity;
      el.style.visibility = paperOpacity > .02 ? 'visible' : 'hidden';
    });
    heroUI.forEach(el => {
      el.style.opacity = uiOpacity;
      el.style.visibility = uiOpacity > .01 ? 'visible' : 'hidden';
    });
    brand.style.opacity = uiOpacity;
    if (raw > .02 && !introduced) introduce();
  }

  function requestRender() {
    if (!requestedFrame) requestedFrame = requestAnimationFrame(render);
  }

  async function play() {
    if (!teaserVisible || !teaserWantsPlay || document.hidden) return;
    try {
      await video.play();
      playPrompt.hidden = true;
    } catch (_) {
      // Safari / Low Power Mode can require an explicit user gesture.
      if (video.paused && !video.error && document.querySelector('#video-error').hidden) playPrompt.hidden = false;
    }
    syncPlayback();
  }

  function introduce() {
    if (introduced) return;
    introduced = true;
    clearTimeout(introTimer);
    scene.classList.add('is-introduced');
    play();
  }

  function syncPlayback() {
    stage.classList.toggle('is-paused', video.paused);
    const label = video.paused ? 'Play teaser' : 'Pause teaser';
    playToggle.setAttribute('aria-label', label);
    playToggle.title = label;
  }

  function updateTime() {
    const format = seconds => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    seekBar.disabled = duration <= 0;
    seekBar.max = String(duration);
    const currentTime = clamp(isSeeking ? Number(seekBar.value) : video.currentTime, 0, duration);
    if (!isSeeking) seekBar.value = String(currentTime);
    playbackTime.textContent = `${format(currentTime)} / ${format(duration)}`;
    seekBar.style.setProperty('--played', `${duration ? currentTime / duration * 100 : 0}%`);
    seekBar.setAttribute('aria-valuetext', `${format(currentTime)} of ${format(duration)}`);
  }

  seekBar.addEventListener('pointerdown', () => {
    if (seekBar.disabled) return;
    isSeeking = true;
    stage.classList.add('is-seeking');
    resumeAfterSeek = !video.paused;
    video.pause();
  });
  seekBar.addEventListener('input', () => {
    if (!Number.isFinite(video.duration) || video.duration <= 0) return;
    video.currentTime = clamp(Number(seekBar.value), 0, video.duration);
    updateTime();
  });
  function finishSeeking() {
    if (!isSeeking) return;
    isSeeking = false;
    stage.classList.remove('is-seeking');
    if (stage.matches(':hover')) showControls();
    else hideControls();
    updateTime();
    if (resumeAfterSeek) play();
    resumeAfterSeek = false;
  }
  // Finish even when a drag ends outside the player or a touch is interrupted.
  window.addEventListener('pointerup', finishSeeking);
  window.addEventListener('pointercancel', finishSeeking);
  window.addEventListener('blur', finishSeeking);
  seekBar.addEventListener('change', finishSeeking);

  playToggle.addEventListener('click', () => {
    if (!introduced) introduce();
    else if (video.paused) { teaserWantsPlay = true; play(); }
    else { teaserWantsPlay = false; video.pause(); }
  });
  playPrompt.addEventListener('click', () => { teaserWantsPlay = true; play(); });
  soundToggle.addEventListener('click', () => {
    video.muted = !video.muted;
  });
  video.addEventListener('volumechange', () => {
    soundToggle.classList.toggle('is-muted', video.muted);
    soundToggle.setAttribute('aria-pressed', String(!video.muted));
    const label = video.muted ? 'Unmute teaser' : 'Mute teaser';
    soundToggle.setAttribute('aria-label', label);
    soundToggle.title = label;
  });
  const fullscreenSupported = stage.requestFullscreen || video.webkitEnterFullscreen;
  fullscreenToggle.hidden = !fullscreenSupported;
  fullscreenToggle.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (stage.requestFullscreen) await stage.requestFullscreen();
      else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
    } catch (_) {
      // Keep native controls available if fullscreen is denied by the browser.
      video.controls = true;
    }
  });
  document.addEventListener('fullscreenchange', () => {
    const label = document.fullscreenElement ? 'Exit fullscreen' : 'Enter fullscreen';
    fullscreenToggle.setAttribute('aria-label', label);
    fullscreenToggle.title = label;
    if (!document.fullscreenElement) measure();
  });
  video.addEventListener('play', syncPlayback);
  video.addEventListener('pause', syncPlayback);
  video.addEventListener('playing', () => { playPrompt.hidden = true; });
  video.addEventListener('timeupdate', updateTime);
  video.addEventListener('loadedmetadata', () => {
    updateTime();
    measure();
  });
  video.addEventListener('resize', measure);
  video.addEventListener('durationchange', updateTime);
  const showVideoError = () => {
    document.querySelector('#video-error').hidden = false;
    playPrompt.hidden = true;
  };
  video.addEventListener('error', showVideoError);
  video.querySelector('source').addEventListener('error', showVideoError);
  observeCoherePlaybackVisibility(stage, visible => {
    teaserVisible = visible;
    if (!visible) video.pause();
    else if (introduced && teaserWantsPlay) play();
  });
  loadCohereVideosWhenNear(stage, () => {});

  document.querySelectorAll('a[href="#paper"]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      introduce();
      window.scrollTo({ top: bounds.start + bounds.distance, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
      if (link.classList.contains('skip-link')) {
        paper.tabIndex = -1;
        paper.focus({ preventScroll: true });
      }
    });
  });
  document.querySelector('.back-to-top').addEventListener('click', event => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  });
  document.querySelectorAll('[aria-disabled="true"]').forEach(link => {
    link.addEventListener('click', event => event.preventDefault());
  });

  root.classList.add('js');
  video.controls = false;
  video.muted = true;
  measure();
  syncPlayback();
  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  new ResizeObserver(measure).observe(paper);
  reducedMotion.addEventListener('change', measure);
  window.addEventListener('pageshow', () => {
    measure();
    if (window.location.hash === '#paper') window.scrollTo(0, bounds.start + bounds.distance);
  });
  introTimer = setTimeout(introduce, reducedMotion.matches ? 0 : 1650);
})();
