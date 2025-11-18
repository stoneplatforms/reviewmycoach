# Global Search System Documentation

## Overview

This document covers the complete implementation of the global search system for ReviewMyCoach, including the global search bar, advanced filtering, and paginated search results.

## Features Implemented

### ✅ **Global Search Bar**
- Located in the navbar (both desktop and mobile)
- Auto-complete suggestions for coaches, sports, and locations
- Keyboard navigation support (arrow keys, enter, escape)
- Debounced search to prevent excessive API calls
- Redirects to search page with query parameters

### ✅ **Advanced Filters**
- **Sport Filter** - Search by specific sports (Tennis, Basketball, etc.)
- **Location Filter** - Filter by city and state
- **Gender Filter** - Filter by coach gender (Male, Female, Non-binary)
- **Organization Filter** - Filter by coaching organizations/certifications
- **Rating Filter** - Minimum rating filter (1-5 stars)
- **Price Filter** - Maximum hourly rate filter
- **Verification Filter** - Show only verified coaches

### ✅ **Search Results Page**
- Responsive grid layout with coach cards
- Real-time filtering with URL state management
- Advanced sorting options (rating, price, experience, name)
- Pagination with page navigation
- Results count and pagination info
- Mobile-responsive filter toggles

### ✅ **Backend API**
- Firestore-powered search with composite indexes
- Text search across multiple fields
- Advanced filtering and sorting
- Pagination support
- Error handling and validation

## File Structure

```
reviewmycoach/app/
├── components/
│   ├── GlobalSearchBar.tsx      # Main search bar component
│   ├── SearchFilters.tsx        # Filter dropdowns and controls
│   ├── CoachCard.tsx           # Coach result card display
│   ├── Pagination.tsx          # Pagination controls
│   └── Navbar.tsx              # Updated with search bar
├── search/
│   ├── page.tsx               # Search page server component
│   └── SearchPageClient.tsx   # Client-side search functionality
├── api/search/
│   ├── coaches/route.ts       # Search API endpoint
│   └── suggestions/route.ts   # Search suggestions API
├── lib/hooks/
│   └── useDebounce.ts        # Debounce hook for search
└── firestore.indexes.json    # Updated Firestore indexes
```

## Components

### GlobalSearchBar

**Location**: `app/components/GlobalSearchBar.tsx`

**Features**:
- Debounced search input (300ms delay)
- Real-time suggestions from API
- Keyboard navigation (↑↓ for navigation, Enter to select, Escape to close)
- Redirects to search page with query parameters
- Loading states and error handling
- Click outside to close functionality

**Usage**:
```tsx
<GlobalSearchBar 
  placeholder="Search coaches, sports, or locations..."
  showSuggestions={true}
  className="max-w-lg"
/>
```

### SearchFilters

**Location**: `app/components/SearchFilters.tsx`

**Features**:
- Dropdown filters for sport, location, gender, organization
- Range inputs for rating and price
- Verification toggle
- Active filter display with remove options
- Mobile-responsive collapsible design
- Clear all filters functionality

**Props**:
```tsx
interface SearchFiltersProps {
  filters: FilterState;
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}
```

### CoachCard

**Location**: `app/components/CoachCard.tsx`

**Features**:
- Coach profile image with fallback
- Star rating display
- Sports and specialties tags
- Location and experience info
- Verification badge
- Hourly rate display
- Hover effects and click navigation

### SearchPageClient

**Location**: `app/search/SearchPageClient.tsx`

**Features**:
- URL state management for filters and search terms
- Real-time search with debouncing
- Pagination with scroll-to-top
- Loading and error states
- Results count display
- Sort options dropdown

## API Endpoints

### Search Coaches

**Endpoint**: `GET /api/search/coaches`

**Query Parameters**:
```
search: string          // Text search across multiple fields
sport: string          // Filter by sport
location: string       // Filter by location
gender: string         // Filter by gender
organization: string   // Filter by organization
minRating: number      // Minimum rating (0-5)
maxRate: number        // Maximum hourly rate
isVerified: boolean    // Verification status
sortBy: string         // Sort field
sortOrder: string      // Sort direction (asc/desc)
page: number           // Page number (1-based)
limit: number          // Results per page (max 50)
```

**Response**:
```json
{
  "coaches": [...],
  "total": 150,
  "page": 1,
  "totalPages": 13,
  "hasMore": true,
  "limit": 12,
  "filters": {...}
}
```

### Search Suggestions

**Endpoint**: `GET /api/search/suggestions`

**Query Parameters**:
```
q: string  // Search query (minimum 2 characters)
```

**Response**:
```json
{
  "suggestions": [
    {
      "type": "coach",
      "text": "John Smith",
      "subtitle": "Los Angeles, CA • Tennis, Golf • 4.8 stars",
      "href": "/coach/123"
    },
    {
      "type": "sport", 
      "text": "Tennis",
      "subtitle": "Sport category",
      "href": "/search?sport=Tennis"
    }
  ],
  "query": "tennis"
}
```

## Firestore Structure

### Coach Document

