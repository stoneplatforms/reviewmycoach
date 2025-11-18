'use client';

import { useState, useEffect } from 'react';
import { auth } from '../../../lib/firebase-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ClassData {
  id: string;
  title: string;
  description: string;
  sport: string;
  type: 'virtual' | 'physical';
  location?: string;
  zoomJoinUrl?: string;
  zoomStartUrl?: string;
  maxParticipants: number;
  currentParticipants: number;
  price: number;
  currency: string;
  duration: number;
  schedules: {
    date: string;
    startTime: string;
    endTime: string;
  }[];
  level: string;
  status: string;
  participants: any[];
  createdAt: string;
}

export default function ClassesManagementPage() {
  const [user, setUser] = useState<any>(null);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        fetchClasses(user);
      } else {
        router.push('/signin');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchClasses = async (user: any) => {
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/classes?coachId=${user.uid}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setClasses(data.classes || []);
      } else {
        setError(data.error || 'Failed to fetch classes');
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      setError('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const deleteClass = async (classId: string) => {
    if (!confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      return;
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/classes?id=${classId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setClasses(classes.filter(c => c.id !== classId));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete class');
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('Failed to delete class');
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'completed':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getTypeBadge = (type: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    if (type === 'virtual') {
      return `${baseClasses} bg-purple-100 text-purple-800`;
    } else {
      return `${baseClasses} bg-orange-100 text-orange-800`;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const isUpcoming = (schedule: any) => {
    const classDateTime = new Date(`${schedule.date}T${schedule.startTime}`);
    return classDateTime > new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">My Classes</h1>
              <p className="mt-2 text-gray-300">
                Manage your virtual and physical classes
              </p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/dashboard/coach"
                className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </Link>
              <Link
                href="/dashboard/coach/classes/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Class
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500/50 rounded-lg p-4">
            <div className="text-red-400">{error}</div>
          </div>
        )}

        {/* Classes Grid */}
        {classes.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-white">No classes yet</h3>
            <p className="mt-2 text-sm text-gray-400">
              Create your first class to start teaching students.
            </p>
            <div className="mt-6">
              <Link
                href="/dashboard/coach/classes/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Your First Class
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem) => (
              <div key={classItem.id} className="bg-neutral-900 rounded-lg shadow-lg overflow-hidden">
                {/* Class Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {classItem.title}
                      </h3>
                      <div className="flex items-center space-x-2 mb-3">
                        <span className={getTypeBadge(classItem.type)}>
                          {classItem.type === 'virtual' ? '💻 Virtual' : '📍 Physical'}
                        </span>
                        <span className={getStatusBadge(classItem.status)}>
                          {classItem.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-white">
                        ${classItem.price}
                      </div>
                      <div className="text-sm text-gray-400">
                        {classItem.duration} min
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {classItem.description}
                  </p>

                  <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-2">Upcoming Sessions:</div>
                    {classItem.schedules.filter(schedule => isUpcoming(schedule)).slice(0, 2).map((schedule, index) => (
                      <div key={index} className="text-sm text-white mb-1">
                        {formatDate(schedule.date)} at {formatTime(schedule.startTime)}
                      </div>
                    ))}
                    {classItem.schedules.filter(schedule => isUpcoming(schedule)).length === 0 && (
                      <div className="text-sm text-gray-500">No upcoming sessions</div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-400">
                      <span className="font-medium text-white">{classItem.currentParticipants}</span>
                      <span> / {classItem.maxParticipants} participants</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {classItem.sport} • {classItem.level}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(classItem.currentParticipants / classItem.maxParticipants) * 100}%` }}
                    ></div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedClass(classItem);
                        setShowParticipants(true);
                      }}
                      className="flex-1 px-3 py-2 text-sm border border-gray-600 rounded-md text-white hover:bg-neutral-800 transition-colors"
                    >
                      View Participants
                    </button>
                    
                    {classItem.type === 'virtual' && classItem.zoomStartUrl && (
                      <a
                        href={classItem.zoomStartUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-2 text-sm bg-green-600 rounded-md text-white hover:bg-green-700 transition-colors text-center"
                      >
                        Start Zoom
                      </a>
                    )}
                    
                    <button
                      onClick={() => deleteClass(classItem.id)}
                      className="px-3 py-2 text-sm border border-red-600 rounded-md text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Participants Modal */}
        {showParticipants && selectedClass && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-neutral-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">
                    Participants - {selectedClass.title}
                  </h2>
                  <button
                    onClick={() => setShowParticipants(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                {selectedClass.participants && selectedClass.participants.length > 0 ? (
                  <div className="space-y-4">
                    {selectedClass.participants.map((participant, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
                        <div>
                          <div className="font-medium text-white">{participant.userName}</div>
                          <div className="text-sm text-gray-400">{participant.userEmail}</div>
                          <div className="text-xs text-gray-500">
                            Joined: {new Date(participant.bookedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-sm text-green-400">
                          Confirmed
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="mt-4 text-gray-400">No participants yet</p>
                    <p className="text-sm text-gray-500">Students will appear here once they book your class</p>
                  </div>
                )}

                {selectedClass.type === 'virtual' && selectedClass.zoomJoinUrl && (
                  <div className="mt-6 p-4 bg-neutral-800 rounded-lg">
                    <h3 className="font-medium text-white mb-2">Zoom Meeting Details</h3>
                    <div className="text-sm text-gray-300 mb-2">
                      <strong>Join URL:</strong> 
                      <a href={selectedClass.zoomJoinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 ml-2">
                        {selectedClass.zoomJoinUrl}
                      </a>
                    </div>
                    <p className="text-xs text-gray-400">
                      Share this URL with your participants or they'll receive it automatically when they book.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}