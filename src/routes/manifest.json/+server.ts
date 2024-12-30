import type { RequestHandler } from './$types';
import { PUBLIC_APP_NAME } from '$env/static/public';

export const GET: RequestHandler = async () => {
  const MANIFEST_JSON = {
    name: PUBLIC_APP_NAME ?? '',
    short_name: PUBLIC_APP_NAME ?? '',
    start_url: '/',
    scope: './',
    icons: [
      {
        src: 'img/icon_128.png',
        sizes: '128x128',
        type: 'image/png'
      },
      {
        src: 'img/icon_512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ],
    theme_color: '#181e20',
    background_color: '#333',
    display: 'standalone'
  };

  const resp = new Response(JSON.stringify(MANIFEST_JSON), {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'max-age=0, s-maxage=86400' // 1 day
    }
  });
  return resp;
};
