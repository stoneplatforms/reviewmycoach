/**
 * Firebase Data Connect Server-Side Client
 * 
 * This module provides server-side access to Firebase Data Connect
 * for use in API routes and server components.
 */

import { initializeApp as initializeClientApp, getApps as getClientApps } from 'firebase/app';
import { getDataConnect } from 'firebase/data-connect';
import {
  searchCoachesAdvanced,
  getPublicCoaches,
  type SearchCoachesAdvancedVariables,
  type GetPublicCoachesVariables,
} from './dataconnect';

// Note: Firebase Admin is NOT needed for DataConnect operations
// DataConnect uses the client SDK, not Admin SDK
// Admin SDK initialization is handled separately in firebase-admin-server.ts when needed

// Initialize Firebase Client App for Data Connect
let clientApp;
if (getClientApps().length === 0) {
  clientApp = initializeClientApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });
} else {
  clientApp = getClientApps()[0];
}

// Get Data Connect instance for server-side use
const dataConnect = getDataConnect(clientApp, {
  connector: 'reviewmycoach',
  location: 'us-east4',
  service: 'review-my-coach-service'
});

/**
 * Search coaches with advanced filtering (server-side)
 * When searchTerm is provided, we fetch all coaches and filter client-side
 * since Firebase DataConnect doesn't support text search operators
 */
export async function searchCoachesWithFilters(params: {
  searchTerm?: string;
  sport?: string;
  location?: string;
  gender?: string;
  organization?: string;
  minRating?: number;
  maxRate?: number;
  isVerified?: boolean;
  page?: number;
  limit?: number;
}) {
  const limit = params.limit || 12;
  const page = params.page || 1;
  
  try {
    // If searchTerm is provided, we need to fetch ALL coaches to filter properly
    // Firebase DataConnect doesn't support text search, so we filter client-side
    // Since there are ~30k coaches, we fetch in batches to avoid memory issues
    let coaches: any[] = [];
    
    if (params.searchTerm) {
      // Fetch coaches in batches until we have enough results or have searched all coaches
      const batchSize = 10000; // Fetch 10k at a time
      const maxBatches = 5; // Max 50k coaches (should cover all)
      const term = params.searchTerm.toLowerCase().trim();
      let offset = 0;
      let foundEnoughResults = false;
      
      for (let batch = 0; batch < maxBatches && !foundEnoughResults; batch++) {
        const variables: SearchCoachesAdvancedVariables = {
          searchTerm: params.searchTerm,
          sport: params.sport,
          location: params.location,
          gender: params.gender,
          organization: params.organization,
          minRating: params.minRating,
          maxRate: params.maxRate,
          isVerified: params.isVerified,
          offset,
          limit: batchSize,
        };
        
        const result = await searchCoachesAdvanced(dataConnect, variables);
        const batchCoaches = result.data.coaches || [];
        
        if (batchCoaches.length === 0) {
          break; // No more coaches
        }
        
        // Filter this batch
        const filteredBatch = batchCoaches.filter((coach: any) => {
          const username = (coach.username || '').toLowerCase();
          const displayName = (coach.displayName || '').toLowerCase();
          const bio = (coach.bio || '').toLowerCase();
          const sports = Array.isArray(coach.sports) ? coach.sports.map((s: string) => s?.toLowerCase()) : [];
          const specialties = Array.isArray(coach.specialties) ? coach.specialties.map((s: string) => s?.toLowerCase()) : [];
          const location = (coach.location || '').toLowerCase();
          const organization = (coach.organization || '').toLowerCase();
          const school = (coach.school || '').toLowerCase();
          // Extract email domain (part after @) for school/university matching
          const email = (coach.email || '').toLowerCase();
          const emailDomain = email.includes('@') ? email.split('@')[1] : '';

          // Prioritize username and displayName matches
          return (
            username.includes(term) ||
            displayName.includes(term) ||
            bio.includes(term) ||
            sports.some((s: string) => s?.includes(term)) ||
            specialties.some((s: string) => s?.includes(term)) ||
            location.includes(term) ||
            organization.includes(term) ||
            school.includes(term) ||
            emailDomain.includes(term)
          );
        });
        
        coaches.push(...filteredBatch);
        
        // If we got less than batchSize, we've reached the end
        if (batchCoaches.length < batchSize) {
          break;
        }
        
        // If we found enough results for pagination, we can stop early
        // (we need at least page * limit results)
        if (coaches.length >= page * limit + limit) {
          foundEnoughResults = true;
        }
        
        offset += batchSize;
      }
      
      // Sort by relevance: username/displayName matches first
      coaches.sort((a: any, b: any) => {
        const aUsername = (a.username || '').toLowerCase();
        const aDisplayName = (a.displayName || '').toLowerCase();
        const bUsername = (b.username || '').toLowerCase();
        const bDisplayName = (b.displayName || '').toLowerCase();
        
        const aUsernameMatch = aUsername.includes(term);
        const aDisplayNameMatch = aDisplayName.includes(term);
        const bUsernameMatch = bUsername.includes(term);
        const bDisplayNameMatch = bDisplayName.includes(term);
        
        // Username matches come first
        if (aUsernameMatch && !bUsernameMatch) return -1;
        if (!aUsernameMatch && bUsernameMatch) return 1;
        
        // Then displayName matches
        if (aDisplayNameMatch && !bDisplayNameMatch) return -1;
        if (!aDisplayNameMatch && bDisplayNameMatch) return 1;
        
        // Then by rating
        return (b.averageRating || 0) - (a.averageRating || 0);
      });
      
      // Apply pagination after filtering
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      coaches = coaches.slice(startIndex, endIndex);
    } else {
      // No search term, use normal pagination
      const offset = (page - 1) * limit;
      const variables: SearchCoachesAdvancedVariables = {
        searchTerm: params.searchTerm,
        sport: params.sport,
        location: params.location,
        gender: params.gender,
        organization: params.organization,
        minRating: params.minRating,
        maxRate: params.maxRate,
        isVerified: params.isVerified,
        offset,
        limit,
      };
      
      const result = await searchCoachesAdvanced(dataConnect, variables);
      coaches = result.data.coaches || [];
    }
    
    return coaches;
  } catch (error) {
    console.error('Error searching coaches:', error);
    throw error;
  }
}

