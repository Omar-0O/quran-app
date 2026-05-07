'use client'; // Can be a Server Component if no client interactivity is needed initially

import { useState } from "react"; // Import useState
import Link from "next/link";
import SurahSelectionModal from "../components/SurahSelectionModal"; // Import the modal component
import { surahList } from "../data/surahList"; // Import surah list data

// Define structure for reciter MP3 data
interface ReciterMp3Info {
  id: string; // Simple identifier for internal use (e.g., keys)
  serverUrl: string; // Identifier used in audio URLs (e.g., everyayah.com)
  name: string;
  description?: string; // Optional description (e.g., Riwayah)
}

// Updated list of reciters with actual audio API IDs
const recitersList: ReciterMp3Info[] = [
  { id: 'mishari', serverUrl: 'https://server8.mp3quran.net/afs', name: 'مشاري بن راشد العفاسي' },
  { id: 'husary', serverUrl: 'https://server13.mp3quran.net/husr', name: 'محمود خليل الحصري (مرتل)', description: 'رواية حفص عن عاصم' },
  { id: 'abdulbasit', serverUrl: 'https://server7.mp3quran.net/basit', name: 'عبد الباسط عبد الصمد (مرتل)' }, // Murattal version
  { id: 'basfar', serverUrl: 'https://server6.mp3quran.net/bsfr', name: 'عبد الله بصفر' },
  { id: 'balushi', serverUrl: 'https://server11.mp3quran.net/hazza', name: 'هزاع البلوشي' },
  { id: 'sudais', serverUrl: 'https://server11.mp3quran.net/sds', name: 'عبد الرحمن السديس' },
  { id: 'shuraim', serverUrl: 'https://server12.mp3quran.net/shoraimy', name: 'سعود الشريم' },
  { id: 'ajmi', serverUrl: 'https://server11.mp3quran.net/ahmad_nu', name: 'أحمد نعينع' }, // Using Ahmed Neana as found on everyayah
  { id: 'ghamdi', serverUrl: 'https://server6.mp3quran.net/ghamdi', name: 'سعد الغامدي' },
    { id: 'minshawi', serverUrl: 'https://server10.mp3quran.net/minsh', name: 'محمد صديق المنشاوي' },
  // Add more reciters here with their corresponding serverUrl
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
                reciter={selectedReciter} // Pass the full reciter object including serverUrl
                surahList={surahList}
            />
        )}
      </div>
    </div>
  );
} 