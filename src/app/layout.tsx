import type { Metadata } from "next";
import { Amiri, Noto_Sans_Arabic } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const amiri = Amiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-amiri',
});

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600'],
  variable: '--font-noto-sans-arabic',
});

export const metadata: Metadata = {
  title: "القرآن الكريم",
  description: "تصفح واستمع إلى القرآن الكريم",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${amiri.variable} ${notoSansArabic.variable} antialiased bg-pattern flex flex-col min-h-screen`}
      >
        <div className="flex-grow">
            {children}
        </div>

        <footer className="text-center mt-16 mb-8 px-6 text-sm text-foreground/70 fade-in w-full flex-shrink-0">
          <p className="mb-3">تطبيق القرآن الكريم</p>
          <div className="flex justify-center items-center gap-x-4 gap-y-2 flex-wrap">
            <Link 
               href="/about"
               className="text-accent hover:text-primary transition-colors"
               aria-label="الانتقال إلى صفحة عن المبرمج"
             >
              عن المبرمج
            </Link>
            <span className="text-foreground/40" aria-hidden="true">|</span>
            <Link 
               href="/audio" 
               className="text-accent hover:text-primary transition-colors"
               aria-label="الانتقال إلى صفحة الاستماع والتحميل"
             >
               استماع وتحميل MP3
             </Link>
           </div>
        </footer>
      </body>
    </html>
  );
}
