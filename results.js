(() => {
  'use strict';
  const catalog = {
  "motion": [
    {
      "id": "P7_56_outdoor_stairs_up_down",
      "videos": {
        "result": "video/human_motion/P7_56_outdoor_stairs_up_down/P7_56_outdoor_stairs_up_down_all.mp4",
        "input": "video/human_motion/P7_56_outdoor_stairs_up_down/P7_56_outdoor_stairs_up_down.mp4"
      }
    },
    {
      "id": "P3_30_outdoor_stairs_down",
      "videos": {
        "result": "video/human_motion/P3_30_outdoor_stairs_down/P3_30_outdoor_stairs_down_all.mp4",
        "input": "video/human_motion/P3_30_outdoor_stairs_down/P3_30_outdoor_stairs_down.mp4"
      }
    },
    {
      "id": "P9_79_outdoor_walk_rectangle",
      "videos": {
        "result": "video/human_motion/P9_79_outdoor_walk_rectangle/P9_79_outdoor_walk_rectangle_all.mp4",
        "input": "video/human_motion/P9_79_outdoor_walk_rectangle/P9_79_outdoor_walk_rectangle.mp4"
      }
    },
    {
      "id": "P9_78_outdoor_stairs_up_down",
      "videos": {
        "result": "video/human_motion/P9_78_outdoor_stairs_up_down/P9_78_outdoor_stairs_up_down_all.mp4",
        "input": "video/human_motion/P9_78_outdoor_stairs_up_down/P9_78_outdoor_stairs_up_down.mp4"
      }
    },
    {
      "id": "P4_35_indoor_walk",
      "videos": {
        "result": "video/human_motion/P4_35_indoor_walk/P4_35_indoor_walk_all.mp4",
        "input": "video/human_motion/P4_35_indoor_walk/P4_35_indoor_walk.mp4"
      }
    },
    {
      "id": "P7_58_outdoor_parcours",
      "videos": {
        "result": "video/human_motion/P7_58_outdoor_parcours/P7_58_outdoor_parcours_all.mp4",
        "input": "video/human_motion/P7_58_outdoor_parcours/P7_58_outdoor_parcours.mp4"
      }
    }
  ],
  "scene": [
    {
      "id": "20221013_3_250_batch01hand_orbit_bigOffice_seq_000049",
      "videos": {
        "pi3x": "video/scene/20221013_3_250_batch01hand_orbit_bigOffice_seq_000049/20221013_3_250_batch01hand_orbit_bigOffice_seq_000049_pi3X.mp4",
        "vggt": "video/scene/20221013_3_250_batch01hand_orbit_bigOffice_seq_000049/20221013_3_250_batch01hand_orbit_bigOffice_seq_000049_vggtO_crop_3x.mp4",
        "input": "video/scene/20221013_3_250_batch01hand_orbit_bigOffice_seq_000049/seq_000049_10fps.mp4",
        "da3": "video/scene/20221013_3_250_batch01hand_orbit_bigOffice_seq_000049/20221013_3_250_batch01hand_orbit_bigOffice_seq_000049_da3.mp4"
      }
    },
    {
      "id": "20241213_1_250_rome_tracking_seq_000032",
      "videos": {
        "input": "video/scene/20241213_1_250_rome_tracking_seq_000032/seq_000032.mp4",
        "da3": "video/scene/20241213_1_250_rome_tracking_seq_000032/20241213_1_250_rome_tracking_seq_000032_da3_.mp4",
        "pi3x": "video/scene/20241213_1_250_rome_tracking_seq_000032/20241213_1_250_rome_tracking_seq_000032_pi3x_.mp4",
        "vggt": "video/scene/20241213_1_250_rome_tracking_seq_000032/20241213_1_250_rome_tracking_seq_000032_vggtO_.mp4"
      }
    },
    {
      "id": "20221019_3-8_250_highbmihand_orbit_stadium_seq_000014",
      "videos": {
        "vggt": "video/scene/20221019_3-8_250_highbmihand_orbit_stadium_seq_000014/20221019_3-8_250_highbmihand_orbit_stadium_seq_000014_vggtO_.mp4",
        "da3": "video/scene/20221019_3-8_250_highbmihand_orbit_stadium_seq_000014/20221019_3-8_250_highbmihand_orbit_stadium_seq_000014_da3_.mp4",
        "pi3x": "video/scene/20221019_3-8_250_highbmihand_orbit_stadium_seq_000014/20221019_3-8_250_highbmihand_orbit_stadium_seq_000014_pi3x_.mp4",
        "input": "video/scene/20221019_3-8_250_highbmihand_orbit_stadium_seq_000014/20221019_3-8_250_highbmihand_orbit_stadium_seq_000014.mp4"
      }
    }
  ],
  "singles": [
    {
      "id": "scale-ablation",
      "src": "video/ablation/scale/Date03_Sub05_yogamat_boths_.mp4",
      "poster": "video/ablation/scale/poster.jpg",
      "title": "Effect of Human-anchored Scale Calibration",
      "ratio": "3046 / 1936"
    },
    {
      "id": "translation-ablation",
      "src": "video/ablation/transl/transl_ablation_.mp4",
      "poster": "video/ablation/transl/poster.jpg",
      "title": "Effect of Scene-grounded Translation Refinement",
      "ratio": "1920 / 1034"
    },
    {
      "id": "occlusion",
      "src": "video/occlusion/occlusion.mp4",
      "poster": "video/occlusion/poster.jpg",
      "title": "More Occlusion Results",
      "ratio": "1920 / 980"
    },
    {
      "id": "interaction",
      "src": "video/interaction/interaction-web.mp4",
      "poster": "video/interaction/poster.jpg",
      "title": "More Interaction Results",
      "ratio": "1920 / 1080"
    },
    {
      "id": "internet",
      "src": "video/internet/internet.mp4",
      "poster": "video/internet/poster.jpg",
      "title": "More Internet Video",
      "ratio": "1920 / 980"
    }
  ]
};

  function poster(src, role) {
    return src.slice(0, src.lastIndexOf('/') + 1) + 'poster-' + role + '.jpg';
  }
  function initializeGallery(kind, cases) {
    const root = document.querySelector('[data-gallery="' + kind + '"]');
    const viewer = document.querySelector('#' + kind + '-viewer');
    const thumbnails = [...root.querySelectorAll('.case-thumbnail')];
    const videos = Object.fromEntries(Object.keys(cases[0].videos).map(role => [role, document.querySelector('#' + kind + '-' + role)]));
    const group = new CohereVideoGroup(Object.values(videos), () => group.restart());
    let activeIndex = -1;
    bindCohereVideoControls(group, viewer, kind);

    if (kind === 'motion') {
      const inset = document.querySelector('#motion-inset');
      const geometry = () => {
        if (videos.result.videoWidth && videos.result.videoHeight) viewer.style.aspectRatio = videos.result.videoWidth + ' / ' + videos.result.videoHeight;
        if (videos.input.videoWidth && videos.input.videoHeight) inset.style.aspectRatio = videos.input.videoWidth + ' / ' + videos.input.videoHeight;
      };
      for (const video of Object.values(videos)) {
        video.addEventListener('loadedmetadata', geometry);
        video.addEventListener('resize', geometry);
      }
    }
    function selectCase(index) {
      if (index === activeIndex && !group.error) { group.play(); return; }
      activeIndex = index;
      thumbnails.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
      group.load(Object.entries(cases[index].videos).map(([role, src]) => ({video: videos[role], src, poster: poster(src, role)})));
      group.play();
    }
    thumbnails.forEach((button, index) => {
      button.addEventListener('click', () => selectCase(index));
      button.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? cases.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + cases.length) % cases.length;
        thumbnails[next].focus({preventScroll: true});
        thumbnails[next].scrollIntoView({block: 'nearest', inline: 'nearest'});
        selectCase(next);
      });
    });
    loadCohereVideosWhenNear(viewer, () => { if (activeIndex < 0) selectCase(0); });
  }

  initializeGallery('motion', catalog.motion);
  initializeGallery('scene', catalog.scene);
  for (const item of catalog.singles) {
    const viewer = document.querySelector('#' + item.id + '-viewer');
    const video = document.querySelector('#' + item.id + '-video');
    const group = new CohereVideoGroup([video], () => group.restart());
    bindCohereVideoControls(group, viewer, item.id);
    const geometry = () => {
      if (video.videoWidth && video.videoHeight) viewer.style.aspectRatio = video.videoWidth + ' / ' + video.videoHeight;
    };
    video.addEventListener('loadedmetadata', geometry);
    video.addEventListener('resize', geometry);
    loadCohereVideosWhenNear(viewer, () => group.load([{video, src: item.src, poster: item.poster}]));
  }
})();
