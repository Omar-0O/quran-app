'use client';

import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { SurahData, AyahData } from '../../data/constants';
import { ALL_RECITERS, ReciterInfo, getSurahAudioUrl, getSurahDownloadUrl } from '../../data/reciters';
import TafsirModal from '../../components/TafsirModal';

// الأيقونات بصيغة SVG خفيفة وسريعة بدون مكتبات خارجية
const IconMaximize = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
);
const IconMinimize = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>
);
const IconBookOpen = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
);
const IconAlignJustify = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
);
const IconChevronRight = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
);
const IconChevronLeft = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
);
const IconEye = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
);

// أسماء الأجزاء
const JUZ_NAMES: { [key: number]: string } = {
  1: 'الأول', 2: 'الثاني', 3: 'الثالث', 4: 'الرابع', 5: 'الخامس',
  6: 'السادس', 7: 'السابع', 8: 'الثامن', 9: 'التاسع', 10: 'العاشر',
  11: 'الحادي عشر', 12: 'الثاني عشر', 13: 'الثالث عشر', 14: 'الرابع عشر', 15: 'الخامس عشر',
  16: 'السادس عشر', 17: 'السابع عشر', 18: 'الثامن عشر', 19: 'التاسع عشر', 20: 'العشرون',
  21: 'الحادي والعشرون', 22: 'الثاني والعشرون', 23: 'الثالث والعشرون', 24: 'الرابع والعشرون', 25: 'الخامس والعشرون',
  26: 'السادس والعشرون', 27: 'السابع والعشرون', 28: 'الثامن والعشرون', 29: 'التاسع والعشرون', 30: 'الثلاثون',
};

// دالة مساعدة لترجمة نوع النزول إلى العربية
const getArabicRevelationType = (type: string): string => {
  return type === 'Meccan' ? 'مكية' : 'مدنية';
};

// خيارات راحة العين
type ReadingTheme = 'sepia' | 'night' | 'emerald' | 'light';
type QuranFont = 'amiri' | 'naskh';
type LineSpacing = 'normal' | 'relaxed' | 'loose';

// ---- مكوّن شاشة التحميل الفاخرة ----
function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-pattern" dir="rtl">
      <div className="text-center space-y-6">
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border-4 border-t-primary border-r-primary border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="w-10 h-10 text-primary" fill="currentColor">
              <path d="M8 8h48v48H8z" fill="none" stroke="currentColor" strokeWidth="3" rx="4" />
              <path d="M16 20h32M16 28h32M16 36h24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M32 8v8M32 48v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        <div>
          <p className="text-2xl font-quran text-primary font-semibold mb-1">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</p>
          <p className="text-sm text-foreground/60 font-ui animate-pulse">جارٍ تحميل السورة الشريفة...</p>
        </div>
      </div>
    </div>
  );
}

