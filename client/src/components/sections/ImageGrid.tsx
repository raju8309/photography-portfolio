import React from 'react';
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from '@tanstack/react-query';
import { Photo } from "@shared/schema";
import ImageCard from './ImageCard';

interface ImageGridProps {
  mediaType?: 'image' | 'video';
  maxItems?: number;
  featured?: boolean;
  homePage?: boolean;
  category?: string;
  showHomePageToggle?: boolean;
}

export default function ImageGrid({ 
  mediaType = 'image', 
  maxItems, 
  featured, 
  homePage, 
  category,
  showHomePageToggle = false 
}: ImageGridProps) {
  const { data: photos = [], isLoading, error } = useQuery<Photo[]>({
    queryKey: ['/api/photos'],
    staleTime: 30000, // Cache for 30 seconds
    select: React.useCallback((data: Photo[]) => {
      let filtered = data.filter(photo => 
        (!mediaType || photo.type === mediaType) &&
        (featured === undefined || photo.featured === featured) &&
        (homePage === undefined || photo.homePage === homePage) &&
        (category === undefined || photo.category === category)
      );
      return maxItems ? filtered.slice(0, maxItems) : filtered;
    }, [mediaType, featured, homePage, category, maxItems]),
    refetchOnWindowFocus: false,
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" role="status" aria-label="Loading media">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={`skeleton-${i}`} className="relative pt-[100%]">
            <Card className="absolute inset-0">
              <Skeleton className="w-full h-full rounded-lg" />
            </Card>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive" role="alert">
        Failed to load images
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="text-center text-muted-foreground" role="status">
        No media available
      </div>
    );
  }

  return (
    <div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      role="grid"
      aria-label={`${mediaType === 'video' ? 'Video' : 'Photo'} gallery`}
    >
      {photos.map((photo) => (
        <div key={photo.id} className="relative pt-[100%]">
          <div className="absolute inset-0">
            <ImageCard photo={photo} showHomePageToggle={showHomePageToggle} />
          </div>
        </div>
      ))}
    </div>
  );
}