'use client'; // Can be a Server Component if no client interactivity is needed initially

import { useState } from "react"; // Import useState
import Link from "next/link";
import SurahSelectionModal from "../components/SurahSelectionModal"; // Import the modal component
import { surahList } from "../data/surahList"; // Import surah list data

// Define structure for reciter MP3 data
interface ReciterMp3Info {
  id: string; // Simple identifier for internal use (e.g., keys)
  audioApiId: string; // Identifier used in audio URLs (e.g., everyayah.com)
  name: string;
  description?: string; // Optional description (e.g., Riwayah)
}

// Updated list of reciters with actual audio API IDs
const recitersList: ReciterMp3Info[] = [
  { id: 'mishari', audioApiId: 'Mishary_Rashed_Alafasy_128kbps', name: 'مشاري بن راشد العفاسي' },
  { id: 'husary', audioApiId: 'Mahmoud_Khalil_Al-Husary_128kbps', name: 'محمود خليل الحصري (مرتل)', description: 'رواية حفص عن عاصم' },
  { id: 'abdulbasit', audioApiId: 'Abdul_Basit_Murattal_192kbps', name: 'عبد الباسط عبد الصمد (مرتل)' }, // Murattal version
  { id: 'basfar', audioApiId: 'Abdullah_Basfar_192kbps', name: 'عبد الله بصفر' },
  { id: 'balushi', audioApiId: 'Hazza_Al-Balushi_128kbps', name: 'هزاع البلوشي' },
  { id: 'sudais', audioApiId: 'Abdurrahmaan_As-Sudais_192kbps', name: 'عبد الرحمن السديس' },
  { id: 'shuraim', audioApiId: 'Saood_Ash-Shuraym_128kbps', name: 'سعود الشريم' },
  { id: 'ajmi', audioApiId: 'Ahmed_Neana_128kbps', name: 'أحمد نعينع' }, // Using Ahmed Neana as found on everyayah
  { id: 'ghamdi', audioApiId: 'Saad_Al-Ghamdi_128kbps', name: 'سعد الغامدي' },
  // Add more reciters here with their corresponding audioApiId
];

export default function AudioDownloadPage() {
  // State for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReciter, setSelectedReciter] = useState<ReciterMp3Info | null>(null);

  const handleOpenModal = (reciter: ReciterMp3Info) => {
    setSelectedReciter(reciter);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReciter(null);
  };

  // Function to generate the full Quran ZIP download URL from everyayah.com
  const generateZipUrl = (audioApiId: string): string => {
      // Example: https://everyayah.com/data/Mishary_Rashed_Alafasy_128kbps/Mishary_Rashed_Alafasy_128kbps.zip
      return `https://everyayah.com/data/${audioApiId}/${audioApiId}.zip`;
  };

  return (
    <div className="min-h-screen p-6 md:p-10 bg-pattern">
      <div className="max-w-6xl mx-auto fade-in"> {/* Increased max-width */}
        {/* Navigation back home */}
        <nav className="mb-8 flex justify-start">
           <Link
             href="/"
             className="flex items-center text-primary hover:text-accent transition-colors hover-lift font-medium text-sm"
             aria-label="العودة إلى فهرس السور"
           >
             <svg xmlns="http://www.w3.org/2000/svg" className="mr-1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
             العودة إلى الرئيسية
           </Link>
        </nav>

        {/* Updated Page Header and Introduction */}
        <header className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">القرآن الكريم بصيغة MP3</h1>
            <h2 className="text-xl md:text-2xl text-foreground/90 mb-4">
                استمع وحمّل القرآن الكريم بصوت أشهر قراء العالم الإسلامي.
            </h2>
            <p className="text-md md:text-lg leading-relaxed text-foreground/80 max-w-3xl mx-auto">
                يمكنكم الاستماع للتلاوات أو تحميلها بصيغة MP3، لكل سور القرآن الكريم، بصوت نخبة من القراء.
            </p>
        </header>

        {/* Reciters List/Grid - Adjusted grid for better alignment */}
        <main>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 auto-rows-fr"> {/* Use auto-rows-fr for equal height */}
                {recitersList.map((reciter) => {
                    const fullQuranZipUrl = generateZipUrl(reciter.audioApiId);
                    return (
                        <div key={reciter.id} className="quran-card p-5 flex flex-col text-center scale-in h-full"> {/* Added h-full */}
                            <div className="flex-grow"> {/* Wrapper to push buttons down */}
                                <h3 className="text-lg font-semibold text-primary mb-1">{reciter.name}</h3>
                                {reciter.description && (
                                    <p className="text-xs text-foreground/70 mb-4">{reciter.description}</p>
                                )}
                            </div>
                            <div className="mt-auto pt-4 border-t border-border-color flex flex-col gap-3">
                                {/* Button to open Surah Selection Modal */}
                                <button
                                    onClick={() => handleOpenModal(reciter)}
                                    className="button-outline text-sm px-4 py-2 flex items-center justify-center gap-1.5 w-full"
                                    aria-label={`استعراض سور القارئ ${reciter.name}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12c-2 0-4.5 1-6 3.5V6.5C7.5 5 10 4 12 4s4.5 1 6 2.5V15c-1.5-2.5-4-3.5-6-3.5zM6 18.5c1.5-2.5 4-3.5 6-3.5s4.5 1 6 3.5"/><path d="M12 4v15"/></svg>
                                    استماع / تحميل السور
                                </button>
                                 {/* Changed to <a> tag and enabled */}
                                <a
                                    href={fullQuranZipUrl}
                                    download
                                    target="_blank" // Optional: Open download link in new tab
                                    rel="noopener noreferrer"
                                    className="button text-sm px-4 py-2 flex items-center justify-center gap-1.5 w-full"
                                    aria-label={`تحميل المصحف كاملاً بصوت ${reciter.name}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                                    تحميل المصحف كاملاً (ZIP)
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>
        </main>

        {/* Render the Modal */}
        {selectedReciter && (
            <SurahSelectionModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                reciter={selectedReciter} // Pass the full reciter object including audioApiId
                surahList={surahList}
            />
        )}
      </div>
    </div>
  );
} 