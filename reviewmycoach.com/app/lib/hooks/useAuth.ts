import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase-client';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';

interface AuthState {
  user: any;
  loading: boolean;
  error: Error | undefined;
  userRole: 'student' | 'coach' | 'admin' | null;
  isCoach: boolean;
  hasCoachPro: boolean;
  subscriptionStatus: 'active' | 'inactive' | 'cancelled' | null;
}

export function useAuth(): AuthState {
  const [user, loading, error] = useAuthState(auth);
  const [userRole, setUserRole] = useState<'student' | 'coach' | 'admin' | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'inactive' | 'cancelled' | null>(null);

  useEffect(() => {
    const checkUserData = async () => {
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
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
                setSubscriptionStatus(coachData.subscriptionStatus || 'inactive');
              } else {
                setSubscriptionStatus('inactive');
              }
            } else {
              setSubscriptionStatus(null);
            }
          }
        } catch (error) {
          console.error('Error checking user data:', error);
        }
      } else {
        setUserRole(null);
        setSubscriptionStatus(null);
      }
    };

    checkUserData();
  }, [user]);

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