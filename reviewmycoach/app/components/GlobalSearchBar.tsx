'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '../lib/hooks/useDebounce';

interface GlobalSearchBarProps {
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
}

interface SearchSuggestion {
  type: 'coach' | 'sport' | 'location';
  text: string;
  subtitle?: string;
  href: string;
}

export default function GlobalSearchBar({ 
  placeholder = "Search coaches, sports, or locations...",
  className = "",
  showSuggestions = true 
}: GlobalSearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Handle search submission
  const handleSearch = (term: string = searchTerm) => {
    if (term.trim()) {
      const searchParams = new URLSearchParams({
        q: term.trim()
      });
      router.push(`/search?${searchParams.toString()}`);
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          router.push(suggestions[selectedIndex].href);
          setIsOpen(false);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Fetch search suggestions
  useEffect(() => {
    if (!showSuggestions || !debouncedSearchTerm.trim() || debouncedSearchTerm.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(debouncedSearchTerm)}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions || []);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedSearchTerm, showSuggestions]);

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'coach':
        return (
          <svg className="w-4 h-4 text-[var(--brand-red)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'sport':
        return (
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case 'location':
        return (
          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-5 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-red-200 focus:border-red-300 placeholder-gray-500 transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-md text-base"
          autoComplete="off"
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <svg className="animate-spin w-4 h-4 text-neutral-300" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>

      {/* Search Suggestions Dropdown */}
      {isOpen && showSuggestions && (searchTerm.length >= 2 || suggestions.length > 0) && (
        <div className="absolute z-50 w-full mt-2 border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
          {suggestions.length > 0 ? (
            <>
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${index}`}
                  onClick={() => {
                    router.push(suggestion.href);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-red-50 flex items-center space-x-3 transition-colors ${
                    index === selectedIndex ? 'bg-red-50 border-l-2 border-red-300' : ''
                  }`}
                >
                  {getSuggestionIcon(suggestion.type)}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {suggestion.text}
                    </div>
                    {suggestion.subtitle && (
                      <div className="text-xs text-gray-500 truncate">
                        {suggestion.subtitle}
                      </div>
                    )}
                  </div>
                </button>
              ))}
              {searchTerm.trim() && (
                <>
                  <div className="border-t border-gray-200"></div>
                  <button
                    onClick={() => handleSearch()}
                    className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center space-x-3 transition-colors text-gray-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="text-sm">Search for &quot;{searchTerm}&quot;</span>
                  </button>
                </>
              )}
            </>
          ) : searchTerm.length >= 2 ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              {loading ? 'Searching...' : 'No suggestions found'}
            </div>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500">
              Type at least 2 characters to search
            </div>
          )}
        </div>
      )}
    </div>
  );
} 