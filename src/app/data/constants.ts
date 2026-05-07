export interface SurahData {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
  ayahs: Array<{
    number: number;
    numberInSurah: number;
    text: string;
  }>;
}

export interface Reciter {
  id: number;
  name: string;
}

export const RECITERS: Reciter[] = [
  { id: 2, name: 'محمود خليل الحصري' },
  { id: 7, name: 'مشاري بن راشد العفاسي' },
  { id: 1, name: 'عبد الباسط عبد الصمد (مرتل)' },
  { id: 4, name: 'عبد الله بصفر' },
  { id: 3, name: 'عبد الرحمن السديس' },
  { id: 11, name: 'سعود الشريم' },
  { id: 5, name: 'سعد الغامدي' },
  { id: 9, name: 'محمد صديق المنشاوي' },
];
