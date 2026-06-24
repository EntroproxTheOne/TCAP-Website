const PUBLIC = process.env.PUBLIC_URL || '';

/**
 * TCAP event albums — newest first.
 * Replace thumbnail paths with real cover photos when available.
 */
export const GALLERY_ALBUMS = [
  {
    id: 'tspark-2026',
    name: 'First Year Tspark',
    date: '04 · 04 · 2026',
    thumbnail: `${PUBLIC}/assets/albums/tspark-2026.svg`,
    photosUrl: 'https://photos.app.goo.gl/yStm1uHioSAvpybg8',
  },
  {
    id: 'sojourn-day-2',
    name: 'Sojourn Day 2',
    date: 'Mar 2026',
    thumbnail: `${PUBLIC}/assets/albums/sojourn-day-2.svg`,
    photosUrl: 'https://photos.app.goo.gl/vQ5budu2vQPfPkun6',
  },
  {
    id: 'sojourn-day-1',
    name: 'Sojourn Day 1',
    date: 'Mar 2026',
    thumbnail: `${PUBLIC}/assets/albums/sojourn-day-1.svg`,
    photosUrl: 'https://photos.app.goo.gl/AWNV6mi7weubo6US8',
  },
  {
    id: 'photowalk-4',
    name: 'Photowalk 4.0',
    date: '21 · 02 · 2026',
    thumbnail: `${PUBLIC}/assets/albums/photowalk-4.svg`,
    photosUrl: 'https://photos.app.goo.gl/F6SXfbCrfrDAzkra9',
  },
  {
    id: 'nss-blood-drive',
    name: 'NSS Blood Donation Drive',
    date: '20 · 02 · 2026',
    thumbnail: `${PUBLIC}/assets/albums/nss-blood-drive.svg`,
    photosUrl: 'https://photos.app.goo.gl/gCpcMd1bK7S2ZJQZ7',
  },
  {
    id: 'eclips-event',
    name: 'Eclips Event Photos',
    date: 'Feb 2026',
    thumbnail: `${PUBLIC}/assets/albums/eclips-event.svg`,
    photosUrl: 'https://photos.app.goo.gl/KsAcmWPu8a3PxJye6',
  },
  {
    id: 'zephyr-theme-reveal',
    name: 'Zephyr Theme Reveal',
    date: '16 · 09 · 2025',
    thumbnail: `${PUBLIC}/assets/albums/zephyr-theme-reveal.svg`,
    photosUrl: 'https://photos.app.goo.gl/yS7KXtrC3Lo3E6uF8',
  },
];
