'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import SearchBar from '../components/SearchBar';

interface SearchResultItem {
  surah: number;
  ayah: number;
  surahName: string;
  text: string;
  translation: string;
}

// Interface for Surah data from /surah endpoint
interface ApiSurahInfo {
  number: number;
  name: string; // Arabic name
  englishName: string;
  // Add other fields if needed
}

// Interface for search match data from /search endpoint
interface ApiSearchMatch {
  surah: number;
  ayah: number;
  text: string; // This is the translation text in the search API
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchQuran = useCallback(async (searchQuery: string) => {
    if (!searchQuery) return; // Don't search if query is empty
    setLoading(true);
    setError('');
    setResults([]);

    try {
      const quranCloudBaseUrl = process.env.NEXT_PUBLIC_QURAN_CLOUD_API_URL || 'https://api.alquran.cloud/v1';

      // 1. Fetch all Surah names
      let surahMap: { [key: number]: string } = {};
      try {
        const surahsResponse = await fetch(`${quranCloudBaseUrl}/surah`);
        const surahsData = await surahsResponse.json();
        if (surahsData.code === 200 && surahsData.data) {
          surahMap = surahsData.data.reduce((acc: { [key: number]: string }, surah: ApiSurahInfo) => {
            acc[surah.number] = surah.englishName; // Using English name from API
            return acc;
          }, {});
        }
      } catch (err) {
        console.error('Error fetching surahs:', err);
        // Non-critical error, continue search without names if fetch fails
      }

      // 2. Fetch English search results
      let initialSearchResults: { surah: number; ayah: number; translation: string }[] = [];
      try {
        const englishResponse = await fetch(`${quranCloudBaseUrl}/search/${encodeURIComponent(searchQuery)}/all/en.sahih`);
        const englishData = await englishResponse.json();
        if (englishData.code === 200 && englishData.data && englishData.data.matches) {
          initialSearchResults = englishData.data.matches.map((match: ApiSearchMatch) => ({
            surah: match.surah,
            ayah: match.ayah,
            translation: match.text,
          }));
        }
      } catch (err) {
        console.error('Error fetching search results:', err);
        // Set error and stop if primary search fails
        setError('Failed to fetch search results.');
        setLoading(false);
        return;
      }

      // 3. Fetch Arabic text for each matching Ayah
      const resultsWithArabicPromises = initialSearchResults.map(async (match) => {
        try {
          const ayahResponse = await fetch(`${quranCloudBaseUrl}/ayah/${match.surah}:${match.ayah}`);
          const ayahData = await ayahResponse.json();
          if (ayahData.code === 200 && ayahData.data && ayahData.data.text) {
            return {
              surah: match.surah,
              ayah: match.ayah,
              surahName: surahMap[match.surah] || `Surah ${match.surah}`, // Use fetched name or default
              text: ayahData.data.text, // Arabic text
              translation: match.translation,
            };
          }
          return undefined; // Return undefined if fetch fails for this ayah
        } catch (err) {
          console.error(`Error fetching Arabic text for ${match.surah}:${match.ayah}:`, err);
          return undefined; // Return undefined on error
        }
      });

      const resolvedResults = await Promise.all(resultsWithArabicPromises);
      // Filter out undefined results before setting state
      const finalResults = resolvedResults.filter((result): result is SearchResultItem => result !== undefined);

      setResults(finalResults);
    } catch (err) {
      console.error('Error searching Quran:', err);
      setError('An unexpected error occurred during the search.');
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array for useCallback as it doesn't depend on component state/props

  useEffect(() => {
    if (query) {
      searchQuran(query);
    }
  }, [query, searchQuran]); // Add searchQuran to dependencies

  // Function to highlight the search term in the text
  const highlightText = (text: string, term: string) => {
    if (!term.trim()) return text;
    
    // Case insensitive search
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<span class="bg-accent/30 text-foreground px-1 rounded">$1</span>');
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-pattern">
      <div className="max-w-4xl mx-auto fade-in">
        <header className="mb-8">
          <Link 
            href="/" 
            className="flex items-center text-primary hover:text-primary-light transition-colors mb-6 hover-lift"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span className="ml-2 font-medium">Back to Home</span>
          </Link>
          
          <div className="quran-card p-6 mb-8 scale-in">
            <SearchBar />
          </div>
          
          <div className="mt-4">
            <h1 className="text-2xl font-bold surah-title mb-2">Search Results: &quot;{query}&quot;</h1>
            {loading ? (
              <p className="text-foreground/70">Searching the Quran...</p>
            ) : (
              <p className="text-foreground/70">
                {results.length > 0 
                  ? `Found ${results.length} match${results.length === 1 ? '' : 'es'}`
                  : query && !error ? 'No matches found' : ''}
              </p>
            )}
          </div>
        </header>
        
        <main>
          {loading ? (
            <div className="flex flex-col justify-center items-center my-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-primary">Searching through the Holy Quran...</p>
            </div>
          ) : error ? (
            <div className="quran-card p-6 text-center text-red-500">
              <p>{error}</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-6">
              {results.map((result, index) => (
                <Link 
                  key={index} 
                  href={`/surah/${result.surah}?ayah=${result.ayah}`}
                  className="quran-card p-6 block hover:shadow-md transition-shadow hover-lift slide-in"
                  style={{animationDelay: `${index * 0.05}s`}}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <div className="surah-number mr-3">
                        {result.surah}:{result.ayah}
                      </div>
                      <h2 className="font-semibold surah-title">{result.surahName}</h2>
                    </div>
                    <div className="action-button">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </div>
                  </div>
                  
                  <p className="font-arabic text-right mb-4">{result.text}</p>
                  
                  <p 
                    className="text-foreground/80 border-t border-border-color pt-3"
                    dangerouslySetInnerHTML={{ 
                      __html: highlightText(result.translation, query) 
                    }}
                  />
                </Link>
              ))}
            </div>
          ) : query && (
            <div className="quran-card p-8 text-center scale-in">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-primary/50 mx-auto mb-4">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="11" y1="8" x2="11" y2="14"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
              <p className="text-lg mb-2 font-medium">No verses found for &quot;{query}&quot;</p>
              <p className="text-foreground/70">Try a different search term or check your spelling.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
} 