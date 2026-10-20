'use client';

import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react';
import Link from "next/link";
import { useParams, useSearchParams } from 'next/navigation';
// SVG icon components (no external dependency)
const IconMaximize = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>;
const IconMinimize = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>;
const IconBookOpen = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const IconAlignJustify = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const IconChevronRight = ({ size = 18 }: { size?: number }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IconChevronLeft = ({ size = 18 }: { size?: number }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;

import { SurahData, Reciter, RECITERS } from '../../data/constants';

// دالة مساعدة لترجمة نوع النزول إلى العربية
const getArabicRevelationType = (type: string): string => {
  return type === 'Meccan' ? 'مكية' : 'مدنية';
};

// عدد الآيات في كل صفحة في وضع القراءة بالصفحات
const AYAHS_PER_PAGE = 15;

// ---- مكوّن شاشة التحميل ----
function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-pattern" dir="rtl">
      <div className="text-center space-y-6">
        {/* أيقونة القرآن المتحركة */}
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

        {/* نص التحميل */}
        <div>
          <p className="text-2xl font-quran text-primary font-semibold mb-1">بِسْمِ اللّٰهِ</p>
          <p className="text-sm text-foreground/60 font-ui animate-pulse">جارٍ تحميل السورة...</p>
        </div>

        {/* أشرطة التحميل المتحركة */}
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

  // حالة الصوت
  const [selectedReciter, setSelectedReciter] = useState<Reciter>(RECITERS[0]);
  const [isSurahPlaying, setIsSurahPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);

  // ---- حالة نمط القراءة: 'scroll' | 'page' ----
  const [readingMode, setReadingMode] = useState<'scroll' | 'page'>('scroll');
  const [currentPage, setCurrentPage] = useState(1);

  // ---- حالة ملء الشاشة ----
  const [isFullscreen, setIsFullscreen] = useState(false);

  // مراجع
  const ayahRefs = useRef<{ [key: number]: HTMLSpanElement | null }>({});
  const surahContentRef = useRef<HTMLDivElement | null>(null);

  const prevSurah = surahId > 1 ? surahId - 1 : null;
  const nextSurah = surahId < 114 ? surahId + 1 : null;

  // ---- حساب الصفحات ----
  const totalPages = useMemo(() => {
    if (!surah) return 1;
    return Math.ceil(surah.ayahs.length / AYAHS_PER_PAGE);
  }, [surah]);

  const currentPageAyahs = useMemo(() => {
    if (!surah) return [];
    const start = (currentPage - 1) * AYAHS_PER_PAGE;
    return surah.ayahs.slice(start, start + AYAHS_PER_PAGE);
  }, [surah, currentPage]);

  // ---- جلب بيانات السورة ----
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setFetchError('');
      setSurah(null);
      setIsSurahPlaying(false);
      setCurrentAudioUrl(null);
      setAudioError('');
      setCurrentPage(1);

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

  // ---- إعداد عنصر الصوت ----
  const handleFullSurahEnded = useCallback(() => setIsSurahPlaying(false), []);
  const handleAudioCanPlay = useCallback(() => setIsAudioLoading(false), []);
  const handleAudioWaiting = useCallback(() => setIsAudioLoading(true), []);
  const handleAudioPlaying = useCallback(() => setIsAudioLoading(false), []);
  const handleAudioError = useCallback((e: Event) => {
    console.error("خطأ في عنصر الصوت:", e);
    const audioErr = audioRef.current?.error;
    const message = audioErr
      ? `خطأ في الصوت: ${audioErr.message || 'رمز غير معروف'} (الرمز ${audioErr.code})`
      : 'عذرًا، لم نتمكن من تحميل الصوت في الوقت الحالي.';
    setAudioError(message);
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

  // ---- جلب رابط الصوت ----
  useEffect(() => {
    if (!surahId || !selectedReciter) return;

    const fetchUrl = async () => {
      setIsAudioLoading(true);
      setAudioError('');
      setCurrentAudioUrl(null);
      setIsSurahPlaying(false);

      try {
        const baseUrl = process.env.NEXT_PUBLIC_QURAN_COM_API_URL || 'https://api.quran.com/api/v4';
        const response = await fetch(`${baseUrl}/chapter_recitations/${selectedReciter.id}/${surahId}`);
        if (!response.ok) throw new Error(`فشل في جلب ملف الصوت (خطأ ${response.status})`);
        const data = await response.json();
        if (data.audio_file?.audio_url) {
          setCurrentAudioUrl(data.audio_file.audio_url);
          if (audioRef.current && audioRef.current.src !== data.audio_file.audio_url) {
            audioRef.current.src = data.audio_file.audio_url;
            audioRef.current.load();
          }
        } else {
          throw new Error('لم يتم العثور على الملف الصوتي في الاستجابة.');
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'خطأ في تحميل رابط الصوت.';
        setAudioError(message);
      } finally {
        setIsAudioLoading(false);
      }
    };

    fetchUrl();
  }, [surahId, selectedReciter]);

  // ---- التمرير للآية المسلط عليها الضوء ----
  useEffect(() => {
    if (highlightedAyahParam && !loading && surah) {
      const ayahNumber = parseInt(highlightedAyahParam);
      const ayahElement = ayahRefs.current[ayahNumber];
      if (ayahElement && surahContentRef.current) {
        setTimeout(() => {
          const container = surahContentRef.current!;
          const containerRect = container.getBoundingClientRect();
          const elementRect = ayahElement.getBoundingClientRect();
          const scrollPosition = container.scrollTop + (elementRect.top - containerRect.top) - containerRect.height / 3;
          container.scrollTo({ top: scrollPosition, behavior: 'smooth' });
          ayahElement.classList.add('ayah-highlight');
          setTimeout(() => { if (ayahElement) ayahElement.classList.remove('ayah-highlight'); }, 3000);
        }, 300);
      }
    }
  }, [highlightedAyahParam, loading, surah]);

  // ---- مستمع ملء الشاشة ----
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // ---- معالجات التشغيل ----
  const handleToggleFullSurahPlay = async () => {
    if (!audioRef.current) return;
    setAudioError('');

    if (isSurahPlaying) {
      audioRef.current.pause();
      setIsSurahPlaying(false);
    } else {
      if (!currentAudioUrl) {
        setAudioError('رابط الصوت غير متوفر. يرجى الانتظار أو اختيار قارئ آخر.');
        return;
      }
      if (audioRef.current.src !== currentAudioUrl) {
        audioRef.current.src = currentAudioUrl;
        audioRef.current.load();
      }
      setIsAudioLoading(true);
      try {
        await audioRef.current.play();
        setIsSurahPlaying(true);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'لم يتمكن المتصفح من تشغيل الملف الصوتي.';
        setAudioError(message);
        setIsAudioLoading(false);
        setIsSurahPlaying(false);
      }
    }
  };

  const handleReciterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const reciterId = parseInt(event.target.value, 10);
    const newReciter = RECITERS.find(r => r.id === reciterId);
    if (newReciter) {
      if (isSurahPlaying && audioRef.current) audioRef.current.pause();
      setIsSurahPlaying(false);
      setSelectedReciter(newReciter);
    }
  };

  const setAyahRef = (ayahNumber: number) => (el: HTMLSpanElement | null) => {
    ayahRefs.current[ayahNumber] = el;
  };

  const toggleFullscreen = async () => {
    const elem = surahContentRef.current;
    if (!elem) return;
    if (!document.fullscreenElement) {
      try { await elem.requestFullscreen(); setIsFullscreen(true); }
      catch (err: unknown) { const m = err instanceof Error ? err.message : ''; setAudioError(m); }
    } else {
      try { await document.exitFullscreen(); setIsFullscreen(false); }
      catch (err: unknown) { const m = err instanceof Error ? err.message : ''; setAudioError(m); }
    }
  };

  // ---- دالة عرض آية واحدة ----
  const renderAyah = (ayah: SurahData['ayahs'][0]) => {
    let ayahTextToRender = ayah.text;
    const bismillahPrefix = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
    if (surah && surah.number !== 1 && surah.number !== 9 && ayah.numberInSurah === 1 && ayahTextToRender.startsWith(bismillahPrefix)) {
      ayahTextToRender = ayahTextToRender.substring(bismillahPrefix.length).trimStart();
    }
    return (
      <span key={ayah.number} id={`ayah-${ayah.numberInSurah}`} className="ayah-text-segment">
        <span ref={setAyahRef(ayah.numberInSurah)} className="inline">{ayahTextToRender}</span>
        <span className="verse-number-decorator font-sans select-none" aria-hidden="true">
          ﴿{ayah.numberInSurah.toLocaleString('ar-EG')}﴾
        </span>
        {' '}‌
      </span>
    );
  };

  // ---- حالة التحميل ----
  if (loading) return <LoadingScreen />;

  // ---- حالة الخطأ ----
  if (fetchError || !surah) {
    return (
      <div className="min-h-screen p-4 md:p-8 bg-pattern flex items-center justify-center" dir="rtl">
        <div className="quran-card p-8 text-center fade-in max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold mb-4 text-red-600">تعذّر تحميل السورة</h1>
          <p className="mb-6 text-foreground/70">{fetchError || 'حدث خطأ غير متوقع.'}</p>
          <Link href="/" className="button">العودة إلى الفهرس</Link>
        </div>
      </div>
    );
  }

  const currentDownloadUrl = currentAudioUrl ?? '#';

  return (
    <div className="min-h-screen p-4 md:p-8 bg-pattern" dir="rtl">
      <div className="max-w-5xl mx-auto fade-in">

        {/* ---- شريط التنقل العلوي ---- */}
        <nav className="mb-8 flex justify-between items-center text-sm">
          {prevSurah ? (
            <Link href={`/surah/${prevSurah}`} className="flex items-center text-primary hover:text-accent transition-colors hover-lift" aria-label="السورة السابقة">
              <IconChevronRight size={18} />
              <span className="me-1 font-medium">السابقة</span>
            </Link>
          ) : <div aria-hidden="true" />}

          <Link href="/" className="flex items-center text-primary hover:text-accent transition-colors hover-lift font-medium" aria-label="الفهرس">
            <svg xmlns="http://www.w3.org/2000/svg" className="me-1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
            الفهرس
          </Link>

          {nextSurah ? (
            <Link href={`/surah/${nextSurah}`} className="flex items-center text-primary hover:text-accent transition-colors hover-lift" aria-label="السورة التالية">
              <span className="ms-1 font-medium">التالية</span>
              <IconChevronLeft size={18} />
            </Link>
          ) : <div aria-hidden="true" />}
        </nav>

        {/* ---- بطاقة عنوان السورة ---- */}
        <header className="mb-8 quran-card p-6 scale-in">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold font-quran text-primary mb-1">{surah.name}</h1>
            <div className="text-sm text-foreground/70 flex items-center justify-center gap-4">
              <span>{surah.numberOfAyahs.toLocaleString('ar-EG')} آيات</span>
              <span className="flex items-center">
                <span className={`revelation-indicator ms-1 ${surah.revelationType === 'Meccan' ? 'revelation-meccan' : 'revelation-medinan'}`} title={getArabicRevelationType(surah.revelationType)} />
                {getArabicRevelationType(surah.revelationType)}
              </span>
            </div>
          </div>

          {/* ---- منطقة التحكم ---- */}
          <div className="mt-4 pt-4 border-t border-border-color flex flex-col sm:flex-row items-center justify-center gap-3 flex-wrap">

            {/* اختيار القارئ */}
            <div className="flex items-center gap-2">
              <label htmlFor="reciter-select" className="text-sm font-medium whitespace-nowrap">القارئ:</label>
              <select
                id="reciter-select"
                value={selectedReciter.id}
                onChange={handleReciterChange}
                className="p-2 border border-border-color rounded-md bg-background text-sm font-ui focus:outline-none focus:ring-1 focus:ring-primary min-w-[190px] max-w-[220px]"
                aria-label="اختر القارئ"
              >
                {RECITERS.map(reciter => (
                  <option key={reciter.id} value={reciter.id}>{reciter.name}</option>
                ))}
              </select>
            </div>

            {/* زر التشغيل */}
            <button
              onClick={handleToggleFullSurahPlay}
              className={`button ${isSurahPlaying ? 'bg-accent' : 'bg-primary'} flex items-center gap-2 min-w-[100px] justify-center transition-colors duration-200`}
              aria-label={isSurahPlaying ? 'إيقاف مؤقت' : 'تشغيل التلاوة'}
              disabled={!currentAudioUrl || isAudioLoading}
            >
              {isAudioLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : isSurahPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              )}
              <span className="font-medium text-sm">{isAudioLoading ? 'تحميل...' : (isSurahPlaying ? 'إيقاف' : 'تشغيل')}</span>
            </button>

            {/* زر التحميل */}
            <a
              href={currentDownloadUrl}
              download
              onClick={(e) => { if (!currentAudioUrl || audioError) e.preventDefault(); }}
              className={`button-outline flex items-center gap-2 min-w-[100px] justify-center transition-opacity duration-200 ${!currentAudioUrl || audioError ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-disabled={!currentAudioUrl || !!audioError}
              aria-label={`تحميل تلاوة ${surah.name}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 17V3" /><path d="m6 11 6 6 6-6" /><path d="M19 21H5" />
              </svg>
              <span className="font-medium text-sm">تحميل</span>
            </a>

            {/* ---- زر تبديل نمط القراءة ---- */}
            <button
              onClick={() => { setReadingMode(m => m === 'scroll' ? 'page' : 'scroll'); setCurrentPage(1); }}
              className="button-outline flex items-center gap-2 min-w-[120px] justify-center transition-colors duration-200"
              title={readingMode === 'scroll' ? 'التبديل إلى نمط الصفحات' : 'التبديل إلى النمط المتدفق'}
            >
              {readingMode === 'scroll' ? <IconBookOpen /> : <IconAlignJustify />}
              <span className="font-medium text-sm">{readingMode === 'scroll' ? 'صفحات' : 'متدفق'}</span>
            </button>

            {/* زر ملء الشاشة */}
            <button
              onClick={toggleFullscreen}
              className="button-outline flex items-center gap-2 min-w-[100px] justify-center transition-colors duration-200"
              aria-label={isFullscreen ? 'الخروج من وضع ملء الشاشة' : 'وضع ملء الشاشة'}
            >
              {isFullscreen ? <IconMinimize /> : <IconMaximize />}
              <span className="font-medium text-sm">{isFullscreen ? 'تصغير' : 'تكبير'}</span>
            </button>
          </div>

          {/* خطأ الصوت */}
          {audioError && (
            <p className="text-center text-red-600 text-sm mt-3 px-3 py-2 bg-red-100 border border-red-300 rounded-md" role="alert">
              {audioError}
            </p>
          )}
        </header>

        {/* ---- محتوى السورة ---- */}
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
          /* ===== نمط الصفحات ===== */
          <div>
            {/* منطقة الصفحة */}
            <main
              ref={surahContentRef}
              className="quran-card p-6 md:p-10 lg:p-12 font-quran text-center leading-relaxed bg-white shadow-lg min-h-[60vh] text-2xl md:text-3xl relative"
              style={{ lineHeight: '2.9' }}
              aria-label={`سورة ${surah.name} - صفحة ${currentPage} من ${totalPages}`}
            >
              {/* البسملة فقط في الصفحة الأولى */}
              {currentPage === 1 && surah.number !== 1 && surah.number !== 9 && (
                <p className="bismillah text-primary font-bold py-4 text-center">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</p>
              )}
              {currentPageAyahs.map(renderAyah)}
            </main>

            {/* ---- أزرار الصفحات ---- */}
            <div className="mt-6 flex items-center justify-center gap-4">
              {/* الصفحة السابقة */}
              <button
                onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); surahContentRef.current?.scrollTo({ top: 0 }); }}
                disabled={currentPage === 1}
                className="button-outline flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="الصفحة السابقة"
              >
                <IconChevronRight size={18} />
                السابقة
              </button>

              {/* مؤشر الصفحة */}
              <div className="flex items-center gap-2">
                {/* أزرار أرقام الصفحات (تعرض حتى 7 أزرار) */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => {
                    if (totalPages <= 7) return true;
                    if (p === 1 || p === totalPages) return true;
                    if (Math.abs(p - currentPage) <= 2) return true;
                    return false;
                  })
                  .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                    if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === '...' ? (
                      <span key={`ellipsis-${idx}`} className="text-foreground/40 px-1">…</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => { setCurrentPage(item as number); surahContentRef.current?.scrollTo({ top: 0 }); }}
                        className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${currentPage === item ? 'bg-primary text-white shadow-md scale-110' : 'bg-card-bg border border-border-color text-foreground/70 hover:bg-primary/10'}`}
                        aria-label={`الانتقال إلى الصفحة ${item}`}
                        aria-current={currentPage === item ? 'page' : undefined}
                      >
                        {(item as number).toLocaleString('ar-EG')}
                      </button>
                    )
                  )}
              </div>

              {/* الصفحة التالية */}
              <button
                onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); surahContentRef.current?.scrollTo({ top: 0 }); }}
                disabled={currentPage === totalPages}
                className="button-outline flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="الصفحة التالية"
              >
                التالية
                <IconChevronLeft size={18} />
              </button>
            </div>

            {/* مؤشر تقدم القراءة */}
            <div className="mt-4 flex flex-col items-center gap-1">
              <div className="w-full max-w-sm h-2 bg-border-color rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${(currentPage / totalPages) * 100}%` }}
                />
              </div>
              <p className="text-xs text-foreground/50">صفحة {currentPage.toLocaleString('ar-EG')} من {totalPages.toLocaleString('ar-EG')}</p>
            </div>
          </div>
        )}

        {/* ---- شريط التنقل السفلي ---- */}
        <footer className="mt-8 flex justify-between items-center text-sm">
          {prevSurah ? (
            <Link href={`/surah/${prevSurah}`} className="flex items-center text-primary hover:text-accent transition-colors hover-lift" aria-label="السورة السابقة">
              <IconChevronRight size={18} />
              <span className="me-1 font-medium">السورة السابقة</span>
            </Link>
          ) : <div aria-hidden="true" />}

          <Link href="/" className="flex items-center text-primary hover:text-accent transition-colors hover-lift font-medium" aria-label="الفهرس">الفهرس</Link>

          {nextSurah ? (
            <Link href={`/surah/${nextSurah}`} className="flex items-center text-primary hover:text-accent transition-colors hover-lift" aria-label="السورة التالية">
              <span className="ms-1 font-medium">السورة التالية</span>
              <IconChevronLeft size={18} />
            </Link>
          ) : <div aria-hidden="true" />}
        </footer>

      </div>
    </div>
  );
}

// تصدير الصفحة الرئيسية مغلفة بـ Suspense لضمان توافق Next.js 15 و Vercel
export default function SurahPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <SurahPageContent />
    </Suspense>
  );
}