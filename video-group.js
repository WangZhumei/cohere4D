// Multi-video cases play at their original speed and hold the last frame until
// EVERY active clip ends. Future comparison sections should use this controller.
class CohereVideoGroup extends EventTarget {
  constructor(videos, onComplete) {
    super();
    Object.assign(this, { videos, onComplete, active: [], finished: new Set(), waiting: new Set(), wantsPlay: true,
      enabled: false, seeking: false, blocked: false, error: false, completed: false, revision: 0, pending: false });
    for (const video of videos) {
      video.loop = false; video.muted = true; video.playbackRate = 1;
      video.addEventListener('ended', () => {
        if (!this.active.includes(video) || !video.ended) return;
        this.finished.add(video); this.update(); this.pump();
      });
      for (const event of ['loadedmetadata', 'canplay', 'seeked']) video.addEventListener(event, () => {
        if (!this.active.includes(video)) return;
        if (event === 'canplay') this.waiting.delete(video);
        this.update(); this.pump();
      });
      for (const event of ['timeupdate', 'play', 'pause']) video.addEventListener(event, () => this.update());
      video.addEventListener('waiting', () => {
        if (this.allowed && this.active.includes(video) && !this.finished.has(video)) {
          this.waiting.add(video); this.pauseMedia();
        }
      });
      video.addEventListener('error', () => {
        if (!this.active.includes(video)) return;
        this.error = true; this.pauseMedia(); this.update();
      });
    }
    document.addEventListener('visibilitychange', () => document.hidden ? this.pauseMedia() : this.pump());
  }
  get allowed() { return this.enabled && this.wantsPlay && !this.seeking && !this.error && !this.blocked && !document.hidden; }
  get duration() {
    return this.active.length && this.active.every(v => Number.isFinite(v.duration) && v.duration > 0)
      ? Math.max(...this.active.map(v => v.duration)) : 0;
  }
  get currentTime() { return Math.max(0, ...this.active.map(v => v.currentTime || 0)); }
  get isPlaying() { return this.active.some(v => !v.paused && !this.finished.has(v)); }
  update() { this.dispatchEvent(new Event('change')); }
  pauseMedia() { this.videos.forEach(v => v.pause()); }
  load(entries) {
    this.revision++; this.pending = false; this.pauseMedia();
    this.active = entries.map(entry => entry.video); this.finished.clear(); this.waiting.clear();
    this.completed = this.error = this.blocked = this.seeking = false;
    for (const {video, src, poster} of entries) {
      video.loop = false; video.playbackRate = 1;
      video.preload = this.enabled ? 'auto' : 'metadata';
      if (poster) video.poster = poster;
      video.src = src; video.load();
    }
    this.update(); this.pump();
  }
  setEnabled(enabled) {
    this.enabled = enabled;
    if (enabled) { this.active.forEach(v => { v.preload = 'auto'; }); this.pump(); }
    else this.pauseMedia();
    this.update();
  }
  play() { this.wantsPlay = true; this.blocked = false; this.pump(); this.update(); }
  pause() { this.wantsPlay = false; this.pauseMedia(); this.update(); }
  async pump() {
    if (!this.allowed || !this.active.length || this.completed) return;
    // Native end state can precede the queued `ended` event. In particular,
    // equal-length clips may end together but dispatch their events separately.
    // Calling play() in that gap would rewind one clip and play it twice.
    for (const video of this.active) {
      if (video.ended && !video.seeking) this.finished.add(video);
    }
    if (this.pending) return;
    if (this.active.every(v => this.finished.has(v))) { this.completed = true; this.onComplete(); return; }
    const unfinished = this.active.filter(v => !this.finished.has(v));
    // A decoded frame from every unfinished clip is required before any starts.
    if (!this.duration || unfinished.some(v => v.readyState < 2 || v.seeking || this.waiting.has(v))) return;
    if (unfinished.every(v => !v.paused)) return;
    const revision = this.revision; this.pending = true;
    const results = await Promise.allSettled(unfinished.map(v => v.play()));
    if (revision !== this.revision) return;
    this.pending = false;
    if (!this.allowed) this.pauseMedia();
    else if (results.some(r => r.status === 'rejected' && r.reason?.name === 'NotAllowedError')) {
      this.blocked = true; this.pauseMedia();
    }
    this.update();
    // Media events can arrive while the play promises are still pending.
    if (this.allowed && (this.active.every(v => this.finished.has(v)) ||
        results.some(r => r.status === 'rejected' && r.reason?.name === 'AbortError'))) {
      setTimeout(() => { if (revision === this.revision) this.pump(); }, 0);
    }
  }
  beginSeek() { this.seeking = true; this.pauseMedia(); }
  seek(seconds) {
    if (!this.duration) return;
    this.revision++; this.pending = false; this.pauseMedia(); this.finished.clear(); this.waiting.clear(); this.completed = false;
    const target = Math.max(0, Math.min(this.duration, seconds));
    for (const video of this.active) {
      video.currentTime = Math.min(target, video.duration);
      if (target >= video.duration) this.finished.add(video);
    }
    this.update(); this.pump();
  }
  endSeek() { this.seeking = false; this.update(); this.pump(); }
  restart() { this.seek(0); }
}

