(() => {
  'use strict';
  const cases = [
  {
    "id": "P1_14_outdoor_climb",
    "raw": "video/hsa_baseline_comparison/P1_14_outdoor_climb/single_frame/raw.png",
    "motion": {
      "unish": "video/hsa_baseline_comparison/P1_14_outdoor_climb/baseline_unish_P1_14_outdoor_climb.mp4",
      "human3r": "video/hsa_baseline_comparison/P1_14_outdoor_climb/baseline_Human3r_P1_14_outdoor_climb.mp4",
      "ours": "video/hsa_baseline_comparison/P1_14_outdoor_climb/Ours_P1_14_outdoor_climb.mp4",
      "input": "video/hsa_baseline_comparison/P1_14_outdoor_climb/P1_14_outdoor_climb.mp4"
    },
    "single": {
      "human3r": "video/hsa_baseline_comparison/P1_14_outdoor_climb/single_frame/baseline_Hman3r_P1_14_outdoor_climb.mp4",
      "unish": "video/hsa_baseline_comparison/P1_14_outdoor_climb/single_frame/baseline_unish_P1_14_outdoor_climb.mp4",
      "ours": "video/hsa_baseline_comparison/P1_14_outdoor_climb/single_frame/P1_14_outdoor_climb.mp4"
    }
  },
  {
    "id": "P9_76_outdoor_sitting",
    "raw": "video/hsa_baseline_comparison/P9_76_outdoor_sitting/single_frame/raw.png",
    "motion": {
      "ours": "video/hsa_baseline_comparison/P9_76_outdoor_sitting/Ours_P9_76_outdoor_sitting.mp4",
      "unish": "video/hsa_baseline_comparison/P9_76_outdoor_sitting/baseline_unish_P9_76_outdoor_sitting.mp4",
      "input": "video/hsa_baseline_comparison/P9_76_outdoor_sitting/P9_76_outdoor_sitting.mp4",
      "human3r": "video/hsa_baseline_comparison/P9_76_outdoor_sitting/baseline_human3r_P9_76_outdoor_sitting.mp4"
    },
    "single": {
      "unish": "video/hsa_baseline_comparison/P9_76_outdoor_sitting/single_frame/baseline_unish_P9_76_outdoor_sitting.mp4",
      "ours": "video/hsa_baseline_comparison/P9_76_outdoor_sitting/single_frame/P9_76_outdoor_sitting-web.mp4",
      "human3r": "video/hsa_baseline_comparison/P9_76_outdoor_sitting/single_frame/baseline_human3r_P9_76_outdoor_sitting.mp4"
    }
  },
  {
    "id": "Date03_Sub05_yogamat",
    "raw": "video/hsa_baseline_comparison/Date03_Sub05_yogamat/single_frame/raw.png",
    "motion": {
      "input": "video/hsa_baseline_comparison/Date03_Sub05_yogamat/Date03_Sub05_yogamat.mp4",
      "human3r": "video/hsa_baseline_comparison/Date03_Sub05_yogamat/baseline_human3r_Date03_Sub05_yogamat.mp4",
      "ours": "video/hsa_baseline_comparison/Date03_Sub05_yogamat/Ours_Date03_Sub05_yogamat.mp4",
      "unish": "video/hsa_baseline_comparison/Date03_Sub05_yogamat/baseline_unish_Date03_Sub05_yogamat.mp4"
    },
    "single": {
      "human3r": "video/hsa_baseline_comparison/Date03_Sub05_yogamat/single_frame/baseline_human3r_Date03_Sub05_yogamat.mp4",
      "ours": "video/hsa_baseline_comparison/Date03_Sub05_yogamat/single_frame/Ours_Date03_Sub05_yogamat.mp4",
      "unish": "video/hsa_baseline_comparison/Date03_Sub05_yogamat/single_frame/baseline_unish_Date03_Sub05_yogamat.mp4"
    }
  }
];
  const viewer = document.querySelector('#alignment-player');
  const raw = document.querySelector('#alignment-raw');
  const thumbnails = [...document.querySelectorAll('.alignment-thumbnails .case-thumbnail')];
  const videos = Object.fromEntries(['input', 'ours', 'human3r', 'unish'].map(role => [role, document.querySelector('#alignment-' + role)]));
  let activeIndex = 0;
  let phase = 'motion';
  let initialized = false;
  const group = new CohereVideoGroup(Object.values(videos), () => loadPhase(phase === 'motion' ? 'single' : 'motion'));
  bindCohereVideoControls(group, viewer, 'alignment');

  function loadPhase(next) {
    initialized = true;
    phase = next;
    const item = cases[activeIndex];
    viewer.dataset.phase = phase;
    videos.input.hidden = phase === 'single';
    raw.hidden = phase !== 'single';
    raw.src = item.raw;
    const entries = Object.entries(item[phase]).map(([role, src]) => ({
      video: videos[role], src, poster: src.slice(0, src.lastIndexOf('/') + 1) + 'poster-' + role + '.jpg',
    }));
    group.load(entries);
  }
  function selectCase(index) {
    activeIndex = index;
    thumbnails.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    loadPhase('motion');
    group.play();
  }
  thumbnails.forEach((button, index) => {
    button.addEventListener('click', () => selectCase(index));
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? thumbnails.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + thumbnails.length) % thumbnails.length;
      thumbnails[next].focus({preventScroll: true});
      selectCase(next);
    });
  });
  loadCohereVideosWhenNear(viewer, () => {
    if (!initialized) loadPhase('motion');
  });
})();
