'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/hooks/useAuth';
import Link from 'next/link';

interface Job {
  id: string;
  title: string;
  description: string;
  sport: string;
  location: string;
  budget: number;
  deadline: string;
  requiredSkills: string[];
  postedBy: string;
  posterEmail?: string;
  postedAt: string;
  status: 'open' | 'closed' | 'filled';
}

interface Application {
  id: string;
  jobId: string;
  coachId: string;
  coachName: string;
  coachEmail: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  appliedAt: string;
}

export default function CoachJobsPage() {
  const { user, isCoach } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCoachPro, setIsCoachPro] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [submittingApplication, setSubmittingApplication] = useState(false);

  useEffect(() => {
    if (user && isCoach) {
      checkCoachProStatus();
    }
  }, [user, isCoach]);

  useEffect(() => {
    if (isCoachPro && !loading) {
      fetchJobs();
      fetchMyApplications();
    }
  }, [isCoachPro, loading]);

  const checkCoachProStatus = async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/subscription/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsCoachPro(data.isActive && data.plan === 'pro');
        setLoading(false);
      } else {
        setIsCoachPro(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking Coach Pro status:', error);
      setIsCoachPro(false);
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/jobs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch jobs');
      }
    } catch (error) {
      setError('Failed to fetch jobs');
      console.error('Error:', error);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/jobs/applications?coachId=' + user?.uid, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleApplyToJob = async (job: Job) => {
    if (!applicationMessage.trim()) {
      alert('Please enter a message with your application');
      return;
    }

    setSubmittingApplication(true);
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/jobs/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          jobId: job.id,
          message: applicationMessage,
          idToken: token
        })
      });

      if (response.ok) {
        alert('Application submitted successfully!');
        setShowApplicationModal(false);
        setApplicationMessage('');
        setSelectedJob(null);
        fetchMyApplications();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application');
    } finally {
      setSubmittingApplication(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatBudget = (budget: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(budget);
  };

  const hasAppliedToJob = (jobId: string) => {
    return applications.some(app => app.jobId === jobId);
  };

  if (!isCoach) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">Only coaches can access this page.</p>
        </div>
      </div>
    );
  }

  if (!isCoachPro) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center bg-gray-900 border border-gray-700 rounded-lg p-12">
            <div className="w-20 h-20 bg-[color:rgb(255_0_2_/_.15)] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-[var(--brand-red)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Coach Pro Required</h1>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto text-lg">
              Access to the job board is exclusive to Coach Pro members. Upgrade your account to browse and apply for coaching opportunities.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-left">
              <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
                <div className="w-12 h-12 bg-[color:rgb(163_182_196_/_.10)] rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[var(--brand-silver-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8zM16 10h.01" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Browse Job Postings</h3>
                <p className="text-gray-400 text-sm">Access hundreds of coaching opportunities from clients looking for expert trainers.</p>
              </div>
              
              <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Direct Communication</h3>
                <p className="text-gray-400 text-sm">Message clients directly through the platform to discuss requirements and rates.</p>
              </div>
              
              <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Priority Applications</h3>
                <p className="text-gray-400 text-sm">Your applications get priority consideration from clients looking for qualified coaches.</p>
              </div>
            </div>

            <Link
              href="/subscription"
              className="inline-flex items-center px-8 py-4 btn-brand rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105"
            >
              Upgrade to Coach Pro
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand-red)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="border-b border-gray-700 pb-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Job Board</h1>
              <p className="text-gray-300 text-lg">Browse and apply for coaching opportunities</p>
            </div>
            <div className="flex items-center space-x-2 bg-[color:rgb(255_0_2_/_.12)] border border-[var(--brand-red)]/30 px-4 py-2 rounded-lg">
              <div className="w-2 h-2 bg-[var(--brand-red)] rounded-full animate-pulse"></div>
              <span className="text-[var(--brand-red)] font-medium">Coach Pro Active</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-400 px-6 py-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">{job.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {job.location}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Due {formatDate(job.deadline)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{formatBudget(job.budget)}</div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[color:rgb(163_182_196_/_.15)] text-[var(--brand-silver-blue)]">
                    {job.sport}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-300 mb-4 line-clamp-3">{job.description}</p>
              
              {job.requiredSkills && job.requiredSkills.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.slice(0, 3).map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded border border-gray-600">
                        {skill}
                      </span>
                    ))}
                    {job.requiredSkills.length > 3 && (
                      <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded border border-gray-600">
                        +{job.requiredSkills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <div className="text-xs text-gray-500">
                  Posted {formatDate(job.postedAt)}
                </div>
                <div className="flex items-center space-x-3">
                  {hasAppliedToJob(job.id) ? (
                    <span className="px-4 py-2 bg-green-600/20 text-green-400 text-sm rounded-lg border border-green-600/30">
                      Applied
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedJob(job);
                        setShowApplicationModal(true);
                      }}
                      className="px-4 py-2 btn-brand text-sm rounded-lg"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {jobs.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8zM16 10h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-400 mb-2">No Jobs Available</h3>
            <p className="text-gray-600">Check back later for new coaching opportunities.</p>
          </div>
        )}

        {/* Application Modal */}
        {showApplicationModal && selectedJob && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-gray-200 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Apply for Position</h2>
                  <button
                    onClick={() => {
                      setShowApplicationModal(false);
                      setSelectedJob(null);
                      setApplicationMessage('');
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="mb-6 p-4 bg-gray-800 border border-gray-600 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">{selectedJob.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                    <span>{selectedJob.location}</span>
                    <span>{formatBudget(selectedJob.budget)}</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">{selectedJob.sport}</span>
                  </div>
                  <p className="text-gray-300 text-sm">{selectedJob.description}</p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-white mb-2">
                    Cover Letter / Message *
                  </label>
                  <textarea
                    value={applicationMessage}
                    onChange={(e) => setApplicationMessage(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-[var(--brand-red)] focus:border-transparent"
                    placeholder="Tell the client why you're the perfect coach for this job..."
                    required
                  />
                </div>

                <div className="flex items-center justify-end space-x-4">
                  <button
                    onClick={() => {
                      setShowApplicationModal(false);
                      setSelectedJob(null);
                      setApplicationMessage('');
                    }}
                    className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleApplyToJob(selectedJob)}
                    disabled={submittingApplication || !applicationMessage.trim()}
                    className="px-6 py-2 btn-brand rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingApplication ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}