import Link from 'next/link';

// Define the expected Surah shape directly
interface SurahInfo {
  number: number;
  name: string; // Arabic name
  revelationType: string; // 'Meccan' or 'Medinan'
  numberOfAyahs: number;
}

interface SurahCardProps {
  surah: SurahInfo;
  index: number;
}

export default function SurahCard({ surah, index }: SurahCardProps) {
  const revelationClass = surah.revelationType === 'Meccan' ? 'revelation-meccan' : 'revelation-medinan';

  return (
    <Link
      href={`/surah/${surah.number}`}
      className="quran-card block hover-lift slide-in group h-full" // Added h-full for consistent grid height
      style={{ animationDelay: `${index * 20}ms` }} // Adjusted delay slightly
      aria-label={`الانتقال إلى سورة ${surah.name}`}
    >
      <div className="flex flex-col justify-between items-center text-center p-4 h-full">
        {/* Top section: Surah number and Revelation type dot */}
        <div className="w-full flex justify-between items-center mb-3">
            <span className={`revelation-indicator ${revelationClass}`} title={surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}></span>
            <span className="text-sm font-medium text-primary">{surah.number.toLocaleString('ar-EG')}</span>
        </div>

        {/* Middle section: Surah Name (main focus) */}
        <div className="flex-grow flex items-center justify-center my-2">
             <h2 className="text-xl font-semibold font-quran text-primary group-hover:text-accent transition-colors duration-200">
                {surah.name}
             </h2>
        </div>

        {/* Bottom section: Ayah count */}
        <div className="mt-auto pt-2 w-full">
            <p className="text-xs text-foreground/70">
                {surah.numberOfAyahs.toLocaleString('ar-EG')} آيات
            </p>
        </div>
      </div>
    </Link>
  );
} 