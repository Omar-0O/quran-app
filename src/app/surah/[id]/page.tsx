'use client';

import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { SurahData, AyahData } from '../../data/constants';
import {
  ALL_RECITERS,
  RECITERS_CATEGORIES,
  ReciterInfo,
  getSurahAudioUrl,
  getSurahDownloadUrl,
} from '../../data/reciters';
import {
  getCachedSurah,
  loadSurah,
  prefetchSurah,
  getLastVisitedPage,
  saveLastVisitedPage,
} from '../../data/quranCache';
import TafsirModal from '../../components/TafsirModal';

/* ---------- SVG Icons ---------- */
const IconMaximize = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
  </svg>
);
const IconMinimize = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>
  </svg>
);
const IconBookOpen = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);
const IconAlignJustify = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const IconChevronRight = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const IconChevronLeft = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const getArabicRevelationType = (type: string): string => (type === 'Meccan' ? 'مكية' : 'مدنية');
const toAr = (n: number) => n.toLocaleString('ar-EG');

// عدد الآيات في كل صفحة في وضع الصفحات الأصلي
const AYAHS_PER_PAGE = 15;

// Strip diacritics for clean Bismillah check
const normalizeArabic = (s: string) =>
  s
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '')
    .replace(/\u0671/g, '\u0627')
    .replace(/\u06CC/g, '\u064A');

const stripBismillah = (text: string) => {
  const words = text.trim().split(/\s+/);
  if (words.length > 4 && normalizeArabic(words.slice(0, 4).join(' ')) === 'بسم الله الرحمن الرحيم') {
    return words.slice(4).join(' ');
  }
  return text;
};

