'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '../../components/LoadingSpinner';
import AuthGuard from '../../components/AuthGuard';

interface JobPosting {
  id: string;
  title: string;
  description: string;
  sport: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'volunteer';
  salaryRange?: string;
  requirements: string[];
  postedBy: string;
  postedAt: Date;
  applicationDeadline?: Date;
  isActive: boolean;
}

export default function CoachJobsPage() {
  const { user, loading, hasCoachPro } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    sport: '',
    type: '',
    location: ''
  });

  useEffect(() => {
    if (!loading && !hasCoachPro) {
      router.push('/subscription');
    }
  }, [loading, hasCoachPro, router]);

  useEffect(() => {
    if (hasCoachPro) {
      fetchJobs();
    }
  }, [hasCoachPro, filter]);

  const fetchJobs = async () => {
    try {
      setJobsLoading(true);
      const params = new URLSearchParams();
      
      if (filter.sport) params.set('sport', filter.sport);
      if (filter.type) params.set('type', filter.type);
      if (filter.location) params.set('location', filter.location);

      const response = await fetch(`/api/jobs?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setJobs(data.jobs || []);
      } else {
        setError(data.error || 'Failed to fetch jobs');
      }
    } catch (err) {
      setError('Failed to fetch jobs');
      console.error('Error fetching jobs:', err);
    } finally {
      setJobsLoading(false);
    }
  };

  const handleApplyToJob = async (jobId: string) => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/jobs/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ jobId })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Application submitted successfully!');
        fetchJobs(); // Refresh to update application status
      } else {
        alert(data.error || 'Failed to submit application');
      }
    } catch (err) {
      console.error('Error applying to job:', err);
      alert('Failed to submit application');
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!hasCoachPro) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Coach Pro Required</h1>
          <p className="text-gray-400 mb-6">You need a Coach Pro subscription to access job listings.</p>
          <button
            onClick={() => router.push('/subscription')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Upgrade to Coach Pro
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Job Opportunities</h1>
            <p className="text-gray-400">
              Discover coaching opportunities that match your expertise and passion.
            </p>
          </div>

          {/* Filters */}
          <div className="bg-gray-900 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Filter Jobs</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Sport</label>
                <select
                  value={filter.sport}
                  onChange={(e) => setFilter(prev => ({ ...prev, sport: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">All Sports</option>
                  <option value="football">Football</option>
                  <option value="basketball">Basketball</option>
                  <option value="baseball">Baseball</option>
                  <option value="soccer">Soccer</option>
                  <option value="tennis">Tennis</option>
                  <option value="swimming">Swimming</option>
                  <option value="track">Track & Field</option>
                  <option value="volleyball">Volleyball</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Job Type</label>
                <select
                  value={filter.type}
                  onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">All Types</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="volunteer">Volunteer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                <input
                  type="text"
                  value={filter.location}
                  onChange={(e) => setFilter(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter city, state, or remote"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-200 focus:border-red-300"
                />
              </div>
            </div>
          </div>

          {/* Jobs List */}
          {jobsLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchJobs}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Retry
              </button>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6.294A3.001 3.001 0 0116 6z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No jobs found</h3>
              <p className="text-gray-400">Try adjusting your filters or check back later for new opportunities.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {jobs.map((job) => (
                <div key={job.id} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-2">{job.title}</h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-3">
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {job.location}
                            </span>
                            <span className="bg-gray-800 px-2 py-1 rounded text-xs uppercase font-medium">
                              {job.type}
                            </span>
                            <span className="bg-orange-900 text-orange-200 px-2 py-1 rounded text-xs uppercase font-medium">
                              {job.sport}
                            </span>
                          </div>
                        </div>
                        {job.salaryRange && (
                          <div className="text-right">
                            <p className="text-green-400 font-semibold">{job.salaryRange}</p>
                          </div>
                        )}
                      </div>

                      <p className="text-gray-300 mb-4 leading-relaxed">{job.description}</p>

                      {job.requirements.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-white mb-2">Requirements:</h4>
                          <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                            {job.requirements.map((req, index) => (
                              <li key={index}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500">
                        <span>Posted by {job.postedBy}</span>
                        <span>Posted {new Date(job.postedAt).toLocaleDateString()}</span>
                        {job.applicationDeadline && (
                          <span className="text-orange-400">
                            Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="lg:ml-6 mt-4 lg:mt-0">
                      <button
                        onClick={() => handleApplyToJob(job.id)}
                        className="w-full lg:w-auto bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}