```javascript
{
  userId: string,
  displayName: string,
  bio: string,
  sports: string[],           // Array of sports
  gender: string,             // NEW: 'Male', 'Female', 'Non-binary'
  organization: string,       // NEW: Coaching organization
  certifications: string[],
  specialties: string[],
  location: string,
  averageRating: number,
  totalReviews: number,
  hourlyRate: number,
  experience: number,
  isVerified: boolean,
  profileImage?: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Required Firestore Indexes

The following composite indexes are required for optimal performance:

```json
{
  "indexes": [
    // Sport + Rating
    {
      "collectionGroup": "coaches",
      "fields": [
        {"fieldPath": "sports", "arrayConfig": "CONTAINS"},
        {"fieldPath": "averageRating", "order": "DESCENDING"}
      ]
    },
    // Location + Rating  
    {
      "collectionGroup": "coaches",
      "fields": [
        {"fieldPath": "location", "order": "ASCENDING"},
        {"fieldPath": "averageRating", "order": "DESCENDING"}
      ]
    },
    // Gender + Rating (NEW)
    {
      "collectionGroup": "coaches", 
      "fields": [
        {"fieldPath": "gender", "order": "ASCENDING"},
        {"fieldPath": "averageRating", "order": "DESCENDING"}
      ]
    },
    // Organization + Rating (NEW)
    {
      "collectionGroup": "coaches",
      "fields": [
        {"fieldPath": "organization", "order": "ASCENDING"}, 
        {"fieldPath": "averageRating", "order": "DESCENDING"}
      ]
    },
    // Multi-filter combinations
    {
      "collectionGroup": "coaches",
      "fields": [
        {"fieldPath": "sports", "arrayConfig": "CONTAINS"},
        {"fieldPath": "location", "order": "ASCENDING"},
        {"fieldPath": "averageRating", "order": "DESCENDING"}
      ]
    }
  ]
}
```

## Search Flow

### 1. **Global Search**
```
User types in navbar search
↓
Debounced after 300ms
↓
API call to /api/search/suggestions
↓
Display suggestions dropdown
↓
User selects or presses Enter
↓
Navigate to /search?q=query
```

### 2. **Filter Search**
```
User applies filters on search page
↓
Update URL with filter parameters
↓
API call to /api/search/coaches
↓
Update results display
↓
URL reflects current search state
```

### 3. **Pagination**
```
User clicks page number
↓
Update URL with page parameter
↓
Scroll to top
↓
Fetch new page results
↓
Update pagination controls
```

## Search Algorithm

### Text Search Priority
1. **Exact matches** - Highest priority
2. **Starts with** - High priority  
3. **Contains** - Medium priority
4. **Fuzzy matches** - Low priority

### Multi-field Search
Text searches across:
- Coach display name
- Bio/description
- Sports array
- Specialties array
- Certifications array
- Location

### Filtering Logic
- **Firestore filters**: sport, location, gender, organization, minRating, isVerified
- **Client-side filters**: maxRate, text search (due to Firestore limitations)
- **Sorting**: averageRating, totalReviews, hourlyRate, experience, displayName

## Performance Optimizations

### 1. **Debouncing**
- Search input debounced to 300ms
- Suggestions debounced to 300ms
- Prevents excessive API calls while typing

### 2. **Pagination**
- Results limited to 12 per page
- Infinite scroll considered but pagination chosen for better UX
- Page state maintained in URL for shareable links

### 3. **Firestore Optimization**
- Composite indexes for common filter combinations
- Limited result sets with pagination
- Client-side filtering for complex queries

### 4. **Caching**
- Component state caching for filter options
- URL state management for browser navigation
- Suggestion caching (could be implemented)

## Mobile Responsiveness

### Responsive Design Features
- **Mobile search bar** in collapsible navbar menu
- **Filter toggles** for mobile screens
- **Responsive grid** (1 column mobile, 2-3 desktop)
- **Touch-friendly** pagination controls
- **Optimized suggestions** (fewer on mobile)

## Error Handling

### Client-side Errors
- Network connectivity issues
- Invalid search parameters
- Empty search results
- Loading states with skeletons

### Server-side Errors
- Firestore query errors
- Invalid filter combinations
- Rate limiting protection
- Graceful error responses

## Future Enhancements

### Planned Features
- **Fuzzy Search** - Better typo tolerance
- **Search Analytics** - Track popular searches
- **Advanced Filters** - Date ranges, availability
- **Saved Searches** - User bookmarks
- **Geographic Search** - Radius-based location
- **AI Recommendations** - ML-powered suggestions

### Performance Improvements
- **Search Result Caching** - Redis/memory cache
- **Elasticsearch Integration** - Advanced text search
- **CDN Optimization** - Faster static assets
- **Image Optimization** - WebP format, lazy loading

## Testing

### Manual Testing Checklist
- [ ] Search bar appears in navbar (desktop/mobile)
- [ ] Suggestions appear on typing (min 2 chars)
- [ ] Keyboard navigation works (arrows, enter, escape)
- [ ] Search redirects to /search page
- [ ] All filters work independently
- [ ] Combined filters work together
- [ ] Sorting works for all options
- [ ] Pagination navigates correctly
- [ ] URL state reflects search parameters
- [ ] Mobile responsive design
- [ ] Error states display properly
- [ ] Loading states show appropriately

### API Testing
```bash
# Test search endpoint
curl "http://localhost:3000/api/search/coaches?search=tennis&sport=Tennis&page=1&limit=12"

# Test suggestions endpoint  
curl "http://localhost:3000/api/search/suggestions?q=tennis"
```

## Deployment

### Required Environment Variables
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config
```

### Firestore Setup
1. Deploy firestore.indexes.json
2. Wait for index creation (can take several minutes)
3. Verify indexes in Firebase Console

### Production Considerations
- **Rate Limiting** - Implement API rate limits
- **Search Analytics** - Track search performance
- **Error Monitoring** - Sentry/logging integration
- **Performance Monitoring** - Core Web Vitals tracking

This search system provides a comprehensive, performant, and user-friendly way to find coaches with advanced filtering capabilities while maintaining excellent performance and mobile responsiveness. 