/* ---------- شاشة التحميل الأصلية الفاخرة ---------- */
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
          <p className="text-2xl font-quran text-primary font-semibold mb-1">بِسْمِ اللّٰهِ</p>
          <p className="text-sm text-foreground/60 font-ui animate-pulse">جارٍ تحميل السورة...</p>
        </div>

        <div className="flex justify-center gap-1.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-1.5 rounded-full bg-primary"
              style={{
                height: '24px',
                animation: `loadingBar 1.2s ease-in-out ${i * 0.15}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes loadingBar {
          0%, 100% { transform: scaleY(0.4); opacity: 0.4; }
          50% { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ---------- محتوى الصفحة الرئيسي ---------- */
function SurahPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const highlightedAyahParam = searchParams.get('ayah');
  const pageParam = searchParams.get('page');
  const surahId = parseInt(params.id as string, 10);

  // Synchronous cache retrieval – 0ms rendering if visited before or prefetched
  const [surah, setSurah] = useState<SurahData | null>(() => getCachedSurah(surahId));
  const [loading, setLoading] = useState<boolean>(() => !getCachedSurah(surahId));
  const [fetchError, setFetchError] = useState('');
  const [audioError, setAudioError] = useState('');

  // حالة الصوت - المنشاوي المرتل افتراضياً في الصدارة
  const [selectedReciter, setSelectedReciter] = useState<ReciterInfo>(ALL_RECITERS[0]);
  const [isSurahPlaying, setIsSurahPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loadedAudioSrcRef = useRef<string>('');

  // ---- أسلوب القراءة: 'scroll' (متدفق) | 'page' (بشكل صفحات) ----
  const [readingMode, setReadingMode] = useState<'scroll' | 'page'>('page');
  const [currentPage, setCurrentPage] = useState<number>(() => {
    if (pageParam === 'last') return 1; // updated after totalPages calculation
    if (pageParam) {
      const p = parseInt(pageParam, 10);
      if (!isNaN(p) && p > 0) return p;
    }
    const saved = getLastVisitedPage(surahId);
    return saved != null ? saved + 1 : 1;
  });

  // ---- ملء الشاشة والتفسير ومراجع الآيات ----
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tafsirAyahNumber, setTafsirAyahNumber] = useState<number | null>(null);

  const ayahRefs = useRef<{ [key: number]: HTMLSpanElement | null }>({});
  const surahContentRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const initialPageSurahRef = useRef<number | null>(null);

  const prevSurah = surahId > 1 ? surahId - 1 : null;
  const nextSurah = surahId < 114 ? surahId + 1 : null;

  // ---- حساب الصفحات ----
  const totalPages = useMemo(() => {
    if (!surah || !surah.ayahs) return 1;
    return Math.max(1, Math.ceil(surah.ayahs.length / AYAHS_PER_PAGE));
  }, [surah]);

  const currentPageAyahs = useMemo(() => {
    if (!surah || !surah.ayahs) return [];
    const start = (currentPage - 1) * AYAHS_PER_PAGE;
    return surah.ayahs.slice(start, start + AYAHS_PER_PAGE);
  }, [surah, currentPage]);

  // روابط الصوت والتحميل
  const currentAudioUrl = useMemo(
    () => getSurahAudioUrl(selectedReciter.serverUrl, surahId),
    [selectedReciter, surahId]
  );
  const currentDownloadUrl = useMemo(
    () => (surah ? getSurahDownloadUrl(selectedReciter.serverUrl, surahId, surah.name, selectedReciter.name) : '#'),
    [selectedReciter, surahId, surah]
  );

  /* ----- جلب / كاش بيانات السورة ----- */
  useEffect(() => {
    let cancelled = false;
    const cached = getCachedSurah(surahId);
    if (cached) {
      setSurah(cached);
      setLoading(false);
      setFetchError('');
      if (surahId > 1) prefetchSurah(surahId - 1);
      if (surahId < 114) prefetchSurah(surahId + 1);
      return;
    }

    setLoading(true);
    setFetchError('');
    setSurah(null);

    loadSurah(surahId)
      .then((data) => {
        if (cancelled) return;
        setSurah(data);
        setLoading(false);
        if (surahId > 1) prefetchSurah(surahId - 1);
        if (surahId < 114) prefetchSurah(surahId + 1);
      })
      .catch((err) => {
        if (cancelled) return;
        setFetchError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع أثناء تحميل السورة.');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [surahId]);

  /* ----- ضبط وتذكر الصفحة عند التغيير ----- */
  useEffect(() => {
    if (!surah || totalPages <= 0) return;

    if (highlightedAyahParam) {
      const ayahNum = parseInt(highlightedAyahParam, 10);
      if (!isNaN(ayahNum)) {
        const pageOfAyah = Math.ceil(ayahNum / AYAHS_PER_PAGE);
        setCurrentPage(Math.max(1, Math.min(totalPages, pageOfAyah)));
      }
      initialPageSurahRef.current = surahId;
      return;
    }

    if (pageParam === 'last') {
      setCurrentPage(totalPages);
      initialPageSurahRef.current = surahId;
      return;
    }

    if (pageParam) {
      const p = parseInt(pageParam, 10);
      if (!isNaN(p) && p > 0) {
        setCurrentPage(Math.max(1, Math.min(totalPages, p)));
        initialPageSurahRef.current = surahId;
        return;
      }
    }

    if (initialPageSurahRef.current !== surahId) {
      const saved = getLastVisitedPage(surahId);
      if (saved != null && saved >= 0 && saved < totalPages) {
        setCurrentPage(saved + 1);
      } else {
        setCurrentPage(1);
      }
      initialPageSurahRef.current = surahId;
    }
  }, [surahId, surah, totalPages, pageParam, highlightedAyahParam]);

  useEffect(() => {
    if (surah && currentPage >= 1) {
      saveLastVisitedPage(surah.number, currentPage - 1);
    }
  }, [surah, currentPage]);

  /* ----- إعداد مشغل الصوت ----- */
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none';

    const onEnded = () => setIsSurahPlaying(false);
    const onCanPlay = () => setIsAudioLoading(false);
    const onPlaying = () => setIsAudioLoading(false);
    const onWaiting = () => setIsAudioLoading(true);
    const onError = () => {
      setAudioError('تعذر تشغيل التلاوة. يمكنك تجربة قارئ آخر أو تحميل الملف مباشرة.');
      setIsAudioLoading(false);
      setIsSurahPlaying(false);
    };

    audio.addEventListener('ended', onEnded);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('error', onError);

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('error', onError);
    };
  }, []);

  // توقف الصوت عند تغيير السورة أو القارئ
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      loadedAudioSrcRef.current = '';
    }
    setIsSurahPlaying(false);
    setIsAudioLoading(false);
    setAudioError('');
  }, [currentAudioUrl]);

  const handleToggleFullSurahPlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    setAudioError('');

    if (isSurahPlaying) {
      audio.pause();
      setIsSurahPlaying(false);
      return;
    }

    if (loadedAudioSrcRef.current !== currentAudioUrl) {
      audio.src = currentAudioUrl;
      loadedAudioSrcRef.current = currentAudioUrl;
    }

    setIsAudioLoading(true);
    try {
      await audio.play();
      setIsSurahPlaying(true);
    } catch {
      setAudioError('لم يتمكن المتصفح من تشغيل التلاوة. جرّب قارئاً آخر أو استخدم زر التحميل.');
      setIsAudioLoading(false);
      setIsSurahPlaying(false);
    }
  };

  /* ----- التمرير للآية المسلط عليها الضوء ----- */
  useEffect(() => {
    if (!highlightedAyahParam || loading || !surah) return;
    const n = parseInt(highlightedAyahParam, 10);
    const el = ayahRefs.current[n];
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ayah-highlight');
        setTimeout(() => el.classList.remove('ayah-highlight'), 3000);
      }, 300);
    }
  }, [highlightedAyahParam, loading, surah, currentPage, readingMode]);

  /* ----- ملء الشاشة ----- */
  const toggleFullscreen = async () => {
    const target = containerRef.current || document.documentElement;
    if (!document.fullscreenElement) {
      try {
        await target.requestFullscreen?.();
        setIsFullscreen(true);
      } catch {
        setIsFullscreen(true);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch {
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  /* ----- التنقل بين الصفحات مع إمكانية التمرير بلمس الشاشة (Swipe) ----- */
  const handleGoToPage = useCallback((p: number) => {
    setCurrentPage(p);
    surahContentRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      handleGoToPage(currentPage + 1);
    } else if (nextSurah) {
      if (nextSurah + 1 <= 114) prefetchSurah(nextSurah + 1);
      router.push(`/surah/${nextSurah}`);
    }
  }, [currentPage, totalPages, handleGoToPage, nextSurah, router]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      handleGoToPage(currentPage - 1);
    } else if (prevSurah) {
      if (prevSurah - 1 >= 1) prefetchSurah(prevSurah - 1);
      router.push(`/surah/${prevSurah}?page=last`);
    }
  }, [currentPage, handleGoToPage, prevSurah, router]);

  // إيماءات اللمس على الموبايل للتقليب السلس بالإصبع
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      // عربي: السحب لليسار = الصفحة التالية، السحب لليمين = السابقة
      if (dx < 0) {
        handleNextPage();
      } else {
        handlePrevPage();
      }
    }
  };

  // لوحة المفاتيح
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (readingMode !== 'page') return;
      if (e.key === 'ArrowLeft') handleNextPage();
      if (e.key === 'ArrowRight') handlePrevPage();
      if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [readingMode, handleNextPage, handlePrevPage, isFullscreen]);

  // التبديل بين النمط المتدفق ونمط الصفحات مع الحفاظ على الموضع
  const toggleReadingMode = () => {
    if (readingMode === 'scroll') {
      setReadingMode('page');
      surahContentRef.current?.scrollTo({ top: 0 });
    } else {
      setReadingMode('scroll');
      const firstAyahNum = currentPageAyahs[0]?.numberInSurah;
      if (firstAyahNum) {
        setTimeout(() => {
          const el = ayahRefs.current[firstAyahNum];
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      }
    }
  };

  const setAyahRef = (ayahNumber: number) => (el: HTMLSpanElement | null) => {
    ayahRefs.current[ayahNumber] = el;
  };

  /* ----- دالة عرض الآية الكريمة ----- */
  const renderAyah = (ayah: AyahData) => {
    let ayahTextToRender = ayah.text.replace(/\n/g, ' ').trim();
    if (surah && surah.number !== 1 && surah.number !== 9 && ayah.numberInSurah === 1) {
      ayahTextToRender = stripBismillah(ayahTextToRender);
    }
    return (
      <span
        key={ayah.number}
        id={`ayah-${ayah.numberInSurah}`}
        className="ayah-text-segment cursor-pointer hover:text-primary transition-colors inline"
        onClick={() => setTafsirAyahNumber(ayah.numberInSurah)}
        title={`آية ${toAr(ayah.numberInSurah)} - انقر لعرض التفسير`}
      >
        <span ref={setAyahRef(ayah.numberInSurah)} className="inline">
          {ayahTextToRender}
        </span>
        <span className="verse-number-decorator font-sans select-none" aria-hidden="true">
          {' '}﴿{toAr(ayah.numberInSurah)}﴾{' '}
        </span>
      </span>
    );
  };

  /* ----- أرقام أزرار الصفحات (بحد أقصى 7 أزرار مع نقاط ...) ----- */
  const pageNumbers = useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
      .filter((p) => {
        if (totalPages <= 7) return true;
        if (p === 1 || p === totalPages) return true;
        if (Math.abs(p - currentPage) <= 2) return true;
        return false;
      })
      .reduce<(number | '...')[]>((acc, p, idx, arr) => {
        if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) {
          acc.push('...');
        }
        acc.push(p);
        return acc;
      }, []);
  }, [totalPages, currentPage]);

  /* ----- حالة التحميل ----- */
  if (loading) return <LoadingScreen />;

  /* ----- حالة الخطأ ----- */
  if (fetchError || !surah) {
    return (
      <div className="min-h-screen p-4 md:p-8 bg-pattern flex items-center justify-center" dir="rtl">
        <div className="quran-card p-8 text-center fade-in max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold mb-4 text-red-600">تعذّر تحميل السورة</h1>
          <p className="mb-6 text-foreground/70">{fetchError || 'حدث خطأ غير متوقع.'}</p>
          <Link href="/" className="button">
            العودة إلى الفهرس
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`min-h-screen p-4 md:p-8 bg-pattern ${isFullscreen ? 'fixed inset-0 z-50 overflow-y-auto bg-background p-4 sm:p-6' : ''}`}
      dir="rtl"
    >
      <div className="max-w-5xl mx-auto fade-in">
        {/* ---- شريط التنقل العلوي ---- */}
        {!isFullscreen && (
          <nav className="mb-8 flex justify-between items-center text-sm">
            {prevSurah ? (
              <Link
                href={`/surah/${prevSurah}?page=last`}
                className="flex items-center text-primary hover:text-accent transition-colors hover-lift"
                aria-label="السورة السابقة"
                onMouseEnter={() => prefetchSurah(prevSurah)}
                onTouchStart={() => prefetchSurah(prevSurah)}
              >
                <IconChevronRight size={18} />
                <span className="me-1 font-medium">السابقة</span>
              </Link>
            ) : (
              <div aria-hidden="true" />
            )}

            <Link
              href="/"
              className="flex items-center text-primary hover:text-accent transition-colors hover-lift font-medium"
              aria-label="الفهرس"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="me-1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              الفهرس
            </Link>

            {nextSurah ? (
              <Link
                href={`/surah/${nextSurah}`}
                className="flex items-center text-primary hover:text-accent transition-colors hover-lift"
                aria-label="السورة التالية"
                onMouseEnter={() => prefetchSurah(nextSurah)}
                onTouchStart={() => prefetchSurah(nextSurah)}
              >
                <span className="ms-1 font-medium">التالية</span>
                <IconChevronLeft size={18} />
              </Link>
            ) : (
              <div aria-hidden="true" />
            )}
          </nav>
        )}

        {/* ---- بطاقة عنوان السورة والتحكم ---- */}
        <header className="mb-8 quran-card p-6 scale-in">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold font-quran text-primary mb-1">سورة {surah.name}</h1>
            <div className="text-sm text-foreground/70 flex items-center justify-center gap-4">
              <span>{toAr(surah.numberOfAyahs)} آيات</span>
              <span className="flex items-center">
                <span
                  className={`revelation-indicator ms-1 ${
                    surah.revelationType === 'Meccan' ? 'revelation-meccan' : 'revelation-medinan'
                  }`}
                  title={getArabicRevelationType(surah.revelationType)}
                />
                {getArabicRevelationType(surah.revelationType)}
              </span>
            </div>
          </div>

          {/* منطقة أزرار التحكم */}
          <div className="mt-4 pt-4 border-t border-border-color flex flex-col sm:flex-row items-center justify-center gap-3 flex-wrap">
            {/* اختيار القارئ */}
            <div className="flex items-center gap-2">
              <label htmlFor="reciter-select" className="text-sm font-medium whitespace-nowrap">
                القارئ:
              </label>
              <select
                id="reciter-select"
                value={selectedReciter.id}
                onChange={(e) => {
                  const r = ALL_RECITERS.find((x) => x.id === e.target.value);
                  if (r) setSelectedReciter(r);
                }}
                className="p-2 border border-border-color rounded-md bg-background text-sm font-ui focus:outline-none focus:ring-1 focus:ring-primary min-w-[200px] max-w-[240px]"
                aria-label="اختر القارئ"
              >
                {RECITERS_CATEGORIES.filter((c) => c.id !== 'all').map((c) => {
                  const items = ALL_RECITERS.filter((r) => r.category === c.id);
                  if (!items.length) return null;
                  return (
                    <optgroup key={c.id} label={c.name}>
                      {items.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
            </div>

            {/* زر تشغيل التلاوة */}
            <button
              onClick={handleToggleFullSurahPlay}
              className={`button ${isSurahPlaying ? 'bg-accent' : 'bg-primary'} flex items-center gap-2 min-w-[105px] justify-center transition-colors duration-200`}
              aria-label={isSurahPlaying ? 'إيقاف مؤقت' : 'تشغيل التلاوة'}
              disabled={isAudioLoading && !isSurahPlaying}
            >
              {isAudioLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : isSurahPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
              <span className="font-medium text-sm">
                {isAudioLoading ? 'تحميل...' : isSurahPlaying ? 'إيقاف' : 'تشغيل'}
              </span>
            </button>

            {/* زر تحميل MP3 */}
            <a
              href={currentDownloadUrl}
              download
              className="button-outline flex items-center gap-2 min-w-[100px] justify-center transition-opacity duration-200"
              aria-label={`تحميل تلاوة ${surah.name}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 17V3" />
                <path d="m6 11 6 6 6-6" />
                <path d="M19 21H5" />
              </svg>
              <span className="font-medium text-sm">تحميل</span>
            </a>

            {/* زر تبديل نمط القراءة */}
            <button
              onClick={toggleReadingMode}
              className="button-outline flex items-center gap-2 min-w-[110px] justify-center transition-colors duration-200"
              title={readingMode === 'scroll' ? 'التبديل إلى نمط الصفحات' : 'التبديل إلى النمط المتدفق'}
            >
              {readingMode === 'scroll' ? <IconBookOpen /> : <IconAlignJustify />}
              <span className="font-medium text-sm">{readingMode === 'scroll' ? 'صفحات' : 'متدفق'}</span>
            </button>

            {/* زر ملء الشاشة */}
            <button
              onClick={toggleFullscreen}
              className="button-outline flex items-center gap-2 min-w-[95px] justify-center transition-colors duration-200"
              aria-label={isFullscreen ? 'الخروج من وضع ملء الشاشة' : 'وضع ملء الشاشة'}
            >
              {isFullscreen ? <IconMinimize /> : <IconMaximize />}
              <span className="font-medium text-sm">{isFullscreen ? 'تصغير' : 'تكبير'}</span>
            </button>
          </div>

          {/* تنبيه خطأ الصوت */}
          {audioError && (
            <p className="text-center text-red-600 text-sm mt-3 px-3 py-2 bg-red-100 border border-red-300 rounded-md" role="alert">
              {audioError}
            </p>
          )}
        </header>

        {/* ---- محتوى السورة الكريمة ---- */}
        {readingMode === 'scroll' ? (
          /* ===== النمط المتدفق ===== */
          <main
            ref={surahContentRef}
            className="quran-card p-6 md:p-10 lg:p-12 font-quran text-center leading-relaxed bg-white shadow-lg max-h-[75vh] overflow-y-auto scroll-smooth text-2xl md:text-3xl"
            style={{ lineHeight: '2.9' }}
            aria-label={`نص سورة ${surah.name}`}
          >
            {surah.number !== 1 && surah.number !== 9 && (
              <p className="bismillah text-primary font-bold py-4 text-center">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</p>
            )}
            {surah.ayahs.map(renderAyah)}
          </main>
        ) : (
          /* ===== نمط الصفحات الأصلي ===== */
          <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <main
              ref={surahContentRef}
              className="quran-card p-6 md:p-10 lg:p-12 font-quran text-center leading-relaxed bg-white shadow-lg min-h-[60vh] text-2xl md:text-3xl relative select-none"
              style={{ lineHeight: '2.9' }}
              aria-label={`سورة ${surah.name} - صفحة ${currentPage} من ${totalPages}`}
            >
              {/* البسملة في الصفحة الأولى فقط (ما عدا التوبة والفاتحة) */}
              {currentPage === 1 && surah.number !== 1 && surah.number !== 9 && (
                <p className="bismillah text-primary font-bold py-4 text-center">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</p>
              )}
              {currentPageAyahs.map(renderAyah)}
            </main>

            {/* ---- أزرار التنقل بين الصفحات ---- */}
            <div className="mt-6 flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
              {/* الصفحة السابقة */}
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1 && !prevSurah}
                className="button-outline flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed text-sm py-2 px-3 sm:px-4"
                aria-label="الصفحة السابقة"
              >
                <IconChevronRight size={18} />
                السابقة
              </button>

              {/* أزرار أرقام الصفحات */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {pageNumbers.map((item, idx) =>
                  item === '...' ? (
                    <span key={`ellipsis-${idx}`} className="text-foreground/40 px-1">
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => handleGoToPage(item as number)}
                      className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${
                        currentPage === item
                          ? 'bg-primary text-white shadow-md scale-110'
                          : 'bg-card-bg border border-border-color text-foreground/70 hover:bg-primary/10'
                      }`}
                      aria-label={`الانتقال إلى الصفحة ${item}`}
                      aria-current={currentPage === item ? 'page' : undefined}
                    >
                      {toAr(item as number)}
                    </button>
                  )
                )}
              </div>

              {/* الصفحة التالية */}
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages && !nextSurah}
                className="button-outline flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed text-sm py-2 px-3 sm:px-4"
                aria-label="الصفحة التالية"
              >
                التالية
                <IconChevronLeft size={18} />
              </button>
            </div>

            {/* شريط تقدم القراءة */}
            <div className="mt-4 flex flex-col items-center gap-1">
              <div className="w-full max-w-sm h-2 bg-border-color rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${(currentPage / totalPages) * 100}%` }}
                />
              </div>
              <p className="text-xs text-foreground/60">
                صفحة {toAr(currentPage)} من {toAr(totalPages)}
                <span className="hidden sm:inline text-foreground/40 ms-2">(يمكنك سحب الشاشة للتنقل)</span>
              </p>
            </div>
          </div>
        )}

        {/* ---- شريط التنقل السفلي ---- */}
        {!isFullscreen && (
          <footer className="mt-8 flex justify-between items-center text-sm">
            {prevSurah ? (
              <Link
                href={`/surah/${prevSurah}?page=last`}
                className="flex items-center text-primary hover:text-accent transition-colors hover-lift"
                aria-label="السورة السابقة"
                onMouseEnter={() => prefetchSurah(prevSurah)}
                onTouchStart={() => prefetchSurah(prevSurah)}
              >
                <IconChevronRight size={18} />
                <span className="me-1 font-medium">السورة السابقة</span>
              </Link>
            ) : (
              <div aria-hidden="true" />
            )}

            <Link
              href="/"
              className="flex items-center text-primary hover:text-accent transition-colors hover-lift font-medium"
              aria-label="الفهرس"
            >
              الفهرس
            </Link>

            {nextSurah ? (
              <Link
                href={`/surah/${nextSurah}`}
                className="flex items-center text-primary hover:text-accent transition-colors hover-lift"
                aria-label="السورة التالية"
                onMouseEnter={() => prefetchSurah(nextSurah)}
                onTouchStart={() => prefetchSurah(nextSurah)}
              >
                <span className="ms-1 font-medium">السورة التالية</span>
                <IconChevronLeft size={18} />
              </Link>
            ) : (
              <div aria-hidden="true" />
            )}
          </footer>
        )}

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

export default function SurahPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <SurahPageContent />
    </Suspense>
  );
}