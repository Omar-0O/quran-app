import { Suspense } from 'react';
import SearchPageClientContent from './SearchPageClientContent';

// Basic Loading Component for Suspense Fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen p-4 md:p-8 bg-pattern flex justify-center items-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="font-semibold text-primary">Loading search results...</p>
        </div>
      </div>
  );
}

// This remains the main page component, now acting as a Server Component wrapper
export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SearchPageClientContent />
    </Suspense>
  );
} 