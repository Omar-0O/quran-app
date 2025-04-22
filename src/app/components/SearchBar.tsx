'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search the Quran..."
          className={`w-full p-4 pl-12 pr-20 rounded-full border border-border-color bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all ${
            focused ? 'shadow-md' : ''
          }`}
          aria-label="Search the Quran"
        />
        <div className={`absolute inset-y-0 left-0 flex items-center pl-4 transition-all ${
          focused ? 'text-primary' : 'text-foreground/60'
        }`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <button 
          type="submit" 
          className={`absolute inset-y-0 right-0 flex items-center pr-4 rounded-r-full px-4 text-white bg-primary hover:bg-primary-light transition-all ${
            query.trim() ? 'opacity-100' : 'opacity-80'
          } btn-pulse`}
          disabled={!query.trim()}
          aria-label="Submit search"
        >
          <span className="text-sm font-medium mr-1">Search</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </form>
      <div className="mt-2 flex flex-wrap gap-2 text-xs">
        <span className="text-foreground/60">Popular searches:</span>
        <button 
          onClick={() => {
            setQuery('mercy');
            router.push('/search?q=mercy');
          }}
          className="text-primary hover:text-accent transition-colors"
        >
          mercy
        </button>
        <button 
          onClick={() => {
            setQuery('guidance');
            router.push('/search?q=guidance');
          }}
          className="text-primary hover:text-accent transition-colors"
        >
          guidance
        </button>
        <button 
          onClick={() => {
            setQuery('forgiveness');
            router.push('/search?q=forgiveness');
          }}
          className="text-primary hover:text-accent transition-colors"
        >
          forgiveness
        </button>
        <button 
          onClick={() => {
            setQuery('paradise');
            router.push('/search?q=paradise');
          }}
          className="text-primary hover:text-accent transition-colors"
        >
          paradise
        </button>
      </div>
    </div>
  );
} 