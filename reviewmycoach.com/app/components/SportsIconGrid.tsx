'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Map Firestore sport names to GIF filenames in public/Widgets
function toGifFilename(sport: string): string {
  // Known direct mappings based on existing assets
  const overrides: Record<string, string> = {
    'Track & Field': 'Track and Field',
    'Track and Field': 'Track and Field',
    'Beach Volleyball': 'beach volleyball',
    'Ice Hockey': 'Ice Hockey',
    'Field Hockey': 'Field Hockey',
    'Cheerleading': 'Cheer and Dance',
    'Cheer': 'Cheer and Dance',
    'Cheer & Dance': 'Cheer and Dance',
    'Cross Country': 'Cross Country',
  };

  const base = overrides[sport] || sport;
  return `${base}.gif`;
}

export default function SportsIconGrid() {
  const [sports, setSports] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSports = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/sports');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load sports');
        setSports(Array.isArray(data.sports) ? data.sports : []);
      } catch (e) {
        console.error('Error fetching sports', e);
        setError('Failed to load sports');
      } finally {
        setLoading(false);
      }
    };
    fetchSports();
  }, []);

  const visibleSports = useMemo(() => {
    // Only show sports that likely have GIFs based on known assets
    const knownGifs = new Set([
      'Lacrosse','Baseball','Basketball','beach volleyball','Bowling','Cheer and Dance','Cross Country','Fencing','Field Hockey','Golf','Gymnastics','Helmet','Ice Hockey','Rowing','Rugby','Skiing','Soccer','Softball','Swimming','Tennis','Track and Field','Volleyball','Water Polo','Wrestling'
    ]);
    return sports.filter((s) => {
      const name = toGifFilename(s).replace(/\.gif$/i, '');
      return knownGifs.has(name);
    });
  }, [sports]);

  if (loading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-8 w-48 bg-gray-100 rounded mb-4"></div>
        <div className="columns-[12rem] sm:columns-[14rem] md:columns-[16rem] lg:columns-[18rem] [column-gap:1rem] md:[column-gap:1.5rem]">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="inline-block w-full break-inside-avoid mb-4">
              <div className="h-32 bg-gray-50 border border-gray-200 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return null;
  }

  if (visibleSports.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-6 max-w-screen-2xl mx-auto">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Explore by Sport</h3>
          <p className="text-gray-600">Tap a sport to see matching coaches</p>
        </div>
        <div className="columns-[12rem] sm:columns-[14rem] md:columns-[16rem] lg:columns-[18rem] [column-gap:1rem] md:[column-gap:1.5rem]">
          {visibleSports.map((sport) => {
            const gifFile = toGifFilename(sport);
            const imgSrc = `/Widgets/${gifFile}`;
            return (
              <Link
                key={sport}
                href={`/search?sport=${encodeURIComponent(sport)}`}
                className="group inline-block w-full break-inside-avoid mb-4"
              >
                <div className="flex flex-col items-center gap-3 p-4 bg-black border border-red-900/40 rounded-xl hover:shadow-lg hover:border-red-700/60 transition-all">
                  <div className="relative w-16 h-16 md:w-20 md:h-20 overflow-hidden rounded-lg border border-red-200 bg-red-50">
                    {/* Using next/image for optimization; fall back handled by static assets */}
                    <Image src={imgSrc} alt={`${sport} icon`} fill sizes="80px" className="object-contain" />
                  </div>
                  <div className="w-full text-center">
                    <div className="text-gray-900 font-semibold text-sm md:text-base leading-tight break-words">{sport}</div>
                    <div className="text-gray-500 text-xs md:text-sm leading-snug break-words">Browse {sport} coaches</div>
                  </div>
                  <svg className="w-5 h-5 text-red-400 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}


