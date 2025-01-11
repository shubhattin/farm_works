import { PUBLIC_APP_NAME } from '$env/static/public';

const MAIN_TITLE = PUBLIC_APP_NAME ?? '';
export const PAGE_TITLES = {
  '/(main)': [MAIN_TITLE, 'font-bold mt-2'],
  '/(main)/vistrita/[id]': [MAIN_TITLE, 'font-bold mt-2']
};
