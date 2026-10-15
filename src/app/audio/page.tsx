'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { surahList, SurahInfoBasic } from '../data/surahList';
import { juzList, hizbList, JuzInfo, HizbInfo } from '../data/quranStructure';

// واجهة بيانات القارئ
interface AudioReciter {
  id: string;
  name: string;
  serverUrl: string;
  description: string;
}

// قائمة القراء المعتمدين والموثوقين
const AUDIO_RECITERS: AudioReciter[] = [
  { id: 'afs', name: 'مشاري بن راشد العفاسي', serverUrl: 'https://server8.mp3quran.net/afs', description: 'رواية حفص عن عاصم' },
  { id: 'basit', name: 'عبد الباسط عبد الصمد (مرتل)', serverUrl: 'https://server7.mp3quran.net/basit', description: 'رواية حفص عن عاصم' },
  { id: 'basit_mjwd', name: 'عبد الباسط عبد الصمد (مجود)', serverUrl: 'https://server7.mp3quran.net/basit_mjwd', description: 'تلاوة مجودة' },
  { id: 'husr', name: 'محمود خليل الحصري (مرتل)', serverUrl: 'https://server13.mp3quran.net/husr', description: 'رواية حفص عن عاصم' },
  { id: 'husr_mjwd', name: 'محمود خليل الحصري (مجود)', serverUrl: 'https://server13.mp3quran.net/husr_mjwd', description: 'تلاوة مجودة' },
  { id: 'minsh', name: 'محمد صديق المنشاوي (مرتل)', serverUrl: 'https://server10.mp3quran.net/minsh', description: 'رواية حفص عن عاصم' },
  { id: 'minsh_mjwd', name: 'محمد صديق المنشاوي (مجود)', serverUrl: 'https://server10.mp3quran.net/minsh_mjwd', description: 'تلاوة مجودة' },
  { id: 'sds', name: 'عبد الرحمن السديس', serverUrl: 'https://server11.mp3quran.net/sds', description: 'إمام الحرم المكي' },
  { id: 'shoraimy', name: 'سعود الشريم', serverUrl: 'https://server12.mp3quran.net/shoraimy', description: 'رواية حفص عن عاصم' },
  { id: 'maher', name: 'ماهر المعيقلي', serverUrl: 'https://server12.mp3quran.net/maher', description: 'إمام الحرم المكي' },
  { id: 'ghamdi', name: 'سعد الغامدي', serverUrl: 'https://server6.mp3quran.net/ghamdi', description: 'رواية حفص عن عاصم' },
  { id: 'yasser', name: 'ياسر الدوسري', serverUrl: 'https://server11.mp3quran.net/yasser', description: 'إمام الحرم المكي' },
  { id: 'frs_a', name: 'فارس عباد', serverUrl: 'https://server8.mp3quran.net/frs_a', description: 'رواية حفص عن عاصم' },
  { id: 'qtm', name: 'ناصر القطامي', serverUrl: 'https://server6.mp3quran.net/qtm', description: 'رواية حفص عن عاصم' },
  { id: 'jleel', name: 'خالد الجليل', serverUrl: 'https://server10.mp3quran.net/jleel', description: 'رواية حفص عن عاصم' },
  { id: 'ajm', name: 'أحمد بن علي العجمي', serverUrl: 'https://server10.mp3quran.net/ajm', description: 'رواية حفص عن عاصم' },
  { id: 'shatri', name: 'أبو بكر الشاطري', serverUrl: 'https://server11.mp3quran.net/shatri', description: 'رواية حفص عن عاصم' },
  { id: 'hthfi', name: 'علي بن عبد الرحمن الحذيفي', serverUrl: 'https://server9.mp3quran.net/hthfi', description: 'إمام المسجد النبوي' },
  { id: 'ayyub', name: 'محمد أيوب', serverUrl: 'https://server8.mp3quran.net/ayyub', description: 'رواية حفص عن عاصم' },
  { id: 'hazza', name: 'هزاع البلوشي', serverUrl: 'https://server11.mp3quran.net/hazza', description: 'رواية حفص عن عاصم' },
  { id: 'wdee', name: 'وديع اليمني', serverUrl: 'https://server6.mp3quran.net/wdee', description: 'رواية حفص عن عاصم' },
  { id: 'rifai', name: 'هاني الرفاعي', serverUrl: 'https://server8.mp3quran.net/rifai', description: 'رواية حفص عن عاصم' },
  { id: 'abkr', name: 'إدريس أبكر', serverUrl: 'https://server6.mp3quran.net/abkr', description: 'رواية حفص عن عاصم' },
  { id: 'bsfr', name: 'عبد الله بصفر', serverUrl: 'https://server6.mp3quran.net/bsfr', description: 'رواية حفص عن عاصم' },
];

