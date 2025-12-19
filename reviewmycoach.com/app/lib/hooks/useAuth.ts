import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase-client';
import { setAuthToken, clearAuthToken } from '../auth-cookie';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | undefined;
  userRole: 'student' | 'coach' | 'admin' | null;
  isCoach: boolean;
  hasCoachPro: boolean;
  subscriptionStatus: 'active' | 'inactive' | 'cancelled' | null;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [userRole, setUserRole] = useState<'student' | 'coach' | 'admin' | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'inactive' | 'cancelled' | null>(null);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Get Firebase ID token and store in cookie for middleware
          const token = await firebaseUser.getIdToken();
          await setAuthToken(token);
          
          // Get user data from Firestore
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setUserRole(userData.role || null);
            
            // If user is a coach, check for subscription status
            if (userData.role === 'coach' && userData.username) {
              const coachRef = doc(db, 'coaches', userData.username);
              const coachSnap = await getDoc(coachRef);
              
              if (coachSnap.exists()) {
                const coachData = coachSnap.data();
                setSubscriptionStatus(coachData.subscriptionStatus || coachData.subscription_status || 'inactive');
              } else {
                setSubscriptionStatus('inactive');
              }
            } else {
              setSubscriptionStatus(null);
            }
          }
        } catch (err) {
          console.error('Error checking user data:', err);
          setError(err as Error);
        }
      } else {
        clearAuthToken();
        setUserRole(null);
        setSubscriptionStatus(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    loading,
    error,
    userRole,
    isCoach: userRole === 'coach',
    hasCoachPro: userRole === 'coach' && subscriptionStatus === 'active',
    subscriptionStatus
  };
}