// ---- محتوى الصفحة الرئيسي ----
function SurahPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const highlightedAyahParam = searchParams.get('ayah');
  const surahId = parseInt(params.id as string);

  const [surah, setSurah] = useState<SurahData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [audioError, setAudioError] = useState('');

  // حالة الصوت - المنشاوي المرتل افتراضياً في الصدارة
  const [selectedReciter, setSelectedReciter] = useState<ReciterInfo>(ALL_RECITERS[0]);
  const [isSurahPlaying, setIsSurahPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ---- أسلوب القراءة: 'scroll' (متدفق) | 'page' (بشكل صفحات المصحف) ----
  const [readingMode, setReadingMode] = useState<'scroll' | 'page'>('page');
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // ---- إعدادات راحة العين ----
  const [readingTheme, setReadingTheme] = useState<ReadingTheme>('sepia');
  const [fontSize, setFontSize] = useState<number>(24); // px
  const [fontFamily, setFontFamily] = useState<QuranFont>('amiri');
  const [lineSpacing, setLineSpacing] = useState<LineSpacing>('relaxed');
  const [showComfortMenu, setShowComfortMenu] = useState(false);

  // ---- حالة ملء الشاشة ----
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ---- حالة الآية المختارة والتفسير والإشعار ----
  const [selectedAyahForAction, setSelectedAyahForAction] = useState<AyahData | null>(null);
  const [tafsirAyahNumber, setTafsirAyahNumber] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // مراجع
  const ayahRefs = useRef<{ [key: number]: HTMLSpanElement | null }>({});
  const surahContentRef = useRef<HTMLDivElement | null>(null);

  const prevSurah = surahId > 1 ? surahId - 1 : null;
  const nextSurah = surahId < 114 ? surahId + 1 : null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // استرجاع تفضيلات راحة العين من التخزين المحلي
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('quran_reading_theme') as ReadingTheme;
      if (savedTheme) setReadingTheme(savedTheme);
      const savedMode = localStorage.getItem('quran_reading_mode') as 'scroll' | 'page';
      if (savedMode) setReadingMode(savedMode);
      const savedFontSize = localStorage.getItem('quran_font_size');
      if (savedFontSize) setFontSize(parseInt(savedFontSize, 10));
      const savedFont = localStorage.getItem('quran_font_family') as QuranFont;
      if (savedFont) setFontFamily(savedFont);
    } catch {
      // ignore
    }
  }, []);

  const changeReadingTheme = (theme: ReadingTheme) => {
    setReadingTheme(theme);
    try {
      localStorage.setItem('quran_reading_theme', theme);
    } catch {
      // ignore
    }
  };

  const changeReadingMode = (mode: 'scroll' | 'page') => {
    setReadingMode(mode);
    try {
      localStorage.setItem('quran_reading_mode', mode);
    } catch {
      // ignore
    }
  };

  const changeFontSize = (delta: number) => {
    setFontSize(prev => {
      const nextSize = Math.max(18, Math.min(40, prev + delta));
      try {
        localStorage.setItem('quran_font_size', nextSize.toString());
      } catch {
        // ignore
      }
      return nextSize;
    });
  };

  // ---- جلب بيانات السورة مع معلومات الصفحات الحقيقية ----
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setFetchError('');
      setSurah(null);
      setIsSurahPlaying(false);
      setAudioError('');
      setCurrentPageIndex(0);

      try {
        const baseUrl = process.env.NEXT_PUBLIC_QURAN_CLOUD_API_URL || 'https://api.alquran.cloud/v1';
        const response = await fetch(`${baseUrl}/surah/${surahId}`);
        const data = await response.json();
        if (data.code === 200 && data.data) {
          setSurah(data.data);
        } else {
          throw new Error('فشل تحميل بيانات السورة.');
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع أثناء تحميل السورة.';
        setFetchError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [surahId]);

  // ---- تقسيم آيات السورة حسب صفحات المصحف الشريف الحقيقية ----
  const pagesList = useMemo(() => {
    if (!surah || !surah.ayahs) return [];

    // تجميع الآيات حسب رقم الصفحة في مصحف المدينة
    const pageMap = new Map<number, AyahData[]>();
    surah.ayahs.forEach((ayah) => {
      const pageNum = ayah.page || 1;
      if (!pageMap.has(pageNum)) {
        pageMap.set(pageNum, []);
      }
      pageMap.get(pageNum)!.push(ayah);
    });

    const sortedPages = Array.from(pageMap.keys()).sort((a, b) => a - b);
    return sortedPages.map(pageNum => ({
      pageNumber: pageNum,
      ayahs: pageMap.get(pageNum)!,
      juz: pageMap.get(pageNum)![0]?.juz || 1,
      hizbQuarter: pageMap.get(pageNum)![0]?.hizbQuarter || 1,
    }));
  }, [surah]);

  const currentPage = pagesList[currentPageIndex] || null;

  // ---- إعداد وإدارة الصوت ----
  const currentAudioUrl = useMemo(() => {
    if (!surahId || !selectedReciter) return null;
    return getSurahAudioUrl(selectedReciter.serverUrl, surahId);
  }, [surahId, selectedReciter]);

  const currentDownloadUrl = useMemo(() => {
    if (!surahId || !selectedReciter || !surah) return '#';
    return getSurahDownloadUrl(selectedReciter.serverUrl, surahId, surah.name, selectedReciter.name);
  }, [surahId, selectedReciter, surah]);

  const handleFullSurahEnded = useCallback(() => setIsSurahPlaying(false), []);
  const handleAudioCanPlay = useCallback(() => setIsAudioLoading(false), []);
  const handleAudioWaiting = useCallback(() => setIsAudioLoading(true), []);
  const handleAudioPlaying = useCallback(() => setIsAudioLoading(false), []);
  const handleAudioError = useCallback(() => {
    setAudioError('تعذر تشغيل التلاوة حالياً. يمكنك تجربة قارئ آخر.');
    setIsAudioLoading(false);
    setIsSurahPlaying(false);
  }, []);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'none';
      audioRef.current.addEventListener('ended', handleFullSurahEnded);
      audioRef.current.addEventListener('error', handleAudioError);
      audioRef.current.addEventListener('canplay', handleAudioCanPlay);
      audioRef.current.addEventListener('waiting', handleAudioWaiting);
      audioRef.current.addEventListener('playing', handleAudioPlaying);
    }
    return () => {
      const currentAudio = audioRef.current;
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
        currentAudio.removeEventListener('ended', handleFullSurahEnded);
        currentAudio.removeEventListener('error', handleAudioError);
        currentAudio.removeEventListener('canplay', handleAudioCanPlay);
        currentAudio.removeEventListener('waiting', handleAudioWaiting);
        currentAudio.removeEventListener('playing', handleAudioPlaying);
      }
    };
  }, [handleFullSurahEnded, handleAudioError, handleAudioCanPlay, handleAudioWaiting, handleAudioPlaying]);

  // تحديث مصدر الصوت عند تغيير السورة أو القارئ
  useEffect(() => {
    if (audioRef.current && currentAudioUrl) {
      if (audioRef.current.src !== currentAudioUrl) {
        audioRef.current.src = currentAudioUrl;
        if (isSurahPlaying) {
          audioRef.current.play().catch(() => setIsSurahPlaying(false));
        }
      }
    }
  }, [currentAudioUrl, isSurahPlaying]);

  const handleToggleFullSurahPlay = async () => {
    if (!audioRef.current || !currentAudioUrl) return;
    setAudioError('');

    if (isSurahPlaying) {
      audioRef.current.pause();
      setIsSurahPlaying(false);
    } else {
      if (audioRef.current.src !== currentAudioUrl) {
        audioRef.current.src = currentAudioUrl;
      }
      setIsAudioLoading(true);
      try {
        await audioRef.current.play();
        setIsSurahPlaying(true);
      } catch {
        setAudioError('تعذر تشغيل التلاوة. يمكنك تحميلها مباشرة عبر زر التحميل.');
        setIsAudioLoading(false);
        setIsSurahPlaying(false);
      }
    }
  };

  const handleReciterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const reciterId = event.target.value;
    const newReciter = ALL_RECITERS.find(r => r.id === reciterId);
    if (newReciter) {
      if (isSurahPlaying && audioRef.current) audioRef.current.pause();
      setIsSurahPlaying(false);
      setSelectedReciter(newReciter);
      showToast(`تم اختيار القارئ: ${newReciter.name}`);
    }
  };

  // ---- التنقل بالأسهم في وضع الصفحات ----
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (readingMode !== 'page') return;
      if (e.key === 'ArrowLeft') {
        // السهم الأيسر ينتقل للصفحة التالية في اتجاه القراءة العربية
        setCurrentPageIndex(prev => Math.min(pagesList.length - 1, prev + 1));
      } else if (e.key === 'ArrowRight') {
        // السهم الأيمن ينتقل للصفحة السابقة
        setCurrentPageIndex(prev => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [readingMode, pagesList.length]);

  // ---- التمرير للآية المسلط عليها الضوء ----
  useEffect(() => {
    if (highlightedAyahParam && !loading && surah) {
      const ayahNum = parseInt(highlightedAyahParam);
      // في وضع الصفحات، ننتقل تلقائياً للصفحة التي تحوي الآية
      if (readingMode === 'page') {
        const targetPageIndex = pagesList.findIndex(p => p.ayahs.some(a => a.numberInSurah === ayahNum));
        if (targetPageIndex !== -1) {
          setCurrentPageIndex(targetPageIndex);
        }
      }
      setTimeout(() => {
        const ayahElement = ayahRefs.current[ayahNum];
        if (ayahElement) {
          ayahElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          ayahElement.classList.add('ayah-highlight');
          setTimeout(() => ayahElement.classList.remove('ayah-highlight'), 3500);
        }
      }, 300);
    }
  }, [highlightedAyahParam, loading, surah, readingMode, pagesList]);

  // ---- مستمع ملء الشاشة ----
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    const elem = surahContentRef.current;
    if (!elem) return;
    if (!document.fullscreenElement) {
      try {
        await elem.requestFullscreen();
        setIsFullscreen(true);
      } catch {
        // ignore
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch {
        // ignore
      }
    }
  };

  const copyAyahText = (ayah: AyahData) => {
    if (!surah) return;
    const textToCopy = `﴿${ayah.text}﴾ [سورة ${surah.name}: آية ${ayah.numberInSurah}]`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast(`تم نسخ الآية (${ayah.numberInSurah}) إلى الحافظة`);
      setSelectedAyahForAction(null);
    });
  };

  const bookmarkAyah = (ayah: AyahData) => {
    if (!surah) return;
    try {
      localStorage.setItem('last_read_quran', JSON.stringify({
        surahId: surah.number,
        surahName: surah.name,
        ayahNumber: ayah.numberInSurah,
        date: new Date().toLocaleDateString('ar-EG'),
      }));
      showToast(`تم حفظ علامة القراءة عند الآية (${ayah.numberInSurah})`);
      setSelectedAyahForAction(null);
    } catch {
      // ignore
    }
  };

  // تطبيق كلاس الثيم على الحاوية
  const themeClass = useMemo(() => {
    switch (readingTheme) {
      case 'sepia': return 'reading-theme-sepia';
      case 'night': return 'reading-theme-night';
      case 'emerald': return 'reading-theme-emerald';
      case 'light': return 'reading-theme-light';
      default: return 'reading-theme-sepia';
    }
  }, [readingTheme]);

  // حساب معدل تباعد الأسطر
  const lineHeightValue = useMemo(() => {
    switch (lineSpacing) {
      case 'normal': return '2.3';
      case 'relaxed': return '2.8';
      case 'loose': return '3.3';
    }
  }, [lineSpacing]);

  // ---- عرض آية واحدة ----
  const renderAyah = (ayah: AyahData) => {
    let ayahTextToRender = ayah.text;
    const bismillahPrefix = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
    if (surah && surah.number !== 1 && surah.number !== 9 && ayah.numberInSurah === 1 && ayahTextToRender.startsWith(bismillahPrefix)) {
      ayahTextToRender = ayahTextToRender.substring(bismillahPrefix.length).trimStart();
    }

    const isSelected = selectedAyahForAction?.numberInSurah === ayah.numberInSurah;

    return (
      <span
        key={ayah.number}
        id={`ayah-${ayah.numberInSurah}`}
        className={`ayah-segment ${isSelected ? 'active-playing' : ''}`}
        onClick={() => setSelectedAyahForAction(isSelected ? null : ayah)}
        title="انقر لعرض التفسير أو النسخ أو الحفظ"
      >
        <span
          ref={(el) => { ayahRefs.current[ayah.numberInSurah] = el; }}
          className="inline"
        >
          {ayahTextToRender}
        </span>
        <span className="mushaf-verse-badge" aria-hidden="true">
          ﴿{ayah.numberInSurah.toLocaleString('ar-EG')}﴾
        </span>
        {ayah.sajda ? (
          <span className="inline-block text-xs font-sans text-accent bg-accent/15 px-1.5 py-0.5 rounded mx-1 select-none">
            ۩ سجدة
          </span>
        ) : null}
        {' '}
      </span>
    );
  };

  if (loading) return <LoadingScreen />;

  if (fetchError || !surah) {
    return (
      <div className="min-h-screen p-4 md:p-8 bg-pattern flex items-center justify-center" dir="rtl">
        <div className="quran-card p-8 text-center fade-in max-w-md rounded-2xl">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold mb-4 text-red-600">تعذّر تحميل السورة</h1>
          <p className="mb-6 text-foreground/70">{fetchError || 'حدث خطأ غير متوقع أثناء الاتصال بالخادم.'}</p>
          <Link href="/" className="button">العودة إلى الفهرس</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-3 md:p-8 transition-colors duration-300 ${themeClass}`} dir="rtl">
      <div className="max-w-5xl mx-auto fade-in">

        {/* إشعار عائم Toast */}
        {toastMessage && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-primary text-white text-xs md:text-sm py-2 px-5 rounded-full shadow-2xl border border-white/20 animate-bounce">
            {toastMessage}
          </div>
        )}

        {/* ---- شريط التنقل العلوي السريع ---- */}
        <nav className="mb-4 flex justify-between items-center text-xs md:text-sm">
          {prevSurah ? (
            <Link
              href={`/surah/${prevSurah}`}
              className="flex items-center text-primary hover:text-accent transition-colors font-medium hover-lift"
              aria-label="السورة السابقة"
            >
              <IconChevronRight size={16} />
              <span className="me-1">السورة السابقة</span>
            </Link>
          ) : <div />}

          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center text-primary hover:text-accent font-medium">
              فهرس السور
            </Link>
            <span className="text-foreground/30">•</span>
            <Link href="/audio" className="text-accent hover:text-primary font-medium">
              تحميل MP3
            </Link>
          </div>

          {nextSurah ? (
            <Link
              href={`/surah/${nextSurah}`}
              className="flex items-center text-primary hover:text-accent transition-colors font-medium hover-lift"
              aria-label="السورة التالية"
            >
              <span className="ms-1">السورة التالية</span>
              <IconChevronLeft size={16} />
            </Link>
          ) : <div />}
        </nav>

        {/* ---- بطاقة عنوان السورة وأزرار التحكم الصوتي والقراءة ---- */}
        <header className="mb-6 mushaf-page-container p-4 md:p-6 scale-in">
          <div className="text-center mb-4">
            <h1 className="text-2xl md:text-4xl font-bold font-quran text-primary mb-1">
              {surah.name}
            </h1>
            <div className="text-xs md:text-sm text-foreground/70 flex items-center justify-center gap-3">
              <span>{surah.numberOfAyahs.toLocaleString('ar-EG')} آيات</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className={`revelation-indicator ${surah.revelationType === 'Meccan' ? 'revelation-meccan' : 'revelation-medinan'}`} />
                {getArabicRevelationType(surah.revelationType)}
              </span>
              <span>•</span>
              <span>ترتيبها: {surah.number.toLocaleString('ar-EG')}</span>
            </div>
          </div>

          {/* صف أدوات التحكم الشاملة */}
          <div className="pt-3 border-t border-border-color/60 flex flex-wrap items-center justify-between gap-3">

            {/* أسلوب القراءة: متدفق أو صفحات */}
            <div className="flex items-center p-1 bg-background/60 rounded-xl border border-border-color">
              <button
                onClick={() => changeReadingMode('page')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  readingMode === 'page'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-foreground/70 hover:text-foreground'
                }`}
                title="قراءة بشكل صفحات المصحف الشريف"
              >
                <IconBookOpen />
                <span>صفحات المصحف</span>
              </button>
              <button
                onClick={() => changeReadingMode('scroll')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  readingMode === 'scroll'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-foreground/70 hover:text-foreground'
                }`}
                title="قراءة متدفقة متتابعة لجميع الآيات"
              >
                <IconAlignJustify />
                <span>النمط المتدفق</span>
              </button>
            </div>

            {/* الاستماع وتحديد القارئ المفضل */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 text-xs">
                <label htmlFor="reciter-dropdown" className="font-medium whitespace-nowrap text-foreground/70">القارئ:</label>
                <select
                  id="reciter-dropdown"
                  value={selectedReciter.id}
                  onChange={handleReciterChange}
                  className="p-1.5 border border-border-color rounded-lg bg-background text-xs font-ui focus:outline-none focus:ring-1 focus:ring-primary max-w-[190px] md:max-w-[240px]"
                >
                  <optgroup label="⭐ فضيلة الشيخ المنشاوي">
                    {ALL_RECITERS.filter(r => r.category === 'minshawi').map(reciter => (
                      <option key={reciter.id} value={reciter.id}>{reciter.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="👑 كبار القراء وأئمة الحرمين">
                    {ALL_RECITERS.filter(r => r.category !== 'minshawi').map(reciter => (
                      <option key={reciter.id} value={reciter.id}>{reciter.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* زر التشغيل */}
              <button
                onClick={handleToggleFullSurahPlay}
                className={`button text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-sm transition-colors ${
                  isSurahPlaying ? 'bg-accent text-white' : 'bg-primary text-white'
                }`}
                disabled={isAudioLoading}
                aria-label={isSurahPlaying ? 'إيقاف التلاوة' : 'تشغيل التلاوة'}
              >
                {isAudioLoading ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : isSurahPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                )}
                <span>{isAudioLoading ? 'تحميل...' : (isSurahPlaying ? 'إيقاف' : 'استماع')}</span>
              </button>

              {/* زر تحميل MP3 المباشر */}
              <a
                href={currentDownloadUrl}
                download
                className="button-outline text-xs py-1.5 px-3 flex items-center gap-1.5 rounded-lg"
                title={`تحميل سورة ${surah.name} بصوت ${selectedReciter.name}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/></svg>
                <span>تحميل</span>
              </a>
            </div>

            {/* أدوات راحة العين والتكبير والتركيز */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowComfortMenu(v => !v)}
                className={`button-outline text-xs py-1.5 px-2.5 flex items-center gap-1 rounded-lg ${
                  showComfortMenu ? 'bg-primary text-white' : ''
                }`}
                title="إعدادات راحة العين والخط"
              >
                <IconEye />
                <span>راحة العين</span>
              </button>

              <button
                onClick={toggleFullscreen}
                className="button-outline text-xs p-1.5 rounded-lg"
                title={isFullscreen ? 'الخروج من ملء الشاشة' : 'ملء الشاشة ووضع التركيز'}
                aria-label="ملء الشاشة"
              >
                {isFullscreen ? <IconMinimize /> : <IconMaximize />}
              </button>
            </div>
          </div>

          {/* لوحة راحة العين القابلة للفتح */}
          {showComfortMenu && (
            <div className="mt-4 pt-4 border-t border-border-color bg-background/50 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs">
              {/* الثيمات المريحة للعين */}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground/80">لون الورق:</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => changeReadingTheme('sepia')}
                    className={`px-2.5 py-1 rounded-md border text-xs font-medium flex items-center gap-1 ${
                      readingTheme === 'sepia' ? 'ring-2 ring-accent border-accent font-bold' : 'border-border-color'
                    }`}
                    style={{ backgroundColor: '#fdfaf3', color: '#2c221a' }}
                  >
                    <span>📜</span>
                    <span>ورق دافئ</span>
                  </button>

                  <button
                    onClick={() => changeReadingTheme('night')}
                    className={`px-2.5 py-1 rounded-md border text-xs font-medium flex items-center gap-1 ${
                      readingTheme === 'night' ? 'ring-2 ring-accent border-accent font-bold' : 'border-border-color'
                    }`}
                    style={{ backgroundColor: '#192027', color: '#e6e2d8' }}
                  >
                    <span>🌙</span>
                    <span>ليلي هادئ</span>
                  </button>

                  <button
                    onClick={() => changeReadingTheme('emerald')}
                    className={`px-2.5 py-1 rounded-md border text-xs font-medium flex items-center gap-1 ${
                      readingTheme === 'emerald' ? 'ring-2 ring-accent border-accent font-bold' : 'border-border-color'
                    }`}
                    style={{ backgroundColor: '#f6fbf7', color: '#172d1f' }}
                  >
                    <span>🌿</span>
                    <span>أخضر نبوي</span>
                  </button>

                  <button
                    onClick={() => changeReadingTheme('light')}
                    className={`px-2.5 py-1 rounded-md border text-xs font-medium flex items-center gap-1 ${
                      readingTheme === 'light' ? 'ring-2 ring-accent border-accent font-bold' : 'border-border-color'
                    }`}
                    style={{ backgroundColor: '#ffffff', color: '#1e293b' }}
                  >
                    <span>⚪</span>
                    <span>نهاري</span>
                  </button>
                </div>
              </div>

              {/* حجم الخط */}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground/80">حجم الخط:</span>
                <button
                  onClick={() => changeFontSize(-2)}
                  className="w-7 h-7 rounded border border-border-color hover:bg-primary hover:text-white transition-colors"
                  title="تصغير الخط"
                >
                  -
                </button>
                <span className="font-mono text-xs w-6 text-center">{fontSize}</span>
                <button
                  onClick={() => changeFontSize(2)}
                  className="w-7 h-7 rounded border border-border-color hover:bg-primary hover:text-white transition-colors"
                  title="تكبير الخط"
                >
                  +
                </button>
              </div>

              {/* نوع الخط */}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground/80">نوع الخط:</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setFontFamily('amiri')}
                    className={`px-2 py-1 rounded text-xs border ${
                      fontFamily === 'amiri' ? 'bg-primary text-white border-primary' : 'border-border-color'
                    }`}
                  >
                    عثماني
                  </button>
                  <button
                    onClick={() => setFontFamily('naskh')}
                    className={`px-2 py-1 rounded text-xs border ${
                      fontFamily === 'naskh' ? 'bg-primary text-white border-primary' : 'border-border-color'
                    }`}
                  >
                    نسخ
                  </button>
                </div>
              </div>

              {/* تباعد الأسطر */}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground/80">التباعد:</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setLineSpacing('normal')}
                    className={`px-2 py-0.5 rounded text-xs border ${lineSpacing === 'normal' ? 'bg-primary text-white' : 'border-border-color'}`}
                  >
                    عادي
                  </button>
                  <button
                    onClick={() => setLineSpacing('relaxed')}
                    className={`px-2 py-0.5 rounded text-xs border ${lineSpacing === 'relaxed' ? 'bg-primary text-white' : 'border-border-color'}`}
                  >
                    مريح
                  </button>
                  <button
                    onClick={() => setLineSpacing('loose')}
                    className={`px-2 py-0.5 rounded text-xs border ${lineSpacing === 'loose' ? 'bg-primary text-white' : 'border-border-color'}`}
                  >
                    واسع
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* تنبيه خطأ الصوت */}
          {audioError && (
            <p className="text-center text-red-600 text-xs mt-3 px-3 py-2 bg-red-100 dark:bg-red-950/40 border border-red-300 dark:border-red-900 rounded-lg">
              {audioError}
            </p>
          )}
        </header>

        {/* ---- شريط إجراءات الآية المنبثق عند النقر ---- */}
        {selectedAyahForAction && (
          <div className="sticky top-4 z-40 mb-4 p-3 bg-card-bg/95 backdrop-blur-md border-2 border-primary/40 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 scale-in">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent" />
              <span className="font-bold text-xs md:text-sm text-primary">
                الآية رقم ({selectedAyahForAction.numberInSurah.toLocaleString('ar-EG')}) من سورة {surah.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setTafsirAyahNumber(selectedAyahForAction.numberInSurah)}
                className="button text-xs py-1.5 px-3 flex items-center gap-1"
              >
                <span>📖</span>
                <span>تفسير الآية</span>
              </button>

              <button
                onClick={() => copyAyahText(selectedAyahForAction)}
                className="button-outline text-xs py-1.5 px-3 flex items-center gap-1"
              >
                <span>📋</span>
                <span>نسخ</span>
              </button>

              <button
                onClick={() => bookmarkAyah(selectedAyahForAction)}
                className="button-outline text-xs py-1.5 px-3 flex items-center gap-1"
                title="حفظ موضع القراءة"
              >
                <span>🔖</span>
                <span>حفظ علامة</span>
              </button>

              <button
                onClick={() => setSelectedAyahForAction(null)}
                className="w-7 h-7 rounded-full text-foreground/50 hover:text-red-500 transition-colors flex items-center justify-center"
                title="إغلاق"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            عرض المحتوى القرآني: الأسلوب المختار
           ======================================================== */}
        <main
          ref={surahContentRef}
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: lineHeightValue,
            fontFamily: fontFamily === 'amiri' ? 'var(--font-quran), Amiri, serif' : 'var(--font-ui), Noto Sans Arabic, sans-serif'
          }}
        >
          {readingMode === 'page' && currentPage ? (
            /* =====================================================
               الأسلوب الأول: بشكل صفحات المصحف الشريف الحقيقي
               ===================================================== */
            <div className="mushaf-page-container p-3 sm:p-6 md:p-10 text-center relative overflow-hidden transition-all duration-300">

              {/* الإطار الداخلي المذهب للمصحف */}
              <div className="mushaf-inner-frame">

                {/* ترويسة الصفحة العلوية (Header) */}
                <div className="flex justify-between items-center text-xs md:text-sm pb-3 mb-6 border-b border-border-color/60 text-foreground/75 font-ui select-none">
                  <span className="font-semibold text-primary">
                    سُورَةُ {surah.name}
                  </span>
                  <span className="text-foreground/40 font-serif">۞</span>
                  <span className="font-medium">
                    الجزء {JUZ_NAMES[currentPage.juz] || currentPage.juz}
                  </span>
                </div>

                {/* ترويسة اسم السورة بالمصحف عند بدء السورة في هذه الصفحة */}
                {currentPage.ayahs.some(a => a.numberInSurah === 1) && (
                  <div className="mushaf-surah-header-banner my-4">
                    <h2 className="text-2xl md:text-3xl font-bold font-quran text-primary">
                      سُورَةُ {surah.name}
                    </h2>
                    <p className="text-xs text-foreground/70 mt-1 font-ui">
                      {surah.numberOfAyahs.toLocaleString('ar-EG')} آيات • {getArabicRevelationType(surah.revelationType)}
                    </p>
                  </div>
                )}

                {/* البسملة الشريفة */}
                {currentPage.ayahs.some(a => a.numberInSurah === 1) && surah.number !== 1 && surah.number !== 9 && (
                  <p className="bismillah text-accent font-bold py-3 text-center select-none" style={{ fontSize: `${fontSize * 1.15}px` }}>
                    بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
                  </p>
                )}

                {/* نص آيات صفحة المصحف */}
                <div className="text-center font-quran my-4 text-justify-center" style={{ textAlign: 'justify', textAlignLast: 'center' }}>
                  {currentPage.ayahs.map(renderAyah)}
                </div>

                {/* تذييل الصفحة ورقمها في المصحف الشريف */}
                <div className="pt-4 mt-6 border-t border-border-color/60 flex justify-between items-center text-xs text-foreground/60 font-ui select-none">
                  <span>سورة {surah.name}</span>
                  <span className="text-base font-bold font-quran text-primary px-3 py-1 bg-foreground/5 rounded-full border border-border-color/40">
                    — {currentPage.pageNumber.toLocaleString('ar-EG')} —
                  </span>
                  <span>صفحة المصحف</span>
                </div>
              </div>

              {/* شريط التحكم والتنقل بين صفحات المصحف */}
              <div className="mt-6 pt-4 border-t border-border-color/60 flex flex-col sm:flex-row items-center justify-between gap-4 font-ui">
                {/* زر الصفحة السابقة في اتجاه المصحف */}
                <button
                  onClick={() => {
                    setCurrentPageIndex(p => Math.max(0, p - 1));
                    surahContentRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  disabled={currentPageIndex === 0}
                  className="button-outline text-xs md:text-sm py-2 px-4 flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed w-full sm:w-auto justify-center rounded-xl"
                  aria-label="الانتقال إلى الصفحة السابقة"
                >
                  <IconChevronRight size={16} />
                  <span>الصفحة السابقة</span>
                </button>

                {/* مؤشر صفحات السورة وقائمة القفز */}
                <div className="flex items-center gap-3">
                  <select
                    value={currentPageIndex}
                    onChange={(e) => {
                      setCurrentPageIndex(parseInt(e.target.value, 10));
                      surahContentRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="p-1.5 border border-border-color rounded-lg bg-background text-xs font-ui focus:outline-none focus:ring-1 focus:ring-primary"
                    aria-label="اختر صفحة من صفحات السورة"
                  >
                    {pagesList.map((p, idx) => (
                      <option key={p.pageNumber} value={idx}>
                        صفحة المصحف {p.pageNumber.toLocaleString('ar-EG')} ({idx + 1} من {pagesList.length})
                      </option>
                    ))}
                  </select>

                  <span className="text-xs text-foreground/60 whitespace-nowrap">
                    ({currentPageIndex + 1} من {pagesList.length})
                  </span>
                </div>

                {/* زر الصفحة التالية */}
                <button
                  onClick={() => {
                    setCurrentPageIndex(p => Math.min(pagesList.length - 1, p + 1));
                    surahContentRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  disabled={currentPageIndex === pagesList.length - 1}
                  className="button-outline text-xs md:text-sm py-2 px-4 flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed w-full sm:w-auto justify-center rounded-xl"
                  aria-label="الانتقال إلى الصفحة التالية"
                >
                  <span>الصفحة التالية</span>
                  <IconChevronLeft size={16} />
                </button>
              </div>

              {/* شريط تقدم قراءة صفحات السورة */}
              <div className="mt-4 flex flex-col items-center gap-1 font-ui">
                <div className="w-full max-w-md h-1.5 bg-border-color/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${((currentPageIndex + 1) / pagesList.length) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-foreground/40">
                  يمكنك أيضاً التنقل بين الصفحات باستخدام مفاتيح الأسهم (يمين / يسار)
                </p>
              </div>
            </div>
          ) : (
            /* =====================================================
               الأسلوب الثاني: النمط المتدفق المستمر
               ===================================================== */
            <div className="mushaf-page-container p-6 md:p-12 text-center shadow-lg transition-all duration-300">
              {surah.number !== 1 && surah.number !== 9 && (
                <p className="bismillah text-accent font-bold py-4 text-center select-none" style={{ fontSize: `${fontSize * 1.2}px` }}>
                  بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
                </p>
              )}
              <div className="font-quran leading-relaxed" style={{ textAlign: 'justify', textAlignLast: 'center' }}>
                {surah.ayahs.map(renderAyah)}
              </div>
            </div>
          )}
        </main>

        {/* ---- شريط التنقل السفلي بين السور ---- */}
        <footer className="mt-8 flex justify-between items-center text-xs md:text-sm border-t border-border-color/60 pt-4">
          {prevSurah ? (
            <Link href={`/surah/${prevSurah}`} className="flex items-center text-primary hover:text-accent font-medium hover-lift">
              <IconChevronRight size={16} />
              <span className="me-1">السورة السابقة</span>
            </Link>
          ) : <div />}

          <Link href="/" className="text-primary hover:text-accent font-medium hover-lift">
            العودة للفهرس
          </Link>

          {nextSurah ? (
            <Link href={`/surah/${nextSurah}`} className="flex items-center text-primary hover:text-accent font-medium hover-lift">
              <span className="ms-1">السورة التالية</span>
              <IconChevronLeft size={16} />
            </Link>
          ) : <div />}
        </footer>

        {/* نافذة التفسير الميسر */}
        {tafsirAyahNumber && (
          <TafsirModal
            isOpen={!!tafsirAyahNumber}
            onClose={() => setTafsirAyahNumber(null)}
            surahNumber={surah.number}
            ayahNumber={tafsirAyahNumber}
          />
        )}

      </div>
    </div>
  );
}

// تصدير الصفحة الرئيسية مغلفة بـ Suspense
export default function SurahPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <SurahPageContent />
    </Suspense>
  );
}