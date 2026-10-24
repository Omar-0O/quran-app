'use client';

import { useState, useMemo } from "react";
import Link from "next/link";
import SurahSelectionModal from "../components/SurahSelectionModal";
import { surahList } from "../data/surahList";
import { ALL_RECITERS, RECITERS_CATEGORIES, ReciterInfo } from "../data/reciters";

export default function AudioDownloadPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReciter, setSelectedReciter] = useState<ReciterInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleOpenModal = (reciter: ReciterInfo) => {
    setSelectedReciter(reciter);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReciter(null);
  };

  // تصفية القراء بحسب الفئة والبحث
  const filteredReciters = useMemo(() => {
    let list = ALL_RECITERS;

    if (selectedCategory !== 'all') {
      if (selectedCategory === 'minshawi') {
        list = list.filter(r => r.category === 'minshawi' || r.name.includes('المنشاوي'));
      } else if (selectedCategory === 'mujawwad') {
        list = list.filter(r => r.name.includes('مجود') || r.subname?.includes('مجود') || r.category === 'mujawwad');
      } else if (selectedCategory === 'muallim') {
        list = list.filter(r => r.name.includes('معلم') || r.subname?.includes('معلم') || r.category === 'muallim');
      } else {
        list = list.filter(r => r.category === selectedCategory);
      }
    }

    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      list = list.filter(r =>
        r.name.toLowerCase().includes(term) ||
        (r.subname && r.subname.toLowerCase().includes(term)) ||
        r.rewaya.toLowerCase().includes(term)
      );
    }

    return list;
  }, [searchTerm, selectedCategory]);

  // تلاوات الشيخ المنشاوي المميزة
  const minshawiRecitations = useMemo(() => {
    return ALL_RECITERS.filter(r => r.category === 'minshawi' || r.name.includes('المنشاوي'));
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-10 bg-pattern" dir="rtl">
      <div className="max-w-6xl mx-auto fade-in">
        {/* التنقل للرئيسية */}
        <nav className="mb-6 flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center text-primary hover:text-accent transition-colors hover-lift font-medium text-sm"
            aria-label="العودة إلى فهرس السور"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="me-1.5" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            العودة إلى فهرس المصحف
          </Link>

          <Link
            href="/surah/1"
            className="button-outline text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            📖 قراءة القرآن
          </Link>
        </nav>

        {/* رأس الصفحة */}
        <header className="text-center mb-8">
          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-3">
            المكتبة الصوتية الشاملة • MP3 مجاناً
          </span>
          <h1 className="text-2xl! md:text-4xl! font-bold text-primary mb-3!">
            تحميل واستماع القرآن الكريم
          </h1>
          <p className="text-base md:text-lg text-foreground/80 max-w-2xl mx-auto mb-6">
            استمع وحمّل جميع سور القرآن الكريم بجودة عالية MP3 بصوت نخبة من كبار قراء العالم الإسلامي بروابط مباشرة وسريعة.
          </p>

          {/* شريط البحث المطور */}
          <div className="max-w-xl mx-auto relative mb-6">
            <input
              type="search"
              placeholder="ابحث عن قارئ، رواية، أو نوع التلاوة (مثال: المنشاوي، مرتل، ورش)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-3 ps-11 pe-4 border border-border-color rounded-xl bg-card-bg text-sm font-ui focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              aria-label="البحث عن قارئ"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          {/* تصنيفات القراء السريعة */}
          <div className="flex gap-2 justify-center flex-wrap max-w-4xl mx-auto">
            {RECITERS_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-xs md:text-sm py-1.5 px-3.5 rounded-full transition-all border ${
                  selectedCategory === cat.id
                    ? 'bg-primary text-white border-primary shadow-sm font-semibold'
                    : 'bg-card-bg text-foreground/80 border-border-color hover:bg-primary/10'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </header>

        {/* قسم خاص مميز: الشيخ محمد صديق المنشاوي */}
        {(selectedCategory === 'all' || selectedCategory === 'minshawi') && !searchTerm && (
          <section className="mb-10 quran-card border-2 border-primary/30 bg-gradient-to-br from-card-bg via-primary/5 to-card-bg p-6 md:p-8 rounded-2xl shadow-md">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 border-b border-border-color/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center text-2xl shadow-md">
                  🎙️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-accent text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      صوت يبكي القلوب
                    </span>
                    <span className="text-xs text-foreground/50">تلاوات كاملة 114 سورة</span>
                  </div>
                  <h2 className="text-xl! md:text-2xl! font-bold text-primary mt-1 mb-0!">
                    فضيلة الشيخ محمد صديق المنشاوي (رحمه الله)
                  </h2>
                </div>
              </div>
              <p className="text-xs text-foreground/70 max-w-sm text-center md:text-left">
                اختر نوع المصحف للاستماع المباشر أو تحميل السور بصيغة MP3 عالية النقاء
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {minshawiRecitations.map((reciter) => (
                <div
                  key={reciter.id}
                  className="bg-card-bg border border-border-color hover:border-primary/60 rounded-xl p-4 flex flex-col justify-between transition-all hover:shadow-md hover:-translate-y-0.5"
                >
                  <div>
                    <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-md inline-block mb-2">
                      {reciter.rewaya}
                    </span>
                    <h3 className="text-base! font-bold text-primary mb-1!">
                      {reciter.name}
                    </h3>
                    <p className="text-xs text-foreground/70 mb-4 leading-relaxed">
                      {reciter.subname}
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenModal(reciter)}
                    className="button text-xs py-2 px-3 w-full flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/></svg>
                    استماع / تحميل السور
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* شبكة القراء الكاملة */}
        <main>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg! font-bold text-primary flex items-center gap-2 mb-0!">
              <span>قائمة القراء والمصاحف الكاملة</span>
              <span className="text-xs font-normal text-foreground/50 bg-foreground/5 px-2 py-0.5 rounded-full">
                {filteredReciters.length} قارئ ومصحف
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr">
            {filteredReciters.map((reciter) => (
              <div
                key={reciter.id}
                className="quran-card p-5 flex flex-col text-center scale-in h-full hover:border-primary/60 hover:shadow-md transition-all rounded-xl"
              >
                <div className="flex-grow">
                  <span className="text-[10px] font-medium text-foreground/60 bg-foreground/5 px-2 py-0.5 rounded-full inline-block mb-2">
                    {reciter.rewaya}
                  </span>
                  <h3 className="text-base! font-bold text-primary mb-1!">
                    {reciter.name}
                  </h3>
                  {reciter.subname && (
                    <p className="text-xs text-foreground/70 mb-4">{reciter.subname}</p>
                  )}
                </div>

                <div className="mt-auto pt-3 border-t border-border-color/60 flex flex-col gap-2">
                  <button
                    onClick={() => handleOpenModal(reciter)}
                    className="button-outline text-xs px-3 py-2 flex items-center justify-center gap-1.5 w-full hover:bg-primary hover:text-white transition-colors rounded-lg"
                    aria-label={`استعراض سور القارئ ${reciter.name}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/>
                    </svg>
                    استماع / تحميل السور
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredReciters.length === 0 && (
            <div className="text-center py-16 quran-card rounded-2xl">
              <span className="text-4xl block mb-2">🔍</span>
              <p className="text-foreground/70 mb-2">لم يتم العثور على قراء يطابقون بحثك.</p>
              <button
                onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                className="button-outline text-xs py-1.5 px-4"
              >
                إعادة ضبط البحث
              </button>
            </div>
          )}
        </main>

        {/* النافذة المنبثقة لاختيار السور والتحميل */}
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