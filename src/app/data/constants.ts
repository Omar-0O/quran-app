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
  { id: 7,  name: 'مشاري بن راشد العفاسي' },
  { id: 1,  name: 'عبد الباسط عبد الصمد (مرتل)' },
  { id: 3,  name: 'عبد الرحمن السديس' },
  { id: 2,  name: 'محمود خليل الحصري' },
  { id: 5,  name: 'سعد الغامدي' },
  { id: 11, name: 'سعود الشريم' },
  { id: 9,  name: 'محمد صديق المنشاوي' },
  { id: 4,  name: 'عبد الله بصفر' },
  { id: 10, name: 'ماهر المعيقلي' },
  { id: 12, name: 'ياسر الدوسري' },
  { id: 13, name: 'فارس عباد' },
  { id: 17, name: 'أكرم العلاقمي' },
  { id: 6,  name: 'عبد الباسط عبد الصمد (مجود)' },
  { id: 8,  name: 'إدريس أبكر' },
  { id: 14, name: 'خالد الجليل' },
  { id: 15, name: 'هاني الرفاعي' },
  { id: 16, name: 'وديع اليمني' },
  { id: 18, name: 'محمد أيوب' },
  { id: 19, name: 'علي الحذيفي' },
  { id: 20, name: 'أحمد نعينع' },
];
