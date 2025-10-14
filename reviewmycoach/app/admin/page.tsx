'use client';

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Report {
  id: string;
  reporterId: string;
  reportedItemType: 'review' | 'coach';
  reportedItemId: string;
  reason: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: { toDate: () => Date };
  reviewData?: {
    studentName: string;
    coachName: string;
    rating: number;
    reviewText: string;
  };
}

interface UserData {
  role: string;
  displayName: string;
  email: string;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        await checkAdminAccess(user);
      } else {
        router.push('/signin');
      }
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const checkAdminAccess = async (user: User) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data() as UserData;
        if (userData.role !== 'admin') {
          router.push('/dashboard');
          return;
        }
        setUserRole(userData.role);
        await fetchReports();
      } else {
        router.push('/onboarding');
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const reportsRef = collection(db, 'reports');
      const q = query(
        reportsRef,
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const reportsData: Report[] = [];

      for (const docSnapshot of querySnapshot.docs) {
        const reportData = { id: docSnapshot.id, ...docSnapshot.data() } as Report;
        
        // Fetch additional review data if it's a review report
        if (reportData.reportedItemType === 'review') {
          try {
            // Try to find the review in coaches collection
            const coachesSnapshot = await getDocs(collection(db, 'coaches'));
            let reviewFound = false;

            for (const coachDoc of coachesSnapshot.docs) {
              const reviewRef = doc(db, 'coaches', coachDoc.id, 'reviews', reportData.reportedItemId);
              const reviewSnap = await getDoc(reviewRef);
              
              if (reviewSnap.exists()) {
                const reviewData = reviewSnap.data();
                reportData.reviewData = {
                  studentName: reviewData.studentName,
                  coachName: coachDoc.data().displayName,
                  rating: reviewData.rating,
                  reviewText: reviewData.reviewText
                };
                reviewFound = true;
                break;
              }
            }
            
            if (!reviewFound) {
              // Try global reviews collection
              const globalReviewRef = doc(db, 'reviews', reportData.reportedItemId);
              const globalReviewSnap = await getDoc(globalReviewRef);
              if (globalReviewSnap.exists()) {
                const reviewData = globalReviewSnap.data();
                reportData.reviewData = {
                  studentName: reviewData.studentName || 'Anonymous',
                  coachName: reviewData.coachName || 'Unknown Coach',
                  rating: reviewData.rating,
                  reviewText: reviewData.reviewText || reviewData.reviews
                };
              }
            }
          } catch (error) {
            console.error('Error fetching review data:', error);
          }
        }
        
        reportsData.push(reportData);
      }

      setReports(reportsData);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const handleReportAction = async (reportId: string, action: 'approve' | 'reject', shouldDeleteReview = false) => {
    setActionLoading(reportId);
    try {
      const reportRef = doc(db, 'reports', reportId);
      await updateDoc(reportRef, {
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewedAt: new Date(),
        reviewedBy: user?.uid
      });

      if (action === 'approve' && shouldDeleteReview) {
        const report = reports.find(r => r.id === reportId);
        if (report && report.reportedItemType === 'review') {
          // Try to delete from coaches subcollection first
          const coachesSnapshot = await getDocs(collection(db, 'coaches'));
          let deleted = false;

          for (const coachDoc of coachesSnapshot.docs) {
            try {
              const reviewRef = doc(db, 'coaches', coachDoc.id, 'reviews', report.reportedItemId);
              const reviewSnap = await getDoc(reviewRef);
              
              if (reviewSnap.exists()) {
                await deleteDoc(reviewRef);
                deleted = true;
                break;
              }
            } catch (error) {
              console.error('Error deleting from coach subcollection:', error);
            }
          }

          // Try global reviews collection if not found in coaches
          if (!deleted) {
            try {
              const globalReviewRef = doc(db, 'reviews', report.reportedItemId);
              await deleteDoc(globalReviewRef);
            } catch (error) {
              console.error('Error deleting from global reviews:', error);
            }
          }
        }
      }

      // Refresh reports
      await fetchReports();
    } catch (error) {
      console.error('Error processing report action:', error);
      alert('Error processing action. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600 mt-2">You don't have admin privileges.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">ReviewMyCoach Administration Panel</p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/admin/coach-onboarding"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Add New Coach
              </Link>
              <Link
                href="/dashboard"
                className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{reports.length}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Reports</dt>
                    <dd className="text-lg font-medium text-gray-900">Flagged Reviews</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Quick Actions</dt>
                    <dd className="text-lg font-medium text-gray-900">Moderate Content</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Coach Management</dt>
                    <dd className="text-lg font-medium text-gray-900">Add New Coaches</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Flagged Reviews */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Flagged Reviews</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Reviews reported by users that require moderation
            </p>
          </div>
          
          {reports.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No pending reports</h3>
              <p className="mt-1 text-sm text-gray-500">All reports have been reviewed.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {reports.map((report) => (
                <li key={report.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-red-600 truncate">
                          Report: {report.reason}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            {report.status}
                          </p>
                        </div>
                      </div>
                      
                      {report.reviewData && (
                        <div className="mt-2 bg-gray-50 rounded-md p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              Review by {report.reviewData.studentName}
                            </span>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < report.reviewData!.rating ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Coach: {report.reviewData.coachName}
                          </p>
                          <p className="text-sm text-gray-800 bg-white p-2 rounded border">
                            &quot;{report.reviewData.reviewText}&quot;
                          </p>
                        </div>
                      )}
                      
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Reason:</span> {report.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Reported on {report.createdAt.toDate().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="ml-4 flex-shrink-0 flex space-x-2">
                      <button
                        onClick={() => handleReportAction(report.id, 'reject')}
                        disabled={actionLoading === report.id}
                        className="bg-green-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                      >
                        {actionLoading === report.id ? 'Processing...' : 'Approve Review'}
                      </button>
                      <button
                        onClick={() => handleReportAction(report.id, 'approve', true)}
                        disabled={actionLoading === report.id}
                        className="bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                      >
                        {actionLoading === report.id ? 'Processing...' : 'Remove Review'}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
} 

export const metadata = {
  title: 'Admin | ReviewMyCoach',
  description: 'Administration panel for content moderation and coach management.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/admin' },
};