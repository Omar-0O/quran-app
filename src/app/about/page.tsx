'use client'; // Mark as client component if needed for future interactivity, otherwise can be server component

import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen p-6 md:p-10 bg-pattern">
      <div className="max-w-3xl mx-auto fade-in">
        {/* Navigation back home */}
        <nav className="mb-8 flex justify-start">
           <Link
             href="/"
             className="flex items-center text-primary hover:text-accent transition-colors hover-lift font-medium text-sm"
             aria-label="العودة إلى فهرس السور"
           >
             <svg xmlns="http://www.w3.org/2000/svg" className="mr-1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
             العودة إلى الرئيسية
           </Link>
        </nav>

        {/* Main Content Card */}
        <main className="quran-card p-8 md:p-10 text-center shadow-lg">
          <header className="mb-8">
            <h1 className="text-2xl md:text-3xl font-semibold text-primary mb-4">عن المبرمج</h1>
             {/* Developer Name */}
             <h2 className="text-xl md:text-2xl font-medium text-foreground">عمر محمد احمد السيد</h2>
          </header>

          {/* Motivation Paragraph */}
          <p className="text-md md:text-lg leading-relaxed text-foreground/90 mb-6">
              تم بناء هذا المشروع بحب واحترام للقرآن الكريم. أعداد اخوكم العبد الفقير الى الله .
          </p>

          {/* Open Source Notice */}
          <p className="text-md md:text-lg font-semibold text-primary mb-8">
              هذا المشروع مفتوح المصدر ومتاح للجميع مجانًا.
          </p>

          {/* Placeholder for Portfolio/GitHub Link */}
          <div className="mt-6 pt-6 border-t border-border-color">
              
          </div>
        </main>
      </div>
    </div>
  );
} 