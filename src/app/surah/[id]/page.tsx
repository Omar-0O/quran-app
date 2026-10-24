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
import '../../styles/reader.css';

/* ---------- Small inline icons ---------- */
type IconProps = { size?: number };
const Svg = ({ size = 20, children }: IconProps & { children: React.ReactNode }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);
const IconBack = () => <Svg><polyline points="9 18 15 12 9 6" /></Svg>;
const IconNext = () => <Svg><polyline points="15 18 9 12 15 6" /></Svg>;
const IconSettings = () => (
  <Svg>
    <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="8" cy="17" r="2" />
  </Svg>
);
const IconPlay = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>;
const IconPause = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>;
const IconDownload = () => <Svg size={18}><path d="M12 3v12" /><path d="m7 11 5 5 5-5" /><path d="M5 21h14" /></Svg>;
const IconExpand = () => <Svg><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" /><path d="M3 16v3a2 2 0 0 0 2 2h3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" /></Svg>;
const IconShrink = () => <Svg><path d="M8 3v3a2 2 0 0 1-2 2H3" /><path d="M21 8h-3a2 2 0 0 1-2-2V3" /><path d="M3 16h3a2 2 0 0 1 2 2v3" /><path d="M16 21v-3a2 2 0 0 1 2-2h3" /></Svg>;

/* ---------- Helpers ---------- */
const JUZ_NAMES = [
  '', 'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر',
  'الحادي عشر', 'الثاني عشر', 'الثالث عشر', 'الرابع عشر', 'الخامس عشر', 'السادس عشر', 'السابع عشر',
  'الثامن عشر', 'التاسع عشر', 'العشرون', 'الحادي والعشرون', 'الثاني والعشرون', 'الثالث والعشرون',
  'الرابع والعشرون', 'الخامس والعشرون', 'السادس والعشرون', 'السابع والعشرون', 'الثامن والعشرون',
  'التاسع والعشرون', 'الثلاثون',
];

const getArabicRevelationType = (type: string) => (type === 'Meccan' ? 'مكية' : 'مدنية');
const toAr = (n: number) => n.toLocaleString('ar-EG');

// Strip the Bismillah that the API prepends to the first ayah (diacritics-insensitive)
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

type ReaderTheme = 'auto' | 'white' | 'paper' | 'green' | 'night';
type ReadingMode = 'scroll' | 'page';
type QuranFont = 'amiri' | 'naskh';
type LineSpacing = 'tight' | 'normal' | 'loose';

const LINE_HEIGHTS: Record<LineSpacing, number> = { tight: 1.9, normal: 2.3, loose: 2.8 };
const STORAGE_KEY = 'qr_reader_prefs_v2';

const THEME_SWATCHES: { id: ReaderTheme; label: string; bg: string }[] = [
  { id: 'auto', label: 'تلقائي', bg: 'linear-gradient(135deg,#fdfbf6 50%,#1a202c 50%)' },
  { id: 'white', label: 'أبيض', bg: '#ffffff' },
  { id: 'paper', label: 'ورقي', bg: '#f6efdf' },
  { id: 'green', label: 'أخضر', bg: '#e8f0e8' },
  { id: 'night', label: 'ليلي', bg: '#101417' },
];

/* ---------- Loading ---------- */
function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center" dir="rtl">
      <div className="text-center space-y-4">
        <div className="relative mx-auto w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
          <div className="absolute inset-1 rounded-full border-4 border-t-primary border-r-primary border-b-transparent border-l-transparent animate-spin" />
        </div>
        <p className="text-sm text-foreground/60 animate-pulse">جارٍ تحميل السورة...</p>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */
function SurahPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const highlightedAyahParam = searchParams.get('ayah');
  const pageParam = searchParams.get('page');
  const surahId = parseInt(params.id as string);

  // Synchronous cache retrieval – 0ms rendering if visited before or prefetched
  const initialSurah = useMemo(() => getCachedSurah(surahId), [surahId]);
  const [surah, setSurah] = useState<SurahData | null>(() => getCachedSurah(surahId));
  const [loading, setLoading] = useState<boolean>(() => !getCachedSurah(surahId));
  const [fetchError, setFetchError] = useState('');

  /* reader preferences */
  const [theme, setTheme] = useState<ReaderTheme>('auto');
  const [mode, setMode] = useState<ReadingMode>('scroll');
  const [fontSize, setFontSize] = useState(26);
  const [font, setFont] = useState<QuranFont>('amiri');
  const [spacing, setSpacing] = useState<LineSpacing>('normal');
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  /* ui state */
  const [pageIndex, setPageIndex] = useState<number>(() => {
    if (pageParam === 'last') return 0; // Will be set to pages.length - 1 once pages are computed
    if (pageParam) {
      const p = parseInt(pageParam, 10);
      if (!isNaN(p) && p > 0) return p - 1;
    }
    const saved = getLastVisitedPage(surahId);
    return saved != null ? saved : 0;
  });
  const [sheet, setSheet] = useState<null | 'settings' | 'pages'>(null);
  const [selectedAyah, setSelectedAyah] = useState<AyahData | null>(null);
  const [tafsirAyah, setTafsirAyah] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [scrollPct, setScrollPct] = useState(0);

  /* audio */
  const [reciter, setReciter] = useState<ReciterInfo>(ALL_RECITERS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loadedSrcRef = useRef('');

  const [immersive, setImmersive] = useState(false);
  const touchRef = useRef<{ x: number; y: number } | null>(null);
  const jumpedRef = useRef(false);
  const initialPageSurahRef = useRef<number | null>(null);

  const prevSurah = surahId > 1 ? surahId - 1 : null;
  const nextSurah = surahId < 114 ? surahId + 1 : null;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  }, []);

  /* ----- preferences: load once, save on change ----- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (p.theme) setTheme(p.theme);
        if (p.mode) setMode(p.mode);
        if (p.fontSize) setFontSize(p.fontSize);
        if (p.font) setFont(p.font);
        if (p.spacing) setSpacing(p.spacing);
        if (p.reciterId) {
          const r = ALL_RECITERS.find((x) => x.id === p.reciterId);
          if (r) setReciter(r);
        }
      }
    } catch {
      /* ignore */
    }
    setPrefsLoaded(true);
  }, []);

  useEffect(() => {
    if (!prefsLoaded) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ theme, mode, fontSize, font, spacing, reciterId: reciter.id })
      );
    } catch {
      /* ignore */
    }
  }, [prefsLoaded, theme, mode, fontSize, font, spacing, reciter.id]);

  /* ----- fetch / cache surah ----- */
  useEffect(() => {
    let cancelled = false;
    jumpedRef.current = false;
    setSelectedAyah(null);

    const cached = getCachedSurah(surahId);
    if (cached) {
      setSurah(cached);
      setLoading(false);
      setFetchError('');
      // Background prefetching of adjacent surahs so flipping is instant
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
        setFetchError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع.');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [surahId]);

  /* ----- real mushaf pages ----- */
  const pages = useMemo(() => {
    if (!surah) return [];
    const map = new Map<number, AyahData[]>();
    surah.ayahs.forEach((a) => {
      const p = a.page || 1;
      if (!map.has(p)) map.set(p, []);
      map.get(p)!.push(a);
    });
    return Array.from(map.keys())
      .sort((a, b) => a - b)
      .map((p) => ({ number: p, ayahs: map.get(p)!, juz: map.get(p)![0]?.juz || 1 }));
  }, [surah]);

  // Handle page positioning without resetting to 0 every time
  useEffect(() => {
    if (!pages.length) return;

    if (highlightedAyahParam) {
      initialPageSurahRef.current = surahId;
      return;
    }

    if (pageParam === 'last') {
      setPageIndex(pages.length - 1);
      initialPageSurahRef.current = surahId;
      return;
    }

    if (pageParam) {
      const p = parseInt(pageParam, 10);
      if (!isNaN(p) && p > 0) {
        setPageIndex(Math.max(0, Math.min(pages.length - 1, p - 1)));
        initialPageSurahRef.current = surahId;
        return;
      }
    }

    if (initialPageSurahRef.current !== surahId) {
      const saved = getLastVisitedPage(surahId);
      if (saved != null && saved >= 0 && saved < pages.length) {
        setPageIndex(saved);
      } else {
        setPageIndex(0);
      }
      initialPageSurahRef.current = surahId;
    }
  }, [surahId, pages, pageParam, highlightedAyahParam]);

  // Persist reading position for this surah
  useEffect(() => {
    if (surah && pages.length > 0 && pageIndex >= 0 && pageIndex < pages.length) {
      saveLastVisitedPage(surah.number, pageIndex);
    }
  }, [surah, pages.length, pageIndex]);

  const page = pages[pageIndex];
  const isPageMode = mode === 'page' && !!page;
  const isLastPage = pageIndex >= pages.length - 1;

  /* ----- audio ----- */
  const audioUrl = useMemo(() => getSurahAudioUrl(reciter.serverUrl, surahId), [reciter, surahId]);
  const downloadUrl = useMemo(
    () => (surah ? getSurahDownloadUrl(reciter.serverUrl, surahId, surah.name, reciter.name) : '#'),
    [reciter, surahId, surah]
  );

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none';
    const onEnded = () => setIsPlaying(false);
    const onReady = () => setIsAudioLoading(false);
    const onWaiting = () => setIsAudioLoading(true);
    const onError = () => {
      setAudioError('تعذر تشغيل التلاوة حالياً. جرّب قارئاً آخر أو حمّلها مباشرة.');
      setIsAudioLoading(false);
      setIsPlaying(false);
    };
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('canplay', onReady);
    audio.addEventListener('playing', onReady);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('error', onError);
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.removeAttribute('src');
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('canplay', onReady);
      audio.removeEventListener('playing', onReady);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('error', onError);
    };
  }, []);

  // surah / reciter changed -> stop and lazily reload on next play
  useEffect(() => {
    audioRef.current?.pause();
    loadedSrcRef.current = '';
    setIsPlaying(false);
    setIsAudioLoading(false);
    setAudioError('');
  }, [audioUrl]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    setAudioError('');
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }
    if (loadedSrcRef.current !== audioUrl) {
      audio.src = audioUrl;
      loadedSrcRef.current = audioUrl;
    }
    setIsAudioLoading(true);
    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setAudioError('تعذر تشغيل التلاوة. يمكنك تحميلها مباشرة من الإعدادات.');
      setIsAudioLoading(false);
      setIsPlaying(false);
    }
  };

  /* ----- page navigation ----- */
  const goToPage = useCallback(
    (idx: number) => {
      setPageIndex(Math.max(0, Math.min(pages.length - 1, idx)));
      setSelectedAyah(null);
      window.scrollTo({ top: 0, behavior: 'auto' });
    },
    [pages.length]
  );

  // Next / previous page; at the edges move on to the neighbouring surah
  const goNext = useCallback(() => {
    if (pageIndex < pages.length - 1) {
      goToPage(pageIndex + 1);
    } else if (nextSurah) {
      if (nextSurah + 1 <= 114) prefetchSurah(nextSurah + 1);
      router.push(`/surah/${nextSurah}`);
    }
  }, [pageIndex, pages.length, goToPage, nextSurah, router]);

  const goPrev = useCallback(() => {
    if (pageIndex > 0) {
      goToPage(pageIndex - 1);
    } else if (prevSurah) {
      if (prevSurah - 1 >= 1) prefetchSurah(prevSurah - 1);
      router.push(`/surah/${prevSurah}?page=last`);
    }
  }, [pageIndex, goToPage, prevSurah, router]);

  /* ----- mode switching preserving position ----- */
  const switchToScroll = useCallback(() => {
    if (mode === 'scroll') return;
    const currentFirstAyah = page?.ayahs[0]?.numberInSurah;
    setMode('scroll');
    if (currentFirstAyah) {
      setTimeout(() => {
        const el = document.getElementById(`ayah-${currentFirstAyah}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 60);
    }
  }, [mode, page]);

  const switchToPage = useCallback(() => {
    if (mode === 'page') return;
    let target = pageIndex;
    if (surah && pages.length > 0) {
      const ayahEls = document.querySelectorAll('.rd-ayah');
      let foundAyah: number | null = null;
      for (let i = 0; i < ayahEls.length; i++) {
        const rect = ayahEls[i].getBoundingClientRect();
        if (rect.top >= 40 && rect.top <= window.innerHeight * 0.6) {
          const num = parseInt(ayahEls[i].id.replace('ayah-', ''), 10);
          if (!isNaN(num)) {
            foundAyah = num;
            break;
          }
        }
      }
      if (foundAyah != null) {
        const idx = pages.findIndex((p) => p.ayahs.some((a) => a.numberInSurah === foundAyah));
        if (idx !== -1) target = idx;
      }
    }
    setMode('page');
    setPageIndex(target);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [mode, pageIndex, pages, surah]);

  useEffect(() => {
    if (!isPageMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goNext();
      if (e.key === 'ArrowRight') goPrev();
      if (e.key === 'Escape') setImmersive(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isPageMode, goNext, goPrev]);

  /* ----- immersive (full-screen) mode ----- */
  const toggleImmersive = useCallback(async () => {
    const next = !immersive;
    setImmersive(next);
    setSelectedAyah(null);
    window.scrollTo({ top: 0 });
    try {
      if (next && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen?.();
      } else if (!next && document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      /* browsers without the Fullscreen API (e.g. iPhone) use the CSS full-screen layout */
    }
    if (next) showToast('اضغط يمين الشاشة للسابقة ويسارها للتالية');
  }, [immersive, showToast]);

  // keep state in sync if the user leaves browser full screen by system gesture
  useEffect(() => {
    const onFs = () => {
      if (!document.fullscreenElement) setImmersive(false);
    };
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  // leave immersive when switching to scroll mode
  useEffect(() => {
    if (mode !== 'page' && immersive) {
      setImmersive(false);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    }
  }, [mode, immersive]);

  const onTouchStart = (e: React.TouchEvent) => {
    if (!isPageMode) return;
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchRef.current;
    touchRef.current = null;
    if (!start || !isPageMode) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      // Arabic book: swipe left = next page
      if (dx < 0) goNext();
      else goPrev();
    }
  };

  /* ----- reading progress (scroll mode) ----- */
  useEffect(() => {
    if (isPageMode) return;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isPageMode, surah]);

  /* ----- jump to ?ayah= ----- */
  useEffect(() => {
    if (!highlightedAyahParam || !surah || loading || !prefsLoaded || jumpedRef.current) return;
    const n = parseInt(highlightedAyahParam);
    if (mode === 'page') {
      const idx = pages.findIndex((p) => p.ayahs.some((a) => a.numberInSurah === n));
      if (idx !== -1 && idx !== pageIndex) {
        setPageIndex(idx);
        return;
      }
    }
    jumpedRef.current = true;
    window.setTimeout(() => {
      const el = document.getElementById(`ayah-${n}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('is-flash');
        window.setTimeout(() => el.classList.remove('is-flash'), 3000);
      }
    }, 250);
  }, [highlightedAyahParam, surah, loading, prefsLoaded, mode, pages, pageIndex]);

  /* ----- ayah actions ----- */
  const copyAyah = async (a: AyahData) => {
    if (!surah) return;
    try {
      await navigator.clipboard.writeText(`﴿${a.text}﴾ [سورة ${surah.name}: ${a.numberInSurah}]`);
      showToast('تم نسخ الآية');
    } catch {
      showToast('تعذر النسخ');
    }
    setSelectedAyah(null);
  };
  const bookmarkAyah = (a: AyahData) => {
    if (!surah) return;
    try {
      localStorage.setItem(
        'last_read_quran',
        JSON.stringify({ surahId: surah.number, surahName: surah.name, ayahNumber: a.numberInSurah })
      );
      showToast('تم حفظ علامة القراءة');
    } catch {
      /* ignore */
    }
    setSelectedAyah(null);
  };

  /* ----- render helpers ----- */
  const renderAyah = (ayah: AyahData) => {
    let text = ayah.text.replace(/\n/g, ' ').trim();
    if (surah && surah.number !== 1 && surah.number !== 9 && ayah.numberInSurah === 1) {
      text = stripBismillah(text);
    }
    const selected = selectedAyah?.numberInSurah === ayah.numberInSurah;
    return (
      <span
        key={ayah.number}
        id={`ayah-${ayah.numberInSurah}`}
        className={`rd-ayah${selected ? ' is-selected' : ''}`}
        onClick={() => setSelectedAyah(selected ? null : ayah)}
      >
        {text}
        <span className="rd-num">{' ﴿'}{toAr(ayah.numberInSurah)}{'﴾'}</span>
        {ayah.sajda ? <span className="rd-num"> ۩</span> : null}{' '}
      </span>
    );
  };

  const showBismillah = (startsHere: boolean) =>
    startsHere && !!surah && surah.number !== 1 && surah.number !== 9;

  /* ----- states ----- */
  if (loading) return <LoadingScreen />;

  if (fetchError || !surah) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center" dir="rtl">
        <div className="quran-card p-8 text-center max-w-md">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="font-bold mb-2 text-red-600">تعذّر تحميل السورة</p>
          <p className="mb-5 text-sm text-foreground/70">{fetchError || 'حدث خطأ غير متوقع.'}</p>
          <Link href="/" className="button">العودة إلى الفهرس</Link>
        </div>
      </div>
    );
  }

  const progress = isPageMode ? ((pageIndex + 1) / pages.length) * 100 : scrollPct;
  const cssVars = {
    '--rd-fs': `${fontSize}px`,
    '--rd-lh': LINE_HEIGHTS[spacing],
  } as React.CSSProperties;
  const barClass = isPageMode && !immersive ? '' : ' no-bar';
  const showChrome = !immersive;

  return (
    <div
      className={`rd${immersive ? ' is-immersive' : ''}`}
      dir="rtl"
      data-theme={immersive ? theme : undefined}
      data-font={font}
      style={cssVars}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Top bar */}
      {showChrome && (<>
      <header className="rd-topbar">
        <Link href="/" className="rd-btn rd-ghost rd-icon" aria-label="العودة إلى الفهرس">
          <IconBack />
        </Link>

        <div className="rd-topbar-title">
          <h1 className="rd-title">سورة {surah.name}</h1>
          <div className="rd-sub">
            {toAr(surah.numberOfAyahs)} آية · {getArabicRevelationType(surah.revelationType)}
          </div>
        </div>

        <button
          className={`rd-btn rd-icon${isPlaying ? ' rd-primary' : ''}`}
          onClick={togglePlay}
          disabled={isAudioLoading && !isPlaying}
          aria-label={isPlaying ? 'إيقاف التلاوة' : 'تشغيل التلاوة'}
        >
          {isAudioLoading ? <span className="rd-spin" style={{ borderColor: 'var(--rd-border)', borderTopColor: 'var(--rd-primary)' }} /> : isPlaying ? <IconPause /> : <IconPlay />}
        </button>
        {isPageMode && (
          <button className="rd-btn rd-ghost rd-icon" onClick={toggleImmersive} aria-label="قراءة بملء الشاشة">
            <IconExpand />
          </button>
        )}
        <button className="rd-btn rd-ghost rd-icon" onClick={() => setSheet('settings')} aria-label="إعدادات القراءة">
          <IconSettings />
        </button>
      </header>
      <div className="rd-progress" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
      </>)}

      {/* Full-screen reading: tap the screen edges to turn pages */}
      {immersive && isPageMode && (
        <>
          <button className="rd-zone is-prev" onClick={goPrev} aria-label="الصفحة السابقة" />
          <button className="rd-zone is-next" onClick={goNext} aria-label="الصفحة التالية" />
          <div className="rd-hud-top">
            <button className="rd-btn rd-icon" onClick={toggleImmersive} aria-label="الخروج من ملء الشاشة"><IconShrink /></button>
            <button className="rd-btn rd-icon" onClick={() => setSheet('settings')} aria-label="إعدادات القراءة"><IconSettings /></button>
          </div>
          <div className="rd-hud-pill">{toAr(page.number)} · {toAr(pageIndex + 1)}/{toAr(pages.length)}</div>
        </>
      )}

      {toast && <div className="rd-toast" role="status">{toast}</div>}

      {/* Content */}
      <main className={`rd-main${barClass}`}>
        {audioError && <p className="rd-error" role="alert">{audioError}</p>}

        {isPageMode ? (
          <article className="rd-page" data-theme={theme} aria-label={`صفحة ${toAr(page.number)}`}>
            <div className="rd-pagehead">
              <span>سورة {surah.name}</span>
              <span>الجزء {JUZ_NAMES[page.juz] || toAr(page.juz)}</span>
            </div>

            {page.ayahs.some((a) => a.numberInSurah === 1) && (
              <div className="rd-banner">
                سورة {surah.name}
                <small>{toAr(surah.numberOfAyahs)} آية · {getArabicRevelationType(surah.revelationType)}</small>
              </div>
            )}
            {showBismillah(page.ayahs.some((a) => a.numberInSurah === 1)) && (
              <p className="rd-bismillah" style={{ fontSize: fontSize * 1.1 }}>بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
            )}

            <div className="rd-text">{page.ayahs.map(renderAyah)}</div>

            <div className="rd-pagefoot">
              <span className="rd-pagenum">{toAr(page.number)}</span>
            </div>
          </article>
        ) : (
          <article className="rd-page" data-theme={theme}>
            {surah.number !== 9 && (
              <div className="rd-banner">
                سورة {surah.name}
                <small>{toAr(surah.numberOfAyahs)} آية · {getArabicRevelationType(surah.revelationType)}</small>
              </div>
            )}
            {showBismillah(true) && (
              <p className="rd-bismillah" style={{ fontSize: fontSize * 1.1 }}>بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
            )}
            <div className="rd-text">{surah.ayahs.map(renderAyah)}</div>
          </article>
        )}

        {/* Surah navigation at the end of the content (scroll mode, or the last page) */}
        {(!isPageMode || (isLastPage && !immersive)) && (
          <div className="rd-endnav">
            {prevSurah ? (
              <Link
                href={`/surah/${prevSurah}?page=last`}
                className="rd-btn"
                onMouseEnter={() => prefetchSurah(prevSurah)}
                onTouchStart={() => prefetchSurah(prevSurah)}
              >
                <IconBack /> السورة السابقة
              </Link>
            ) : <span />}
            {nextSurah ? (
              <Link
                href={`/surah/${nextSurah}`}
                className="rd-btn rd-primary"
                onMouseEnter={() => prefetchSurah(nextSurah)}
                onTouchStart={() => prefetchSurah(nextSurah)}
              >
                السورة التالية <IconNext />
              </Link>
            ) : <span />}
          </div>
        )}
      </main>

      {/* Page mode bottom navigation */}
      {isPageMode && !immersive && (
        <nav className="rd-bottombar" aria-label="التنقل بين الصفحات">
          {pageIndex > 0 ? (
            <button className="rd-btn" onClick={() => goToPage(pageIndex - 1)} aria-label="الصفحة السابقة">
              <IconBack /> السابقة
            </button>
          ) : prevSurah ? (
            <Link
              href={`/surah/${prevSurah}?page=last`}
              className="rd-btn"
              onMouseEnter={() => prefetchSurah(prevSurah)}
              onTouchStart={() => prefetchSurah(prevSurah)}
            >
              <IconBack /> السورة السابقة
            </Link>
          ) : <span />}

          <button className="rd-btn rd-pagejump" onClick={() => setSheet('pages')} aria-label="اختيار صفحة">
            <span>صفحة {toAr(page.number)}</span>
            <small>{toAr(pageIndex + 1)} من {toAr(pages.length)}</small>
          </button>

          {!isLastPage ? (
            <button className="rd-btn rd-primary" onClick={() => goToPage(pageIndex + 1)} aria-label="الصفحة التالية">
              التالية <IconNext />
            </button>
          ) : nextSurah ? (
            <Link
              href={`/surah/${nextSurah}`}
              className="rd-btn rd-primary"
              onMouseEnter={() => prefetchSurah(nextSurah)}
              onTouchStart={() => prefetchSurah(nextSurah)}
            >
              السورة التالية <IconNext />
            </Link>
          ) : <span />}
        </nav>
      )}

      {/* Selected ayah actions */}
      {selectedAyah && (
        <div className={`rd-actions${barClass}`} role="toolbar" aria-label="إجراءات الآية">
          <span className="rd-label">آية {toAr(selectedAyah.numberInSurah)}</span>
          <button className="rd-btn rd-primary" onClick={() => setTafsirAyah(selectedAyah.numberInSurah)}>التفسير</button>
          <button className="rd-btn" onClick={() => copyAyah(selectedAyah)}>نسخ</button>
          <button className="rd-btn" onClick={() => bookmarkAyah(selectedAyah)}>حفظ</button>
          <button className="rd-btn rd-ghost rd-icon" onClick={() => setSelectedAyah(null)} aria-label="إغلاق">✕</button>
        </div>
      )}

      {/* Settings sheet */}
      {sheet === 'settings' && (
        <div className="rd-overlay" onClick={() => setSheet(null)}>
          <div className="rd-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="إعدادات القراءة">
            <div className="rd-grab" />
            <p className="rd-sheet-title">إعدادات القراءة</p>

            <div className="rd-section">
              <span className="rd-label-row">أسلوب القراءة</span>
              <div className="rd-seg">
                <button className={mode === 'scroll' ? 'is-on' : ''} onClick={switchToScroll}>
                  متتابع
                </button>
                <button className={mode === 'page' ? 'is-on' : ''} onClick={switchToPage}>
                  صفحات المصحف
                </button>
              </div>
            </div>

            <div className="rd-section">
              <span className="rd-label-row">لون الخلفية</span>
              <div className="rd-swatches">
                {THEME_SWATCHES.map((t) => (
                  <button key={t.id} className={`rd-swatch${theme === t.id ? ' is-on' : ''}`} onClick={() => setTheme(t.id)}>
                    <i style={{ background: t.bg }} />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rd-section">
              <span className="rd-label-row">حجم الخط ({toAr(fontSize)})</span>
              <input
                className="rd-range"
                type="range"
                min={18}
                max={44}
                step={1}
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                aria-label="حجم الخط"
              />
              <div className="rd-preview" data-theme={theme} style={{ background: 'var(--rd-card)' }}>
                <span className="rd-text" style={{ textAlignLast: 'center' }}>بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</span>
              </div>
            </div>

            <div className="rd-section">
              <span className="rd-label-row">نوع الخط</span>
              <div className="rd-seg">
                <button className={font === 'amiri' ? 'is-on' : ''} onClick={() => setFont('amiri')}>مصحفي</button>
                <button className={font === 'naskh' ? 'is-on' : ''} onClick={() => setFont('naskh')}>نسخ واضح</button>
              </div>
            </div>

            <div className="rd-section">
              <span className="rd-label-row">تباعد الأسطر</span>
              <div className="rd-seg">
                <button className={spacing === 'tight' ? 'is-on' : ''} onClick={() => setSpacing('tight')}>مضغوط</button>
                <button className={spacing === 'normal' ? 'is-on' : ''} onClick={() => setSpacing('normal')}>مريح</button>
                <button className={spacing === 'loose' ? 'is-on' : ''} onClick={() => setSpacing('loose')}>واسع</button>
              </div>
            </div>

            <div className="rd-section">
              <label className="rd-label-row" htmlFor="rd-reciter">القارئ</label>
              <select
                id="rd-reciter"
                className="rd-select"
                value={reciter.id}
                onChange={(e) => {
                  const r = ALL_RECITERS.find((x) => x.id === e.target.value);
                  if (r) setReciter(r);
                }}
              >
                {RECITERS_CATEGORIES.filter((c) => c.id !== 'all').map((c) => {
                  const items = ALL_RECITERS.filter((r) => r.category === c.id);
                  if (!items.length) return null;
                  return (
                    <optgroup key={c.id} label={c.name}>
                      {items.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </optgroup>
                  );
                })}
              </select>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem' }}>
                <button className="rd-btn rd-primary" style={{ flex: 1 }} onClick={() => { setSheet(null); togglePlay(); }}>
                  {isPlaying ? <IconPause /> : <IconPlay />} {isPlaying ? 'إيقاف' : 'استماع'}
                </button>
                <a className="rd-btn" style={{ flex: 1 }} href={downloadUrl} download>
                  <IconDownload /> تحميل MP3
                </a>
              </div>
            </div>

            <button className="rd-btn" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => setSheet(null)}>
              تم
            </button>
          </div>
        </div>
      )}

      {/* Page picker sheet */}
      {sheet === 'pages' && (
        <div className="rd-overlay" onClick={() => setSheet(null)}>
          <div className="rd-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="اختيار صفحة">
            <div className="rd-grab" />
            <p className="rd-sheet-title">الانتقال إلى صفحة</p>
            <div className="rd-grid">
              {pages.map((p, i) => (
                <button
                  key={p.number}
                  className={`rd-btn${i === pageIndex ? ' rd-primary' : ''}`}
                  onClick={() => { goToPage(i); setSheet(null); }}
                >
                  {toAr(p.number)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {tafsirAyah && (
        <TafsirModal
          isOpen={!!tafsirAyah}
          onClose={() => setTafsirAyah(null)}
          surahNumber={surah.number}
          ayahNumber={tafsirAyah}
        />
      )}
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