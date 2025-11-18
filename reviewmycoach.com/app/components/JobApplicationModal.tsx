'use client';

import { useState } from 'react';
import { User } from 'firebase/auth';

interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  location: string;
  sport: string;
  deadline: Date;
  requiredSkills: string[];
}

interface JobApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  user: User | null;
  onApplicationSubmitted: () => void;
}

export default function JobApplicationModal({
  isOpen,
  onClose,
  job,
  user,
  onApplicationSubmitted
}: JobApplicationModalProps) {
  const [formData, setFormData] = useState({
    coverLetter: '',
    hourlyRate: '',
    estimatedHours: '',
    availability: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to apply for jobs');
      return;
    }

    // Validate form
    if (!formData.coverLetter.trim()) {
      setError('Cover letter is required');
      return;
    }

    if (!formData.hourlyRate || isNaN(parseFloat(formData.hourlyRate))) {
      setError('Valid hourly rate is required');
      return;
    }

    if (!formData.estimatedHours || isNaN(parseFloat(formData.estimatedHours))) {
      setError('Valid estimated hours is required');
      return;
    }

    if (!formData.availability.trim()) {
      setError('Availability is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const idToken = await user.getIdToken();
      
      const response = await fetch('/api/jobs/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: job.id,
          coverLetter: formData.coverLetter.trim(),
          hourlyRate: parseFloat(formData.hourlyRate),
          estimatedHours: parseFloat(formData.estimatedHours),
          availability: formData.availability.trim(),
          idToken
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onApplicationSubmitted();
        onClose();
        // Reset form
        setFormData({
          coverLetter: '',
          hourlyRate: '',
          estimatedHours: '',
          availability: ''
        });
      } else {
        setError(data.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setError('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Apply for Job</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Job Details */}
        <div className="p-6 border-b bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{job.title}</h3>
          <div className="flex gap-4 text-sm text-gray-600 mb-3">
            <span>📍 {job.location}</span>
            <span>🏃 {job.sport}</span>
            <span>💰 ${job.budget.toLocaleString()}</span>
          </div>
          <p className="text-gray-700 text-sm line-clamp-3">{job.description}</p>
          {job.requiredSkills.length > 0 && (
            <div className="mt-3">
              <span className="text-sm font-medium text-gray-700">Required Skills: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {job.requiredSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Cover Letter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Letter *
              </label>
              <textarea
                name="coverLetter"
                value={formData.coverLetter}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell the client why you're the perfect fit for this job..."
                required
              />
            </div>

            {/* Hourly Rate and Estimated Hours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hourly Rate ($) *
                </label>
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleInputChange}
                  min="1"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="50.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Hours *
                </label>
                <input
                  type="number"
                  name="estimatedHours"
                  value={formData.estimatedHours}
                  onChange={handleInputChange}
                  min="1"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="10"
                  required
                />
              </div>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability *
              </label>
              <textarea
                name="availability"
                value={formData.availability}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Monday-Friday 9 AM - 5 PM, Weekends flexible..."
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 