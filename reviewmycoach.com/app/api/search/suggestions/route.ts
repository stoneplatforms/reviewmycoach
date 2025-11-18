import { NextRequest, NextResponse } from 'next/server';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase-client';

interface SearchSuggestion {
  type: 'coach' | 'sport' | 'location';
  text: string;
  subtitle?: string;
  href: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('q');

    if (!searchTerm || searchTerm.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const suggestions: SearchSuggestion[] = [];
    const searchTermLower = searchTerm.toLowerCase();

    // Search for coaches
    try {
      const coachesQuery = query(
        collection(db, 'coaches'),
        orderBy('averageRating', 'desc'),
        limit(5)
      );
      
      const coachesSnapshot = await getDocs(coachesQuery);
      
      coachesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const displayName = data.displayName || '';
        const bio = data.bio || '';
        const sports = data.sports || [];
        const location = data.location || '';
        
        // Check if search term matches coach name, bio, sports, or location
        if (
          displayName.toLowerCase().includes(searchTermLower) ||
          bio.toLowerCase().includes(searchTermLower) ||
          sports.some((sport: string) => sport.toLowerCase().includes(searchTermLower)) ||
          location.toLowerCase().includes(searchTermLower)
        ) {
          // Only include coaches that have usernames AND public profiles
          if (data.username && data.isPublic !== false) {
            suggestions.push({
              type: 'coach',
              text: displayName,
              subtitle: `${location} • ${sports.slice(0, 2).join(', ')} • ${data.averageRating?.toFixed(1) || '0.0'} stars`,
              href: `/coach/${data.username}`
            });
          }
        }
      });
    } catch (error) {
      console.error('Error fetching coach suggestions:', error);
    }

    // Predefined sports and locations for suggestions
    const commonSports = [
      'Tennis', 'Basketball', 'Soccer', 'Swimming', 'Baseball', 'Football',
      'Volleyball', 'Golf', 'Track & Field', 'Gymnastics', 'Wrestling',
      'Boxing', 'Martial Arts', 'Hockey', 'Lacrosse', 'Softball', 'Cricket'
    ];

    const commonLocations = [
      'Los Angeles, CA', 'New York, NY', 'Chicago, IL', 'Houston, TX',
      'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA',
      'Dallas, TX', 'San Jose, CA', 'Austin, TX', 'Jacksonville, FL',
      'Fort Worth, TX', 'Columbus, OH', 'San Francisco, CA'
    ];

    // Add matching sports suggestions
    const matchingSports = commonSports
      .filter(sport => sport.toLowerCase().includes(searchTermLower))
      .slice(0, 3);

    matchingSports.forEach(sport => {
      suggestions.push({
        type: 'sport',
        text: sport,
        subtitle: 'Sport category',
        href: `/search?sport=${encodeURIComponent(sport)}`
      });
    });

    // Add matching location suggestions
    const matchingLocations = commonLocations
      .filter(location => location.toLowerCase().includes(searchTermLower))
      .slice(0, 3);

    matchingLocations.forEach(location => {
      suggestions.push({
        type: 'location',
        text: location,
        subtitle: 'Location',
        href: `/search?location=${encodeURIComponent(location)}`
      });
    });

    // Sort suggestions by relevance (exact matches first, then partial matches)
    const sortedSuggestions = suggestions.sort((a, b) => {
      const aExact = a.text.toLowerCase() === searchTermLower;
      const bExact = b.text.toLowerCase() === searchTermLower;
      const aStarts = a.text.toLowerCase().startsWith(searchTermLower);
      const bStarts = b.text.toLowerCase().startsWith(searchTermLower);

      if (aExact && !bExact) return -1;
      if (bExact && !aExact) return 1;
      if (aStarts && !bStarts) return -1;
      if (bStarts && !aStarts) return 1;

      // Sort by type priority: coach > sport > location
      const typePriority = { coach: 0, sport: 1, location: 2 };
      return typePriority[a.type] - typePriority[b.type];
    });

    // Limit total suggestions
    const limitedSuggestions = sortedSuggestions.slice(0, 8);

    return NextResponse.json({
      suggestions: limitedSuggestions,
      query: searchTerm
    });

  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return NextResponse.json(
      { suggestions: [], error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
} 