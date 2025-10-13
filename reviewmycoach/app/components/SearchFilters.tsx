'use client';

import { useState, useEffect } from 'react';

interface SearchFiltersProps {
  filters: {
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
  };
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

interface FilterOption {
  value: string;
  label: string;
}

export default function SearchFilters({
  filters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
}: SearchFiltersProps) {
  const [availableOptions, setAvailableOptions] = useState<{
    sports: FilterOption[];
    locations: FilterOption[];
    genders: FilterOption[];
    organizations: FilterOption[];
    roles: FilterOption[];
    ageGroups: FilterOption[];
  }>({
    sports: [],
    locations: [],
    genders: [],
    organizations: [],
    roles: [],
    ageGroups: [],
  });

  const [showMobileFilters, setShowMobileFilters] = useState(false);



  // Fetch available filter options on component mount
  useEffect(() => {
    // Static options defined inside useEffect to avoid dependency issues
    const staticOptions = {
      sports: [
        { value: 'Tennis', label: 'Tennis' },
        { value: 'Basketball', label: 'Basketball' },
        { value: 'Soccer', label: 'Soccer' },
        { value: 'Swimming', label: 'Swimming' },
        { value: 'Baseball', label: 'Baseball' },
        { value: 'Football', label: 'Football' },
        { value: 'Volleyball', label: 'Volleyball' },
        { value: 'Golf', label: 'Golf' },
        { value: 'Track & Field', label: 'Track & Field' },
        { value: 'Gymnastics', label: 'Gymnastics' },
        { value: 'Wrestling', label: 'Wrestling' },
        { value: 'Boxing', label: 'Boxing' },
        { value: 'Martial Arts', label: 'Martial Arts' },
        { value: 'Hockey', label: 'Hockey' },
        { value: 'Lacrosse', label: 'Lacrosse' },
      ],
      locations: [
        { value: 'Los Angeles, CA', label: 'Los Angeles, CA' },
        { value: 'New York, NY', label: 'New York, NY' },
        { value: 'Chicago, IL', label: 'Chicago, IL' },
        { value: 'Houston, TX', label: 'Houston, TX' },
        { value: 'Phoenix, AZ', label: 'Phoenix, AZ' },
        { value: 'Philadelphia, PA', label: 'Philadelphia, PA' },
        { value: 'San Antonio, TX', label: 'San Antonio, TX' },
        { value: 'San Diego, CA', label: 'San Diego, CA' },
        { value: 'Dallas, TX', label: 'Dallas, TX' },
        { value: 'San Jose, CA', label: 'San Jose, CA' },
        { value: 'Austin, TX', label: 'Austin, TX' },
        { value: 'Jacksonville, FL', label: 'Jacksonville, FL' },
        { value: 'Fort Worth, TX', label: 'Fort Worth, TX' },
        { value: 'Columbus, OH', label: 'Columbus, OH' },
        { value: 'San Francisco, CA', label: 'San Francisco, CA' },
      ],
      genders: [
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' },
        { value: 'Non-binary', label: 'Non-binary' },
      ],
      organizations: [
        { value: 'USA Coaching Association', label: 'USA Coaching Association' },
        { value: 'National Federation of Professional Trainers', label: 'NFPT' },
        { value: 'American College of Sports Medicine', label: 'ACSM' },
        { value: 'National Academy of Sports Medicine', label: 'NASM' },
        { value: 'International Association of Athletics Federations', label: 'IAAF' },
        { value: 'US Olympic Training Center', label: 'USOTC' },
        { value: 'National Collegiate Athletic Association', label: 'NCAA' },
        { value: 'International Tennis Federation', label: 'ITF' },
        { value: 'USA Swimming', label: 'USA Swimming' },
        { value: 'USA Track & Field', label: 'USA Track & Field' },
      ],
      roles: [
        { value: 'Head Coach', label: 'Head Coach' },
        { value: 'Assistant Coach', label: 'Assistant Coach' },
        { value: 'Strength & Conditioning Coach', label: 'Strength & Conditioning Coach' },
        { value: 'Skills Coach', label: 'Skills Coach' },
        { value: 'Goalkeeper Coach', label: 'Goalkeeper Coach' },
        { value: 'Position Coach', label: 'Position Coach' },
        { value: 'Private Instructor', label: 'Private Instructor' },
        { value: 'Team Coach', label: 'Team Coach' },
        { value: 'Other', label: 'Other' },
      ],
      ageGroups: [
        { value: 'Youth (Under 12)', label: 'Youth (Under 12)' },
        { value: 'Junior (12-16)', label: 'Junior (12-16)' },
        { value: 'High School (14-18)', label: 'High School (14-18)' },
        { value: 'College (18-22)', label: 'College (18-22)' },
        { value: 'Adult (22+)', label: 'Adult (22+)' },
        { value: 'Senior (55+)', label: 'Senior (55+)' },
        { value: 'All Ages', label: 'All Ages' },
      ],
    };
    
    // For now, use static options. In production, you'd fetch from API
    setAvailableOptions(staticOptions);
  }, []);

  const renderSelect = (
    key: string,
    label: string,
    options: FilterOption[],
    placeholder: string
  ) => (
    <div className="flex flex-col">
      <label htmlFor={key} className="text-xs font-medium text-gray-600 mb-2">
        {label}
      </label>
      <select
        id={key}
        value={filters[key as keyof typeof filters]}
        onChange={(e) => onFilterChange(key, e.target.value)}
        className="px-4 py-3 border border-gray-200 text-base rounded-full shadow-md hover:shadow-lg transition-shadow focus:ring-2 focus:ring-gray-200 focus:border-gray-200"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const renderRangeInput = (
    key: string,
    label: string,
    placeholder: string,
    type: 'number' | 'text' = 'number'
  ) => (
    <div className="flex flex-col">
      <label htmlFor={key} className="text-xs font-medium text-gray-600 mb-2">
        {label}
      </label>
      <input
        id={key}
        type={type}
        value={filters[key as keyof typeof filters]}
        onChange={(e) => onFilterChange(key, e.target.value)}
        placeholder={placeholder}
        className="px-4 py-3 border border-gray-200 text-base rounded-full shadow-md hover:shadow-lg transition-shadow placeholder-gray-400 focus:ring-2 focus:ring-gray-200 focus:border-gray-200"
      />
    </div>
  );

  const renderVerifiedToggle = () => (
    <div className="flex flex-col">
      <label htmlFor="isVerified" className="text-xs font-medium text-gray-600 mb-2">
        VERIFICATION
      </label>
      <select
        id="isVerified"
        value={filters.isVerified}
        onChange={(e) => onFilterChange('isVerified', e.target.value)}
        className="px-4 py-3 border border-gray-200 text-base rounded-full shadow-md hover:shadow-lg transition-shadow focus:ring-2 focus:ring-gray-200 focus:border-gray-200"
      >
        <option value="">All coaches</option>
        <option value="true">Verified only</option>
        <option value="false">Unverified only</option>
      </select>
    </div>
  );

  return (
    <div className="mb-8">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="flex items-center justify-between w-full px-4 py-3 border border-gray-300 rounded-2xl text-left hover:bg-gray-50"
        >
          <span className="flex items-center">
            <svg className="w-5 h-5 mr-3 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="font-medium text-gray-900">Filters</span>
            {hasActiveFilters && (
              <span className="ml-3 inline-flex items-center px-2 py-0.5 text-xs font-medium bg-neutral-100 text-neutral-900 rounded-full">
                Active
              </span>
            )}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${
              showMobileFilters ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Filters Container */}
      <div className={`border border-gray-200 p-6 rounded-2xl ${
        showMobileFilters ? 'block' : 'hidden lg:block'
      }`}>
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear all
            </button>
          )}
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Sport Filter */}
          {renderSelect('sport', 'Sport', availableOptions.sports, 'Any sport')}

