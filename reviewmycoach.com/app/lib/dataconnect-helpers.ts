/**
 * Firebase Data Connect Helper Functions
 * 
 * This module provides helper functions to interact with Firebase Data Connect
 * for querying coaches and other data.
 */

import { getDataConnect } from 'firebase/data-connect';
import { app } from './firebase-client';
import {
  searchCoachesAdvanced,
  getPublicCoaches,
  type SearchCoachesAdvancedVariables,
  type GetPublicCoachesVariables,
} from './dataconnect';

// Get Data Connect instance
const dataConnect = getDataConnect(app, {
  connector: 'reviewmycoach',
  location: 'us-east4',
  service: 'review-my-coach-service'
});

/**
 * Search coaches with advanced filtering
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

  try {
    const result = await searchCoachesAdvanced(dataConnect, variables);
    return result.data.coaches || [];
  } catch (error) {
    console.error('Error searching coaches:', error);
    throw error;
  }
}

/**
 * Get public coaches with pagination
 */
export async function fetchPublicCoaches(params: {
  page?: number;
  limit?: number | null;
}) {
  // If limit is null, fetch ALL coaches by using a very large limit
  const limit = params.limit === null ? 999999 : (params.limit || 24);
  const page = params.page || 1;
  const offset = (page - 1) * limit;

  const variables: GetPublicCoachesVariables = {
    limit,
    offset,
  };

  console.log('🔧 fetchPublicCoaches variables:', variables);

  try {
    const result = await getPublicCoaches(dataConnect, variables);
    console.log('📦 fetchPublicCoaches result count:', result.data.coaches?.length || 0);
    return result.data.coaches || [];
  } catch (error) {
    console.error('Error fetching public coaches:', error);
    throw error;
  }
}

/**
 * Filter coaches on the client side for complex search terms
 * (This is used when we need to filter results beyond what GraphQL provides)
 */
export function filterCoaches(coaches: any[], searchTerm?: string, organization?: string, ageGroup?: string) {
  let filtered = [...coaches];

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter((coach) =>
      coach.displayName?.toLowerCase().includes(term) ||
      coach.bio?.toLowerCase().includes(term) ||
      coach.sports?.some((s: string) => s?.toLowerCase().includes(term)) ||
      coach.specialties?.some((s: string) => s?.toLowerCase().includes(term)) ||
      coach.organization?.toLowerCase().includes(term)
    );
  }

  if (organization) {
    filtered = filtered.filter((coach) =>
      coach.organization?.toLowerCase().includes(organization.toLowerCase())
    );
  }

  if (ageGroup) {
    filtered = filtered.filter((coach) =>
      coach.ageGroup?.some((age: string) => age?.toLowerCase().includes(ageGroup.toLowerCase()))
    );
  }

  return filtered;
}

