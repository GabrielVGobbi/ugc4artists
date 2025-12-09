import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
    src: string;
    alt: string;
    className?: string;
    priority?: boolean;
    width?: number,
    height?: number,
    fetchPriority?: 'high' | 'low' | 'auto'
    fallbackIcon?: React.ReactNode;
    aspectRatio?: 'square' | 'video' | 'auto';
    onLoad?: () => void;
    onError?: () => void;
}

export const OptimizedImage = React.memo(({
    src,
    alt,
    className,
    priority = false,
    fetchPriority = 'low',
    fallbackIcon = <ShoppingBag className="h-8 w-8 text-gray-400" />,
    aspectRatio = 'square',
    width,
    height,
    onLoad,
    onError
}: OptimizedImageProps) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(false);
    const [inView, setInView] = useState(priority);
    const imgRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Intersection Observer para lazy loading
    useEffect(() => {
        if (priority || inView) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.disconnect();
                }
            },
            {
                threshold: 0.1,
                rootMargin: '50px' // Carrega 50px antes de aparecer
            }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [priority, inView]);

    const handleLoad = () => {
        setIsLoaded(true);
        onLoad?.();
    };

    const handleError = () => {
        setError(true);
        onError?.();
    };

    const aspectRatioClass = {
        square: 'aspect-square',
        video: 'aspect-video',
        auto: ''
    }[aspectRatio];

    return (
        <div
            ref={containerRef}
            className={cn(
                'relative overflow-hidden',
                aspectRatioClass,
                className
            )}
        >
            {/* Loading skeleton */}
            {!isLoaded && !error && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}

            {/* Error fallback */}
            {error && (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                    <img src="/assets/images/blank.jpg" alt="blank image" />
                    {/*{fallbackIcon}*/}
                </div>
            )}

            {/* Image */}
            {inView && !error && (
                <img
                    ref={imgRef}
                    src={src}
                    alt={alt}
                    className={cn(
                        'h-full object-contain transition-opacity duration-300',
                        isLoaded ? 'opacity-100' : 'opacity-0'
                    )}
                    onLoad={handleLoad}
                    onError={handleError}
                    loading={priority ? 'eager' : 'lazy'}
                    decoding="async"
                    width={width}
                    height={height}
                    fetchPriority={fetchPriority}
                />
            )}

            {/* Loading indicator para imagens prioritárias */}
            {priority && !isLoaded && !error && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
});

OptimizedImage.displayName = 'OptimizedImage';
