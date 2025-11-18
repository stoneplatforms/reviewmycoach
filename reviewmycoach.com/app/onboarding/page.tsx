'use client';

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase-client';
import { useRouter } from 'next/navigation';

type OnboardingStep = 'username' | 'role' | 'coach_options' | 'claim_check' | 'claim_profile' | 'identity_verify' | 'loading';

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('username');
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [selectedRole, setSelectedRole] = useState<'student' | 'coach' | null>(null);
  const [coachChoice, setCoachChoice] = useState<'claim' | 'create' | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [fadeClass, setFadeClass] = useState('opacity-100');
  const [claimableProfiles, setClaimableProfiles] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [identityVerificationData, setIdentityVerificationData] = useState({
    fullName: '',
    dateOfBirth: '',
    address: '',
    phoneNumber: '',
    driversLicense: null as File | null
  });
  const router = useRouter();
  const [claimInProgress, setClaimInProgress] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const validateUsername = (value: string): boolean => {
    if (!value.trim()) {
      setUsernameError('Username is required');
      return false;
    }
    if (value.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return false;
    }
    if (value.length > 20) {
      setUsernameError('Username must be less than 20 characters');
      return false;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      setUsernameError('Username can only contain letters, numbers, hyphens, and underscores');
      return false;
    }
    setUsernameError('');
    return true;
  };

  const handleUsernameSubmit = async () => {
    if (!validateUsername(username) || !user) return;
    
    setLoading(true);
    try {
      // Save username to user profile
      const usersRef = doc(db, 'users', user.uid);
      await setDoc(usersRef, {
        userId: user.uid,
        email: user.email,
        displayName: user.displayName,
        username: username.toLowerCase().trim(),
        createdAt: new Date(),
        onboardingCompleted: false,
        isVerified: false
      });

      // Check for claimable coach profiles with this email
      const response = await fetch(`/api/coaches/claim?email=${encodeURIComponent(user.email || '')}`);
      const data = await response.json();

      if (response.ok && data.claimableProfiles && data.claimableProfiles.length > 0) {
        // Found claimable profiles - show them to the user
        setClaimableProfiles(data.claimableProfiles);
        setFadeClass('opacity-0');
        setTimeout(() => {
          setCurrentStep('claim_check');
          setFadeClass('opacity-100');
        }, 300);
      } else {
        // No claimable profiles - proceed to role selection
        setFadeClass('opacity-0');
        setTimeout(() => {
          setCurrentStep('role');
          setFadeClass('opacity-100');
        }, 300);
      }
      
    } catch (error) {
      console.error('Error saving username or checking profiles:', error);
      setUsernameError('Error saving username. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelection = async () => {
    if (!selectedRole || !user || !username) return;
    
    if (selectedRole === 'coach') {
      // For coaches, show coach options (claim vs create)
      setCurrentStep('coach_options');
      
      // Check for claimable profiles
      try {
        const response = await fetch('/api/coaches/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: user.email,
            checkOnly: true 
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.claimableProfiles && data.claimableProfiles.length > 0) {
            setClaimableProfiles(data.claimableProfiles);
          }
        }
      } catch (error) {
        console.error('Error checking claimable profiles:', error);
      }
    } else {
      // For students, complete onboarding immediately
      await completeStudentOnboarding();
    }
  };

  const completeStudentOnboarding = async () => {
    if (!selectedRole || !user || !username) return;
    
    setLoading(true);
    setCurrentStep('loading');
    
    try {
      const userRef = doc(db, 'users', user.uid);
      
      // Update user document with role
      await setDoc(userRef, {
        role: selectedRole,
        onboardingCompleted: true,
        updatedAt: new Date()
      }, { merge: true });

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error updating user role:', error);
      alert(`Error updating profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setCurrentStep('role');
    } finally {
      setLoading(false);
    }
  };

  const handleCoachChoice = async () => {
    if (!coachChoice || !user || !username) return;

    if (coachChoice === 'claim') {
      if (claimableProfiles && claimableProfiles.length > 0) {
        setCurrentStep('claim_check');
      } else {
        alert('No claimable profiles found for your email address.');
        return;
      }
    } else {
      // Create new profile
      await createNewCoachProfile();
    }
  };

  const createNewCoachProfile = async () => {
    if (!user || !username) return;
    
    setLoading(true);
    setCurrentStep('loading');
    
    try {
      const userRef = doc(db, 'users', user.uid);
      
      // Update user document with role
      await setDoc(userRef, {
        role: 'coach',
        onboardingCompleted: true,
        updatedAt: new Date()
      }, { merge: true });

      // Create a new public coach profile
      const coachRef = doc(db, 'coaches', username.toLowerCase());
      await setDoc(coachRef, {
        userId: user.uid,
        username: username.toLowerCase(),
        displayName: user.displayName || username,
        email: user.email,
        bio: '',
        sports: [],
        experience: 0,
        certifications: [],
        hourlyRate: 0,
        location: '',
        availability: [],
        specialties: [],
        languages: ['English'],
        organization: '',
        role: '',
        gender: '',
        ageGroup: [],
        sourceUrl: '',
        averageRating: 0,
        totalReviews: 0,
        isVerified: false,
        isClaimed: true,
        claimedAt: new Date(),
        profileImage: '',
        phoneNumber: '',
        website: '',
        socialMedia: {
          instagram: '',
          twitter: '',
          linkedin: ''
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        profileCompleted: false
      });

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating coach profile:', error);
      alert(`Error creating profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setCurrentStep('coach_options');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimProfile = async (profile: any) => {
    setSelectedProfile(profile);
    setFadeClass('opacity-0');
    setTimeout(() => {
      setCurrentStep('identity_verify');
      setFadeClass('opacity-100');
    }, 300);
  };

  const handleSkipClaiming = async () => {
    // Create new profile instead of claiming
    await createNewCoachProfile();
  };

  const sendEmailVerificationRequest = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const idToken = await user.getIdToken();
      const res = await fetch('/api/account/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to send verification email');
      alert('Verification email sent. Please verify and then return to claim your profile.');
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const attemptAutoClaim = async () => {
    if (!user || !selectedProfile || claimInProgress) return;
    try {
      setClaimInProgress(true);
      await user.reload();
      if (!user.emailVerified) {
        setClaimInProgress(false);
        return;
      }
      const token = await user.getIdToken();
      const claimResponse = await fetch('/api/coaches/claim', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ coachUsername: selectedProfile.username })
      });
      if (!claimResponse.ok) {
        const data = await claimResponse.json().catch(() => ({}));
        throw new Error(data?.message || data?.error || 'Failed to claim profile');
      }
      router.push('/dashboard?claimed=true&verified=email');
    } catch (err) {
      console.error('Auto-claim error:', err);
      alert((err as Error).message);
      setClaimInProgress(false);
    }
  };

  useEffect(() => {
    if (currentStep !== 'identity_verify' || !user || !selectedProfile) return;
    let isMounted = true;
    const interval = setInterval(async () => {
      if (!isMounted) return;
      await attemptAutoClaim();
    }, 5000);
    // Initial immediate attempt as well
    attemptAutoClaim();
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentStep, user, selectedProfile]);
  const handleIdentityVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfile || !user || !identityVerificationData.driversLicense) return;

    setLoading(true);
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('driversLicense', identityVerificationData.driversLicense);
      formData.append('coachUsername', selectedProfile.username);
      formData.append('personalInfo', JSON.stringify({
        fullName: identityVerificationData.fullName,
        dateOfBirth: identityVerificationData.dateOfBirth,
        address: identityVerificationData.address,
        phoneNumber: identityVerificationData.phoneNumber
      }));

      const token = await user.getIdToken();
      
      // First claim the profile
      const claimResponse = await fetch('/api/coaches/claim', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          coachUsername: selectedProfile.username
        })
      });

      if (!claimResponse.ok) {
        throw new Error('Failed to claim profile');
      }

      // Then submit identity verification
      const verificationResponse = await fetch('/api/identity/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!verificationResponse.ok) {
        throw new Error('Failed to submit identity verification');
      }

      // Redirect to dashboard with success message
      router.push('/dashboard?claimed=true');
    } catch (error) {
      console.error('Error claiming profile or verifying identity:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/signin');
    return null;
  }

  const renderUsernameStep = () => (
    <div className={`transition-opacity duration-300 ${fadeClass}`}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Choose your username
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            This will be your unique identifier on ReviewMyCoach
          </p>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1 relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (usernameError) {
                      validateUsername(e.target.value);
                    }
                  }}
                  onBlur={() => validateUsername(username)}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 ${
                    usernameError ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your username"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <span className="text-gray-400 text-sm">@{username.toLowerCase()}</span>
                </div>
              </div>
              {usernameError && (
                <p className="mt-2 text-sm text-red-600">{usernameError}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                3-20 characters, letters, numbers, hyphens, and underscores only
              </p>
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={handleUsernameSubmit}
            disabled={!username.trim() || loading || !!usernameError}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            Continue
          </button>
        </div>
      </div>
    </div>
  );

  const renderRoleStep = () => (
    <div className={`transition-opacity duration-300 ${fadeClass}`}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Welcome, @{username}!
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            I am a...
          </p>
          
          <div className="space-y-4">
            {/* Student Option */}
            <div
              onClick={() => setSelectedRole('student')}
              className={`relative rounded-lg border p-4 cursor-pointer transition-all ${
                selectedRole === 'student'
                  ? 'border-gray-500 bg-gray-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedRole === 'student'
                      ? 'border-gray-500 bg-gray-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedRole === 'student' && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Student/Athlete</h4>
                      <p className="text-sm text-gray-500">
                        I want to find and review coaches
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coach Option */}
            <div
              onClick={() => setSelectedRole('coach')}
              className={`relative rounded-lg border p-4 cursor-pointer transition-all ${
                selectedRole === 'coach'
                  ? 'border-gray-500 bg-gray-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedRole === 'coach'
                      ? 'border-gray-500 bg-gray-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedRole === 'coach' && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Coach/Instructor</h4>
                      <p className="text-sm text-gray-500">
                        I want to manage my coaching profile and view reviews
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => {
              setFadeClass('opacity-0');
              setTimeout(() => {
                setCurrentStep('username');
                setFadeClass('opacity-100');
              }, 300);
            }}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Back
          </button>
          <button
            onClick={handleRoleSelection}
            disabled={!selectedRole || loading}
            className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            Complete Setup
          </button>
        </div>
      </div>
    </div>
  );

  const renderCoachOptionsStep = () => (
    <div className={`transition-opacity duration-300 ${fadeClass}`}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Coach Profile Setup
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            {claimableProfiles && claimableProfiles.length > 0 
              ? `We found ${claimableProfiles.length} existing coach profile(s) associated with your email address. Would you like to claim one of these profiles or create a new one?`
              : 'Would you like to create a new coach profile?'
            }
          </p>
          
          <div className="space-y-4">
            {claimableProfiles && claimableProfiles.length > 0 && (
              <div
                onClick={() => setCoachChoice('claim')}
                className={`relative rounded-lg border p-4 cursor-pointer transition-all ${
                  coachChoice === 'claim'
                    ? 'border-[var(--brand-silver-blue)] bg-[color:rgb(163_182_196_/_.08)]'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      coachChoice === 'claim'
                        ? 'border-[var(--brand-silver-blue)] bg-[var(--brand-silver-blue)]'
                        : 'border-gray-300'
                    }`}>
                      {coachChoice === 'claim' && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center">
                      <svg className="w-6 h-6 text-[var(--brand-silver-blue)] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Claim Existing Profile</h4>
                        <p className="text-sm text-gray-500">
                          Claim one of the {claimableProfiles?.length || 0} existing profile(s) we found
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div
              onClick={() => setCoachChoice('create')}
              className={`relative rounded-lg border p-4 cursor-pointer transition-all ${
                coachChoice === 'create'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    coachChoice === 'create'
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-300'
                  }`}>
                    {coachChoice === 'create' && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Create New Profile</h4>
                      <p className="text-sm text-gray-500">
                        Start fresh with a new coach profile
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => {
              setFadeClass('opacity-0');
              setTimeout(() => {
                setCurrentStep('role');
                setCoachChoice(null);
                setFadeClass('opacity-100');
              }, 300);
            }}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Back
          </button>
          <button
            onClick={handleCoachChoice}
            disabled={!coachChoice || loading}
            className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {coachChoice === 'claim' ? 'Continue to Claim' : 'Create Profile'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderLoadingStep = () => (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Setting up your account...</h3>
      <p className="text-sm text-gray-600">This will only take a moment</p>
    </div>
  );

  const renderClaimCheckStep = () => (
    <div className={`transition-opacity duration-300 ${fadeClass}`}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            We found existing coach profiles for your email!
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            We found {claimableProfiles?.length || 0} coach profile(s) associated with your email address. 
            You can claim one of these profiles or create a new one.
          </p>
          
          <div className="space-y-4">
            {claimableProfiles && claimableProfiles.map((profile, index) => (
              <div key={profile.username} className="border border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{profile.displayName}</h4>
                    <p className="text-sm text-gray-600">{profile.role} at {profile.organization}</p>
                    <p className="text-sm text-gray-500 mt-1">Sports: {profile.sports.join(', ')}</p>
                    {profile.phoneNumber && (
                      <p className="text-sm text-gray-500">Phone: {profile.phoneNumber}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleClaimProfile(profile)}
                    className="ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700"
                  >
                    Claim Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => {
              setFadeClass('opacity-0');
              setTimeout(() => {
                setCurrentStep('coach_options');
                setFadeClass('opacity-100');
              }, 300);
            }}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={handleSkipClaiming}
            className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            Create New Profile Instead
          </button>
        </div>
      </div>
    </div>
  );

  const sendEmailVerification = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const idToken = await user.getIdToken();
      const res = await fetch('/api/account/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to send verification email');
      alert('Verification email sent. Please verify and then return to claim your profile.');
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const renderIdentityVerifyStep = () => (
    <div className={`transition-opacity duration-300 ${fadeClass}`}>
      <form onSubmit={handleIdentityVerification} className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Verify Your Identity
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            To claim the profile for <strong>{selectedProfile?.displayName}</strong>, 
            verify your identity. Best option: verify your school email, then we will auto-claim once verified.
          </p>
          
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-md p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">Verify your school email</p>
                  <p className="text-sm text-gray-600">We will send a verification email to your school address. Once verified, you can claim instantly.</p>
                </div>
                <button type="button" onClick={sendEmailVerificationRequest} disabled={loading} className="ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md btn-brand disabled:opacity-50">
                  Send Verification Email
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between bg-[color:rgb(163_182_196_/_.08)] border border-[var(--brand-silver-blue)]/40 rounded-md p-3">
              <p className="text-sm text-[var(--brand-silver-blue)]">Already verified your email? We will detect it automatically, or you can click below.</p>
              <button type="button" onClick={attemptAutoClaim} disabled={claimInProgress} className="ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-[var(--brand-silver-blue)] bg-white hover:bg-[color:rgb(163_182_196_/_.15)] disabled:opacity-50">
                I've Verified – Claim Now
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name (as it appears on your license)
              </label>
              <input
                type="text"
                value={identityVerificationData.fullName}
                onChange={(e) => setIdentityVerificationData(prev => ({
                  ...prev,
                  fullName: e.target.value
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                value={identityVerificationData.dateOfBirth}
                onChange={(e) => setIdentityVerificationData(prev => ({
                  ...prev,
                  dateOfBirth: e.target.value
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                value={identityVerificationData.address}
                onChange={(e) => setIdentityVerificationData(prev => ({
                  ...prev,
                  address: e.target.value
                }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={identityVerificationData.phoneNumber}
                onChange={(e) => setIdentityVerificationData(prev => ({
                  ...prev,
                  phoneNumber: e.target.value
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500"
                placeholder={selectedProfile?.phoneNumber || ''}
              />
            </div>

            <div className="border border-gray-200 rounded-md p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">Verify your school email</p>
                  <p className="text-sm text-gray-600">We will send a verification email to your school address. Once verified, you can claim instantly.</p>
                </div>
                <button type="button" onClick={sendEmailVerification} disabled={loading} className="ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md btn-brand disabled:opacity-50">
                  Send Verification Email
                </button>
              </div>
            </div>

            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or upload Driver's License Photo (manual review)
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setIdentityVerificationData(prev => ({
                  ...prev,
                  driversLicense: e.target.files?.[0] || null
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload a clear photo of your driver's license (JPEG, PNG, or PDF, max 10MB)
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => {
              setFadeClass('opacity-0');
              setTimeout(() => {
                setCurrentStep('claim_check');
                setFadeClass('opacity-100');
              }, 300);
            }}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading || !identityVerificationData.driversLicense}
            className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </>
            ) : (
              'Claim Profile & Submit ID for Review'
            )}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-gray-100">
          <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Welcome to ReviewMyCoach!
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {currentStep === 'username' && "Let's start by setting up your username"}
          {currentStep === 'role' && "Now, tell us what brings you here"}
          {currentStep === 'coach_options' && "Choose your coach profile setup"}
          {currentStep === 'claim_check' && "We found existing profiles for you!"}
          {currentStep === 'identity_verify' && "Identity verification required"}
          {currentStep === 'loading' && "Setting up your profile..."}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {currentStep === 'username' && renderUsernameStep()}
          {currentStep === 'role' && renderRoleStep()}
          {currentStep === 'coach_options' && renderCoachOptionsStep()}
          {currentStep === 'claim_check' && renderClaimCheckStep()}
          {currentStep === 'identity_verify' && renderIdentityVerifyStep()}
          {currentStep === 'loading' && renderLoadingStep()}
        </div>
      </div>
    </div>
  );
} 

// Metadata cannot be exported from a client component; handled at a parent layout/route.