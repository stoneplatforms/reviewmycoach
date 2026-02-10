import { NextRequest, NextResponse } from 'next/server';
import { searchCoachesWithFilters } from '../../../lib/firebase-dataconnect-server';

interface SearchSuggestion {
  type: 'coach' | 'sport' | 'location' | 'school';
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

    // Search for coaches using Firebase Data Connect
    const schoolSuggestionSet = new Set<string>();
    try {
      const coaches = await searchCoachesWithFilters({
        searchTerm: searchTerm,
        limit: 10, // Will fetch more and filter, then return top 10
        page: 1
      });

      if (coaches && Array.isArray(coaches)) {
        // Filter to only include coaches with usernames (required for profile URLs)
        const coachesWithUsernames = coaches.filter((coach: any) =>
          coach.username && coach.username.trim() !== ''
        );

        // Collect unique organizations/schools and email domains that match the search term
        coachesWithUsernames.forEach((coach: any) => {
          const org = (coach.organization || '').trim();
          if (org && org.toLowerCase().includes(searchTermLower)) {
            schoolSuggestionSet.add(org);
          }
          // Check dedicated school field
          const school = (coach.school || '').trim();
          if (school && school.toLowerCase().includes(searchTermLower)) {
            schoolSuggestionSet.add(school);
          }
          // Extract email domain (e.g., "stanford.edu" from "coach@stanford.edu")
          const email = (coach.email || '').trim();
          if (email.includes('@')) {
            const domain = email.split('@')[1];
            if (domain && domain.toLowerCase().includes(searchTermLower)) {
              // Use the domain as a school identifier (e.g., "stanford.edu")
              schoolSuggestionSet.add(domain);
            }
          }
        });

        // Take top 5 coaches for suggestions
        coachesWithUsernames.slice(0, 5).forEach((coach: any) => {
          const displayName = coach.displayName || 'Unnamed Coach';
          const username = coach.username || '';
          const sports = Array.isArray(coach.sports) ? coach.sports : [];
          const location = coach.location || '';
          const organization = coach.organization || '';
          const email = coach.email || '';
          const emailDomain = email.includes('@') ? email.split('@')[1] : '';

          // Check which fields matched the search term
          const usernameMatch = username.toLowerCase().includes(searchTermLower);
          const displayNameMatch = displayName.toLowerCase().includes(searchTermLower);
          const school = coach.school || '';
          const organizationMatch = organization.toLowerCase().includes(searchTermLower);
          const schoolMatch = school.toLowerCase().includes(searchTermLower);
          const emailDomainMatch = emailDomain.toLowerCase().includes(searchTermLower);

          // Create subtitle with relevant info
          let subtitle = '';
          if (usernameMatch) {
            subtitle = `@${username}`;
          } else if (displayNameMatch) {
            subtitle = displayName;
          }

          // Show organization when it matched the search term
          if (organizationMatch && organization) {
            subtitle += subtitle ? ` • ${organization}` : organization;
          }

          // Show school when it matched the search term
          if (schoolMatch && school) {
            subtitle += subtitle ? ` • ${school}` : school;
          }

          // Show email domain when it matched (school email)
          if (emailDomainMatch && emailDomain) {
            subtitle += subtitle ? ` • @${emailDomain}` : `@${emailDomain}`;
          }

          if (location) {
            subtitle += subtitle ? ` • ${location}` : location;
          }

          if (sports.length > 0) {
            subtitle += subtitle ? ` • ${sports.slice(0, 2).join(', ')}` : sports.slice(0, 2).join(', ');
          }

          if (coach.averageRating) {
            subtitle += ` • ${coach.averageRating.toFixed(1)} stars`;
          }

          if (!subtitle) {
            subtitle = 'Coach';
          }

          suggestions.push({
            type: 'coach',
            text: displayName,
            subtitle: subtitle,
            href: `/coach/${username.toLowerCase()}`
          });
        });
      }
    } catch (error) {
      console.error('Error fetching coach suggestions:', error);
    }

    // Add matching school/university suggestions from organizations and email domains
    Array.from(schoolSuggestionSet).slice(0, 3).forEach(school => {
      // Detect if this is an email domain (contains a dot but no spaces)
      const isEmailDomain = school.includes('.') && !school.includes(' ');
      suggestions.push({
        type: 'school',
        text: isEmailDomain ? `@${school}` : school,
        subtitle: isEmailDomain ? 'School email domain' : 'School / University',
        // Email domains search via the general search term; org names use the organization filter
        href: isEmailDomain
          ? `/search?q=${encodeURIComponent(school)}`
          : `/search?organization=${encodeURIComponent(school)}`
      });
    });

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

      // Sort by type priority: school > coach > sport > location
      const typePriority: Record<string, number> = { school: 0, coach: 1, sport: 2, location: 3 };
      return (typePriority[a.type] ?? 4) - (typePriority[b.type] ?? 4);
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