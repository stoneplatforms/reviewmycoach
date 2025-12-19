/**
 * Firebase Data Connect Client
 * 
 * This module initializes and exports the Firebase Data Connect instance
 * for querying PostgreSQL database through GraphQL.
 */

import { getDataConnect, connectDataConnectEmulator, DataConnect } from 'firebase/data-connect';
import { app } from './firebase-client';

let dataConnectInstance: DataConnect | null = null;

/**
 * Get or initialize Data Connect instance
 */
export function getDataConnectInstance(): DataConnect {
  if (!dataConnectInstance) {
    dataConnectInstance = getDataConnect(app, {
      connector: 'reviewmycoach',
      location: 'us-central1',
      service: 'reviewmycoach'
    });

    // Connect to emulator in development
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      try {
        connectDataConnectEmulator(dataConnectInstance, 'localhost', 9399);
        console.log('Connected to Data Connect emulator');
      } catch (error) {
        console.warn('Could not connect to Data Connect emulator:', error);
      }
    }
  }

  return dataConnectInstance;
}

// Export singleton instance
export const dataConnect = getDataConnectInstance();

/**
 * Helper function to execute Data Connect queries with error handling
 */
export async function executeQuery<T>(
  queryFn: () => Promise<{ data: T; errors?: any[] }>
): Promise<T | null> {
  try {
    const result = await queryFn();
    
    if (result.errors && result.errors.length > 0) {
      console.error('Data Connect query errors:', result.errors);
      return null;
    }
    
    return result.data;
  } catch (error) {
    console.error('Data Connect query failed:', error);
    return null;
  }
}

/**
 * Helper function to execute Data Connect mutations with error handling
 */
export async function executeMutation<T>(
  mutationFn: () => Promise<{ data: T; errors?: any[] }>
): Promise<T | null> {
  try {
    const result = await mutationFn();
    
    if (result.errors && result.errors.length > 0) {
      console.error('Data Connect mutation errors:', result.errors);
      throw new Error(result.errors[0].message || 'Mutation failed');
    }
    
    return result.data;
  } catch (error) {
    console.error('Data Connect mutation failed:', error);
    throw error;
  }
}