/**
 * Get public coaches with pagination (server-side)
 */
export async function fetchPublicCoaches(params: {
  page?: number;
  limit?: number | null;
}) {
  // If limit is null, fetch all coaches (use a very large number)
  // If limit is undefined, use default of 24
  const limit = params.limit === null ? 100000 : (params.limit || 24);
  const page = params.page || 1;
  const offset = (page - 1) * limit;

  const variables: GetPublicCoachesVariables = {
    limit,
    offset,
  };

  try {
    const result = await getPublicCoaches(dataConnect, variables);
    return result.data.coaches || [];
  } catch (error) {
    console.error('Error fetching public coaches:', error);
    throw error;
  }
}

/**
 * Filter coaches on the server side for complex search terms
 * Prioritizes username and displayName matches
 */
export function filterCoaches(coaches: any[], searchTerm?: string, organization?: string, ageGroup?: string) {
  let filtered = [...coaches];

  if (searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    filtered = filtered.filter((coach) => {
      const username = (coach.username || '').toLowerCase();
      const displayName = (coach.displayName || '').toLowerCase();
      const bio = (coach.bio || '').toLowerCase();
      const sports = Array.isArray(coach.sports) ? coach.sports.map((s: string) => s?.toLowerCase()) : [];
      const specialties = Array.isArray(coach.specialties) ? coach.specialties.map((s: string) => s?.toLowerCase()) : [];
      const organization = (coach.organization || '').toLowerCase();
      const school = (coach.school || '').toLowerCase();
      // Extract email domain (part after @) for school/university matching
      const email = (coach.email || '').toLowerCase();
      const emailDomain = email.includes('@') ? email.split('@')[1] : '';

      // Prioritize username and displayName matches
      return (
        username.includes(term) ||
        displayName.includes(term) ||
        bio.includes(term) ||
        sports.some((s: string) => s?.includes(term)) ||
        specialties.some((s: string) => s?.includes(term)) ||
        organization.includes(term) ||
        school.includes(term) ||
        emailDomain.includes(term)
      );
    });
    
    // Sort by relevance: username/displayName matches first
    filtered.sort((a, b) => {
      const aUsername = (a.username || '').toLowerCase();
      const aDisplayName = (a.displayName || '').toLowerCase();
      const bUsername = (b.username || '').toLowerCase();
      const bDisplayName = (b.displayName || '').toLowerCase();
      
      const aUsernameMatch = aUsername.includes(term);
      const aDisplayNameMatch = aDisplayName.includes(term);
      const bUsernameMatch = bUsername.includes(term);
      const bDisplayNameMatch = bDisplayName.includes(term);
      
      // Username matches come first
      if (aUsernameMatch && !bUsernameMatch) return -1;
      if (!aUsernameMatch && bUsernameMatch) return 1;
      
      // Then displayName matches
      if (aDisplayNameMatch && !bDisplayNameMatch) return -1;
      if (!aDisplayNameMatch && bDisplayNameMatch) return 1;
      
      // Then by rating
      return (b.averageRating || 0) - (a.averageRating || 0);
    });
  }

  if (organization) {
    filtered = filtered.filter((coach) =>
      (coach.organization || '').toLowerCase().includes(organization.toLowerCase())
    );
  }

  if (ageGroup) {
    filtered = filtered.filter((coach) =>
      Array.isArray(coach.ageGroup) && coach.ageGroup.some((age: string) => 
        (age || '').toLowerCase().includes(ageGroup.toLowerCase())
      )
    );
  }

  return filtered;
}

export { dataConnect };