// دالة توليد رابط الصوت
const getAudioUrl = (serverUrl: string, surahNum: number) => {
  const padded = surahNum.toString().padStart(3, '0');
  return `${serverUrl}/${padded}.mp3`;
};

// دالة تنزيل الملف المباشرة الموثوقة مع عدة طبقات أمان
const downloadFile = (url: string, filename: string) => {
  fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error('CORS or Network');
      return res.blob();
    })
    .then((blob) => {
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    })
    .catch(() => {
      // في حال تعذر التنزيل عبر الـ Blob، نستخدم مسار الـ proxy أو التنزيل المباشر
      const proxyUrl = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
      const link = document.createElement('a');
      link.href = proxyUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
};

export default function AudioLibraryPage() {
  const [selectedReciter, setSelectedReciter] = useState<AudioReciter>(AUDIO_RECITERS[0]);
  const [activeTab, setActiveTab] = useState<'surahs' | 'juz' | 'hizb'>('surahs');
  const [searchTerm, setSearchTerm] = useState('');
  const [revelationFilter, setRevelationFilter] = useState<'all' | 'meccan' | 'medinan'>('all');

  // التحديد المتعدد للسور للتحميل المجمع
  const [selectedSurahs, setSelectedSurahs] = useState<Set<number>>(new Set());
  const [downloadProgress, setDownloadProgress] = useState<{ current: number; total: number } | null>(null);

  // مشغل الصوت المدمج
  const [currentPlaying, setCurrentPlaying] = useState<{ surah: SurahInfoBasic; url: string } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // السور المفلترة
  const filteredSurahs = useMemo(() => {
    let list = surahList;
    if (revelationFilter !== 'all') {
      const type = revelationFilter === 'meccan' ? 'Meccan' : 'Medinan';
      list = list.filter((s) => s.revelationType === type);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.name.includes(term) ||
          s.number.toString() === term ||
          s.englishName.toLowerCase().includes(term)
      );
    }
    return list;
  }, [revelationFilter, searchTerm]);

  // الأجزاء المفلترة
  const filteredJuz = useMemo(() => {
    if (!searchTerm.trim()) return juzList;
    const term = searchTerm.trim().toLowerCase();
    return juzList.filter(
      (j) =>
        j.name.includes(term) ||
        j.number.toString() === term ||
        j.description.includes(term) ||
        j.startSurah.includes(term)
    );
  }, [searchTerm]);

  // الأحزاب المفلترة
  const filteredHizb = useMemo(() => {
    if (!searchTerm.trim()) return hizbList;
    const term = searchTerm.trim().toLowerCase();
    return hizbList.filter(
      (h) =>
        h.name.includes(term) ||
        h.number.toString() === term ||
        h.startSurah.includes(term)
    );
  }, [searchTerm]);

  // تبديل اختيار سورة
  const toggleSelectSurah = (surahNum: number) => {
    setSelectedSurahs((prev) => {
      const next = new Set(prev);
      if (next.has(surahNum)) next.delete(surahNum);
      else next.add(surahNum);
      return next;
    });
  };

  // تحديد الكل / إلغاء تحديد الكل
  const toggleSelectAll = () => {
    if (selectedSurahs.size === filteredSurahs.length) {
      setSelectedSurahs(new Set());
    } else {
      setSelectedSurahs(new Set(filteredSurahs.map((s) => s.number)));
    }
  };

  // تشغيل سورة في المشغل المدمج
  const handlePlaySurah = (surah: SurahInfoBasic) => {
    const url = getAudioUrl(selectedReciter.serverUrl, surah.number);
    if (currentPlaying?.surah.number === surah.number) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
    } else {
      setCurrentPlaying({ surah, url });
      setIsPlaying(true);
      setAudioLoading(true);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch((err) => {
          console.error('Play error:', err);
          setIsPlaying(false);
          setAudioLoading(false);
        });
      }
    }
  };

  // تحميل سورة مفردة
  const handleDownloadSingle = (surah: SurahInfoBasic) => {
    const url = getAudioUrl(selectedReciter.serverUrl, surah.number);
    const filename = `${surah.number.toString().padStart(3, '0')} - سورة ${surah.name} - ${selectedReciter.name}.mp3`;
    downloadFile(url, filename);
  };

  // تحميل مجموعة سور (تحديد متعدد، أو جزء، أو حزب)
  const handleDownloadMultiple = async (surahNumbers: number[]) => {
    if (surahNumbers.length === 0) return;
    setDownloadProgress({ current: 0, total: surahNumbers.length });

    for (let i = 0; i < surahNumbers.length; i++) {
      const surahNum = surahNumbers[i];
      const surah = surahList.find((s) => s.number === surahNum);
      if (!surah) continue;

      const url = getAudioUrl(selectedReciter.serverUrl, surahNum);
      const filename = `${surahNum.toString().padStart(3, '0')} - سورة ${surah.name} - ${selectedReciter.name}.mp3`;
      downloadFile(url, filename);

      setDownloadProgress({ current: i + 1, total: surahNumbers.length });
      // تأخير بسيط بين التحميلات لمنع حجب المتصفح للتحميلات المتتالية
      if (i < surahNumbers.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }

    setTimeout(() => {
      setDownloadProgress(null);
    }, 1500);
  };

  // التحكم في مشغل الصوت
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setAudioLoading(false);
    };
    const onCanPlay = () => setAudioLoading(false);
    const onEnded = () => setIsPlaying(false);
    const onError = () => {
      setIsPlaying(false);
      setAudioLoading(false);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, []);

  // تنسيق الوقت
  const formatTime = (time: number) => {
    if (isNaN(time) || time === 0) return '0:00';
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-pattern pb-32" dir="rtl">
      {/* مشغل صوت مخفي للتحكم */}
      <audio ref={audioRef} />

      <div className="max-w-6xl mx-auto fade-in">
        {/* شريط التنقل العلوي */}
        <nav className="mb-6 flex justify-between items-center text-sm">
          <Link
            href="/"
            className="flex items-center text-primary hover:text-accent transition-colors hover-lift font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="me-1.5"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            العودة إلى الصفحة الرئيسية
          </Link>
          <span className="text-xs text-foreground/60 bg-primary/10 px-3 py-1 rounded-full">
            المكتبة الصوتية الشاملة
          </span>
        </nav>

        {/* رأس الصفحة مع الهوية الإسلامية */}
        <header className="text-center mb-8 quran-card p-6 md:p-8 scale-in bg-gradient-to-b from-card-bg to-background/50">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary font-quran mb-2">
            المكتبة الصوتية للقرآن الكريم
          </h1>
          <p className="text-md md:text-lg text-foreground/80 max-w-2xl mx-auto mb-4">
            استمع وحمّل القرآن الكريم كاملاً بصوت نخبة من أشهر القراء — تصفح وتحميل فوري بالسورة أو بالجزء أو بالحزب بصيغة MP3.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs md:text-sm font-medium text-foreground/70">
            <span className="bg-background px-3 py-1.5 rounded-md border border-border-color shadow-sm">
              ✨ 114 سورة كاملة
            </span>
            <span className="bg-background px-3 py-1.5 rounded-md border border-border-color shadow-sm">
              📖 30 جزءاً
            </span>
            <span className="bg-background px-3 py-1.5 rounded-md border border-border-color shadow-sm">
              📜 60 حزباً
            </span>
            <span className="bg-background px-3 py-1.5 rounded-md border border-border-color shadow-sm">
              🎙️ {AUDIO_RECITERS.length} قارئاً معتمداً
            </span>
          </div>
        </header>

        {/* لوحة التحكم الرئيسية: اختيار القارئ + البحث + التبويبات */}
        <section className="quran-card p-5 mb-8 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* اختيار القارئ */}
            <div className="lg:col-span-5">
              <label
                htmlFor="reciter-picker"
                className="block text-sm font-semibold text-primary mb-1.5"
              >
                اختر القارئ:
              </label>
              <div className="relative">
                <select
                  id="reciter-picker"
                  value={selectedReciter.id}
                  onChange={(e) => {
                    const rec = AUDIO_RECITERS.find((r) => r.id === e.target.value);
                    if (rec) setSelectedReciter(rec);
                  }}
                  className="w-full p-2.5 pe-8 border border-border-color rounded-lg bg-background text-sm font-ui focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                >
                  {AUDIO_RECITERS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} — ({r.description})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* شريط البحث */}
            <div className="lg:col-span-4">
              <label
                htmlFor="search-input"
                className="block text-sm font-semibold text-primary mb-1.5"
              >
                البحث السريع:
              </label>
              <div className="relative">
                <input
                  id="search-input"
                  type="search"
                  placeholder="ابحث بالاسم أو الرقم..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2.5 pe-9 border border-border-color rounded-lg bg-background text-sm font-ui focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
            </div>

            {/* أزرار التبويبات (سور / أجزاء / أحزاب) */}
            <div className="lg:col-span-3 flex flex-col justify-end">
              <span className="block text-sm font-semibold text-primary mb-1.5">
                طريقة التصفح:
              </span>
              <div className="flex bg-background border border-border-color rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setActiveTab('surahs')}
                  className={`flex-1 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all ${
                    activeTab === 'surahs'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-foreground/70 hover:text-primary'
                  }`}
                >
                  بالسور
                </button>
                <button
                  onClick={() => setActiveTab('juz')}
                  className={`flex-1 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all ${
                    activeTab === 'juz'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-foreground/70 hover:text-primary'
                  }`}
                >
                  بالأجزاء
                </button>
                <button
                  onClick={() => setActiveTab('hizb')}
                  className={`flex-1 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all ${
                    activeTab === 'hizb'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-foreground/70 hover:text-primary'
                  }`}
                >
                  بالأحزاب
                </button>
              </div>
            </div>
          </div>

          {/* فلتر إضافي للسور (مكية / مدنية) وميزة التحديد المجمع */}
          {activeTab === 'surahs' && (
            <div className="mt-4 pt-4 border-t border-border-color/60 flex flex-wrap items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-foreground/70 text-xs font-medium">النوع:</span>
                <button
                  onClick={() => setRevelationFilter('all')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    revelationFilter === 'all'
                      ? 'bg-primary text-white'
                      : 'bg-background border border-border-color text-foreground/70'
                  }`}
                >
                  الكل ({surahList.length})
                </button>
                <button
                  onClick={() => setRevelationFilter('meccan')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    revelationFilter === 'meccan'
                      ? 'bg-orange-600 text-white'
                      : 'bg-background border border-border-color text-foreground/70'
                  }`}
                >
                  مكية
                </button>
                <button
                  onClick={() => setRevelationFilter('medinan')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    revelationFilter === 'medinan'
                      ? 'bg-teal-600 text-white'
                      : 'bg-background border border-border-color text-foreground/70'
                  }`}
                >
                  مدنية
                </button>
              </div>

              {/* أزرار التحديد والتحميل المجمع */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleSelectAll}
                  className="button-outline text-xs py-1.5 px-3 flex items-center gap-1.5"
                >
                  <input
                    type="checkbox"
                    readOnly
                    checked={
                      selectedSurahs.size > 0 &&
                      selectedSurahs.size === filteredSurahs.length
                    }
                    className="accent-primary"
                  />
                  <span>
                    {selectedSurahs.size === filteredSurahs.length
                      ? 'إلغاء تحديد الكل'
                      : `تحديد الكل (${filteredSurahs.length})`}
                  </span>
                </button>

                {selectedSurahs.size > 0 && (
                  <button
                    onClick={() =>
                      handleDownloadMultiple(Array.from(selectedSurahs))
                    }
                    className="button text-xs py-1.5 px-3 flex items-center gap-1.5 bg-accent hover:bg-accent/90"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    تحميل المحدد ({selectedSurahs.size})
                  </button>
                )}
              </div>
            </div>
          )}
        </section>

        {/* تنبيه شريط تقدم التحميل المجمع */}
        {downloadProgress && (
          <div className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center gap-3">
              <svg
                className="animate-spin h-5 w-5 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <div>
                <p className="text-sm font-semibold text-primary">
                  جاري تحميل السور إلى جهازك... ({downloadProgress.current} من {downloadProgress.total})
                </p>
                <p className="text-xs text-foreground/70">
                  يتم التحميل بصوت القارئ: {selectedReciter.name}
                </p>
              </div>
            </div>
            <div className="w-32 bg-border-color rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-300"
                style={{
                  width: `${(downloadProgress.current / downloadProgress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* =========================================
            التبويب الأول: عرض السور (114 سورة)
        ========================================== */}
        {activeTab === 'surahs' && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSurahs.map((surah) => {
                const isSelected = selectedSurahs.has(surah.number);
                const isThisPlaying =
                  currentPlaying?.surah.number === surah.number && isPlaying;

                return (
                  <div
                    key={surah.number}
                    className={`quran-card p-4 flex flex-col justify-between transition-all duration-200 ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/20 shadow-md'
                        : 'hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectSurah(surah.number)}
                          className="w-4 h-4 rounded accent-primary cursor-pointer mt-1"
                          aria-label={`تحديد سورة ${surah.name}`}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                              {surah.number.toLocaleString('ar-EG')}
                            </span>
                            <h2 className="text-xl font-bold font-quran text-foreground">
                              سورة {surah.name}
                            </h2>
                          </div>
                          <p className="text-xs text-foreground/60 mt-0.5">
                            {surah.numberOfAyahs.toLocaleString('ar-EG')} آيات •{' '}
                            {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`w-2.5 h-2.5 rounded-full mt-1.5 ${
                          surah.revelationType === 'Meccan'
                            ? 'bg-orange-500'
                            : 'bg-teal-500'
                        }`}
                        title={surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                      />
                    </div>

                    {/* أزرار العمليات لكل سورة */}
                    <div className="pt-3 border-t border-border-color/60 flex items-center justify-between gap-2">
                      {/* زر الاستماع */}
                      <button
                        onClick={() => handlePlaySurah(surah)}
                        className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                          isThisPlaying
                            ? 'bg-accent text-white shadow-sm'
                            : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                        }`}
                      >
                        {isThisPlaying ? (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <rect x="6" y="4" width="4" height="16" />
                              <rect x="14" y="4" width="4" height="16" />
                            </svg>
                            إيقاف مؤقت
                          </>
                        ) : (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                            استماع
                          </>
                        )}
                      </button>

                      {/* زر التحميل الفردي */}
                      <button
                        onClick={() => handleDownloadSingle(surah)}
                        className="button-outline py-1.5 px-3 rounded-md text-xs flex items-center justify-center gap-1 hover:bg-primary hover:text-white transition-colors"
                        title={`تحميل سورة ${surah.name}`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        تحميل
                      </button>

                      {/* زر الذهاب لقراءة السورة */}
                      <Link
                        href={`/surah/${surah.number}`}
                        className="p-1.5 rounded-md text-foreground/60 hover:text-primary hover:bg-background border border-transparent hover:border-border-color transition-colors"
                        title="قراءة نص السورة"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredSurahs.length === 0 && (
              <div className="text-center py-12 quran-card">
                <p className="text-lg text-foreground/70 mb-2">
                  لم يتم العثور على سور تطابق بحثك.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setRevelationFilter('all');
                  }}
                  className="button text-xs py-1.5 px-4"
                >
                  إعادة ضبط البحث
                </button>
              </div>
            )}
          </div>
        )}

        {/* =========================================
            التبويب الثاني: عرض الأجزاء (30 جزء)
        ========================================== */}
        {activeTab === 'juz' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredJuz.map((juz: JuzInfo) => (
              <div
                key={juz.number}
                className="quran-card p-5 flex flex-col justify-between hover:border-primary/50 transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white bg-primary px-2.5 py-1 rounded-full">
                      الجزء {juz.number.toLocaleString('ar-EG')}
                    </span>
                    <span className="text-xs text-foreground/60 font-medium">
                      {juz.surahNumbers.length} سورة
                    </span>
                  </div>

                  <h3 className="text-xl font-bold font-quran text-foreground mb-1">
                    {juz.name}
                  </h3>
                  <p className="text-xs text-foreground/70 mb-3 leading-relaxed">
                    {juz.description}
                  </p>

                  {/* قائمة أسماء السور داخل هذا الجزء */}
                  <div className="bg-background/80 rounded-md p-2.5 border border-border-color/60 mb-4 max-h-24 overflow-y-auto">
                    <p className="text-[11px] text-foreground/50 mb-1 font-semibold">
                      السور في هذا الجزء:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {juz.surahNumbers.map((sNum) => {
                        const surah = surahList.find((s) => s.number === sNum);
                        if (!surah) return null;
                        return (
                          <span
                            key={sNum}
                            className="inline-block bg-card-bg text-foreground/80 border border-border-color text-[11px] px-2 py-0.5 rounded"
                          >
                            {surah.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* زر تحميل سور الجزء بالكامل */}
                <div className="pt-3 border-t border-border-color flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadMultiple(juz.surahNumbers)}
                    className="button flex-1 py-2 px-3 text-xs flex items-center justify-center gap-1.5"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    تحميل سور الجزء ({juz.surahNumbers.length})
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =========================================
            التبويب الثالث: عرض الأحزاب (60 حزب)
        ========================================== */}
        {activeTab === 'hizb' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredHizb.map((hizb: HizbInfo) => (
              <div
                key={hizb.number}
                className="quran-card p-4 flex flex-col justify-between hover:border-primary/50 transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      الحزب {hizb.number.toLocaleString('ar-EG')}
                    </span>
                    <span className="text-[11px] text-foreground/60">
                      الجزء {hizb.juzNumber.toLocaleString('ar-EG')}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-quran text-foreground mb-1">
                    {hizb.name}
                  </h3>
                  <p className="text-xs text-foreground/70 mb-3">
                    يبدأ من: {hizb.startSurah}
                  </p>

                  <div className="text-[11px] text-foreground/60 bg-background/60 p-2 rounded border border-border-color/60 mb-3">
                    السور المشمولة: {hizb.surahNumbers.length} سورة
                  </div>
                </div>

                <button
                  onClick={() => handleDownloadMultiple(hizb.surahNumbers)}
                  className="button-outline w-full py-1.5 px-3 text-xs flex items-center justify-center gap-1.5 hover:bg-primary hover:text-white transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  تحميل الحزب ({hizb.surahNumbers.length} سورة)
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =========================================
          شريط مشغل الصوت السفلي المدمج (Sticky Player)
      ========================================== */}
      {currentPlaying && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-card-bg/95 backdrop-blur-md border-t border-border-color shadow-2xl p-3 md:p-4 transition-transform duration-300">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6">
            {/* معلومات السورة والقارئ */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-bold font-quran text-lg">
                {currentPlaying.surah.number.toLocaleString('ar-EG')}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm md:text-base font-bold text-foreground truncate font-quran">
                  سورة {currentPlaying.surah.name}
                </h4>
                <p className="text-xs text-foreground/60 truncate">
                  بصوت القارئ: {selectedReciter.name}
                </p>
              </div>
            </div>

            {/* أزرار التحكم والخط الزمني */}
            <div className="flex-1 w-full max-w-xl flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-3">
                {/* زر تشغيل / إيقاف مؤقت */}
                <button
                  onClick={() => {
                    if (isPlaying) {
                      audioRef.current?.pause();
                      setIsPlaying(false);
                    } else {
                      audioRef.current?.play();
                      setIsPlaying(true);
                    }
                  }}
                  className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center hover:bg-accent transition-colors shadow-sm"
                  aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                >
                  {audioLoading ? (
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : isPlaying ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  )}
                </button>
              </div>

              {/* شريط التقدم والوقت */}
              <div className="w-full flex items-center gap-2 text-[11px] font-mono text-foreground/70" dir="ltr">
                <span>{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => {
                    const newTime = Number(e.target.value);
                    if (audioRef.current) {
                      audioRef.current.currentTime = newTime;
                      setCurrentTime(newTime);
                    }
                  }}
                  className="flex-1 h-1.5 bg-border-color rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* أزرار جانبية (تحميل وإغلاق) */}
            <div className="flex items-center gap-2 self-end md:self-center">
              <button
                onClick={() => handleDownloadSingle(currentPlaying.surah)}
                className="button-outline text-xs py-1.5 px-3 flex items-center gap-1"
                title="تحميل هذه السورة"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                تحميل
              </button>

              <button
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.pause();
                  }
                  setCurrentPlaying(null);
                  setIsPlaying(false);
                }}
                className="p-1.5 text-foreground/50 hover:text-red-500 rounded-md transition-colors"
                title="إغلاق المشغل"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}