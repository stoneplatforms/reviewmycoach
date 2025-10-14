'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../lib/hooks/useAuth';
import Link from 'next/link';

interface ClassData {
  id: string;
  title: string;
  description: string;
  sport: string;
  type: 'virtual' | 'physical';
  location?: string;
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
  coachName: string;
  coachId: string;
  status: string;
}

const sports = [
  'All Sports', 'Basketball', 'Soccer', 'Tennis', 'Swimming', 'Running', 'Cycling',
  'Yoga', 'Pilates', 'CrossFit', 'Boxing', 'Martial Arts', 'Golf',
  'Baseball', 'Volleyball', 'Badminton', 'Squash', 'Hockey', 'Rugby'
];

const levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];

export default function ClassesPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // Filters
  const [selectedSport, setSelectedSport] = useState('All Sports');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [classes, selectedSport, selectedType, selectedLevel, priceRange, searchQuery]);

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes?limit=50');
      const data = await response.json();
      
      if (response.ok) {
        // Only show active classes with upcoming schedules
        const activeClasses = data.classes.filter((classItem: ClassData) => {
          return classItem.status === 'active' && 
                 classItem.schedules.some(schedule => 
                   new Date(`${schedule.date}T${schedule.startTime}`) > new Date()
                 );
        });
        setClasses(activeClasses);
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

  const applyFilters = () => {
    let filtered = [...classes];

    // Sport filter
    if (selectedSport !== 'All Sports') {
      filtered = filtered.filter(c => c.sport === selectedSport);
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(c => c.type === selectedType);
    }

    // Level filter
    if (selectedLevel !== 'All Levels') {
      filtered = filtered.filter(c => c.level === selectedLevel.toLowerCase());
    }

    // Price filter
    filtered = filtered.filter(c => c.price >= priceRange[0] && c.price <= priceRange[1]);

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.coachName.toLowerCase().includes(query) ||
        c.sport.toLowerCase().includes(query)
      );
    }

    setFilteredClasses(filtered);
  };

  const bookClass = async (classId: string) => {
    if (!user) {
      alert('Please sign in to book a class');
      return;
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/classes/${classId}/book`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok) {
        if (result.checkoutUrl) {
          // Redirect to Stripe checkout
          window.location.href = result.checkoutUrl;
        } else {
          alert(result.message);
          // Refresh classes to update participant count
          fetchClasses();
        }
      } else {
        alert(result.error || 'Failed to book class');
      }
    } catch (error) {
      console.error('Error booking class:', error);
      alert('Failed to book class. Please try again.');
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

  const getNextSchedule = (schedules: any[]) => {
    const upcoming = schedules.filter(schedule => 
      new Date(`${schedule.date}T${schedule.startTime}`) > new Date()
    );
    return upcoming.sort((a, b) => 
      new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime()
    )[0];
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
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Find Your Perfect Class</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Join live virtual or physical classes led by expert coaches from around the world
          </p>
        </div>

        {/* Filters */}
        <div className="bg-neutral-900 rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Search Classes
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, coach, or sport..."
                className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-neutral-800 text-white focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Sport Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sport
              </label>
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-neutral-800 text-white focus:ring-orange-500 focus:border-orange-500"
              >
                {sports.map(sport => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Class Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-neutral-800 text-white focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Types</option>
                <option value="virtual">Virtual Only</option>
                <option value="physical">Physical Only</option>
              </select>
            </div>

            {/* Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Skill Level
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-neutral-800 text-white focus:ring-orange-500 focus:border-orange-500"
              >
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Price Range */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Price Range: ${priceRange[0]} - ${priceRange[1]}
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0"
                max="1000"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                className="flex-1"
              />
              <input
                type="range"
                min="0"
                max="1000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500/50 rounded-lg p-4">
            <div className="text-red-400">{error}</div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-300">
            Showing {filteredClasses.length} of {classes.length} classes
          </p>
        </div>

        {/* Classes Grid */}
        {filteredClasses.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-white">No classes found</h3>
            <p className="mt-2 text-sm text-gray-400">
              Try adjusting your filters to see more classes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((classItem) => {
              const nextSchedule = getNextSchedule(classItem.schedules);
              const spotsLeft = classItem.maxParticipants - classItem.currentParticipants;
              
              return (
                <div key={classItem.id} className="bg-neutral-900 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {classItem.title}
                        </h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            classItem.type === 'virtual' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {classItem.type === 'virtual' ? '💻 Virtual' : '📍 Physical'}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {classItem.sport}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-white">
                          {classItem.price === 0 ? 'Free' : `$${classItem.price}`}
                        </div>
                        <div className="text-sm text-gray-400">
                          {classItem.duration} min
                        </div>
                      </div>
                    </div>

                    {/* Coach */}
                    <div className="mb-4">
                      <Link 
                        href={`/coach/${classItem.coachId}`}
                        className="text-sm text-orange-400 hover:text-orange-300 font-medium"
                      >
                        Coach {classItem.coachName}
                      </Link>
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                      {classItem.description}
                    </p>

                    {/* Next Session */}
                    {nextSchedule && (
                      <div className="mb-4 p-3 bg-neutral-800 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Next Session:</div>
                        <div className="text-white font-medium">
                          {formatDate(nextSchedule.date)} at {formatTime(nextSchedule.startTime)}
                        </div>
                        {classItem.type === 'physical' && classItem.location && (
                          <div className="text-sm text-gray-400 mt-1">
                            📍 {classItem.location}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Availability */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-gray-400">
                        <span className="font-medium text-white">{spotsLeft}</span>
                        <span> spots left</span>
                      </div>
                      <div className="text-sm text-gray-400 capitalize">
                        {classItem.level} level
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(classItem.currentParticipants / classItem.maxParticipants) * 100}%` }}
                      ></div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => bookClass(classItem.id)}
                      disabled={spotsLeft === 0}
                      className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        spotsLeft === 0
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-orange-600 text-white hover:bg-orange-700'
                      }`}
                    >
                      {spotsLeft === 0 ? 'Class Full' : classItem.price === 0 ? 'Join Free Class' : 'Book Now'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Classes | ReviewMyCoach',
  description: 'Find virtual and in-person sports classes from expert coaches. Filter by sport, level, price, and more.',
  alternates: { canonical: '/classes' },
};