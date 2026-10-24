'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { SurahInfoBasic } from "../data/surahList";
import { juzList, hizbList } from "../data/quranStructure";

interface ReciterMp3Info {
  id: string;
  serverUrl: string;
  name: string;
  description?: string;
  subname?: string;
}

interface SurahSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  reciter: ReciterMp3Info;
  surahList: SurahInfoBasic[];
}

// دالة توليد رابط الصوت
const generateActualUrl = (reciterServerUrl: string, surahNum: number): string => {
  const paddedSurah = surahNum.toString().padStart(3, '0');
  const cleanServer = reciterServerUrl.endsWith('/') ? reciterServerUrl.slice(0, -1) : reciterServerUrl;
  return `${cleanServer}/${paddedSurah}.mp3`;
};

// دالة تنزيل موثوقة ومباشرة عبر خادم التطبيق
const triggerDownload = (url: string, filename: string) => {
  const proxyUrl = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
  const a = document.createElement('a');
  a.href = proxyUrl;
  a.setAttribute('download', filename);
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    if (document.body.contains(a)) {
      document.body.removeChild(a);
    }
  }, 1000);
};

export default function SurahSelectionModal({
  isOpen,
  onClose,
  reciter,
  surahList
}: SurahSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSurahs, setSelectedSurahs] = useState<Set<number>>(new Set());
  const [selectedJuzFilter, setSelectedJuzFilter] = useState<string>('');
  const [selectedHizbFilter, setSelectedHizbFilter] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{ current: number; total: number; name?: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // مشغل استماع مدمج داخل النافذة
  const [playingSurahNum, setPlayingSurahNum] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // إعادة التعيين عند فتح النافذة
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedSurahs(new Set());
      setSelectedJuzFilter('');
      setSelectedHizbFilter('');
      setPlayingSurahNum(null);
      setIsPlaying(false);
      setDownloadProgress(null);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [isOpen, reciter]);

  // إيقاف الصوت عند الإغلاق
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, []);

  // فلترة السور
  const filteredSurahs = useMemo(() => {
    let result = surahList;

    // فلترة بالجزء
    if (selectedJuzFilter) {
      const jNum = parseInt(selectedJuzFilter);
      const juz = juzList.find(j => j.number === jNum);
      if (juz) {
        result = result.filter(s => juz.surahNumbers.includes(s.number));
      }
    }

    // فلترة بالحزب
    if (selectedHizbFilter) {
      const hNum = parseInt(selectedHizbFilter);
      const hizb = hizbList.find(h => h.number === hNum);
      if (hizb) {
        result = result.filter(s => hizb.surahNumbers.includes(s.number));
      }
    }

    // فلترة بالبحث
    if (searchTerm.trim()) {
      const lowerCaseSearch = searchTerm.trim().toLowerCase();
      result = result.filter(surah =>
        surah.name.toLowerCase().includes(lowerCaseSearch) ||
        surah.number.toString() === lowerCaseSearch
      );
    }

    return result;
  }, [searchTerm, selectedJuzFilter, selectedHizbFilter, surahList]);

  // تبديل اختيار سورة مفردة
  const handleSurahSelectionChange = (surahNumber: number, isChecked: boolean) => {
    setSelectedSurahs(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (isChecked) {
        newSelected.add(surahNumber);
      } else {
        newSelected.delete(surahNumber);
      }
      return newSelected;
    });
  };

  // تحديد الكل
  const handleSelectAllChange = (isChecked: boolean) => {
    if (isChecked) {
      const allFilteredIds = new Set(filteredSurahs.map(s => s.number));
      setSelectedSurahs(allFilteredIds);
    } else {
      setSelectedSurahs(new Set());
    }
  };

  // اختيار جزء كامل
  const handleSelectJuz = (juzNumberStr: string) => {
    setSelectedJuzFilter(juzNumberStr);
    setSelectedHizbFilter('');
  };

  // اختيار حزب كامل
  const handleSelectHizb = (hizbNumberStr: string) => {
    setSelectedHizbFilter(hizbNumberStr);
    setSelectedJuzFilter('');
  };

  const isAllSelected = useMemo(() => {
    if (filteredSurahs.length === 0) return false;
    return filteredSurahs.every(s => selectedSurahs.has(s.number));
  }, [filteredSurahs, selectedSurahs]);

  // تشغيل / إيقاف سورة
  const handleTogglePlay = (surahNumber: number) => {
    const audioUrl = generateActualUrl(reciter.serverUrl, surahNumber);
    if (playingSurahNum === surahNumber && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      setPlayingSurahNum(surahNumber);
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.error("Play error:", err);
          setIsPlaying(false);
          setPlayingSurahNum(null);
          showToast('تعذر تشغيل الصوت، جاري إعادة المحاولة...');
        });
      }
    }
  };

  // تحميل سورة مفردة
  const handleDownloadSingleSurah = (surah: SurahInfoBasic) => {
    const audioUrl = generateActualUrl(reciter.serverUrl, surah.number);
    const filename = `${surah.number.toString().padStart(3, '0')} - سورة ${surah.name} - ${reciter.name}.mp3`;
    showToast(`جاري تحميل سورة ${surah.name}...`);
    triggerDownload(audioUrl, filename);
  };

  // تحميل السور المحددة
  const handleDownloadSelected = async () => {
    if (selectedSurahs.size === 0) return;

    setIsDownloading(true);
    const surahsToDownload = Array.from(selectedSurahs).sort((a, b) => a - b);
    setDownloadProgress({ current: 0, total: surahsToDownload.length });

    try {
      for (let i = 0; i < surahsToDownload.length; i++) {
        const surahNumber = surahsToDownload[i];
        const surah = surahList.find(s => s.number === surahNumber);
        const audioUrl = generateActualUrl(reciter.serverUrl, surahNumber);
        const filename = `${surahNumber.toString().padStart(3, '0')} - سورة ${surah?.name || surahNumber} - ${reciter.name}.mp3`;

        setDownloadProgress({
          current: i + 1,
          total: surahsToDownload.length,
          name: surah?.name || `سورة ${surahNumber}`
        });

        triggerDownload(audioUrl, filename);

        // تأخير بسيط لمنع اعتراض المتصفح للتنزيلات المتتابعة
        if (i < surahsToDownload.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1200));
        }
      }
      showToast(`تم إرسال طلبات تحميل ${surahsToDownload.length} سورة بنجاح.`);
    } catch (error) {
      console.error("Error during download:", error);
      showToast('حدث خطأ أثناء محاولة التحميل.');
    } finally {
      setIsDownloading(false);
      setTimeout(() => setDownloadProgress(null), 3000);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentPlayingSurah = useMemo(() => {
    if (!playingSurahNum) return null;
    return surahList.find(s => s.number === playingSurahNum);
  }, [playingSurahNum, surahList]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm fade-in p-3 md:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="surah-modal-title"
      dir="rtl"
    >
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setAudioCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setAudioDuration(e.currentTarget.duration)}
        onEnded={() => {
          setIsPlaying(false);
          setPlayingSurahNum(null);
        }}
      />

      <div
        className="bg-card-bg border border-border-color rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col scale-in overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* إشعار عائم (Toast) */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-primary text-white text-xs md:text-sm py-2 px-4 rounded-full shadow-lg border border-white/20 animate-bounce">
            {toastMessage}
          </div>
        )}

        {/* رأس النافذة */}
        <header className="p-5 border-b border-border-color bg-background/50 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🎙️</span>
              <h2 id="surah-modal-title" className="text-lg! font-bold text-primary mb-0!">
                {reciter.name}
              </h2>
            </div>
            <p className="text-xs text-foreground/70 mt-1">
              {reciter.subname || reciter.description || 'تصفح سور القرآن الكريم للاستماع والتحميل المباشر'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-border-color flex items-center justify-center text-foreground/60 hover:text-red-500 hover:border-red-300 transition-colors"
            aria-label="إغلاق النافذة"
          >
            ✕
          </button>
        </header>

        {/* أدوات التصفية والبحث */}
        <div className="p-4 border-b border-border-color bg-background/30 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <input
                type="search"
                placeholder="ابحث عن اسم السورة أو رقمها..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 ps-9 border border-border-color rounded-lg bg-background text-xs md:text-sm font-ui focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>

            <div className="flex gap-2">
              <select
                value={selectedJuzFilter}
                onChange={(e) => handleSelectJuz(e.target.value)}
                className="p-2 border border-border-color rounded-lg bg-background text-xs font-ui focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">كل الأجزاء</option>
                {juzList.map(juz => (
                  <option key={juz.number} value={juz.number.toString()}>{juz.name}</option>
                ))}
              </select>

              <select
                value={selectedHizbFilter}
                onChange={(e) => handleSelectHizb(e.target.value)}
                className="p-2 border border-border-color rounded-lg bg-background text-xs font-ui focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">كل الأحزاب</option>
                {hizbList.map(hizb => (
                  <option key={hizb.number} value={hizb.number.toString()}>{hizb.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* التحديد الجماعي وأزرار التحميل */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium select-none">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => handleSelectAllChange(e.target.checked)}
                className="checkbox accent-primary rounded"
                disabled={filteredSurahs.length === 0}
              />
              تحديد المعروض ({selectedSurahs.size}/{filteredSurahs.length})
            </label>

            <button
              onClick={handleDownloadSelected}
              className="button text-xs py-1.5 px-3.5 flex items-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={selectedSurahs.size === 0 || isDownloading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              {isDownloading
                ? `جاري التحميل (${downloadProgress?.current}/${downloadProgress?.total})...`
                : `تحميل السور المحددة (${selectedSurahs.size})`}
            </button>
          </div>
        </div>

        {/* شريط تشغيل الصوت المصغر داخل النافذة */}
        {currentPlayingSurah && (
          <div className="bg-primary/10 border-b border-primary/20 px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
              <span className="font-semibold truncate">
                سورة {currentPlayingSurah.name}
              </span>
              <span className="text-foreground/50 text-[11px]">
                {formatTime(audioCurrentTime)} / {formatTime(audioDuration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (audioRef.current) {
                    if (isPlaying) {
                      audioRef.current.pause();
                      setIsPlaying(false);
                    } else {
                      audioRef.current.play();
                      setIsPlaying(true);
                    }
                  }
                }}
                className="p-1.5 rounded-full bg-primary text-white hover:bg-accent transition-colors"
                title={isPlaying ? "إيقاف مؤقت" : "متابعة"}
              >
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                )}
              </button>

              <button
                onClick={() => handleDownloadSingleSurah(currentPlayingSurah)}
                className="p-1.5 rounded-full border border-border-color hover:bg-primary/10 text-primary transition-colors"
                title="تحميل هذه السورة"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/></svg>
              </button>
            </div>
          </div>
        )}

        {/* قائمة السور */}
        <ul className="overflow-y-auto flex-grow p-4 space-y-2 divide-y divide-border-color/40">
          {filteredSurahs.length > 0 ? (
            filteredSurahs.map((surah) => {
              const isChecked = selectedSurahs.has(surah.number);
              const isPlayingThis = playingSurahNum === surah.number && isPlaying;

              return (
                <li
                  key={surah.number}
                  className={`pt-2 flex items-center justify-between p-3 rounded-xl transition-all ${
                    isPlayingThis
                      ? 'bg-primary/10 border border-primary/40 shadow-sm'
                      : isChecked
                      ? 'bg-secondary/10 border border-secondary/30'
                      : 'hover:bg-foreground/5'
                  }`}
                >
                  <div className="flex items-center flex-grow gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => handleSurahSelectionChange(surah.number, e.target.checked)}
                      className="checkbox accent-primary cursor-pointer w-4 h-4 rounded"
                      aria-labelledby={`surah-name-${surah.number}`}
                    />
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-foreground/40 bg-foreground/5 px-1.5 py-0.5 rounded">
                          {surah.number.toString().padStart(3, '0')}
                        </span>
                        <span id={`surah-name-${surah.number}`} className="font-semibold text-sm truncate font-quran">
                          سورة {surah.name}
                        </span>
                        {isPlayingThis && (
                          <span className="text-[10px] bg-accent text-white px-2 py-0.5 rounded-full animate-pulse">
                            يتم الاستماع
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-foreground/50 block mt-0.5">
                        {surah.numberOfAyahs.toLocaleString('ar-EG')} آيات • {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                      </span>
                    </div>
                  </div>

                  {/* أزرار العمليات لكل سورة */}
                  <div className="flex items-center gap-1.5 ms-2 flex-shrink-0">
                    {/* زر الاستماع الفوري */}
                    <button
                      onClick={() => handleTogglePlay(surah.number)}
                      className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-xs ${
                        isPlayingThis
                          ? 'bg-accent text-white shadow-sm'
                          : 'text-primary hover:bg-primary/10 border border-border-color'
                      }`}
                      title={isPlayingThis ? "إيقاف مؤقت" : `استماع لسورة ${surah.name}`}
                    >
                      {isPlayingThis ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                          <span>إيقاف</span>
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                          <span>استماع</span>
                        </>
                      )}
                    </button>

                    {/* زر التحميل الفوري */}
                    <button
                      onClick={() => handleDownloadSingleSurah(surah)}
                      className="p-2 rounded-lg text-foreground/80 hover:text-white hover:bg-primary border border-border-color transition-colors flex items-center gap-1 text-xs"
                      title={`تحميل سورة ${surah.name} بصيغة MP3`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/></svg>
                      <span>تحميل MP3</span>
                    </button>
                  </div>
                </li>
              );
            })
          ) : (
            <li className="text-center text-foreground/60 py-10">لا توجد سور تطابق معايير البحث.</li>
          )}
        </ul>

        {/* تذييل النافذة */}
        <footer className="p-4 border-t border-border-color bg-background/50 text-xs text-foreground/70 flex justify-between items-center">
          <span>تم تحديد {selectedSurahs.size} من {surahList.length} سورة</span>
          <div className="flex gap-2">
            {selectedSurahs.size > 0 && (
              <button
                onClick={() => setSelectedSurahs(new Set())}
                className="button-outline text-xs py-1 px-3"
              >
                إلغاء التحديد
              </button>
            )}
            <button onClick={onClose} className="button text-xs py-1 px-4">
              تم
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}