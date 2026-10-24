import { ALL_RECITERS, ReciterInfo } from './reciters';

export interface AyahData {
  number: number;
  numberInSurah: number;
  text: string;
  juz?: number;
  manzil?: number;
  page?: number;
  ruku?: number;
  hizbQuarter?: number;
  sajda?: boolean | object;
}

export interface SurahData {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
  ayahs: AyahData[];
}

export interface Reciter {
  id: string | number;
  name: string;
  serverUrl?: string;
  subname?: string;
}

// قائمة القراء المعتمدة المستندة إلى سيرفرات MP3Quran السريعة والمستقرة
export const RECITERS: Reciter[] = ALL_RECITERS.map((r) => ({
  id: r.id,
  name: r.name,
  serverUrl: r.serverUrl,
  subname: r.subname,
}));

export { ALL_RECITERS };
export type { ReciterInfo };
