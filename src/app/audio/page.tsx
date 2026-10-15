'use client';

import { useState } from "react";
import Link from "next/link";
import SurahSelectionModal from "../components/SurahSelectionModal";
import { surahList } from "../data/surahList";

// بنية بيانات القارئ
export interface ReciterMp3Info {
  id: string;
  serverUrl: string;
  name: string;
  description?: string;
}

// قائمة القراء المعتمدة الموسعة
const recitersList: ReciterMp3Info[] = [
  { id: 'mishari', serverUrl: 'https://server8.mp3quran.net/afs', name: 'مشاري بن راشد العفاسي', description: 'رواية حفص عن عاصم' },
  { id: 'abdulbasit', serverUrl: 'https://server7.mp3quran.net/basit', name: 'عبد الباسط عبد الصمد (مرتل)', description: 'رواية حفص عن عاصم' },
  { id: 'abdulbasit_mjwd', serverUrl: 'https://server7.mp3quran.net/basit_mjwd', name: 'عبد الباسط عبد الصمد (مجود)', description: 'تلاوة مجودة' },
  { id: 'husary', serverUrl: 'https://server13.mp3quran.net/husr', name: 'محمود خليل الحصري (مرتل)', description: 'رواية حفص عن عاصم' },
  { id: 'husary_mjwd', serverUrl: 'https://server13.mp3quran.net/husr_mjwd', name: 'محمود خليل الحصري (مجود)', description: 'تلاوة مجودة' },
  { id: 'minshawi', serverUrl: 'https://server10.mp3quran.net/minsh', name: 'محمد صديق المنشاوي (مرتل)', description: 'رواية حفص عن عاصم' },
  { id: 'minshawi_mjwd', serverUrl: 'https://server10.mp3quran.net/minsh_mjwd', name: 'محمد صديق المنشاوي (مجود)', description: 'تلاوة مجودة' },
  { id: 'sudais', serverUrl: 'https://server11.mp3quran.net/sds', name: 'عبد الرحمن السديس', description: 'إمام المسجد الحرام' },
  { id: 'shuraim', serverUrl: 'https://server12.mp3quran.net/shoraimy', name: 'سعود الشريم', description: 'رواية حفص عن عاصم' },
  { id: 'maher', serverUrl: 'https://server12.mp3quran.net/maher', name: 'ماهر المعيقلي', description: 'إمام المسجد الحرام' },
  { id: 'ghamdi', serverUrl: 'https://server6.mp3quran.net/ghamdi', name: 'سعد الغامدي', description: 'رواية حفص عن عاصم' },
  { id: 'yasser', serverUrl: 'https://server11.mp3quran.net/yasser', name: 'ياسر الدوسري', description: 'إمام المسجد الحرام' },
  { id: 'frs_a', serverUrl: 'https://server8.mp3quran.net/frs_a', name: 'فارس عباد', description: 'رواية حفص عن عاصم' },
  { id: 'basfar', serverUrl: 'https://server6.mp3quran.net/bsfr', name: 'عبد الله بصفر', description: 'رواية حفص عن عاصم' },
  { id: 'balushi', serverUrl: 'https://server11.mp3quran.net/hazza', name: 'هزاع البلوشي', description: 'رواية حفص عن عاصم' },
  { id: 'ajmi', serverUrl: 'https://server10.mp3quran.net/ajm', name: 'أحمد بن علي العجمي', description: 'رواية حفص عن عاصم' },
  { id: 'shatri', serverUrl: 'https://server11.mp3quran.net/shatri', name: 'أبو بكر الشاطري', description: 'رواية حفص عن عاصم' },
  { id: 'hthfi', serverUrl: 'https://server9.mp3quran.net/hthfi', name: 'علي بن عبد الرحمن الحذيفي', description: 'إمام المسجد النبوي' },
  { id: 'ayyub', serverUrl: 'https://server8.mp3quran.net/ayyub', name: 'محمد أيوب', description: 'رواية حفص عن عاصم' },
  { id: 'qtm', serverUrl: 'https://server6.mp3quran.net/qtm', name: 'ناصر القطامي', description: 'رواية حفص عن عاصم' },
  { id: 'jleel', serverUrl: 'https://server10.mp3quran.net/jleel', name: 'خالد الجليل', description: 'رواية حفص عن عاصم' },
  { id: 'wdee', serverUrl: 'https://server6.mp3quran.net/wdee', name: 'وديع اليمني', description: 'رواية حفص عن عاصم' },
  { id: 'rifai', serverUrl: 'https://server8.mp3quran.net/rifai', name: 'هاني الرفاعي', description: 'رواية حفص عن عاصم' },
  { id: 'abkr', serverUrl: 'https://server6.mp3quran.net/abkr', name: 'إدريس أبكر', description: 'رواية حفص عن عاصم' },
];

