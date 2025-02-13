import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Photo } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Play } from "lucide-react";
import { Modal, ModalContent, ModalTitle } from "@/components/ui/modal";
import React from 'react';

interface ImageCardProps {
  photo: Photo;
  showHomePageToggle?: boolean;
}

export default function ImageCard({ photo, showHomePageToggle = false }: ImageCardProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isHovering, setIsHovering] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const mediaRef = React.useRef<HTMLImageElement | HTMLVideoElement>(null);
  const modalVideoRef = React.useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const handleMediaLoad = React.useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleMediaError = React.useCallback(() => {
    setHasError(true);
    setIsLoaded(true);
  }, []);

  // Handle hover state for grid view videos
  const handleMouseEnter = React.useCallback(() => {
    if (photo.type === 'video' && mediaRef.current) {
      setIsHovering(true);
      const videoElement = mediaRef.current as HTMLVideoElement;
      videoElement.muted = true;
      videoElement.play().catch(console.error);
    }
  }, [photo.type]);

  const handleMouseLeave = React.useCallback(() => {
    if (photo.type === 'video' && mediaRef.current) {
      setIsHovering(false);
      const videoElement = mediaRef.current as HTMLVideoElement;
      videoElement.pause();
      videoElement.currentTime = 0;
    }
  }, [photo.type]);

  // Stop videos when modal closes
  React.useEffect(() => {
    if (!isModalOpen && modalVideoRef.current) {
      modalVideoRef.current.pause();
      modalVideoRef.current.currentTime = 0;
    }
    if (!isModalOpen && mediaRef.current && photo.type === 'video') {
      (mediaRef.current as HTMLVideoElement).pause();
      (mediaRef.current as HTMLVideoElement).currentTime = 0;
      setIsPlaying(false);
    }
  }, [isModalOpen, photo.type]);

  const handleHomePageToggle = async (checked: boolean) => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/photos/${photo.id}/homepage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ homePage: checked }),
      });

      if (!response.ok) throw new Error('Failed to update photo');

      await queryClient.invalidateQueries({ queryKey: ['/api/photos'] });

      toast({
        title: "Success",
        description: `${photo.type === 'video' ? 'Video' : 'Photo'} ${checked ? 'added to' : 'removed from'} home page`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update media",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };


  React.useEffect(() => {
    const currentRef = mediaRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && currentRef) {
            if (photo.type === 'video') {
              const videoElement = currentRef as HTMLVideoElement;
              videoElement.src = photo.imageUrl;
              videoElement.load();
            } else {
              (currentRef as HTMLImageElement).src = photo.imageUrl;
            }
            observer.unobserve(currentRef);
          }
        });
      },
      { rootMargin: '50px' }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [photo.imageUrl, photo.type]);

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input')) {
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <>
      <Card 
        className="overflow-hidden group relative w-full h-full cursor-pointer"
        onClick={handleCardClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative w-full h-full">
          {!isLoaded && !hasError && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}

          {photo.type === 'video' ? (
            <div className="relative w-full h-full">
              <video
                ref={mediaRef as React.RefObject<HTMLVideoElement>}
                className={`
                  w-full h-full object-contain bg-black
                  ${isLoaded ? 'opacity-100' : 'opacity-0'}
                  ${hasError ? 'hidden' : ''}
                `}
                playsInline
                preload="metadata"
                muted
                loop
                controls={false}
                onLoadedData={handleMediaLoad}
                onError={handleMediaError}
              />
              {!isHovering && (
                <button
                  type="button"
                  className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/60 transition-colors"
                  aria-label="Play video"
                >
                  <Play className="w-16 h-16 text-white" />
                </button>
              )}
            </div>
          ) : (
            <img
              ref={mediaRef as React.RefObject<HTMLImageElement>}
              alt={photo.title}
              loading="lazy"
              decoding="async"
              data-src={photo.imageUrl}
              className={`
                w-full h-full object-cover
                transition-all duration-300 group-hover:scale-105
                ${isLoaded ? 'opacity-100' : 'opacity-0'}
                ${hasError ? 'hidden' : ''}
              `}
              onLoad={handleMediaLoad}
              onError={handleMediaError}
            />
          )}

          {hasError && (
            <div className="absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground">
              Failed to load {photo.type}
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <h3 className="text-white font-medium truncate">{photo.title}</h3>
            {showHomePageToggle && (
              <div className="mt-2 flex items-center gap-2">
                <Switch
                  checked={photo.homePage}
                  onCheckedChange={handleHomePageToggle}
                  disabled={isUpdating}
                  aria-label="Toggle home page visibility"
                />
                <span className="text-white text-sm">Show on Home</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
        <ModalContent className="w-auto h-auto max-w-[95vw] max-h-[95vh] p-4 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm">
          <ModalTitle className="sr-only">{photo.title}</ModalTitle>
          {photo.type === 'video' ? (
            <video
              ref={modalVideoRef}
              src={photo.imageUrl}
              controls
              className="w-full h-auto max-h-[85vh]"
              playsInline
            />
          ) : (
            <img
              src={photo.imageUrl}
              alt={photo.title}
              className="max-w-full max-h-[85vh] w-auto h-auto object-contain"
            />
          )}
        </ModalContent>
      </Modal>
    </>
  );
}