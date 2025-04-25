 // this is tha surah page 
 // surah\[id]\page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { useParams, useSearchParams } from 'next/navigation';

// Interface for Surah data structure from API (الحفاظ على بنية البيانات الإنجليزية للتوافق مع الواجهة البرمجية)
interface SurahData {
  number: number;
  name: string; // الاسم العربي (جزء من بيانات الواجهة البرمجية)
  englishName: string; // الإبقاء على الاسم الإنجليزي إن لزم الأمر داخليًا أو للعرض الاختياري
  englishNameTranslation: string; // الإبقاء على ترجمة الاسم الإنجليزية إن لزم الأمر داخليًا أو للعرض الاختياري
  revelationType: string; // نوع النزول (Meccan/Medinan) - سيُترجم عند العرض
  numberOfAyahs: number;
  ayahs: Array<{
    number: number;
    numberInSurah: number;
    text: string; // نص الآية باللغة العربية
  }>;
}

// خيارات القراء مع معرفاتهم الرقمية من واجهة Quran.com API v4
interface Reciter {
  id: number;
  name: string; // أسماء القراء باللغة العربية
}

const RECITERS: Reciter[] = [
  { id: 2, name: 'محمود خليل الحصري' },
  { id: 7, name: 'مشاري بن راشد العفاسي' },
  { id: 1, name: 'عبد الباسط عبد الصمد (مرتل)' },
  { id: 6, name: 'عبد الله بصفر' },
  // { id: ???, name: 'هزاع البلوشي' }, // يجب البحث عن المعرف الخاص بهزاع البلوشي في Quran.com API
];

// دالة مساعدة لترجمة نوع النزول إلى العربية
const getArabicRevelationType = (type: string): string => {
  return type === 'Meccan' ? 'مكية' : 'مدنية';
};

