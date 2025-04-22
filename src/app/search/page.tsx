'use client';

import { useState, useEffect } from 'react';
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

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (query) {
      searchQuran(query);
    }
  }, [query]);

  const searchQuran = async (searchQuery: string) => {
    setLoading(true);
    setError('');
    setResults([]);

    try {
      // First, get all surahs for mapping names
      const surahsResponse = await fetch('https://api.alquran.cloud/v1/surah');
      const surahsData = await surahsResponse.json();
      const surahs = surahsData.data;

      // Search English translation for matches
      const englishResponse = await fetch('https://api.alquran.cloud/v1/search/' + encodeURIComponent(searchQuery) + '/all/en.sahih');
      const englishData = await englishResponse.json();

      if (englishData.code === 200 && englishData.data.matches.length > 0) {
        // Map results to include Arabic text
        const searchResults = await Promise.all(
          englishData.data.matches.map(async (match: any) => {
            // Get the Arabic text for this verse
            const ayahResponse = await fetch(`https://api.alquran.cloud/v1/ayah/${match.surah}:${match.ayah}`);
            const ayahData = await ayahResponse.json();
            
            // Find surah name
            const surahInfo = surahs.find((s: any) => s.number === match.surah);
            
            return {
              surah: match.surah,
              ayah: match.ayah,
              surahName: surahInfo ? surahInfo.englishName : `Surah ${match.surah}`,
              text: ayahData.data.text,
              translation: match.text,
            };
          })
        );
        
        setResults(searchResults);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error('Error searching Quran:', err);
      setError('Could not complete the search at this time. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

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