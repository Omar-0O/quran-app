'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { surahList, SurahInfoBasic } from './data/surahList'; // Import the Surah type

export default function HomePage() {
  const [filter, setFilter] = useState<'all' | 'meccan' | 'medinan'>('all');
  const [searchTerm, setSearchTerm] = useState(''); // State for search term

  // Filter Surahs based on revelation type and search term
  const filteredSurahs = useMemo(() => {
    let surahs = surahList;

    // Filter by revelation type
    if (filter === 'meccan') {
      surahs = surahs.filter(surah => surah.revelationType === 'Meccan');
    } else if (filter === 'medinan') {
      surahs = surahs.filter(surah => surah.revelationType === 'Medinan');
    }

    // Filter by search term (Arabic name)
    if (searchTerm.trim() !== '') {
        const lowerCaseSearchTerm = searchTerm.trim().toLowerCase(); // No need for Arabic lowercasing
        surahs = surahs.filter(surah =>
            surah.name.includes(lowerCaseSearchTerm) // Direct substring match for Arabic
        );
    }

    return surahs;
  }, [filter, searchTerm]); // Add searchTerm dependency

  return (
    <main className="min-h-screen p-6 md:p-10 bg-pattern">
      <div className="max-w-4xl mx-auto fade-in">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">القرآن الكريم</h1>
          <p className="text-lg md:text-xl text-foreground/80">
          تصفح سور القرآن الكريم للقراءة والاستماع والتحميل صدقة جارية عن اموات المسلمين اجمعين, نسألكم الدعاء
          </p>
        </header>

        {/* Restored and Styled Surah Classification Legend */}
        <section aria-labelledby="surah-types-heading" className="mb-8 p-5 quran-card bg-background/70 backdrop-blur-sm rounded-lg border border-border-color scale-in">
           <h3 id="surah-types-heading" className="text-lg font-semibold text-primary mb-3 text-center">أنواع السور في القرآن</h3>
           <p className="text-center text-foreground/80 text-sm leading-relaxed mb-4 max-w-xl mx-auto">
               السور المكية هي التي نزلت قبل الهجرة إلى المدينة المنورة، وتتميز بآياتها القصيرة غالباً ومعالجتها للعقيدة. أما السور المدنية فهي التي نزلت بعد الهجرة، وتتميز بآياتها الطويلة وتناولها للتشريعات والمعاملات.
           </p>
           <div className="flex justify-center items-center gap-6 text-sm font-medium border-t border-border-color/50 pt-4">
               <div className="flex items-center gap-2">
                   <span className="block w-3 h-3 rounded-full bg-orange-600/80" title="مكية"></span>
                   <span>مكية</span>
               </div>
               <div className="flex items-center gap-2">
                    <span className="block w-3 h-3 rounded-full bg-teal-600/80" title="مدنية"></span>
                    <span>مدنية</span>
               </div>
           </div>
       </section>

        {/* Controls: Filter buttons and Search Box */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap justify-center">
            <button
              onClick={() => setFilter('all')}
              className={`filter-button ${filter === 'all' ? 'active' : ''}`}
            >
              جميع السور
            </button>
            <button
              onClick={() => setFilter('meccan')}
              className={`filter-button ${filter === 'meccan' ? 'active' : ''}`}
            >
              السور المكية
            </button>
            <button
              onClick={() => setFilter('medinan')}
              className={`filter-button ${filter === 'medinan' ? 'active' : ''}`}
            >
              السور المدنية
            </button>
          </div>

          {/* Search Input */}
           <div className="relative w-full sm:w-auto">
               <input
                 type="search"
                 placeholder="ابحث عن سورة..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="input pr-8 w-full sm:w-64" // Added padding for icon
                 aria-label="البحث عن سورة بالاسم"
               />
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40 pointer-events-none"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
           </div>
        </div>

        {/* Surah List Grid */}
        {filteredSurahs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSurahs.map((surah: SurahInfoBasic) => (
              <Link key={surah.number} href={`/surah/${surah.number}`}>
                <div className="quran-card h-full p-5 flex justify-between items-center hover-lift scale-in" title={`سورة ${surah.name} (${surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}) - ${surah.numberOfAyahs} آيات`}>
                  <div className="text-right">
                    <p className="text-sm text-primary font-medium mb-1">
                      رقم {surah.number.toLocaleString('ar-EG')}
                    </p>
                    <h2 className="text-xl font-quran font-semibold text-foreground">
                      {surah.name}
                    </h2>
                  </div>
                  <div className="text-left flex flex-col items-end">
                     <p className="text-md font-sans font-medium text-foreground/90 mb-1">
                        {surah.numberOfAyahs.toLocaleString('ar-EG')} آيات
                    </p>
                    <div className="flex items-center gap-1.5" title={surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}>
                        <span className={`block w-2.5 h-2.5 rounded-full ${surah.revelationType === 'Meccan' ? 'bg-orange-600/80' : 'bg-teal-600/80'}`}></span>
                        <span className={`text-xs font-medium ${surah.revelationType === 'Meccan' ? 'text-orange-600' : 'text-teal-600'}`}>
                           {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                       </span>
                   </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
           <div className="text-center py-10 text-foreground/60">
               <p>لم يتم العثور على سور تطابق بحثك.</p>
           </div>
        )}
      </div>
    </main>
  );
}
