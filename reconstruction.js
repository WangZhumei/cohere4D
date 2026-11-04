(() => {
  'use strict';
  const viewer = document.querySelector('#reconstruction-viewer');
  const reconstruction = document.querySelector('#reconstruction-video');
  const input = document.querySelector('#reconstruction-input');
  const inset = document.querySelector('#reconstruction-inset');
  const thumbnails = [...document.querySelectorAll('.reconstruction-section .case-thumbnail')];
  let activeIndex = -1;
  const group = new CohereVideoGroup([reconstruction, input], () => group.restart());
  bindCohereVideoControls(group, viewer, 'reconstruction');
  function updateGeometry() {
    if (reconstruction.videoWidth && reconstruction.videoHeight) viewer.style.aspectRatio = reconstruction.videoWidth + ' / ' + reconstruction.videoHeight;
    if (input.videoWidth && input.videoHeight) inset.style.aspectRatio = input.videoWidth + ' / ' + input.videoHeight;
  }
  for (const video of [reconstruction, input]) {
    video.controls = false;
    video.addEventListener('loadedmetadata', updateGeometry);
    video.addEventListener('resize', updateGeometry);
  }
  function selectCase(index, initial = false) {
    if (!initial && index === activeIndex && !group.error) { group.play(); return; }
    activeIndex = index;
    const {recon, input: original, label, size, inset: position} = thumbnails[index].dataset;
    const folder = recon.slice(0, recon.lastIndexOf('/') + 1);
    inset.classList.toggle('is-right', position === 'right');
    inset.classList.toggle('is-compact', size === 'compact');
    reconstruction.setAttribute('aria-label', 'Reconstruction: ' + label);
    input.setAttribute('aria-label', 'Original video: ' + label);
    thumbnails.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    group.load([
      {video: reconstruction, src: recon, poster: folder + 'recon-poster.jpg'},
      {video: input, src: original, poster: folder + 'input-poster.jpg'},
    ]);
    group.play();
  }
  thumbnails.forEach((button, index) => {
    button.addEventListener('click', () => selectCase(index));
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? thumbnails.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + thumbnails.length) % thumbnails.length;
      thumbnails[next].focus({preventScroll: true});
      thumbnails[next].scrollIntoView({block: 'nearest', inline: 'nearest'});
      selectCase(next);
    });
  });
  loadCohereVideosWhenNear(viewer, () => {
    if (activeIndex < 0) selectCase(0, true);
  });
})();
