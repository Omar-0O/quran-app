<<<<<<< HEAD
 // TafsirModel.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
=======
'use client';

import { useState, useEffect } from 'react';
>>>>>>> 109efb0 (Initial commit)

interface TafsirModalProps {
  isOpen: boolean;
  onClose: () => void;
  surahNumber: number;
  ayahNumber: number;
  tafsirEdition?: string; // Optional prop for flexibility, default to Muyassar
}

// Define Tafsir data structure
interface TafsirData {
  arabicAyah: string;
  tafsirText: string;
}

const DEFAULT_TAFSIR_EDITION = 'ar.muyassar'; // Tafsir Al-Muyassar

export default function TafsirModal({
  isOpen,
  onClose,
  surahNumber,
  ayahNumber,
  tafsirEdition = DEFAULT_TAFSIR_EDITION
}: TafsirModalProps) {
  const [tafsir, setTafsir] = useState<TafsirData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

<<<<<<< HEAD
  // Use useCallback to memoize the fetchTafsir function
  const fetchTafsir = useCallback(async () => {
=======
  useEffect(() => {
    if (isOpen) {
      fetchTafsir();
    }
    // Reset state when modal closes or ayah changes
    return () => {
       setTafsir(null);
       setError('');
       setLoading(false);
    }
  }, [isOpen, surahNumber, ayahNumber, tafsirEdition]);

  const fetchTafsir = async () => {
>>>>>>> 109efb0 (Initial commit)
    setLoading(true);
    setError('');
    setTafsir(null); // Clear previous tafsir

    try {
      // Fetch Ayah text and selected Tafsir edition together
      const response = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/editions/quran-uthmani,${tafsirEdition}`);
      const data = await response.json();

      if (data.code === 200 && data.data.length >= 2) {
        // Assuming data[0] is quran-uthmani and data[1] is the tafsir
        setTafsir({
          arabicAyah: data.data[0].text,
          tafsirText: data.data[1].text
        });
      } else {
        console.error("Unexpected API response structure:", data);
<<<<<<< HEAD
        throw new Error('فشل تحميل بيانات التفسير. استجابة غير متوقعة من الخادم.');
      }
    } catch (err: any) {
      console.error('Error fetching tafsir:', err);
      setError(err.message || 'تعذر تحميل التفسير في الوقت الحالي. يرجى المحاولة مرة أخرى لاحقاً.');
    } finally {
      setLoading(false);
    }
  }, [surahNumber, ayahNumber, tafsirEdition]);  // Add the dependencies here

  useEffect(() => {
    if (isOpen) {
      fetchTafsir();
    }
    // Reset state when modal closes or ayah changes
    return () => {
      setTafsir(null);
      setError('');
      setLoading(false);
    };
  }, [isOpen, fetchTafsir]); // Add fetchTafsir to the dependency array
=======
        throw new Error('فشل تحميل بيانات التفسير. استجابة غير متوقعة من الخادم.'); // Arabic error
      }
    } catch (err: any) { // Add type annotation for err
      console.error('Error fetching tafsir:', err);
      setError(err.message || 'تعذر تحميل التفسير في الوقت الحالي. يرجى المحاولة مرة أخرى لاحقاً.'); // Arabic error
    } finally {
      setLoading(false);
    }
  };
>>>>>>> 109efb0 (Initial commit)

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in"
      onClick={onClose} // Close modal on backdrop click
    >
      <div
        className="quran-card max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col scale-in shadow-xl border-primary/20"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the card
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-border-color flex justify-between items-center bg-primary/5 flex-shrink-0">
          <h2 className="text-lg font-semibold font-ui text-primary">
<<<<<<< HEAD
            تفسير الآية {ayahNumber.toLocaleString('ar-EG')} من سورة ( {surahNumber.toLocaleString('ar-EG')} )
=======
             تفسير الآية {ayahNumber.toLocaleString('ar-EG')} من سورة ( {surahNumber.toLocaleString('ar-EG')} ) {/* Dynamic title */}
>>>>>>> 109efb0 (Initial commit)
          </h2>
          <button
            onClick={onClose}
            className="icon-button w-8 h-8 text-foreground/70 hover:bg-accent hover:text-white"
<<<<<<< HEAD
            aria-label="إغلاق"
=======
            aria-label="إغلاق" // Arabic close label
>>>>>>> 109efb0 (Initial commit)
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="tafsir-modal-content flex-grow font-ui">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
<<<<<<< HEAD
              <span>جاري تحميل التفسير...</span>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">
              <p className="font-semibold mb-2">خطأ</p>
=======
              <span>جاري تحميل التفسير...</span>{/* Arabic loading */}
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">
              <p className="font-semibold mb-2">خطأ</p>{/* Arabic error */}
>>>>>>> 109efb0 (Initial commit)
              <p>{error}</p>
            </div>
          ) : tafsir ? (
            <div className="space-y-6">
              {/* Ayah Text */}
              <div className="p-4 bg-background rounded-md border border-border-color">
                <p className="font-quran text-center text-xl leading-relaxed">{tafsir.arabicAyah}</p>
              </div>
              {/* Tafsir Text */}
              <div>
                <h3 className="text-md font-semibold text-primary mb-2">التفسير الميسر:</h3>
                <p className="text-justify leading-relaxed text-md">{tafsir.tafsirText}</p>
              </div>
            </div>
          ) : (
<<<<<<< HEAD
            <div className="p-6 text-center text-foreground/70">
              <p>لا يوجد بيانات لعرضها.</p>
            </div>
          )}
=======
             <div className="p-6 text-center text-foreground/70">
               <p>لا يوجد بيانات لعرضها.</p> {/* Arabic no data */}
             </div>
           )}
>>>>>>> 109efb0 (Initial commit)
        </div>
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
} 
>>>>>>> 109efb0 (Initial commit)
