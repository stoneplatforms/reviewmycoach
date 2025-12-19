'use client';

import Image from 'next/image';
import { useState } from 'react';

interface TierCardImageProps {
  tierNumber: number;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

/**
 * Component to display tier card images with protection against downloading
 * Images are served through API route and have right-click protection
 */
export default function TierCardImage({ 
  tierNumber, 
  alt, 
  className = '',
  width = 512,
  height = 512
}: TierCardImageProps) {
  const [imageError, setImageError] = useState(false);

  const handleContextMenu = (e: React.MouseEvent) => {
    // Prevent right-click context menu (makes downloading harder)
    e.preventDefault();
    return false;
  };

  const handleDragStart = (e: React.DragEvent) => {
    // Prevent dragging image to desktop
    e.preventDefault();
    return false;
  };

  if (imageError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-200 ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">Tier {tierNumber}</span>
      </div>
    );
  }

  return (
    <div
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
      className="select-none"
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      <Image
        src={`/api/cards/tier/images/${tierNumber}`}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={() => setImageError(true)}
        draggable={false}
        // Prevent easy downloading
        unoptimized // Uses our API route directly
        style={{ 
          pointerEvents: 'none', // Prevent right-click in some browsers
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      />
    </div>
  );
}

