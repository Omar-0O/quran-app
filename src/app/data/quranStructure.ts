export interface JuzInfo {
  number: number;
  name: string;
  startSurah: string;
  endSurah: string;
  surahNumbers: number[];
  description: string;
}

export interface HizbInfo {
  number: number;
  juzNumber: number;
  name: string;
  startSurah: string;
  surahNumbers: number[];
}

export const juzList: JuzInfo[] = [
  {
    number: 1,
    name: 'الجزء الأول',
    startSurah: 'الفاتحة',
    endSurah: 'البقرة (141)',
    surahNumbers: [1, 2],
    description: 'سورة الفاتحة وسورة البقرة حتى الآية 141'
  },
  {
    number: 2,
    name: 'الجزء الثاني (سيقول)',
    startSurah: 'البقرة (142)',
    endSurah: 'البقرة (252)',
    surahNumbers: [2],
    description: 'سورة البقرة من الآية 142 إلى الآية 252'
  },
  {
    number: 3,
    name: 'الجزء الثالث (تلك الرسل)',
    startSurah: 'البقرة (253)',
    endSurah: 'آل عمران (92)',
    surahNumbers: [2, 3],
    description: 'سورة البقرة من الآية 253 إلى 286 وسورة آل عمران حتى الآية 92'
  },
  {
    number: 4,
    name: 'الجزء الرابع (لن تنالوا)',
    startSurah: 'آل عمران (93)',
    endSurah: 'النساء (23)',
    surahNumbers: [3, 4],
    description: 'سورة آل عمران من الآية 93 إلى 200 وسورة النساء حتى الآية 23'
  },
  {
    number: 5,
    name: 'الجزء الخامس (والمحصنات)',
    startSurah: 'النساء (24)',
    endSurah: 'النساء (147)',
    surahNumbers: [4],
    description: 'سورة النساء من الآية 24 إلى 147'
  },
  {
    number: 6,
    name: 'الجزء السادس (لا يحب الله)',
    startSurah: 'النساء (148)',
    endSurah: 'المائدة (81)',
    surahNumbers: [4, 5],
    description: 'سورة النساء من الآية 148 إلى 176 وسورة المائدة حتى الآية 81'
  },
  {
    number: 7,
    name: 'الجزء السابع (وإذا سمعوا)',
    startSurah: 'المائدة (82)',
    endSurah: 'الأنعام (110)',
    surahNumbers: [5, 6],
    description: 'سورة المائدة من الآية 82 إلى 120 وسورة الأنعام حتى الآية 110'
  },
  {
    number: 8,
    name: 'الجزء الثامن (ولو أننا)',
    startSurah: 'الأنعام (111)',
    endSurah: 'الأعراف (87)',
    surahNumbers: [6, 7],
    description: 'سورة الأنعام من الآية 111 إلى 165 وسورة الأعراف حتى الآية 87'
  },
  {
    number: 9,
    name: 'الجزء التاسع (قال الملأ)',
    startSurah: 'الأعراف (88)',
    endSurah: 'الأنفال (40)',
    surahNumbers: [7, 8],
    description: 'سورة الأعراف من الآية 88 إلى 206 وسورة الأنفال حتى الآية 40'
  },
  {
    number: 10,
    name: 'الجزء العاشر (واعلموا)',
    startSurah: 'الأنفال (41)',
    endSurah: 'التوبة (92)',
    surahNumbers: [8, 9],
    description: 'سورة الأنفال من الآية 41 إلى 75 وسورة التوبة حتى الآية 92'
  },
  {
    number: 11,
    name: 'الجزء الحادي عشر (يعتذرون)',
    startSurah: 'التوبة (93)',
    endSurah: 'هود (5)',
    surahNumbers: [9, 10, 11],
    description: 'سورة التوبة من الآية 93، وسورة يونس كاملة، وسورة هود حتى الآية 5'
  },
  {
    number: 12,
    name: 'الجزء الثاني عشر (وما من دابة)',
    startSurah: 'هود (6)',
    endSurah: 'يوسف (52)',
    surahNumbers: [11, 12],
    description: 'سورة هود من الآية 6 إلى 123 وسورة يوسف حتى الآية 52'
  },
  {
    number: 13,
    name: 'الجزء الثالث عشر (وما أبرئ نفسي)',
    startSurah: 'يوسف (53)',
    endSurah: 'إبراهيم (52)',
    surahNumbers: [12, 13, 14],
    description: 'بقية سورة يوسف، وسورة الرعد، وسورة إبراهيم كاملة'
  },
  {
    number: 14,
    name: 'الجزء الرابع عشر (ربما)',
    startSurah: 'الحجر',
    endSurah: 'النحل (128)',
    surahNumbers: [15, 16],
    description: 'سورة الحجر كاملة وسورة النحل كاملة'
  },
  {
    number: 15,
    name: 'الجزء الخامس عشر (سبحان الذي)',
    startSurah: 'الإسراء',
    endSurah: 'الكهف (74)',
    surahNumbers: [17, 18],
    description: 'سورة الإسراء كاملة وسورة الكهف حتى الآية 74'
  },
  {
    number: 16,
    name: 'الجزء السادس عشر (قال ألم)',
    startSurah: 'الكهف (75)',
    endSurah: 'طه (135)',
    surahNumbers: [18, 19, 20],
    description: 'بقية سورة الكهف، وسورة مريم، وسورة طه كاملة'
  },
  {
    number: 17,
    name: 'الجزء السابع عشر (اقترب للناس)',
    startSurah: 'الأنبياء',
    endSurah: 'الحج (78)',
    surahNumbers: [21, 22],
    description: 'سورة الأنبياء وسورة الحج كاملتين'
  },
  {
    number: 18,
    name: 'الجزء الثامن عشر (قد أفلح)',
    startSurah: 'المؤمنون',
    endSurah: 'الفرقان (20)',
    surahNumbers: [23, 24, 25],
    description: 'سورة المؤمنون، وسورة النور، وسورة الفرقان حتى الآية 20'
  },
  {
    number: 19,
    name: 'الجزء التاسع عشر (وقال الذين)',
    startSurah: 'الفرقان (21)',
    endSurah: 'النمل (55)',
    surahNumbers: [25, 26, 27],
    description: 'بقية سورة الفرقان، وسورة الشعراء، وسورة النمل حتى الآية 55'
  },
  {
    number: 20,
    name: 'الجزء العشرون (أمن خلق)',
    startSurah: 'النمل (56)',
    endSurah: 'العنكبوت (45)',
    surahNumbers: [27, 28, 29],
    description: 'بقية سورة النمل، وسورة القصص، وسورة العنكبوت حتى الآية 45'
  },
  {
    number: 21,
    name: 'الجزء الحادي والعشرون (اتل ما أوحي)',
    startSurah: 'العنكبوت (46)',
    endSurah: 'الأحزاب (30)',
    surahNumbers: [29, 30, 31, 32, 33],
    description: 'بقية العنكبوت، وسور الروم، لقمان، السجدة، والأحزاب حتى الآية 30'
  },
  {
    number: 22,
    name: 'الجزء الثاني والعشرون (ومن يقنت)',
    startSurah: 'الأحزاب (31)',
    endSurah: 'يس (27)',
    surahNumbers: [33, 34, 35, 36],
    description: 'بقية سورة الأحزاب، وسور سبأ، فاطر، وسورة يس حتى الآية 27'
  },
  {
    number: 23,
    name: 'الجزء الثالث والعشرون (وما أنزلنا)',
    startSurah: 'يس (28)',
    endSurah: 'الزمر (31)',
    surahNumbers: [36, 37, 38, 39],
    description: 'بقية سورة يس، وسور الصافات، ص، وسورة الزمر حتى الآية 31'
  },
  {
    number: 24,
    name: 'الجزء الرابع والعشرون (فمن أظلم)',
    startSurah: 'الزمر (32)',
    endSurah: 'فصلت (46)',
    surahNumbers: [39, 40, 41],
    description: 'بقية سورة الزمر، وسورة غافر، وسورة فصلت حتى الآية 46'
  },
  {
    number: 25,
    name: 'الجزء الخامس والعشرون (إليه يرد)',
    startSurah: 'فصلت (47)',
    endSurah: 'الجاثية (37)',
    surahNumbers: [41, 42, 43, 44, 45],
    description: 'بقية سورة فصلت، وسور الشورى، الزخرف، الدخان، والجاثية كاملة'
  },
  {
    number: 26,
    name: 'الجزء السادس والعشرون (حم)',
    startSurah: 'الأحقاف',
    endSurah: 'الذاريات (30)',
    surahNumbers: [46, 47, 48, 49, 50, 51],
    description: 'سور الأحقاف، محمد، الفتح، الحجرات، ق، والذاريات حتى الآية 30'
  },
  {
    number: 27,
    name: 'الجزء السابع والعشرون (قال فما خطبكم)',
    startSurah: 'الذاريات (31)',
    endSurah: 'الحديد (29)',
    surahNumbers: [51, 52, 53, 54, 55, 56, 57],
    description: 'بقية الذاريات، وسور الطور، النجم، القمر، الرحمن، الواقعة، والحديد'
  },
  {
    number: 28,
    name: 'الجزء الثامن والعشرون (قد سمع)',
    startSurah: 'المجادلة',
    endSurah: 'التحريم (12)',
    surahNumbers: [58, 59, 60, 61, 62, 63, 64, 65, 66],
    description: 'سور المجادلة، الحشر، الممتحنة، الصف، الجمعة، المنافقون، التغابن، الطلاق، والتحريم'
  },
  {
    number: 29,
    name: 'الجزء التاسع والعشرون (تبارك)',
    startSurah: 'الملك',
    endSurah: 'المرسلات (50)',
    surahNumbers: [67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77],
    description: 'سور الملك، القلم، الحاقة، المعارج، نوح، الجن، المزمل، المدثر، القيامة، الإنسان، والمرسلات'
  },
  {
    number: 30,
    name: 'الجزء الثلاثون (عمّ)',
    startSurah: 'النبأ',
    endSurah: 'الناس (6)',
    surahNumbers: Array.from({ length: 37 }, (_, i) => 78 + i),
    description: 'من سورة النبأ إلى سورة الناس (37 سورة قصار السور)'
  }
];

// إنشاء قائمة الأحزاب الستين
export const hizbList: HizbInfo[] = Array.from({ length: 60 }, (_, i) => {
  const hizbNum = i + 1;
  const juzNum = Math.floor(i / 2) + 1;
  const isFirstHalf = i % 2 === 0;
  
  // تحديد السور لكل حزب بناء على الجزء
  const juz = juzList[juzNum - 1];
  let surahs: number[] = [];
  if (isFirstHalf) {
    const half = Math.ceil(juz.surahNumbers.length / 2);
    surahs = juz.surahNumbers.slice(0, Math.max(1, half));
  } else {
    const half = Math.ceil(juz.surahNumbers.length / 2);
    surahs = juz.surahNumbers.slice(Math.max(0, half - 1));
  }
  if (surahs.length === 0) surahs = juz.surahNumbers;

  return {
    number: hizbNum,
    juzNumber: juzNum,
    name: `الحزب ${hizbNum.toLocaleString('ar-EG')}`,
    startSurah: juz.startSurah,
    surahNumbers: surahs
  };
});