export default function AudioDownloadPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReciter, setSelectedReciter] = useState<ReciterMp3Info | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpenModal = (reciter: ReciterMp3Info) => {
    setSelectedReciter(reciter);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReciter(null);
  };

  const filteredReciters = recitersList.filter(r =>
    r.name.includes(searchTerm) || (r.description && r.description.includes(searchTerm))
  );

  return (
    <div className="min-h-screen p-6 md:p-10 bg-pattern" dir="rtl">
      <div className="max-w-6xl mx-auto fade-in">
        {/* التنقل للرئيسية */}
        <nav className="mb-8 flex justify-start">
          <Link
            href="/"
            className="flex items-center text-primary hover:text-accent transition-colors hover-lift font-medium text-sm"
            aria-label="العودة إلى فهرس السور"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="me-1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            العودة إلى الرئيسية
          </Link>
        </nav>

        {/* رأس الصفحة الأصلي */}
        <header className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4 font-quran">القرآن الكريم بصيغة MP3</h1>
          <h2 className="text-xl md:text-2xl text-foreground/90 mb-4">
            استمع وحمّل القرآن الكريم بصوت أشهر قراء العالم الإسلامي.
          </h2>
          <p className="text-md md:text-lg leading-relaxed text-foreground/80 max-w-3xl mx-auto mb-6">
            يمكنكم الاستماع للتلاوات أو تحميلها بصيغة MP3، لكل سور القرآن الكريم، بصوت نخبة من القراء.
          </p>

          {/* شريط بحث بين القراء */}
          <div className="max-w-md mx-auto relative">
            <input
              type="search"
              placeholder="ابحث عن قارئ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2.5 ps-10 border border-border-color rounded-lg bg-background text-sm font-ui focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
              aria-label="البحث عن قارئ"
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
        </header>

        {/* شبكة القراء (الشكل الأصلي المفضل) */}
        <main>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 auto-rows-fr">
            {filteredReciters.map((reciter) => (
              <div key={reciter.id} className="quran-card p-5 flex flex-col text-center scale-in h-full hover:border-primary/50 transition-all">
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-primary mb-1">{reciter.name}</h3>
                  {reciter.description && (
                    <p className="text-xs text-foreground/70 mb-4">{reciter.description}</p>
                  )}
                </div>
                <div className="mt-auto pt-4 border-t border-border-color flex flex-col gap-3">
                  <button
                    onClick={() => handleOpenModal(reciter)}
                    className="button-outline text-sm px-4 py-2 flex items-center justify-center gap-1.5 w-full hover:bg-primary hover:text-white transition-colors"
                    aria-label={`استعراض سور القارئ ${reciter.name}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 12c-2 0-4.5 1-6 3.5V6.5C7.5 5 10 4 12 4s4.5 1 6 2.5V15c-1.5-2.5-4-3.5-6-3.5zM6 18.5c1.5-2.5 4-3.5 6-3.5s4.5 1 6 3.5" />
                      <path d="M12 4v15" />
                    </svg>
                    استماع / تحميل السور
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredReciters.length === 0 && (
            <div className="text-center py-12 quran-card">
              <p className="text-foreground/70">لم يتم العثور على قراء يطابقون بحثك.</p>
            </div>
          )}
        </main>

        {/* النافذة المنبثقة لاختيار السور والأجزاء والأحزاب */}
        {selectedReciter && (
          <SurahSelectionModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            reciter={selectedReciter}
            surahList={surahList}
          />
        )}
      </div>
    </div>
  );
}