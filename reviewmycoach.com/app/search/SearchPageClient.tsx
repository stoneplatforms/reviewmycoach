'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useDebounce } from '../lib/hooks/useDebounce';
import { useAuth } from '../lib/hooks/useAuth';
import CoachCard from '../components/CoachCard';
import SearchFilters from '../components/SearchFilters';
import Pagination from '../components/Pagination';
import GlobalSearchBar from '../components/GlobalSearchBar';

interface Coach {
  id: string;
  userId: string;
  displayName: string;
  bio: string;
  sports: string[];
  experience: number;
  certifications: string[];
  hourlyRate: number;
  location: string;
  gender?: string;
  organization?: string;
  availability: string[];
  specialties: string[];
  languages: string[];
  averageRating: number;
  totalReviews: number;
  profileImage?: string;
  isVerified: boolean;
}

interface SearchFilters {
  sport: string;
  location: string;
  gender: string;
  organization: string;
  role: string;
  ageGroup: string;
  minRating: string;
  maxRate: string;
  isVerified: string;
  sortBy: string;
  sortOrder: string;
}

interface SearchResponse {
  coaches: Coach[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
  error?: string;
  fallback?: boolean;
}

const ITEMS_PER_PAGE = 12;

export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  // Search state
  const [searchTerm, setSearchTerm] = useState(searchParams?.get('q') || '');
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    sport: searchParams?.get('sport') || '',
    location: searchParams?.get('location') || '',
    gender: searchParams?.get('gender') || '',
    organization: searchParams?.get('organization') || '',
    role: searchParams?.get('role') || '',
    ageGroup: searchParams?.get('ageGroup') || '',
    minRating: searchParams?.get('minRating') || '',
    maxRate: searchParams?.get('maxRate') || '',
    isVerified: searchParams?.get('isVerified') || '',
    sortBy: searchParams?.get('sortBy') || 'averageRating',
    sortOrder: searchParams?.get('sortOrder') || 'desc',
  });

  // Results state
  const [results, setResults] = useState<SearchResponse>({
    coaches: [],
    total: 0,
    page: 1,
    totalPages: 0,
    hasMore: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Current page
  const currentPage = parseInt(searchParams?.get('page') || '1', 10);

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Update URL with current search parameters
  const updateURL = useCallback((newParams: Partial<SearchFilters & { q?: string; page?: number }>) => {
    const params = new URLSearchParams();
    
    // Add search term
    if (newParams.q !== undefined) {
      if (newParams.q.trim()) params.set('q', newParams.q.trim());
    } else if (debouncedSearchTerm.trim()) {
      params.set('q', debouncedSearchTerm.trim());
    }

    // Add filters
    const currentFilters = { ...filters, ...newParams };
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value && key !== 'q' && key !== 'page') {
        params.set(key, String(value));
      }
    });

    // Add page
    const page = newParams.page || currentPage;
    if (page > 1) {
      params.set('page', page.toString());
    }

    // Update URL
    const newURL = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.push(newURL);
  }, [filters, debouncedSearchTerm, currentPage, pathname, router]);

  // Fetch search results
  const fetchResults = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      // Add search term
      if (debouncedSearchTerm.trim()) {
        params.set('search', debouncedSearchTerm.trim());
      }

      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        }
      });

      // Add pagination
      params.set('page', page.toString());
      params.set('limit', ITEMS_PER_PAGE.toString());

      const response = await fetch(`/api/search/coaches?${params.toString()}`);
      
      const data: SearchResponse = await response.json();
      
      // Handle fallback case when Firebase isn't initialized
      if (data.fallback) {
        console.warn('Search service temporarily unavailable, showing fallback response');
        setError('Search service is temporarily unavailable. Please try again later.');
        setResults({ coaches: [], total: 0, page: 1, totalPages: 0, hasMore: false });
        return;
      }
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch search results');
      }

      setResults(data);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Failed to search coaches');
      setResults({ coaches: [], total: 0, page: 1, totalPages: 0, hasMore: false });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, filters]);

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateURL({ ...newFilters, page: 1 });
  };

  // Handle search term change (for future use)
  // const handleSearchChange = (term: string) => {
  //   setSearchTerm(term);
  // };

  // Handle page change
  const handlePageChange = (page: number) => {
    updateURL({ page });
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Clear all filters
  const handleClearFilters = () => {
    const clearedFilters: SearchFilters = {
      sport: '',
      location: '',
      gender: '',
      organization: '',
      role: '',
      ageGroup: '',
      minRating: '',
      maxRate: '',
      isVerified: '',
      sortBy: 'averageRating',
      sortOrder: 'desc',
    };
    setFilters(clearedFilters);
    setSearchTerm('');
    updateURL({ q: '', ...clearedFilters, page: 1 });
  };

  // Effect to fetch results when search parameters change
  useEffect(() => {
    fetchResults(currentPage);
  }, [fetchResults, currentPage]);

  // Effect to update search term from URL
  useEffect(() => {
    const urlSearchTerm = searchParams?.get('q') || '';
    if (urlSearchTerm !== searchTerm) {
      setSearchTerm(urlSearchTerm);
    }
  }, [searchParams, searchTerm]);

  // Check if any filters are active
  const hasActiveFilters = Boolean(
    Object.values(filters).some(value => 
      value && value !== 'averageRating' && value !== 'desc'
    ) || debouncedSearchTerm.trim()
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white">
      {/* Page Header */}
      <div className="mb-8 border-b border-gray-200 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight mb-2">Search coaches</h1>
            <p className="text-gray-600">Filter by sport, location, verification, and more</p>
          </div>
          {user && (
            <div className="mt-6 sm:mt-0">
              <button
                onClick={() => setShowPostJobModal(true)}
                className="px-4 py-2 rounded-full text-sm font-medium text-gray-900 bg-white hover:bg-gray-50 border border-gray-300"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Post coaching job
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="p-1">
          <GlobalSearchBar
            placeholder="Search coaches, sports, locations..."
            showSuggestions={false}
            className="max-w-full"
          />
        </div>
      </div>

      {/* Filters */}
      <SearchFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Results Summary */}
      <div className="mb-6 flex items-center justify-between bg-white border border-gray-200 p-4 rounded-2xl">
        <div className="text-sm text-gray-600 font-medium">
          {loading ? (
            'Searching coaches...'
          ) : error ? (
            'Error loading results'
          ) : (
            <>
              {results.total > 0 ? (
                <>
                  Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, results.total)} of {results.total} coaches
                  {debouncedSearchTerm && ` for "${debouncedSearchTerm}"`}
                </>
              ) : hasActiveFilters ? (
                'No coaches found — adjust your filters'
              ) : (
                'Use filters to find your perfect coach'
              )}
            </>
          )}
        </div>

        {/* Sort Options */}
        <div className="flex items-center space-x-3">
          <label htmlFor="sortBy" className="text-sm text-gray-600 font-medium">Sort:</label>
          <select
            id="sortBy"
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              handleFilterChange('sortBy', sortBy);
              handleFilterChange('sortOrder', sortOrder);
            }}
            className="text-sm border border-gray-200 bg-white text-gray-900 px-3 py-2 rounded-md focus:outline-none"
          >
            <option value="averageRating-desc">Highest Rated</option>
            <option value="averageRating-asc">Lowest Rated</option>
            <option value="totalReviews-desc">Most Reviews</option>
            <option value="hourlyRate-asc">Price: Low to High</option>
            <option value="hourlyRate-desc">Price: High to Low</option>
            <option value="experience-desc">Most Experience</option>
            <option value="displayName-asc">Name: A to Z</option>
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-6 bg-red-50 border border-red-200 rounded-2xl">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 animate-pulse min-h-[240px]">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gray-200"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 mb-2"></div>
                    <div className="h-3 bg-gray-200 w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200"></div>
                  <div className="h-3 bg-gray-200 w-5/6"></div>
                </div>
                <div className="mt-4">
                  <div className="h-8 bg-gray-200"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Grid */}
      {!loading && results.coaches.length > 0 && (
        <>
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.coaches.map((coach) => (
                <div key={coach.id} className="h-full">
                  <CoachCard coach={coach} />
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          <div className="border border-gray-200 bg-white p-6 rounded-2xl">
            <Pagination
              currentPage={currentPage}
              totalPages={results.totalPages}
              onPageChange={handlePageChange}
              showInfo={true}
              totalItems={results.total}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && !error && results.coaches.length === 0 && hasActiveFilters && (
        <div className="text-center py-16 border border-gray-200 bg-white rounded-2xl">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No coaches found</h3>
          <p className="text-gray-600 mb-6">Try changing your filters.</p>
          <button
            onClick={handleClearFilters}
            className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-gray-900 bg-white border border-gray-300 hover:bg-gray-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear all filters
          </button>
        </div>
      )}

      {/* Job Posting Modal */}
      {showPostJobModal && (
        <JobPostingModal
          onClose={() => setShowPostJobModal(false)}
          onJobPosted={() => {
            setShowPostJobModal(false);
            // Could add a success message here
          }}
        />
      )}
    </div>
  );
}

// Job Posting Modal Component
interface JobPostingModalProps {
  onClose: () => void;
  onJobPosted: () => void;
}

function JobPostingModal({ onClose, onJobPosted }: JobPostingModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sport: '',
    location: '',
    type: 'part-time' as 'full-time' | 'part-time' | 'contract' | 'volunteer',
    salaryRange: '',
    requirements: [''],
    applicationDeadline: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData(prev => ({ ...prev, requirements: newRequirements }));
  };

  const addRequirement = () => {
    setFormData(prev => ({ ...prev, requirements: [...prev.requirements, ''] }));
  };

  const removeRequirement = (index: number) => {
    const newRequirements = formData.requirements.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, requirements: newRequirements }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          sport: formData.sport,
          location: formData.location,
          budget: parseFloat(formData.salaryRange.replace(/[^0-9.]/g, '')) || 0,
          deadline: formData.applicationDeadline,
          requiredSkills: formData.requirements.filter(req => req.trim() !== ''),
          idToken: token
        })
      });

      const data = await response.json();

      if (response.ok) {
        onJobPosted();
        alert('Job posted successfully!');
      } else {
        alert(data.error || 'Failed to post job');
      }
    } catch (err) {
      console.error('Error posting job:', err);
      alert('Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border-2 border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-700">
            <h2 className="text-3xl font-bold text-white uppercase tracking-wider">POST COACHING JOB</h2>
            <button
              onClick={onClose}
              type="button"
              className="text-gray-400 hover:text-[var(--brand-red)] transition-colors duration-200"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-bold text-white mb-3 uppercase tracking-widest">JOB TITLE *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-700 bg-black text-white focus:ring-2 focus:ring-[var(--brand-red)] focus:border-[var(--brand-red)] font-medium uppercase tracking-wider placeholder-gray-500"
                placeholder="E.G., YOUTH BASKETBALL COACH"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-white mb-3 uppercase tracking-widest">SPORT *</label>
                <select
                  required
                  value={formData.sport}
                  onChange={(e) => handleInputChange('sport', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-700 bg-black text-white focus:ring-2 focus:ring-[var(--brand-red)] focus:border-[var(--brand-red)] font-medium uppercase tracking-wider"
                >
                  <option value="">SELECT SPORT</option>
                  <option value="football">FOOTBALL</option>
                  <option value="basketball">BASKETBALL</option>
                  <option value="baseball">BASEBALL</option>
                  <option value="soccer">SOCCER</option>
                  <option value="tennis">TENNIS</option>
                  <option value="swimming">SWIMMING</option>
                  <option value="track">TRACK & FIELD</option>
                  <option value="volleyball">VOLLEYBALL</option>
                  <option value="other">OTHER</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-3 uppercase tracking-widest">JOB TYPE *</label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value as any)}
                  className="w-full px-4 py-3 border-2 border-gray-700 bg-black text-white focus:ring-2 focus:ring-[var(--brand-red)] focus:border-[var(--brand-red)] font-medium uppercase tracking-wider"
                >
                  <option value="part-time">PART-TIME</option>
                  <option value="full-time">FULL-TIME</option>
                  <option value="contract">CONTRACT</option>
                  <option value="volunteer">VOLUNTEER</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-white mb-3 uppercase tracking-widest">LOCATION *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-700 bg-black text-white focus:ring-2 focus:ring-[var(--brand-red)] focus:border-[var(--brand-red)] font-medium uppercase tracking-wider placeholder-gray-500"
                  placeholder="E.G., NEW YORK, REMOTE"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-3 uppercase tracking-widest">SALARY RANGE</label>
                <input
                  type="text"
                  value={formData.salaryRange}
                  onChange={(e) => handleInputChange('salaryRange', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-700 bg-black text-white focus:ring-2 focus:ring-[var(--brand-red)] focus:border-[var(--brand-red)] font-medium uppercase tracking-wider placeholder-gray-500"
                  placeholder="E.G., $25-40/HOUR, $50K-70K/YEAR"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-3 uppercase tracking-widest">DESCRIPTION *</label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-700 bg-black text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium placeholder-gray-500"
                placeholder="DESCRIBE THE COACHING POSITION, RESPONSIBILITIES, AND WHAT YOU'RE LOOKING FOR..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-3 uppercase tracking-widest">REQUIREMENTS</label>
              {formData.requirements.map((requirement, index) => (
                <div key={index} className="flex items-center gap-3 mb-3">
                  <input
                    type="text"
                    value={requirement}
                    onChange={(e) => handleRequirementChange(index, e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-gray-700 bg-black text-white focus:ring-2 focus:ring-[var(--brand-red)] focus:border-[var(--brand-red)] font-medium placeholder-gray-500"
                    placeholder="E.G., 2+ YEARS COACHING EXPERIENCE"
                  />
                  {formData.requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="text-red-400 hover:text-red-300 transition-colors duration-200"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addRequirement}
                className="text-[var(--brand-red)] hover:text-red-400 text-sm font-bold uppercase tracking-wider transition-colors duration-200"
              >
                + ADD REQUIREMENT
              </button>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-3 uppercase tracking-widest">APPLICATION DEADLINE</label>
              <input
                type="date"
                value={formData.applicationDeadline}
                onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-700 bg-black text-white focus:ring-2 focus:ring-[var(--brand-red)] focus:border-[var(--brand-red)] font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-6 pt-8 border-t border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3 text-gray-300 hover:text-white font-bold uppercase tracking-wider transition-colors duration-200"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-brand disabled:opacity-50 text-white px-8 py-3 font-bold uppercase tracking-wider transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
              >
                {loading ? 'POSTING...' : 'POST JOB'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 