/**
 * Utility functions for managing Firebase auth token in cookies
 * This allows middleware to access authentication state
 */

export async function setAuthToken(token: string): Promise<void> {
  if (typeof document === 'undefined') return;
  
  // Set cookie with 1 hour expiration (Firebase tokens expire after 1 hour)
  const expires = new Date();
  expires.setHours(expires.getHours() + 1);
  
  document.cookie = `firebase-token=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax; Secure=${location.protocol === 'https:'}`;
  
  // Wait a tick to ensure cookie is written
  await new Promise(resolve => setTimeout(resolve, 50));
  
  // Verify cookie was set
  const wasSet = document.cookie.includes('firebase-token=');
  if (!wasSet) {
    console.error('Failed to set auth cookie');
  }
}

export function clearAuthToken() {
  if (typeof document === 'undefined') return;
  
  document.cookie = 'firebase-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

export function getAuthToken(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'firebase-token') {
      return value;
    }
  }
  return null;
}
