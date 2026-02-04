import { memo } from 'react'
import {
    Rocket,
    FileText,
    Video,
    Users,
    Calendar,
    CheckCircle,
    Lightbulb,
    Sparkles,
    Target,
    Zap,
    Heart,
    Star,
    type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    VISUAL_COMPONENTS,
    type OnboardingSlide as SlideType,
    type SlideVisual,
} from './onboarding-config'

// ─────────────────────────────────────────────────────────────────────────────
// Mapa de Ícones Disponíveis
// ─────────────────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
    Rocket,
    FileText,
    Video,
    Users,
    Calendar,
    CheckCircle,
    Sparkles,
    Target,
    Zap,
    Heart,
    Star,
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente de Visual
// ─────────────────────────────────────────────────────────────────────────────

interface VisualRendererProps {
    visual: SlideVisual
}

function VisualRenderer({ visual }: VisualRendererProps) {
    switch (visual.type) {
        case 'icon': {
            const IconComponent = ICON_MAP[visual.icon]
            if (!IconComponent) return null

            return (
                <div
                    className={cn(
                        'w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-primary/5',
                        'flex items-center justify-center shadow-lg shadow-primary/10'
                    )}
                >
                    <IconComponent
                        className={cn('w-12 h-12', visual.iconColor || 'text-primary')}
                        strokeWidth={1.5}
                    />
                </div>
            )
        }

        case 'image': {
            return (
                <div
                    className={cn(
                        'overflow-hidden rounded-2xl shadow-lg',
                        visual.fullWidth ? 'w-full' : 'w-56 h-40',
                        visual.className
                    )}
                >
                    <img
                        src={visual.src}
                        alt={visual.alt || ''}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                </div>
            )
        }

        case 'video': {
            return (
                <div className="w-56 h-40 overflow-hidden rounded-2xl shadow-lg bg-black">
                    <video
                        src={visual.src}
                        poster={visual.poster}
                        loop={visual.loop ?? true}
                        autoPlay={visual.autoPlay ?? true}
                        muted={visual.muted ?? true}
                        playsInline
                        className="w-full h-full object-cover"
                    />
                </div>
            )
        }

        case 'component': {
            const Component = VISUAL_COMPONENTS[visual.componentId]
            if (!Component) {
                console.warn(`Componente "${visual.componentId}" não encontrado em VISUAL_COMPONENTS`)
                return null
            }

            return <Component {...(visual.props || {})} />
        }

        default:
            return null
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente Principal do Slide
// ─────────────────────────────────────────────────────────────────────────────

interface OnboardingSlideProps {
    slide: SlideType
    isActive: boolean
}

function OnboardingSlideComponent({ slide, isActive }: OnboardingSlideProps) {
    if (!isActive) return null

    return (
        <div className="flex flex-col items-center justify-start p-6 pt-8 min-h-full">
            {/* Visual (Ícone, Imagem, Vídeo ou Componente) */}
            {slide.visual && (
                <div className="mb-6 shrink-0">
                    <VisualRenderer visual={slide.visual} />
                </div>
            )}

            {/* Título */}
            <h3 className="text-xl font-bold text-foreground text-center mb-3">
                {slide.title}
            </h3>

            {/* Descrição */}
            <p className="text-muted-foreground text-center text-sm leading-relaxed max-w-sm mb-4">
                {slide.description}
            </p>

            {/* Highlight */}
            {slide.highlight && (
                <div className="bg-primary/10 text-primary text-xs font-medium px-4 py-2 rounded-full mb-4">
                    {slide.highlight}
                </div>
            )}

            {/* Tips */}
            {slide.tips && slide.tips.length > 0 && (
                <div className="w-full max-w-sm space-y-2 pb-4">
                    {slide.tips.map((tip, index) => (
                        <div
                            key={index}
                            className="flex items-start gap-2 text-xs text-muted-foreground"
                        >
                            <Lightbulb className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                            <span>{tip}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export const OnboardingSlide = memo(OnboardingSlideComponent)