// Defer media requests until the section is close to the viewport, so the
// opening teaser does not compete with the rest of the page for bandwidth.
function loadCohereVideosWhenNear(viewer, load) {
  const observer = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    load();
    observer.disconnect();
  }, {rootMargin: '200px 0px'});
  observer.observe(viewer);
}

function bindCohereVideoControls(group, viewer, prefix) {
  const find = suffix => document.querySelector('#' + prefix + '-' + suffix);
  const play = find('play'), prompt = find('play-prompt'), fullscreen = find('fullscreen');
  const seek = find('seek'), time = find('time'), error = find('error');
  let controlsTimer;
  const format = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  function update() {
    const duration = group.duration;
    const current = Math.max(0, Math.min(duration, group.seeking ? Number(seek.value) : group.currentTime));
    seek.disabled = !duration; seek.max = String(duration);
    if (!group.seeking) seek.value = String(current);
    seek.style.setProperty('--played', (duration ? current / duration * 100 : 0) + '%');
    seek.setAttribute('aria-valuetext', format(current) + ' of ' + format(duration));
    time.textContent = format(current) + ' / ' + format(duration);
    viewer.classList.toggle('is-paused', !group.wantsPlay || group.blocked);
    viewer.classList.toggle('is-seeking', group.seeking);
    const label = group.wantsPlay && !group.blocked ? 'Pause videos' : 'Play videos';
    play.setAttribute('aria-label', label); play.title = label;
    prompt.hidden = !group.blocked || group.error; error.hidden = !group.error;
  }
  group.addEventListener('change', update);
  play.addEventListener('click', () => group.wantsPlay && !group.blocked ? group.pause() : group.play());
  prompt.addEventListener('click', () => group.play());
  function hideControls() { clearTimeout(controlsTimer); if (!group.seeking) viewer.classList.remove('controls-visible'); }
  function showControls() { clearTimeout(controlsTimer); viewer.classList.add('controls-visible'); controlsTimer = setTimeout(hideControls, 2500); }
  for (const event of ['pointerenter', 'pointermove', 'pointerdown']) viewer.addEventListener(event, showControls);
  viewer.addEventListener('pointerleave', hideControls);
  seek.addEventListener('pointerdown', () => {
    if (seek.disabled) return;
    group.beginSeek(); viewer.classList.add('is-seeking');
  });
  seek.addEventListener('input', () => group.seek(Number(seek.value)));
  function endSeek() {
    if (!group.seeking) return;
    group.endSeek();
    if (viewer.matches(':hover')) showControls(); else hideControls();
  }
  for (const event of ['pointerup', 'pointercancel', 'blur']) window.addEventListener(event, endSeek);
  seek.addEventListener('change', endSeek);
  fullscreen.hidden = !viewer.requestFullscreen;
  fullscreen.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen(); else await viewer.requestFullscreen();
    } catch (_) { /* Keep grouped playback intact if fullscreen is unavailable. */ }
  });
  document.addEventListener('fullscreenchange', () => {
    const label = document.fullscreenElement === viewer ? 'Exit fullscreen' : 'Enter fullscreen';
    fullscreen.setAttribute('aria-label', label); fullscreen.title = label;
  });
  new IntersectionObserver(entries => group.setEnabled(entries[0].isIntersecting), {threshold: .1}).observe(viewer);
  update();
}
