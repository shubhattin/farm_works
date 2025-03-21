const langs = [
  'Normal',
  'Assamese',
  'Bengali',
  'Brahmi',
  'Granth',
  'Gujarati',
  'Hindi',
  'Kannada',
  'Konkani',
  'Malayalam',
  'Marathi',
  'Modi',
  'Nepali',
  'Odia',
  'Punjabi',
  'Purna-Devanagari',
  'Romanized',
  'Sanskrit',
  'Sharada',
  'Siddham',
  'Sinhala',
  'Tamil-Extended',
  'Tamil',
  'Telugu',
  'Urdu',
  'Kashmiri',
  'Sindhi'
];
const alts = {
  en: 0,
  English: 0,
  as: 1,
  bn: 2,
  Bangla: 2,
  ben: 2,
  br: 3,
  gr: 4,
  gu: 5,
  guj: 5,
  hi: 6,
  hin: 6,
  kn: 7,
  kan: 7,
  ko: 8,
  kok: 8,
  ml: 9,
  mal: 9,
  mr: 10,
  mar: 10,
  mo: 11,
  mod: 11,
  ne: 12,
  nep: 12,
  Oriya: 13,
  or: 13,
  Odiya: 13,
  pa: 14,
  pan: 14,
  pn: 14,
  Gurumukhi: 14,
  guru: 14,
  'pu-de': 15,
  'pu-dev': 15,
  'pur-dev': 15,
  Romanised: 16,
  ro: 16,
  rom: 16,
  sa: 17,
  san: 17,
  dev: 17,
  Devanagari: 17,
  de: 17,
  sh: 18,
  shr: 18,
  sid: 19,
  si: 20,
  sin: 20,
  'ta-ex': 21,
  'tam-ex': 21,
  ta: 22,
  tam: 22,
  te: 23,
  tel: 23,
  ur: 24
};

export const normalize = (ln: string) => {
  // function to normalize the names of scripts
  let a = ln.trim().split('-');
  for (let x = 0; x < a.length; x++) a[x] = a[x].charAt(0).toUpperCase() + a[x].substring(1);
  let ln1 = a.join('-');
  if (langs.includes(ln1)) return ln1;
  else if (ln in alts) return langs[alts[ln as keyof typeof alts]];
  else return false;
};
