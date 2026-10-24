export interface ReciterInfo {
  id: string;
  name: string;
  subname?: string;
  rewaya: string;
  serverUrl: string;
  category: 'minshawi' | 'giants' | 'haramain' | 'mujawwad' | 'muallim' | 'rewayat' | 'general';
  isFeatured?: boolean;
}

export const RECITERS_CATEGORIES = [
  { id: 'all', name: 'جميع القراء' },
  { id: 'minshawi', name: '⭐ الشيخ المنشاوي' },
  { id: 'giants', name: '👑 كبار عمالقة التلاوة' },
  { id: 'haramain', name: '🕋 أئمة الحرمين الشريفين' },
  { id: 'mujawwad', name: '🎙️ تلاوات مجودة' },
  { id: 'muallim', name: '🎓 المصحف المعلم' },
  { id: 'rewayat', name: '📖 روايات وقراءات' },
  { id: 'general', name: '✨ مشاهير القراء' },
];

export const ALL_RECITERS: ReciterInfo[] = [
  // ---- الشيخ محمد صديق المنشاوي (مميز في الصدارة) ----
  {
    id: 'minshawi-murattal',
    name: 'محمد صديق المنشاوي (مرتل)',
    subname: 'المصحف المرتل الكامل',
    rewaya: 'رواية حفص عن عاصم',
    serverUrl: 'https://cdn.mp3quran.net/audio/muhammad-minshawi/r1',
    category: 'minshawi',
    isFeatured: true,
  },
  {
    id: 'minshawi-mujawwad',
    name: 'محمد صديق المنشاوي (مجود)',
    subname: 'المصحف المجود (خاشع ومؤثر)',
    rewaya: 'تلاوة مجودة - حفص عن عاصم',
    serverUrl: 'https://cdn.mp3quran.net/audio/muhammad-minshawi/r2',
    category: 'minshawi',
    isFeatured: true,
  },
  {
    id: 'minshawi-muallim',
    name: 'محمد صديق المنشاوي (المعلم)',
    subname: 'المصحف المعلم مع ترديد الأطفال',
    rewaya: 'المصحف المعلم',
    serverUrl: 'https://cdn.mp3quran.net/audio/muhammad-minshawi/r3',
    category: 'minshawi',
    isFeatured: true,
  },
  {
    id: 'minshawi-1967',
    name: 'محمد صديق المنشاوي (تسجيل 1967م)',
    subname: 'تسجيلات الإذاعة النادرة لعام 1387هـ',
    rewaya: 'حفص عن عاصم - تلاوة نادرة',
    serverUrl: 'https://cdn.mp3quran.net/audio/muhammad-minshawi/r4',
    category: 'minshawi',
    isFeatured: true,
  },

  // ---- كبار عمالقة دولة التلاوة ----
  {
    id: 'abdulbasit-murattal',
    name: 'عبد الباسط عبد الصمد (مرتل)',
    subname: 'صوت مكة الخالد',
    rewaya: 'رواية حفص عن عاصم',
    serverUrl: 'https://server7.mp3quran.net/basit',
    category: 'giants',
    isFeatured: true,
  },
  {
    id: 'abdulbasit-mujawwad',
    name: 'عبد الباسط عبد الصمد (مجود)',
    subname: 'التلاوة المجودة الشهيرة',
    rewaya: 'تلاوة مجودة',
    serverUrl: 'https://server7.mp3quran.net/basit_mjwd',
    category: 'giants',
    isFeatured: true,
  },
  {
    id: 'husary-murattal',
    name: 'محمود خليل الحصري (مرتل)',
    subname: 'شيخ عموم المقارئ المصرية',
    rewaya: 'رواية حفص عن عاصم',
    serverUrl: 'https://server13.mp3quran.net/husr',
    category: 'giants',
    isFeatured: true,
  },
  {
    id: 'husary-mujawwad',
    name: 'محمود خليل الحصري (مجود)',
    subname: 'التلاوة المجودة بإتقان الأحكام',
    rewaya: 'تلاوة مجودة',
    serverUrl: 'https://server13.mp3quran.net/husr_mjwd',
    category: 'giants',
  },
  {
    id: 'husary-muallim',
    name: 'محمود خليل الحصري (المعلم)',
    subname: 'المصحف المعلم لتعليم التلاوة',
    rewaya: 'المصحف المعلم',
    serverUrl: 'https://server13.mp3quran.net/husr_mo',
    category: 'muallim',
  },
  {
    id: 'banna-murattal',
    name: 'محمود علي البنا (مرتل)',
    subname: 'المصحف المرتل برواية حفص',
    rewaya: 'رواية حفص عن عاصم',
    serverUrl: 'https://cdn.mp3quran.net/audio/mahmoud-banna/r1',
    category: 'giants',
  },
  {
    id: 'banna-mujawwad',
    name: 'محمود علي البنا (مجود)',
    subname: 'التلاوة المجودة الخاشعة',
    rewaya: 'تلاوة مجودة',
    serverUrl: 'https://cdn.mp3quran.net/audio/mahmoud-banna/r2',
    category: 'giants',
  },
  {
    id: 'mustafa-ismail-mujawwad',
    name: 'مصطفى إسماعيل (مجود)',
    subname: 'أمير قراء القرآن الكريم',
    rewaya: 'تلاوة مجودة',
    serverUrl: 'https://cdn.mp3quran.net/audio/mustafa-ismail/r2',
    category: 'giants',
  },
  {
    id: 'mustafa-ismail-murattal',
    name: 'مصطفى إسماعيل (مرتل)',
    subname: 'المصحف المرتل الكامل',
    rewaya: 'رواية حفص عن عاصم',
    serverUrl: 'https://cdn.mp3quran.net/audio/mustafa-ismail/r1',
    category: 'giants',
  },
  {
    id: 'mohamed-refat',
    name: 'محمد رفعت',
    subname: 'قيثارة السماء وتسجيلات نادرة',
    rewaya: 'تلاوات تاريخية نادرة',
    serverUrl: 'https://server14.mp3quran.net/refat',
    category: 'giants',
  },
  {
    id: 'mohamed-tblawi',
    name: 'محمد محمود الطبلاوي',
    subname: 'صاحب النغمة الشجية',
    rewaya: 'رواية حفص عن عاصم',
    serverUrl: 'https://server12.mp3quran.net/tblawi',
    category: 'giants',
  },
  {
    id: 'ahmad-naina',
    name: 'أحمد نعينع',
    subname: 'تلاوة برواية حفص عن عاصم',
    rewaya: 'رواية حفص عن عاصم',
    serverUrl: 'https://server11.mp3quran.net/nyna',
    category: 'giants',
  },

  // ---- أئمة الحرمين الشريفين ----
  {
    id: 'ali-jaber',
    name: 'علي عبد الله جابر',
    subname: 'إمام الحرم المكي الشريف رحمه الله',
    rewaya: 'رواية حفص عن عاصم',
    serverUrl: 'https://server11.mp3quran.net/a_jbr',
    category: 'haramain',
    isFeatured: true,
  },
  {
    id: 'sudais',
    name: 'عبد الرحمن السديس',
    subname: 'إمام وخطيب المسجد الحرام',
    rewaya: 'رواية حفص عن عاصم',
    serverUrl: 'https://server11.mp3quran.net/sds',
    category: 'haramain',
    isFeatured: true,
  },
  {
    id: 'shuraim',
    name: 'سعود الشريم',
    subname: 'إمام المسجد الحرام',
    rewaya: 'رواية حفص عن عاصم',
    serverUrl: 'https://server12.mp3quran.net/shoraimy',
    category: 'haramain',
  },
  {
    id: 'maher-murattal',
    name: 'ماهر المعيقلي (مرتل)',
    subname: 'إمام وخطيب المسجد الحرام',
    rewaya: 'رواية حفص عن عاصم',
    serverUrl: 'https://server12.mp3quran.net/maher',
    category: 'haramain',
    isFeatured: true,
  },
  {
    id: 'maher-mujawwad',
    name: 'ماهر المعيقلي (مجود)',
    subname: 'تلاوة مجودة خاشعة',
    rewaya: 'تلاوة مجودة',
    serverUrl: 'https://cdn.mp3quran.net/audio/maher-muaiqly/r3',
    category: 'mujawwad',
  },
  {
    id: 'yasser-dosari',
    name: 'ياسر الدوسري',
    subname: 'إمام وخطيب المسجد الحرام',
    rewaya: 'رواية حفص عن عاصم',
    serverUrl: 'https://server11.mp3quran.net/yasser',
    category: 'haramain',
    isFeatured: true,
  },
  {
    id: 'ali-hudhaifi',
    name: 'علي بن عبد الرحمن الحذيفي',
    subname: 'إمام وخطيب المسجد النبوي',
    rewaya: 'رواية حفص عن عاصم',
    serverUrl: 'https://server9.mp3quran.net/hthfi',
    category: 'haramain',
  },
  {
    id: 'mohamed-ayyub',
    name: 'محمد أيوب',
    subname: 'إمام المسجد النبوي رحمه الله',
    rewaya: 'رواية حفص عن عاصم',
    serverUrl: 'https://server8.mp3quran.net/ayyub',
    category: 'haramain',
  },
  {
    id: 'abdullah-juhany',
    name: 'عبد الله عواد الجهني',
    subname: 'إمام المسجد الحرام',
    rewaya: 'رواية حفص عن عاصم',
    serverUrl: 'https://server13.mp3quran.net/jhn',
    category: 'haramain',
  },
  {
    id: 'bandar-baleela',
    name: 'بندر بليلة',
    subname: 'إمام المسجد الحرام',
    rewaya: 'رواية حفص عن عاصم',
    serverUrl: 'https://server6.mp3quran.net/balilah',
    category: 'haramain',
  },

  // ---- مشاهير القراء في العالم الإسلامي ----
  {
    id: 'mishari-alafasy',
    name: 'مشاري بن راشد العفاسي',
    subname: 'تلاوة ندية خاشعة',
    rewaya: 'رواية حفص عن عاصم',
    serverUrl: 'https://server8.mp3quran.net/afs',
    category: 'general',
    isFeatured: true,
  },
  {
    id: 'saad-ghamdi',
    name: 'سعد الغامدي',
    subname: 'رواية حفص عن عاصم',
    rewaya: 'رواية حفص عن عاصم',
    serverUrl: 'https://server6.mp3quran.net/ghamdi',
    category: 'general',
  },
  {
    id: 'nasser-qatami',
    name: 'ناصر القطامي',
    subname: 'تلاوة خاشعة برواية حفص',
    rewaya: 'رواية حفص عن عاصم',
    serverUrl: 'https://server6.mp3quran.net/qtm',
    category: 'general',
  },
  {
    id: 'ahmed-ajmi',
    name: 'أحمد بن علي العجمي',
    subname: 'رواية حفص عن عاصم',
    rewaya: 'رواية حفص عن عاصم',
    serverUrl: 'https://server10.mp3quran.net/ajm',
    category: 'general',
  },
  {
    id: 'abu-bakr-shatri',
    name: 'أبو بكر الشاطري',
    subname: 'تلاوة هادئة وجميلة',
    rewaya: 'رواية حفص عن عاصم',
    serverUrl: 'https://server11.mp3quran.net/shatri',
    category: 'general',
  },
  {
    id: 'fares-abbad',
    name: 'فارس عباد',
    subname: 'رواية حفص عن عاصم',
    rewaya: 'رواية حفص عن عاصم',
    serverUrl: 'https://server8.mp3quran.net/frs_a',
    category: 'general',
  },
  {
    id: 'idrees-abkar',
    name: 'إدريس أبكر',
    subname: 'تلاوة مؤثرة خاشعة',
    rewaya: 'رواية حفص عن عاصم',
    serverUrl: 'https://server6.mp3quran.net/abkr',
    category: 'general',
  },
  {
    id: 'khalid-jaleel',
    name: 'خالد الجليل',
    subname: 'رواية حفص عن عاصم',
    rewaya: 'رواية حفص عن عاصم',
    serverUrl: 'https://server10.mp3quran.net/jleel',
    category: 'general',
  },
  {
    id: 'hazza-balushi',
    name: 'هزاع البلوشي',
    subname: 'تلاوة عذبة مؤثرة',
    rewaya: 'رواية حفص عن عاصم',
    serverUrl: 'https://server11.mp3quran.net/hazza',
    category: 'general',
  },
  {
    id: 'raad-kurdi',
    name: 'رعد محمد الكردي',
    subname: 'رواية حفص عن عاصم',
    rewaya: 'رواية حفص عن عاصم',
    serverUrl: 'https://server6.mp3quran.net/ra3ad',
    category: 'general',
  },
  {
    id: 'hani-rifai',
    name: 'هاني الرفاعي',
    subname: 'رواية حفص عن عاصم',
    rewaya: 'رواية حفص عن عاصم',
    serverUrl: 'https://server8.mp3quran.net/rifai',
    category: 'general',
  },
  {
    id: 'wadee-yamani',
    name: 'وديع اليمني',
    subname: 'رواية حفص عن عاصم',
    rewaya: 'رواية حفص عن عاصم',
    serverUrl: 'https://server6.mp3quran.net/wdee',
    category: 'general',
  },
  {
    id: 'mohamed-jibril',
    name: 'محمد جبريل',
    subname: 'رواية حفص عن عاصم',
    rewaya: 'رواية حفص عن عاصم',
    serverUrl: 'https://server8.mp3quran.net/jbrl',
    category: 'general',
  },
  {
    id: 'abdullah-basfar',
    name: 'عبد الله بصفر',
    subname: 'رواية حفص عن عاصم',
    rewaya: 'رواية حفص عن عاصم',
    serverUrl: 'https://server6.mp3quran.net/bsfr',
    category: 'general',
  },
  {
    id: 'salah-bukhatir',
    name: 'صلاح بو خاطر',
    subname: 'رواية حفص عن عاصم',
    rewaya: 'رواية حفص عن عاصم',
    serverUrl: 'https://server8.mp3quran.net/bu_khtr',
    category: 'general',
  },

  // ---- روايات وقراءات متواترة أخرى ----
  {
    id: 'sufi-khalaf',
    name: 'عبد الرشيد صوفي (خلف عن حمزة)',
    subname: 'رواية خلف عن حمزة من طريق الشاطبية',
    rewaya: 'رواية خلف عن حمزة',
    serverUrl: 'https://server16.mp3quran.net/soufi/khalaf',
    category: 'rewayat',
  },
  {
    id: 'sufi-sosi',
    name: 'عبد الرشيد صوفي (السوسي)',
    subname: 'رواية السوسي عن أبي عمرو',
    rewaya: 'رواية السوسي عن أبي عمرو',
    serverUrl: 'https://server16.mp3quran.net/soufi/sosi',
    category: 'rewayat',
  },
  {
    id: 'koshi-warsh',
    name: 'العيون الكوشي (ورش عن نافع)',
    subname: 'رواية ورش عن نافع من طريق الأزرق',
    rewaya: 'رواية ورش عن نافع',
    serverUrl: 'https://server11.mp3quran.net/koshi',
    category: 'rewayat',
  },
  {
    id: 'qazabri-warsh',
    name: 'عمر القزابري (ورش عن نافع)',
    subname: 'رواية ورش عن نافع من طريق الأزرق',
    rewaya: 'رواية ورش عن نافع',
    serverUrl: 'https://server9.mp3quran.net/omr',
    category: 'rewayat',
  },
  {
    id: 'husary-warsh',
    name: 'محمود خليل الحصري (ورش عن نافع)',
    subname: 'رواية ورش عن نافع',
    rewaya: 'رواية ورش عن نافع',
    serverUrl: 'https://cdn.mp3quran.net/audio/mahmoud-husary/r3',
    category: 'rewayat',
  },
];

export const getSurahAudioUrl = (serverUrl: string, surahNumber: number): string => {
  const padded = surahNumber.toString().padStart(3, '0');
  const cleanServer = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;
  return `${cleanServer}/${padded}.mp3`;
};

export const getSurahDownloadUrl = (
  serverUrl: string,
  surahNumber: number,
  surahName?: string,
  reciterName?: string
): string => {
  const audioUrl = getSurahAudioUrl(serverUrl, surahNumber);
  const cleanSurahName = surahName ? ` - سورة ${surahName}` : '';
  const cleanReciterName = reciterName ? ` - ${reciterName}` : '';
  const filename = `${surahNumber.toString().padStart(3, '0')}${cleanSurahName}${cleanReciterName}.mp3`;
  return `/api/download?url=${encodeURIComponent(audioUrl)}&filename=${encodeURIComponent(filename)}`;
};
