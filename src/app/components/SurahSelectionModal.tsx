'use client';

import { useState, useEffect, useMemo } from 'react';
import { SurahInfoBasic } from "../data/surahList"; // Import Surah type

// Define structure for reciter data passed to modal
interface ReciterMp3Info {
  id: string; // Simple identifier
  audioApiId: string; // Actual ID for audio URLs
  name: string;
  description?: string;
}

interface SurahSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  reciter: ReciterMp3Info; // Now includes audioApiId
  surahList: SurahInfoBasic[]; // Receive the list of Surahs
}

// Helper function to generate individual MP3 URLs using the audioApiId
const generateActualUrl = (reciterAudioApiId: string, surahNum: number): string => {
  const paddedSurah = surahNum.toString().padStart(3, '0');
  // Use the actual audioApiId for the URL
  return `https://everyayah.com/data/${reciterAudioApiId}/${paddedSurah}.mp3`;
};

export default function SurahSelectionModal({
  isOpen,
  onClose,
  reciter,
  surahList
}: SurahSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSurahs, setSelectedSurahs] = useState<Set<number>>(new Set()); // Use Set for efficient add/delete

  // Reset search and selection when modal opens/reciter changes
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedSurahs(new Set());
    }
  }, [isOpen, reciter]);

  // Filter Surahs based on search term
  const filteredSurahs = useMemo(() => {
    if (!searchTerm) {
      return surahList;
    }
    const lowerCaseSearch = searchTerm.toLowerCase();
    return surahList.filter(surah =>
      surah.name.toLowerCase().includes(lowerCaseSearch) || // Match Arabic name
      surah.number.toString() === lowerCaseSearch // Match number
    );
  }, [searchTerm, surahList]);

  // Handle individual Surah checkbox change
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

  // Handle "Select All" checkbox change
  const handleSelectAllChange = (isChecked: boolean) => {
    if (isChecked) {
      // Select all *filtered* Surahs
      const allFilteredIds = new Set(filteredSurahs.map(s => s.number));
      setSelectedSurahs(allFilteredIds);
    } else {
      setSelectedSurahs(new Set());
    }
  };

  // Check if all filtered Surahs are currently selected
  const isAllSelected = useMemo(() => {
    if (filteredSurahs.length === 0) return false;
    return filteredSurahs.every(s => selectedSurahs.has(s.number));
  }, [filteredSurahs, selectedSurahs]);

  // Placeholder for downloading selected Surahs
  const handleDownloadSelected = () => {
    if (selectedSurahs.size === 0) return;

    // In a real app, this would trigger a backend process or use a client-side ZIP library
    console.log(`Request to download ${selectedSurahs.size} Surahs for reciter ${reciter.name} (${reciter.audioApiId}):`, Array.from(selectedSurahs).sort((a, b) => a - b));
    alert(`طلب تحميل ${selectedSurahs.size} سورة للقارئ ${reciter.name}\n(لأغراض العرض، سيتم طباعة أرقام السور في الكونسول)`);
    // Potentially close modal after action
    // onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm fade-in p-4"
      onClick={onClose} // Close on backdrop click
      role="dialog"
      aria-modal="true"
      aria-labelledby="surah-modal-title"
    >
      <div
        className="quran-card bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col scale-in"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {/* Modal Header */}
        <header className="p-5 border-b border-border-color flex justify-between items-center sticky top-0 bg-background rounded-t-lg z-10">
          <div>
             <h2 id="surah-modal-title" className="text-xl font-semibold text-primary">اختر السور للقارئ: {reciter.name}</h2>
              <p className="text-sm text-foreground/70">حدد سورة للاستماع أو التحميل، أو حدد عدة سور للتحميل المجمع.</p>
          </div>
          <button
            onClick={onClose}
            className="text-foreground/70 hover:text-primary transition-colors"
            aria-label="إغلاق النافذة"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </header>

        {/* Search and Select All Controls */}
         <div className="p-4 border-b border-border-color sticky top-[85px] bg-background z-10 flex flex-col sm:flex-row gap-3 items-center">
            <input
              type="search"
              placeholder="ابحث عن سورة بالاسم أو الرقم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input flex-grow w-full sm:w-auto"
              aria-label="البحث عن سورة"
            />
           <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
               <label className="flex items-center gap-2 cursor-pointer text-sm whitespace-nowrap">
                 <input
                   type="checkbox"
                   checked={isAllSelected}
                   onChange={(e) => handleSelectAllChange(e.target.checked)}
                   className="checkbox"
                   disabled={filteredSurahs.length === 0}
                 />
                 تحديد الكل ({selectedSurahs.size}/{filteredSurahs.length})
               </label>
               <button
                 onClick={handleDownloadSelected}
                 className="button-outline text-sm px-3 py-1.5 flex items-center gap-1.5 whitespace-nowrap"
                 disabled={selectedSurahs.size === 0}
                 aria-label={`تحميل ${selectedSurahs.size} سورة مختارة`}
               >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                 تحميل المحدد ({selectedSurahs.size})
               </button>
           </div>
         </div>

        {/* Surah List - Scrollable */}
        <ul className="overflow-y-auto flex-grow p-5 space-y-2">
          {filteredSurahs.length > 0 ? (
             filteredSurahs.map((surah) => {
              const audioUrl = generateActualUrl(reciter.audioApiId, surah.number);
              const isChecked = selectedSurahs.has(surah.number);
              return (
                <li key={surah.number} className="flex items-center justify-between p-3 rounded-md bg-background hover:bg-secondary/10 transition-colors border border-transparent hover:border-border-color">
                   <div className="flex items-center flex-grow gap-3 min-w-0">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleSurahSelectionChange(surah.number, e.target.checked)}
                        className="checkbox"
                        aria-labelledby={`surah-name-${surah.number}`}
                      />
                      {/* Surah Info - Wrap for potential truncation */}
                     <div className="flex-grow min-w-0">
                          <span id={`surah-name-${surah.number}`} className="font-medium text-md truncate">{surah.number}. {surah.name}</span>
                      </div>
                   </div>

                  {/* Action Buttons */}
                   <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                      {/* Listen Button - Opens URL in new tab */}
                      <a
                        href={audioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button-icon text-primary hover:text-accent"
                        title={`استماع لسورة ${surah.name}`}
                        aria-label={`استماع لسورة ${surah.name}`}
                      >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon></svg>
                      </a>
                      {/* Download Button - Now uses correct URL and has download attribute */}
                      <a
                        href={audioUrl}
                        download // This attribute triggers the download
                        className="button-icon text-primary hover:text-accent"
                        title={`تحميل سورة ${surah.name}`}
                         aria-label={`تحميل سورة ${surah.name}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/></svg>
                      </a>
                   </div>
                </li>
              );
             })
           ) : (
            <li className="text-center text-foreground/60 py-6">لا توجد سور تطابق بحثك.</li>
           )}
        </ul>

         {/* Optional Footer for Download Button (alternative placement) */}
         {/* <footer className="p-4 border-t border-border-color flex justify-end sticky bottom-0 bg-background rounded-b-lg z-10"> ... </footer> */}
      </div>
    </div>
  );
} 