          {/* Location Filter */}
          {renderSelect('location', 'Location', availableOptions.locations, 'Any location')}

          {/* Gender Filter */}
          {renderSelect('gender', 'Gender', availableOptions.genders, 'Any gender')}

          {/* Role Filter */}
          {renderSelect('role', 'Coaching Role', availableOptions.roles, 'Any role')}

          {/* Age Group Filter */}
          {renderSelect('ageGroup', 'Age Group', availableOptions.ageGroups, 'Any age group')}

          {/* Organization Filter */}
          {renderSelect('organization', 'Organization', availableOptions.organizations, 'Any organization')}

          {/* Verification Filter */}
          {renderVerifiedToggle()}
        </div>

        {/* Advanced Filters */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Advanced</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Minimum Rating */}
            {renderRangeInput('minRating', 'Min Rating', '0 - 5 stars')}

            {/* Maximum Rate */}
            {renderRangeInput('maxRate', 'Max Rate ($/hour)', 'e.g., 100')}
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => {
                if (!value || key === 'sortBy' || key === 'sortOrder') return null;
                
                let displayValue = value;
                if (key === 'isVerified') {
                  displayValue = value === 'true' ? 'Verified' : 'Unverified';
                }

                return (
                  <span
                    key={key}
                    className="inline-flex items-center px-3 py-1 text-sm font-medium bg-red-50 text-red-700 rounded-full border border-red-200"
                  >
                    {displayValue.toString()}
                    <button
                      onClick={() => onFilterChange(key, '')}
                      className="ml-2 hover:text-red-800 transition-colors duration-200"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 