'use client';

import { useState, useEffect, Suspense } from 'react';
import { applyActionCode, sendEmailVerification } from 'firebase/auth';
import { auth } from '../lib/firebase-client';
import { useRouter, useSearchParams } from 'next/navigation';
import { setAuthToken } from '../lib/auth-cookie';
import Link from 'next/link';

function VerifyEmailContent() {
  const [email, setEmail] = useState<string>('');
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(true);
  const [resending, setResending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams?.get('email');
    if (emailParam) setEmail(emailParam);

    const mode = searchParams?.get('mode');
    const oobCode = searchParams?.get('oobCode');

    // Handle email verification from link
    if (mode === 'verifyEmail' && oobCode) {
      handleVerifyEmail(oobCode);
    } else {
      // Check if user is already signed in and verified
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          await user.reload(); // Refresh user data
          if (user.emailVerified) {
            setVerified(true);
            const token = await user.getIdToken();
            await setAuthToken(token);
            
            // Redirect to onboarding after a short delay
            setTimeout(() => {
              router.push('/onboarding');
            }, 2000);
          }
        }
        setChecking(false);
      });

      return () => unsubscribe();
    }
  }, [searchParams, router]);

  const handleVerifyEmail = async (oobCode: string) => {
    try {
      await applyActionCode(auth, oobCode);
      setVerified(true);
      setSuccessMessage('Email verified successfully! Redirecting...');
      
      // Sign in the user if they're not already
      const user = auth.currentUser;
      if (user) {
        await user.reload();
        const token = await user.getIdToken();
        await setAuthToken(token);
      }
      
      setTimeout(() => {
        router.push('/onboarding');
      }, 2000);
    } catch (error: any) {
      console.error('Error verifying email:', error);
      if (error.code === 'auth/invalid-action-code') {
        setError('This verification link is invalid or has expired. Please request a new one.');
      } else {
        setError('Failed to verify email. Please try again.');
      }
    } finally {
      setChecking(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email && !auth.currentUser) {
      setError('Please sign in again to resend verification email');
      return;
    }

    setResending(true);
    setError('');
    setSuccessMessage('');

    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user, {
          url: `${window.location.origin}/verify-email?email=${encodeURIComponent(user.email || '')}`,
        });
        setSuccessMessage('Verification email sent! Check your inbox and spam folder.');
      } else {
        setError('Please sign in again to resend verification email');
      }
    } catch (error: any) {
      console.error('Error resending verification:', error);
      if (error.code === 'auth/too-many-requests') {
        setError('Too many requests. Please wait a few minutes before trying again.');
      } else {
        setError('Failed to resend verification email. Please try again.');
      }
    } finally {
      setResending(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-neutral-400">Verifying your email...</p>
        </div>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-600">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-white">
              Email Verified!
            </h2>
            <p className="mt-2 text-sm text-neutral-400">
              Your email has been successfully verified. Redirecting you to complete your profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Verify your email
          </h2>
          <p className="mt-2 text-sm text-neutral-400">
            We sent a verification email to <span className="font-medium text-white">{email}</span>
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {error && (
            <div className="rounded-md bg-red-900/50 border border-red-700 p-4">
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="rounded-md bg-green-900/50 border border-green-700 p-4">
              <p className="text-sm text-green-200">{successMessage}</p>
            </div>
          )}

          {/* Spam Warning Banner */}
          <div className="rounded-lg bg-yellow-900/30 border-2 border-yellow-600 p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-bold text-yellow-400">
                  ⚠️ Check Your Spam Folder!
                </h3>
                <div className="mt-2 text-sm text-yellow-200">
                  <p className="font-medium">
                    Verification emails often go to spam. If you don't see the email in your inbox within 2 minutes, 
                    <span className="font-bold"> check your spam or junk folder</span>.
                  </p>
                  <p className="mt-2 text-xs text-yellow-300">
                    Add <strong>noreply@review-my-coach.firebaseapp.com</strong> to your contacts to prevent this in the future.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-white">
                  How to verify
                </h3>
                <div className="mt-2 text-sm text-neutral-400">
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Check your inbox for an email from ReviewMyCoach</li>
                    <li>If not there, check your spam/junk folder</li>
                    <li>Click the "Verify Email" link in the email</li>
                    <li>You'll be automatically redirected to continue</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={handleResendVerification}
              disabled={resending}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {resending ? 'Sending...' : 'Resend verification email'}
            </button>
          </div>

          <div className="text-center">
            <Link href="/signin" className="text-sm text-neutral-400 hover:text-white transition-colors">
              ← Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-xl">Loading...</div></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
