'use client';

import { useState, useEffect } from 'react';
import { auth } from '../../../../lib/firebase-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ClassFormData {
  title: string;
  description: string;
  sport: string;
  type: 'virtual' | 'physical';
  location: string;
  zoomLink: string;
  maxParticipants: number;
  price: number;
  currency: string;
  duration: number;
  schedules: {
    date: string;
    startTime: string;
    endTime: string;
  }[];
  recurringPattern?: {
    type: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: string;
  };
  requirements: string[];
  equipment: string[];
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';
  tags: string[];
}

const sports = [
  'Basketball', 'Soccer', 'Tennis', 'Swimming', 'Running', 'Cycling',
  'Yoga', 'Pilates', 'CrossFit', 'Boxing', 'Martial Arts', 'Golf',
  'Baseball', 'Volleyball', 'Badminton', 'Squash', 'Hockey', 'Rugby',
  'Skiing', 'Snowboarding', 'Surfing', 'Rock Climbing'
];

export default function CreateClassPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [autoCreateZoom, setAutoCreateZoom] = useState(true);
  const router = useRouter();

  const [formData, setFormData] = useState<ClassFormData>({
    title: '',
    description: '',
    sport: '',
    type: 'virtual',
    location: '',
    zoomLink: '',
    maxParticipants: 10,
    price: 0,
    currency: 'usd',
    duration: 60,
    schedules: [{
      date: '',
      startTime: '',
      endTime: ''
    }],
    requirements: [],
    equipment: [],
    level: 'all',
    tags: []
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        router.push('/signin');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleInputChange = (field: keyof ClassFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleScheduleChange = (index: number, field: string, value: string) => {
    const newSchedules = [...formData.schedules];
    newSchedules[index] = {
      ...newSchedules[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      schedules: newSchedules
    }));
  };

  const addSchedule = () => {
    setFormData(prev => ({
      ...prev,
      schedules: [...prev.schedules, { date: '', startTime: '', endTime: '' }]
    }));
  };

  const removeSchedule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      schedules: prev.schedules.filter((_, i) => i !== index)
    }));
  };

  const addListItem = (field: 'requirements' | 'equipment' | 'tags', item: string) => {
    if (item.trim() && !formData[field].includes(item.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], item.trim()]
      }));
    }
  };

  const removeListItem = (field: 'requirements' | 'equipment' | 'tags', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = await user.getIdToken();

      // Validate form
      if (!formData.title || !formData.sport || !formData.schedules[0].date) {
        throw new Error('Please fill in all required fields');
      }

      if (formData.type === 'physical' && !formData.location) {
        throw new Error('Location is required for physical classes');
      }

      if (formData.type === 'virtual' && !formData.zoomLink && !autoCreateZoom) {
        throw new Error('Zoom link is required for virtual classes');
      }

      // Calculate end times if not provided
      const schedulesWithEndTime = formData.schedules.map(schedule => {
        if (!schedule.endTime && schedule.startTime) {
          const start = new Date(`2000-01-01T${schedule.startTime}`);
          const end = new Date(start.getTime() + formData.duration * 60000);
          return {
            ...schedule,
            endTime: end.toTimeString().slice(0, 5)
          };
        }
        return schedule;
      });

      const classData = {
        ...formData,
        schedules: schedulesWithEndTime,
        recurringPattern: isRecurring ? formData.recurringPattern : undefined
      };

      // Create class
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(classData)
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle Stripe Connect account requirement specially
        if (result.error === 'Stripe Connect account required') {
          const shouldRedirect = confirm(
            `🏦 Payment Setup Required\n\nYou need to connect a Stripe account to receive payments for your classes.\n\nWould you like to set up payments now?`
          );
          
          if (shouldRedirect) {
            router.push('/dashboard/coach/stripe');
            return;
          }
        }
        
        throw new Error(result.error || 'Failed to create class');
      }

      // Auto-create Zoom meeting if requested and it's a virtual class
      if (formData.type === 'virtual' && autoCreateZoom && !formData.zoomLink) {
        try {
          const zoomResponse = await fetch('/api/zoom/meeting', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              classId: result.id,
              classData: classData
            })
          });

          const zoomResult = await zoomResponse.json();
          
          if (zoomResponse.ok) {
            setSuccess(`Class created successfully! Zoom meeting has been set up automatically. Join URL: ${zoomResult.joinUrl}`);
          } else {
            setSuccess(`Class created successfully! Please manually set up the Zoom meeting. Error: ${zoomResult.error}`);
          }
        } catch (zoomError) {
          setSuccess('Class created successfully! Please manually set up the Zoom meeting.');
        }
      } else {
        setSuccess('Class created successfully!');
      }

      // Redirect after delay
      setTimeout(() => {
        router.push('/dashboard/coach');
      }, 3000);

    } catch (error) {
      console.error('Error creating class:', error);
      setError(error instanceof Error ? error.message : 'Failed to create class');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand-red)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Create New Class</h1>
              <p className="mt-2 text-gray-300">
                Set up a virtual or physical class for your students
              </p>
            </div>
            <Link
              href="/dashboard/coach"
              className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-neutral-900 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Class Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:ring-red-200 focus:border-red-300"
                  placeholder="e.g., Beginner Basketball Training"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sport *
                </label>
                <select
                  value={formData.sport}
                  onChange={(e) => handleInputChange('sport', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:ring-red-200 focus:border-red-300"
                  required
                >
                  <option value="">Select a sport</option>
                  {sports.map(sport => (
                    <option key={sport} value={sport}>{sport}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:ring-red-200 focus:border-red-300"
                  placeholder="Describe what students will learn in this class..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Skill Level
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => handleInputChange('level', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:ring-red-200 focus:border-red-300"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Participants
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.maxParticipants}
                  onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:ring-red-200 focus:border-red-300"
                />
              </div>
            </div>
          </div>

          {/* Class Type & Location */}
          <div className="bg-neutral-900 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Class Type & Location</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Class Type *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center p-4 border border-gray-600 rounded-lg cursor-pointer hover:bg-neutral-800 transition-colors">
                    <input
                      type="radio"
                      name="type"
                      value="virtual"
                      checked={formData.type === 'virtual'}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-600"
                    />
                    <div className="ml-3">
                      <div className="text-white font-medium">Virtual Class</div>
                      <div className="text-gray-400 text-sm">Conducted online via Zoom</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-4 border border-gray-600 rounded-lg cursor-pointer hover:bg-neutral-800 transition-colors">
                    <input
                      type="radio"
                      name="type"
                      value="physical"
                      checked={formData.type === 'physical'}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-600"
                    />
                    <div className="ml-3">
                      <div className="text-white font-medium">Physical Class</div>
                      <div className="text-gray-400 text-sm">In-person at a location</div>
                    </div>
                  </label>
                </div>
              </div>

              {formData.type === 'virtual' && (
                <div>
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="autoCreateZoom"
                      checked={autoCreateZoom}
                      onChange={(e) => setAutoCreateZoom(e.target.checked)}
                      className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-600 rounded"
                    />
                    <label htmlFor="autoCreateZoom" className="ml-2 text-sm text-gray-300">
                      Automatically create Zoom meeting
                    </label>
                  </div>
                  
                  {!autoCreateZoom && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Zoom Meeting Link *
                      </label>
                      <input
                        type="url"
                        value={formData.zoomLink}
                        onChange={(e) => handleInputChange('zoomLink', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-neutral-800 text-white focus:ring-orange-500 focus:border-orange-500"
                        placeholder="https://zoom.us/j/..."
                        required={!autoCreateZoom}
                      />
                    </div>
                  )}
                </div>
              )}

              {formData.type === 'physical' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:ring-red-200 focus:border-red-300"
                    placeholder="e.g., Central Park Basketball Court, 123 Main St, City"
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-neutral-900 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Pricing</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Price per Class
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-400">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:ring-red-200 focus:border-red-300"
                    placeholder="0.00"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-400">
                  Set to $0 for free classes
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-neutral-800 text-white focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="usd">USD</option>
                  <option value="eur">EUR</option>
                  <option value="gbp">GBP</option>
                  <option value="cad">CAD</option>
                </select>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-neutral-900 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Schedule</h2>
              <button
                type="button"
                onClick={addSchedule}
                className="inline-flex items-center px-3 py-2 border border-gray-600 rounded-md text-sm font-medium text-white bg-neutral-800 hover:bg-neutral-700"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Date
              </button>
            </div>

            <div className="space-y-4">
              {formData.schedules.map((schedule, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-600 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={schedule.date}
                      onChange={(e) => handleScheduleChange(index, 'date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-neutral-800 text-white focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      value={schedule.startTime}
                      onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-neutral-800 text-white focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min="15"
                      max="480"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-neutral-800 text-white focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    {formData.schedules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSchedule(index)}
                        className="w-full px-3 py-2 border border-red-600 rounded-md text-sm font-medium text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-600 rounded"
                />
                <label htmlFor="isRecurring" className="ml-2 text-sm text-gray-300">
                  Make this a recurring class
                </label>
              </div>

              {isRecurring && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-600 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Repeat
                    </label>
                    <select
                      value={formData.recurringPattern?.type || 'weekly'}
                      onChange={(e) => handleInputChange('recurringPattern', {
                        ...formData.recurringPattern,
                        type: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-neutral-800 text-white focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Every
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={formData.recurringPattern?.interval || 1}
                      onChange={(e) => handleInputChange('recurringPattern', {
                        ...formData.recurringPattern,
                        interval: parseInt(e.target.value)
                      })}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-neutral-800 text-white focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      End Date (optional)
                    </label>
                    <input
                      type="date"
                      value={formData.recurringPattern?.endDate || ''}
                      onChange={(e) => handleInputChange('recurringPattern', {
                        ...formData.recurringPattern,
                        endDate: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-neutral-800 text-white focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <div>
              {error && (
                <div className="text-red-400 text-sm">{error}</div>
              )}
              {success && (
                <div className="text-green-400 text-sm">{success}</div>
              )}
            </div>

            <div className="flex space-x-4">
              <Link
                href="/dashboard/coach"
                className="px-6 py-2 border border-gray-600 rounded-md text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    Creating...
                  </>
                ) : (
                  'Create Class'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}