'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { SurahInfoBasic } from "../data/surahList";
import { juzList, hizbList } from "../data/quranStructure";

interface ReciterMp3Info {
  id: string;
  serverUrl: string;
  name: string;
  description?: string;
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
  return `${reciterServerUrl}/${paddedSurah}.mp3`;
};

// دالة تنزيل موثوقة
const triggerDownload = (url: string, filename: string) => {
  fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error('Network error');
      return res.blob();
    })
    .then((blob) => {
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    })
    .catch(() => {
      // استخدام مسار proxy التحميل الداخلي
      const proxyUrl = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
      const a = document.createElement('a');
      a.href = proxyUrl;
      a.setAttribute('download', filename);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
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
  const [downloadProgress, setDownloadProgress] = useState<{ current: number; total: number } | null>(null);

  // مشغل استماع مدمج داخل النافذة
  const [playingSurahNum, setPlayingSurahNum] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // إعادة التعيين عند فتح النافذة
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedSurahs(new Set());
      setSelectedJuzFilter('');
      setSelectedHizbFilter('');
      setPlayingSurahNum(null);
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
    if (!searchTerm) {
      return surahList;
    }
    const lowerCaseSearch = searchTerm.toLowerCase();
    return surahList.filter(surah =>
      surah.name.toLowerCase().includes(lowerCaseSearch) ||
      surah.number.toString() === lowerCaseSearch
    );
  }, [searchTerm, surahList]);

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
    if (!juzNumberStr) return;

    const jNum = parseInt(juzNumberStr);
    const juz = juzList.find(j => j.number === jNum);
    if (juz) {
      setSelectedSurahs(new Set(juz.surahNumbers));
    }
  };

  // اختيار حزب كامل
  const handleSelectHizb = (hizbNumberStr: string) => {
    setSelectedHizbFilter(hizbNumberStr);
    setSelectedJuzFilter('');
    if (!hizbNumberStr) return;

    const hNum = parseInt(hizbNumberStr);
    const hizb = hizbList.find(h => h.number === hNum);
    if (hizb) {
      setSelectedSurahs(new Set(hizb.surahNumbers));
    }
  };

  const isAllSelected = useMemo(() => {
    if (filteredSurahs.length === 0) return false;
    return filteredSurahs.every(s => selectedSurahs.has(s.number));
  }, [filteredSurahs, selectedSurahs]);

  // تشغيل / إيقاف سورة
  const handleTogglePlay = (surahNumber: number) => {
    const audioUrl = generateActualUrl(reciter.serverUrl, surahNumber);
    if (playingSurahNum === surahNumber) {
      audioRef.current?.pause();
      setPlayingSurahNum(null);
    } else {
      setPlayingSurahNum(surahNumber);
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play().catch(err => {
          console.error("Play error:", err);
          setPlayingSurahNum(null);
        });
      }
    }
  };

  // تحميل سورة مفردة
  const handleDownloadSingleSurah = (surah: SurahInfoBasic) => {
    const audioUrl = generateActualUrl(reciter.serverUrl, surah.number);
    const filename = `${surah.number.toString().padStart(3, '0')} - سورة ${surah.name} - ${reciter.name}.mp3`;
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

        triggerDownload(audioUrl, filename);
        setDownloadProgress({ current: i + 1, total: surahsToDownload.length });

        // تأخير بسيط لمنع اعتراض المتصفح للتحميلات المتتالية
        if (i < surahsToDownload.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }
    } catch (error) {
      console.error("Error during download:", error);
    } finally {
      setIsDownloading(false);
      setTimeout(() => setDownloadProgress(null), 1500);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm fade-in p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="surah-modal-title"
      dir="rtl"
    >
      <audio ref={audioRef} onEnded={() => setPlayingSurahNum(null)} />

      <div
        className="quran-card bg-background rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <header className="p-5 border-b border-border-color flex justify-between items-center bg-background rounded-t-lg">
          <div>
            <h2 id="surah-modal-title" className="text-xl font-bold font-quran text-primary">
              تصفح سور القارئ: {reciter.name}
            </h2>
            <p className="text-xs text-foreground/70 mt-0.5">
              حدد سورة أو جزء أو حزب للاستماع والتحميل المباشر بصيغة MP3.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-foreground/50 hover:text-red-500 transition-colors p-1"
            aria-label="إغلاق النافذة"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </header>

        {/* أدوات البحث والتحديد السريع للأجزاء والأحزاب */}
        <div className="p-4 border-b border-border-color bg-background/50 space-y-3">
          {/* شريط البحث */}
          <div className="flex gap-2">
            <input
              type="search"
              placeholder="ابحث عن سورة بالاسم أو الرقم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input flex-grow w-full text-sm"
              aria-label="البحث عن سورة"
            />
          </div>

          {/* تحديد حسب الجزء أو الحزب */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-background p-1.5 rounded border border-border-color">
              <span className="text-foreground/70 font-semibold whitespace-nowrap">تحديد جزء:</span>
              <select
                value={selectedJuzFilter}
                onChange={(e) => handleSelectJuz(e.target.value)}
                className="bg-transparent text-foreground flex-1 focus:outline-none text-xs"
              >
                <option value="">-- اختر جزءاً لتحديده --</option>
                {juzList.map(j => (
                  <option key={j.number} value={j.number}>
                    {j.name} ({j.surahNumbers.length} سورة)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-background p-1.5 rounded border border-border-color">
              <span className="text-foreground/70 font-semibold whitespace-nowrap">تحديد حزب:</span>
              <select
                value={selectedHizbFilter}
                onChange={(e) => handleSelectHizb(e.target.value)}
                className="bg-transparent text-foreground flex-1 focus:outline-none text-xs"
              >
                <option value="">-- اختر حزباً لتحديده --</option>
                {hizbList.map(h => (
                  <option key={h.number} value={h.number}>
                    {h.name} ({h.surahNumbers.length} سورة)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* عناصر التحديد والتحميل المجمع */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => handleSelectAllChange(e.target.checked)}
                className="checkbox accent-primary"
                disabled={filteredSurahs.length === 0}
              />
              تحديد الكل ({selectedSurahs.size}/{filteredSurahs.length})
            </label>

            <button
              onClick={handleDownloadSelected}
              className="button text-xs py-1.5 px-3 flex items-center gap-1.5 bg-primary hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={selectedSurahs.size === 0 || isDownloading}
              aria-label={`تحميل ${selectedSurahs.size} سورة مختارة`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              {isDownloading
                ? `جاري التحميل (${downloadProgress?.current}/${downloadProgress?.total})...`
                : `تحميل المحدد (${selectedSurahs.size})`}
            </button>
          </div>
        </div>

        {/* قائمة السور */}
        <ul className="overflow-y-auto flex-grow p-4 space-y-2">
          {filteredSurahs.length > 0 ? (
            filteredSurahs.map((surah) => {
              const isChecked = selectedSurahs.has(surah.number);
              const isPlayingThis = playingSurahNum === surah.number;

              return (
                <li
                  key={surah.number}
                  className={`flex items-center justify-between p-3 rounded-md transition-colors border ${
                    isChecked
                      ? 'bg-primary/5 border-primary/40'
                      : 'bg-background hover:bg-secondary/10 border-transparent hover:border-border-color'
                  }`}
                >
                  <div className="flex items-center flex-grow gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => handleSurahSelectionChange(surah.number, e.target.checked)}
                      className="checkbox accent-primary cursor-pointer"
                      aria-labelledby={`surah-name-${surah.number}`}
                    />
                    <div className="flex-grow min-w-0">
                      <span id={`surah-name-${surah.number}`} className="font-semibold text-sm truncate font-quran block">
                        {surah.number.toLocaleString('ar-EG')}. سورة {surah.name}
                      </span>
                      <span className="text-[11px] text-foreground/50">
                        {surah.numberOfAyahs.toLocaleString('ar-EG')} آيات • {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                      </span>
                    </div>
                  </div>

                  {/* أزرار العمليات لكل سورة */}
                  <div className="flex items-center gap-1.5 ms-3 flex-shrink-0">
                    {/* زر الاستماع الفوري */}
                    <button
                      onClick={() => handleTogglePlay(surah.number)}
                      className={`p-2 rounded-full transition-colors ${
                        isPlayingThis
                          ? 'bg-accent text-white shadow-sm'
                          : 'text-primary hover:bg-primary/10'
                      }`}
                      title={isPlayingThis ? "إيقاف مؤقت" : `استماع لسورة ${surah.name}`}
                      aria-label={`استماع لسورة ${surah.name}`}
                    >
                      {isPlayingThis ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <rect x="6" y="4" width="4" height="16" />
                          <rect x="14" y="4" width="4" height="16" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      )}
                    </button>

                    {/* زر التحميل الفوري */}
                    <button
                      onClick={() => handleDownloadSingleSurah(surah)}
                      className="p-2 rounded-full text-primary hover:text-accent hover:bg-primary/10 transition-colors"
                      title={`تحميل سورة ${surah.name}`}
                      aria-label={`تحميل سورة ${surah.name}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/></svg>
                    </button>
                  </div>
                </li>
              );
            })
          ) : (
            <li className="text-center text-foreground/60 py-8">لا توجد سور تطابق بحثك.</li>
          )}
        </ul>

        {/* تذييل النافذة */}
        <footer className="p-3 border-t border-border-color bg-background text-xs text-foreground/60 flex justify-between items-center">
          <span>تم تحديد {selectedSurahs.size} من {surahList.length} سورة</span>
          <button onClick={onClose} className="button-outline text-xs py-1 px-3">
            إغلاق
          </button>
        </footer>
      </div>
    </div>
  );
}