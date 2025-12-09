'use client';
import { cn } from '@/lib/utils';
import { CSSProperties, ReactNode } from 'react';

export type InfiniteSliderProps = {
    children: ReactNode;
    gap?: number;
    duration?: number;
    reverse?: boolean;
    pauseOnHover?: boolean;
    className?: string;
};

/**
 * Slider contínuo sem medições ou animações JS.
 * Usa keyframes CSS com dois blocos duplicados para rolar para a esquerda/direita.
 * Isso elimina o bundle do motion/react e evita forced reflow.
 */
export function InfiniteSlider({
    children,
    gap = 32,
    duration = 30,
    reverse = false,
    pauseOnHover = true,
    className,
}: InfiniteSliderProps) {
    const style = {
        '--slider-gap': `${gap}px`,
        '--slider-duration': `${duration}s`,
        '--slider-direction': reverse ? 'reverse' : 'normal',
    } satisfies CSSProperties;

    return (
        <div className={cn('overflow-hidden', className)}>
            <div
                className={cn(
                    'relative w-full',
                    pauseOnHover && 'slider-pause',
                )}
                style={style}
            >
                <div
                    className="slider-track flex w-max animate-slider-marquee"
                    style={{
                        gap: 'var(--slider-gap)',
                        animationDuration: 'var(--slider-duration)',
                        animationDirection: 'var(--slider-direction)' as CSSProperties['animationDirection'],
                    }}
                    aria-hidden
                >
                    {children}
                    {children}
                </div>
            </div>
        </div>
    );
}