export default function SurahPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const highlightedAyahParam = searchParams.get('ayah');
  const surahId = parseInt(params.id as string);

  const [surah, setSurah] = useState<SurahData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(''); // رسائل الخطأ ستكون بالعربية
  const [audioError, setAudioError] = useState(''); // رسائل الخطأ ستكون بالعربية

  // حالة اختيار القارئ، التشغيل، والتحميل
  const [selectedReciter, setSelectedReciter] = useState<Reciter>(RECITERS[0]);
  const [isSurahPlaying, setIsSurahPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);

  // مراجع للتمرير وتسليط الضوء
  const ayahRefs = useRef<{ [key: number]: HTMLSpanElement | null }>({});
  const surahContentRef = useRef<HTMLDivElement | null>(null);

  const prevSurah = surahId > 1 ? surahId - 1 : null;
  const nextSurah = surahId < 114 ? surahId + 1 : null;

  // --- المؤثرات الجانبية (Effects) ---

  // جلب بيانات نص السورة
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setFetchError('');
      setSurah(null);
      setIsSurahPlaying(false);
      setCurrentAudioUrl(null);
      setAudioError('');

      try {
        // استخدام واجهة alquran.cloud التي لا تحتاج لترجمة (النص العربي الأصلي)
        const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}`);
        const data = await response.json();
        if (data.code === 200 && data.data) {
          setSurah(data.data);
        } else {
          throw new Error('فشل تحميل بيانات السورة.'); // رسالة خطأ عربية
        }
      } catch (err: any) {
        console.error('خطأ في جلب بيانات السورة:', err);
        setFetchError(err.message || 'حدث خطأ غير متوقع أثناء تحميل السورة.'); // رسالة خطأ عربية
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [surahId]);

  // إعداد عنصر الصوت والمستمعين
  useEffect(() => {
    if (!audioRef.current) {
       audioRef.current = new Audio();
       audioRef.current.preload = 'none';
       audioRef.current.addEventListener('ended', handleFullSurahEnded);
       audioRef.current.addEventListener('error', handleAudioError);
       audioRef.current.addEventListener('canplay', handleAudioCanPlay);
       audioRef.current.addEventListener('waiting', handleAudioWaiting);
       audioRef.current.addEventListener('playing', handleAudioPlaying);
    }
    // Cleanup function
    return () => {
        const currentAudio = audioRef.current;
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.src = ''; // Important to prevent memory leaks
            // Remove listeners
            currentAudio.removeEventListener('ended', handleFullSurahEnded);
            currentAudio.removeEventListener('error', handleAudioError);
            currentAudio.removeEventListener('canplay', handleAudioCanPlay);
            currentAudio.removeEventListener('waiting', handleAudioWaiting);
            currentAudio.removeEventListener('playing', handleAudioPlaying);
             // Optional: explicitly set ref to null after cleanup might help garbage collection in some scenarios
             // audioRef.current = null;
        }
    };
  }, []); // Run only once on mount


  // جلب رابط صوت السورة كاملاً
   useEffect(() => {
    if (!surahId || !selectedReciter) return;

    const fetchUrl = async () => {
        setIsAudioLoading(true);
        setAudioError('');
        setCurrentAudioUrl(null);
        // Don't reset src here immediately, do it when toggling play or changing reciter
        // if (audioRef.current) audioRef.current.src = '';
        setIsSurahPlaying(false); // Stop playing if reciter changes

        try {
            const response = await fetch(`https://api.quran.com/api/v4/chapter_recitations/${selectedReciter.id}/${surahId}`);
            if (!response.ok) {
                 // Throw Arabic error
                throw new Error(`فشل في جلب ملف الصوت (خطأ ${response.status})`);
            }
            const data = await response.json();
            if (data.audio_file && data.audio_file.audio_url) {
                setCurrentAudioUrl(data.audio_file.audio_url);
                 // Preload the audio if the element exists, but don't play yet
                 if (audioRef.current) {
                   // Only update src if it's different to avoid unnecessary reloads
                   if (audioRef.current.src !== data.audio_file.audio_url) {
                       audioRef.current.src = data.audio_file.audio_url;
                       audioRef.current.load(); // Initiate loading
                   }
                 }
            } else {
                // Throw Arabic error
                throw new Error('لم يتم العثور على الملف الصوتي في الاستجابة.');
            }
        } catch (err: any) {
            console.error("خطأ في جلب رابط صوت السورة:", err);
             // Set Arabic error
            setAudioError(err.message || 'خطأ في تحميل رابط الصوت.');
        } finally {
             setIsAudioLoading(false);
        }
    };

    fetchUrl();

   }, [surahId, selectedReciter]); // Dependencies

  // التمرير إلى الآية المسلط عليها الضوء
  useEffect(() => {
    if (highlightedAyahParam && !loading && surah && ayahRefs.current) {
      const ayahNumber = parseInt(highlightedAyahParam);
      const ayahElement = ayahRefs.current[ayahNumber];
      if (ayahElement && surahContentRef.current) {
         setTimeout(() => {
          const container = surahContentRef.current!;
          const containerRect = container.getBoundingClientRect();
          const elementRect = ayahElement.getBoundingClientRect();
          // تعديل حساب التمرير ليتناسب مع RTL (العناصر تكون أعلى في DOM لكن ظاهريًا أسفل أو العكس، لكن المنطق نفسه يعمل غالبًا)
          const scrollPosition = container.scrollTop + (elementRect.top - containerRect.top) - (containerRect.height / 3);
          container.scrollTo({ top: scrollPosition, behavior: 'smooth' });
          ayahElement.classList.add('ayah-highlight'); // يمكن تعديل اسم الكلاس ليكون أوضح
          // إزالة التظليل بعد فترة
          setTimeout(() => {
             if (ayahElement) { ayahElement.classList.remove('ayah-highlight'); }
           }, 3000); // 3 ثواني
        }, 300); // تأخير بسيط للتأكد من عرض كل العناصر
      }
    }
  }, [highlightedAyahParam, loading, surah]); // Dependencies

  // --- معالجات الصوت ---

  const handleFullSurahEnded = () => setIsSurahPlaying(false);
  const handleAudioCanPlay = () => setIsAudioLoading(false); // الصوت جاهز للتشغيل
  const handleAudioWaiting = () => setIsAudioLoading(true);  // انتظار تحميل المزيد من البيانات
  const handleAudioPlaying = () => setIsAudioLoading(false); // بدأ التشغيل فعلاً
  const handleAudioError = (e: Event) => {
    console.error("خطأ في عنصر الصوت:", e);
    const audioErr = audioRef.current?.error;
    let message = 'عذرًا، لم نتمكن من تحميل الصوت في الوقت الحالي. يرجى المحاولة مرة أخرى لاحقًا.'; // رسالة افتراضية بالعربية
    if (audioErr) {
      // Attempt to provide a more specific message if available (error messages might still be in English from the browser)
      message = `خطأ في الصوت: ${audioErr.message || 'رمز غير معروف'} (الرمز ${audioErr.code})`;
    }
    setAudioError(message);
    setIsAudioLoading(false);
    setIsSurahPlaying(false);
  };

  const handleToggleFullSurahPlay = async () => {
    if (!audioRef.current) return;
    setAudioError(''); // مسح الأخطاء السابقة عند محاولة التشغيل

    if (isSurahPlaying) {
      audioRef.current.pause();
      setIsSurahPlaying(false);
    } else {
      if (!currentAudioUrl) {
          // رسالة خطأ عربية
          setAudioError('رابط الصوت غير متوفر. يرجى الانتظار أو اختيار قارئ آخر.');
          return;
      }
      setIsAudioLoading(true);
      try {
          // التأكد من أن المصدر هو الصحيح قبل التشغيل
          if(audioRef.current.src !== currentAudioUrl) {
              audioRef.current.src = currentAudioUrl;
              audioRef.current.load(); // قد تحتاج استدعاء load إذا غيرت المصدر
          }
          await audioRef.current.play();
          setIsSurahPlaying(true);
      } catch (err) {
          console.error("خطأ في تشغيل الصوت:", err);
          // رسالة خطأ عربية
          setAudioError('لم يتمكن المتصفح من تشغيل الملف الصوتي.');
          setIsAudioLoading(false);
          setIsSurahPlaying(false);
      }
    }
  };

  const handleReciterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const reciterId = parseInt(event.target.value, 10);
    const newReciter = RECITERS.find(r => r.id === reciterId);
    if (newReciter) {
      // إيقاف التشغيل عند تغيير القارئ
      if (isSurahPlaying && audioRef.current) {
          audioRef.current.pause();
      }
      setIsSurahPlaying(false); // Reset play state
      setSelectedReciter(newReciter);
      // الرابط سيتم تحديثه تلقائيًا بواسطة useEffect [surahId, selectedReciter]
    }
  };

   // دالة لربط مرجع الآية
   const setAyahRef = (ayahNumber: number) => (el: HTMLSpanElement | null) => {
    ayahRefs.current[ayahNumber] = el;
  };

  // --- منطق العرض (Render Logic) ---

  // حالة التحميل
  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex justify-center items-center bg-pattern" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="font-semibold">جارٍ تحميل السورة...</p> {/* رسالة تحميل عربية */}
        </div>
      </div>
    );
  }

  // حالة الخطأ
  if (fetchError || !surah) {
    return (
      <div className="min-h-screen p-4 md:p-8 bg-pattern flex items-center justify-center" dir="rtl">
        <div className="quran-card p-8 text-center fade-in max-w-md">
          <h1 className="text-xl font-bold mb-4 text-red-600">خطأ</h1> {/* عنوان خطأ عربي */}
          <p className="mb-6">{fetchError || 'حدث خطأ غير متوقع.'}</p> {/* رسالة خطأ عربية */}
          <Link href="/" className="button">
            العودة إلى الفهرس
          </Link>
        </div>
      </div>
    );
  }

   const currentDownloadUrl = currentAudioUrl ?? '#'; // رابط التحميل الحالي أو # إذا غير متوفر

  // العرض الرئيسي للسورة - استخدام dir="rtl" هنا
  return (
    <div className="min-h-screen p-4 md:p-8 bg-pattern" dir="rtl">
      <div className="max-w-5xl mx-auto fade-in">

        {/* شريط التنقل العلوي - تعديل الترتيب والمسافات لـ RTL */}
        <nav className="mb-8 flex justify-between items-center text-sm">
           {/* رابط السورة السابقة (يكون على اليمين في RTL) */}
           {prevSurah ? (
             <Link
               href={`/surah/${prevSurah}`}
               className="flex items-center text-primary hover:text-accent transition-colors hover-lift"
               aria-label="الانتقال إلى السورة السابقة"
             >
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg> {/* سهم يشير إلى اليمين */}
               <span className="me-1 font-medium">السورة السابقة</span>
             </Link>
            ) : <div aria-hidden="true"></div>}{/* عنصر نائب للمحافظة على التنسيق */}

           {/* رابط الفهرس */}
           <Link
             href="/"
             className="flex items-center text-primary hover:text-accent transition-colors hover-lift font-medium"
             aria-label="العودة إلى الفهرس"
           >
             <svg xmlns="http://www.w3.org/2000/svg" className="me-1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
             الفهرس
           </Link>

            {/* رابط السورة التالية (يكون على اليسار في RTL) */}
           {nextSurah ? (
             <Link
               href={`/surah/${nextSurah}`}
               className="flex items-center text-primary hover:text-accent transition-colors hover-lift"
               aria-label="الانتقال إلى السورة التالية"
             >
               <span className="ms-1 font-medium">السورة التالية</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg> {/* سهم يشير إلى اليسار */}
             </Link>
           ) : <div aria-hidden="true"></div>}{/* عنصر نائب */}
        </nav>

        {/* بطاقة عنوان السورة */}
        <header className="mb-8 quran-card p-6 scale-in">
           <div className="text-center mb-4">
             {/* عرض اسم السورة العربي فقط */}
             <h1 className="text-3xl font-bold font-quran text-primary mb-1">سورة {surah.name}</h1>
             {/* <p className="text-lg font-medium text-foreground/90 mb-2">{surah.englishName} ({surah.englishNameTranslation})</p> */} {/* إزالة الاسم الإنجليزي والترجمة */}
             <div className="text-sm text-foreground/70 flex items-center justify-center gap-4">
               {/* عرض عدد الآيات بالعربية */}
               <span>{surah.numberOfAyahs.toLocaleString('ar-EG')} آيات</span>
               <span className="flex items-center">
                 <span className={`revelation-indicator ms-1 ${surah.revelationType === 'Meccan' ? 'revelation-meccan' : 'revelation-medinan'}`} title={getArabicRevelationType(surah.revelationType)}></span>
                 {getArabicRevelationType(surah.revelationType)} {/* عرض نوع النزول بالعربية */}
               </span>
             </div>
           </div>

           {/* منطقة التحكم */}
           <div className="mt-4 pt-4 border-t border-border-color flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
              {/* اختيار القارئ */}
              <div className="flex items-center gap-2">
                  <label htmlFor="reciter-select" className="text-sm font-medium">القارئ:</label> {/* تسمية عربية */}
                  <select
                      id="reciter-select"
                    value={selectedReciter.id}
                    onChange={handleReciterChange}
                      className="p-2 border border-border-color rounded-md bg-background text-sm font-ui focus:outline-none focus:ring-1 focus:ring-primary min-w-[180px]"
                    aria-label="اختر القارئ" // وصف ARIA عربي
                  >
                      {RECITERS.map(reciter => (
                          <option key={reciter.id} value={reciter.id}>{reciter.name}</option> // أسماء القراء بالعربية
                      ))}
                  </select>
              </div>

                 {/* زر التشغيل/الإيقاف المؤقت */}
                 <button
                     onClick={handleToggleFullSurahPlay}
                   className={`button ${isSurahPlaying ? 'bg-accent' : 'bg-primary'} flex items-center gap-2 min-w-[100px] justify-center transition-colors duration-200`}
                   aria-label={isSurahPlaying ? 'إيقاف مؤقت للتلاوة' : 'تشغيل التلاوة'} // وصف ARIA عربي
                  disabled={!currentAudioUrl || isAudioLoading} // تعطيل الزر عند عدم توفر الرابط أو أثناء التحميل
                 >
                     {/* أيقونة التحميل أو التشغيل/الإيقاف */}
                     {isAudioLoading ? (
                       <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     ) : isSurahPlaying ? (
                       <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> // أيقونة إيقاف مؤقت
                     ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> // أيقونة تشغيل
                     )}
                    <span className="font-medium text-sm">{isAudioLoading ? 'تحميل...' : (isSurahPlaying ? 'إيقاف مؤقت' : 'تشغيل')}</span> {/* نص الزر بالعربية */}
                 </button>

                 {/* زر التحميل */}
                 <a
                  href={currentDownloadUrl}
                  download // السمة التي تجعل الرابط للتحميل
                  onClick={(e) => { if (!currentAudioUrl || audioError) e.preventDefault(); }} // منع النقر إذا لا يوجد رابط أو يوجد خطأ
                  className={`button-outline flex items-center gap-2 min-w-[100px] justify-center transition-opacity duration-200 ${!currentAudioUrl || audioError ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-light hover:text-white'}`}
                  aria-disabled={!currentAudioUrl || !!audioError} // للإشارة إلى إمكانية الوصول
                  aria-label={`تحميل صوت السورة بصوت ${selectedReciter.name}`} // وصف ARIA عربي وديناميكي
                  target="_blank" // لفتح الرابط في تبويب جديد (يفضل للتحميلات)
                  rel="noopener noreferrer" // لأسباب أمنية عند استخدام target="_blank"
                 >
                   {/* أيقونة تحميل */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/></svg>
                   <span className="font-medium text-sm">تحميل</span> {/* نص زر التحميل بالعربية */}
               </a>

         </div>
           {/* عرض أخطاء الصوت */}
           {audioError && (
               <p className="text-center text-red-600 text-sm mt-3 px-3 py-2 bg-red-100 border border-red-300 rounded-md" role="alert">
                   {audioError} {/* عرض رسالة الخطأ العربية */}
                </p>
           )}
        </header>

        {/* المحتوى الرئيسي: آيات السورة */}
        <main
           ref={surahContentRef} // للحفاظ على إمكانية التمرير البرمجي
           className="quran-card p-6 md:p-10 lg:p-12 font-quran text-center leading-relaxed bg-white shadow-lg max-h-[75vh] overflow-y-auto scroll-smooth text-2xl md:text-3xl"
           style={{lineHeight: '2.9'}} // الحفاظ على ارتفاع السطر المناسب للقرآن
           aria-label={`نص سورة ${surah.name}`} // وصف ARIA عربي
         >
           {/* عرض البسملة (إذا لم تكن السورة الفاتحة أو التوبة) */}
           {surah.number !== 1 && surah.number !== 9 && (
             <p className="bismillah text-primary font-bold py-4 text-center">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</p>
           )}

          {/* عرض الآيات */}
          {surah.ayahs && surah.ayahs.map((ayah) => {
            // التعامل مع البسملة في بداية بعض الآيات (مثل أول آية في سور غير الفاتحة والتوبة)
            let ayahTextToRender = ayah.text;
            const bismillahPrefix = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";

            // إزالة البسملة من بداية الآية الأولى في السور (عدا الفاتحة) لأننا نعرضها منفصلة أعلاه
            // لا نزيلها من أي آية أخرى قد تبدأ بها (غير شائع)
            if (surah.number !== 1 && ayah.numberInSurah === 1 && ayahTextToRender.startsWith(bismillahPrefix)) {
                ayahTextToRender = ayahTextToRender.substring(bismillahPrefix.length).trimStart();
            }

            return (
              <span key={ayah.number} id={`ayah-${ayah.numberInSurah}`} className={`ayah-text-segment`}>
                {/* نص الآية */}
                <span ref={setAyahRef(ayah.numberInSurah)} className="inline">
                  {ayahTextToRender}
                </span>
                {/* زخرفة رقم الآية */}
                <span className="verse-number-decorator font-sans select-none" aria-hidden="true">
                   ﴿{ayah.numberInSurah.toLocaleString('ar-EG')}﴾
                </span>
                {/* فاصل غير مرئي بين الآيات لتحسين التدفق والنسخ */}
                 {' '}‌
              </span>
            );
          })}
        </main>

        {/* شريط التنقل السفلي - تعديل الترتيب لـ RTL */}
         <footer className="mt-8 flex justify-between items-center text-sm">
            {/* رابط السورة السابقة (يمين) */}
           {prevSurah ? (
             <Link href={`/surah/${prevSurah}`} className="flex items-center text-primary hover:text-accent transition-colors hover-lift" aria-label="السورة السابقة">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg> {/* سهم يمين */}
               <span className="me-1 font-medium">السورة السابقة</span>
             </Link>
            ) : <div aria-hidden="true"></div>}

           {/* رابط الفهرس (وسط) */}
           <Link href="/" className="flex items-center text-primary hover:text-accent transition-colors hover-lift font-medium" aria-label="الفهرس">
             الفهرس
           </Link>

            {/* رابط السورة التالية (يسار) */}
           {nextSurah ? (
             <Link href={`/surah/${nextSurah}`} className="flex items-center text-primary hover:text-accent transition-colors hover-lift" aria-label="السورة التالية">
               <span className="ms-1 font-medium">السورة التالية</span>
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg> {/* سهم يسار */}
             </Link>
           ) : <div aria-hidden="true"></div>}
       </footer>

      </div>
    </div>
  );
}