/**
 * Widgets visuais customizados para o onboarding
 */

import { useState, useEffect } from 'react'
import {
    Sparkles, CheckCircle2, ArrowRight, Music, Heart, MessageCircle,
    Send, Bookmark, MoreHorizontal, Video, Clock, Users,
    Calendar, DollarSign, Target, MapPin, Filter,
    FileText, Rocket
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────────────────
// Widget: Social Media Feed Animado
// ─────────────────────────────────────────────────────────────────────────────

const CREATORS = [
    { name: 'Ana Silva', avatar: '👩‍🎤', followers: '125K' },
    { name: 'Lucas Beat', avatar: '🧑‍🎨', followers: '89K' },
    { name: 'Mari Santos', avatar: '👩‍💻', followers: '234K' },
]

const REACTIONS = ['🔥', '❤️', '😍', '🎵', '💜', '✨']

export function SocialFeedWidget() {
    const [likes, setLikes] = useState(1247)
    const [isLiked, setIsLiked] = useState(false)
    const [showReaction, setShowReaction] = useState<string | null>(null)
    const [floatingHearts, setFloatingHearts] = useState<Array<{ id: number; left: number }>>([])
    const [comments, setComments] = useState(89)
    const [currentCreator, setCurrentCreator] = useState(0)
    const [progress, setProgress] = useState(0)

    // Posições fixas para as barras de áudio
    const barOffsets = [3, 7, 2, 9, 4, 6, 1, 8, 5, 3, 7, 2]

    // Animação de progresso do vídeo
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => (prev >= 100 ? 0 : prev + 2))
        }, 100)
        return () => clearInterval(interval)
    }, [])

    // Rotação de criadores
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentCreator(prev => (prev + 1) % CREATORS.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    // Likes automáticos
    useEffect(() => {
        const interval = setInterval(() => {
            setLikes(prev => prev + Math.floor(Math.random() * 3) + 1)
            // Floating heart animation com posição pré-calculada
            const leftPos = 30 + Math.random() * 40
            setFloatingHearts(prev => [...prev, { id: Date.now(), left: leftPos }])
            setTimeout(() => {
                setFloatingHearts(prev => prev.slice(1))
            }, 1000)
        }, 2000)
        return () => clearInterval(interval)
    }, [])

    // Comentários automáticos
    useEffect(() => {
        const interval = setInterval(() => {
            setComments(prev => prev + 1)
        }, 4500)
        return () => clearInterval(interval)
    }, [])

    // Reações aleatórias
    useEffect(() => {
        const interval = setInterval(() => {
            const reaction = REACTIONS[Math.floor(Math.random() * REACTIONS.length)]
            setShowReaction(reaction)
            setTimeout(() => setShowReaction(null), 800)
        }, 2500)
        return () => clearInterval(interval)
    }, [])

    const creator = CREATORS[currentCreator]

    const handleLike = () => {
        setIsLiked(!isLiked)
        setLikes(prev => isLiked ? prev - 1 : prev + 1)
    }

    return (
        <div className="w-64 bg-background rounded-2xl border shadow-2xl overflow-hidden">
            {/* Header do Post */}
            <div className="p-3 flex items-center justify-between border-b">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary via-purple-500 to-pink-500 flex items-center justify-center text-sm animate-pulse">
                        {creator.avatar}
                    </div>
                    <div className="transition-all duration-300">
                        <p className="text-xs font-semibold text-foreground leading-tight">{creator.name}</p>
                        <p className="text-[10px] text-muted-foreground">{creator.followers} seguidores</p>
                    </div>
                </div>
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </div>

            {/* Área do Vídeo */}
            <div className="relative aspect-[4/5] bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
                {/* Visualização de música */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                        {/* Ondas de áudio animadas */}
                        <div className="flex items-end gap-1 h-16">
                            {barOffsets.map((offset, i) => (
                                <div
                                    key={i}
                                    className="w-1.5 bg-gradient-to-t from-primary to-purple-400 rounded-full"
                                    style={{
                                        height: `${20 + Math.sin((progress / 10) + i) * 30 + offset}px`,
                                        transition: 'height 0.1s ease',
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Floating Hearts */}
                {floatingHearts.map((heart) => (
                    <div
                        key={heart.id}
                        className="absolute right-4 bottom-20 animate-float-up"
                        style={{ left: `${heart.left}%` }}
                    >
                        <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                    </div>
                ))}

                {/* Reaction Popup */}
                {showReaction && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl animate-bounce-in">
                        {showReaction}
                    </div>
                )}

                {/* Music Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center">
                            <Music className="w-3 h-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-white/90 font-medium truncate">Sua música aqui</p>
                            <p className="text-[9px] text-white/60">Som original</p>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
                    <div
                        className="h-full bg-white transition-all duration-100"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={handleLike} className="transition-transform active:scale-125">
                            <Heart
                                className={cn(
                                    'w-6 h-6 transition-all',
                                    isLiked ? 'text-red-500 fill-red-500 scale-110' : 'text-foreground'
                                )}
                            />
                        </button>
                        <MessageCircle className="w-6 h-6 text-foreground" />
                        <Send className="w-6 h-6 text-foreground" />
                    </div>
                    <Bookmark className="w-6 h-6 text-foreground" />
                </div>

                {/* Likes Counter */}
                <p className="text-xs font-semibold text-foreground">
                    {likes.toLocaleString('pt-BR')} curtidas
                </p>

                {/* Caption */}
                <p className="text-xs text-foreground">
                    <span className="font-semibold">{creator.name.split(' ')[0].toLowerCase()}</span>
                    {' '}Conteúdo incrível com sua música! 🎵✨
                </p>

                {/* Comments */}
                <p className="text-[10px] text-muted-foreground">
                    Ver todos os {comments} comentários
                </p>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// CSS Animations (adicionar ao seu CSS global ou usar inline)
// ─────────────────────────────────────────────────────────────────────────────

// Adicione isso ao seu app.css:
/*
@keyframes float-up {
    0% { opacity: 1; transform: translateY(0) scale(1); }
    100% { opacity: 0; transform: translateY(-80px) scale(1.5); }
}
.animate-float-up {
    animation: float-up 1s ease-out forwards;
}

@keyframes bounce-in {
    0% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
    50% { transform: translate(-50%, -50%) scale(1.3); }
    100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
.animate-bounce-in {
    animation: bounce-in 0.4s ease-out forwards;
}
*/

// ─────────────────────────────────────────────────────────────────────────────
// Widget: Fluxo de Criação de Campanha (mantido como backup)
// ─────────────────────────────────────────────────────────────────────────────

export function CampaignFlowWidget() {
    const steps = [
        {
            icon: Music,
            label: 'Artista',
            description: 'Você cria',
            color: 'from-violet-500 to-purple-600',
        },
        {
            icon: Sparkles,
            label: 'Campanha',
            description: 'Publica',
            color: 'from-primary to-primary/80',
        },
        {
            icon: Heart,
            label: 'Criadores',
            description: 'Produzem',
            color: 'from-emerald-500 to-green-600',
        },
    ]

    return (
        <div className="w-full max-w-xs">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                    <div key={step.label} className="flex items-center">
                        <div className="flex flex-col items-center">
                            <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg', step.color)}>
                                <step.icon className="w-7 h-7 text-white" strokeWidth={1.5} />
                            </div>
                            <span className="mt-2 text-xs font-semibold text-foreground">{step.label}</span>
                            <span className="text-[10px] text-muted-foreground">{step.description}</span>
                        </div>
                        {index < steps.length - 1 && (
                            <ArrowRight className="mx-2 w-5 h-5 text-muted-foreground/50" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Widget: Animação de Boas-vindas
// ─────────────────────────────────────────────────────────────────────────────

interface WelcomeWidgetProps {
    userName?: string
}

export function WelcomeWidget({ userName }: WelcomeWidgetProps) {
    return (
        <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Círculos animados de fundo */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 rounded-full bg-primary/5 animate-ping" />
                <div className="absolute inset-4 rounded-full bg-primary/10 animate-pulse" />
            </div>

            {/* Conteúdo central */}
            <div className="relative z-10 text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-8 h-8 text-white" />
                </div>
                {userName && (
                    <p className="text-sm font-medium text-foreground">
                        Olá, {userName}!
                    </p>
                )}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Widget: Preview de Steps
// ─────────────────────────────────────────────────────────────────────────────

interface StepPreviewWidgetProps {
    steps?: string[]
    currentStep?: number
}

export function StepPreviewWidget({
    steps = ['Básico', 'Conteúdo', 'Filtros', 'Orçamento', 'Revisão'],
    currentStep = 0,
}: StepPreviewWidgetProps) {
    return (
        <div className="w-full max-w-xs bg-muted/50 rounded-2xl p-4">
            <div className="space-y-2">
                {steps.map((step, index) => (
                    <div
                        key={step}
                        className={cn(
                            'flex items-center gap-3 p-2 rounded-lg transition-all',
                            index === currentStep && 'bg-primary/10',
                            index < currentStep && 'opacity-50'
                        )}
                    >
                        <div
                            className={cn(
                                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                                index < currentStep
                                    ? 'bg-emerald-500 text-white'
                                    : index === currentStep
                                        ? 'bg-primary text-white'
                                        : 'bg-muted-foreground/20 text-muted-foreground'
                            )}
                        >
                            {index < currentStep ? (
                                <CheckCircle2 className="w-4 h-4" />
                            ) : (
                                index + 1
                            )}
                        </div>
                        <span
                            className={cn(
                                'text-sm',
                                index === currentStep
                                    ? 'font-medium text-foreground'
                                    : 'text-muted-foreground'
                            )}
                        >
                            {step}
                        </span>
                        {index === currentStep && (
                            <ArrowRight className="w-4 h-4 text-primary ml-auto" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Widget: Card de Feature
// ─────────────────────────────────────────────────────────────────────────────

interface FeatureCardWidgetProps {
    icon?: 'sparkles' | 'check' | 'arrow'
    title?: string
    description?: string
    color?: 'primary' | 'emerald' | 'amber' | 'purple'
}

export function FeatureCardWidget({
    icon = 'sparkles',
    title = 'Feature',
    description = 'Descrição da feature',
    color = 'primary',
}: FeatureCardWidgetProps) {
    const colorClasses = {
        primary: 'from-primary/20 to-primary/5 text-primary',
        emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-500',
        amber: 'from-amber-500/20 to-amber-500/5 text-amber-500',
        purple: 'from-purple-500/20 to-purple-500/5 text-purple-500',
    }

    const icons = {
        sparkles: Sparkles,
        check: CheckCircle2,
        arrow: ArrowRight,
    }

    const IconComponent = icons[icon]

    return (
        <div
            className={cn(
                'w-56 p-4 rounded-2xl bg-gradient-to-br shadow-lg',
                colorClasses[color]
            )}
        >
            <IconComponent className="w-8 h-8 mb-3" />
            <h4 className="font-semibold text-foreground mb-1">{title}</h4>
            <p className="text-xs text-muted-foreground">{description}</p>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Widget: Mockup de Form
// ─────────────────────────────────────────────────────────────────────────────

interface FormMockupWidgetProps {
    fields?: Array<{ label: string; filled?: boolean }>
}

export function FormMockupWidget({
    fields = [
        { label: 'Nome da campanha', filled: true },
        { label: 'Tipo de conteúdo', filled: true },
        { label: 'Objetivo', filled: false },
    ],
}: FormMockupWidgetProps) {
    return (
        <div className="w-56 bg-background border rounded-2xl p-4 shadow-lg">
            <div className="space-y-3">
                {fields.map((field, index) => (
                    <div key={index}>
                        <div className="text-[10px] text-muted-foreground mb-1">
                            {field.label}
                        </div>
                        <div
                            className={cn(
                                'h-8 rounded-lg',
                                field.filled
                                    ? 'bg-primary/10 border border-primary/20'
                                    : 'bg-muted border border-dashed border-muted-foreground/30'
                            )}
                        />
                    </div>
                ))}
            </div>
            <div className="mt-4 flex justify-end">
                <div className="px-3 py-1.5 bg-primary text-white text-xs rounded-lg">
                    Próximo
                </div>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Widget: Stats/Métricas
// ─────────────────────────────────────────────────────────────────────────────

interface StatsWidgetProps {
    stats?: Array<{ label: string; value: string; trend?: 'up' | 'down' }>
}

export function StatsWidget({
    stats = [
        { label: 'Criadores', value: '150+' },
        { label: 'Campanhas', value: '50+' },
        { label: 'Satisfação', value: '98%' },
    ],
}: StatsWidgetProps) {
    return (
        <div className="flex gap-4">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className="text-center p-3 bg-muted/50 rounded-xl"
                >
                    <div className="text-lg font-bold text-foreground">
                        {stat.value}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                        {stat.label}
                    </div>
                </div>
            ))}
        </div>
    )
}


// ─────────────────────────────────────────────────────────────────────────────
// Widget: Informações Básicas (Formulário Animado)
// ─────────────────────────────────────────────────────────────────────────────

export function BasicInfoWidget() {
    const [activeField, setActiveField] = useState(0)
    const [typing, setTyping] = useState('')
    const texts = ['Lançamento Verão 2024', 'UGC', 'Viralizar no TikTok']
    const labels = ['Nome da campanha', 'Tipo de conteúdo', 'Objetivo']

    useEffect(() => {
        const text = texts[activeField]
        let charIndex = 0
        setTyping('')

        const typeInterval = setInterval(() => {
            if (charIndex <= text.length) {
                setTyping(text.slice(0, charIndex))
                charIndex++
            } else {
                clearInterval(typeInterval)
                setTimeout(() => {
                    setActiveField(prev => (prev + 1) % 3)
                }, 1500)
            }
        }, 80)

        return () => clearInterval(typeInterval)
    }, [activeField])

    return (
        <div className="w-64 bg-background border rounded-2xl p-4 shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold">Informações Básicas</span>
            </div>

            <div className="space-y-3">
                {labels.map((label, index) => (
                    <div key={label} className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">{label}</label>
                        <div
                            className={cn(
                                'h-9 rounded-lg px-3 flex items-center text-xs transition-all duration-300',
                                index === activeField
                                    ? 'bg-primary/10 border-2 border-primary ring-2 ring-primary/20'
                                    : index < activeField
                                        ? 'bg-muted border border-border'
                                        : 'bg-muted/50 border border-dashed border-muted-foreground/30'
                            )}
                        >
                            {index < activeField ? (
                                <span className="text-foreground">{texts[index]}</span>
                            ) : index === activeField ? (
                                <span className="text-foreground">
                                    {typing}
                                    <span className="animate-pulse">|</span>
                                </span>
                            ) : null}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Widget: Especificações de Conteúdo (Plataformas Animadas)
// ─────────────────────────────────────────────────────────────────────────────

export function ContentSpecsWidget() {
    const [selectedPlatforms, setSelectedPlatforms] = useState<number[]>([])
    const [duration, setDuration] = useState(0)

    const platforms = [
        { name: 'TikTok', icon: '📱', color: 'from-black to-gray-800' },
        { name: 'Reels', icon: '📸', color: 'from-pink-500 to-purple-600' },
        { name: 'Shorts', icon: '▶️', color: 'from-red-500 to-red-600' },
        { name: 'Kwai', icon: '🎬', color: 'from-orange-500 to-yellow-500' },
    ]

    useEffect(() => {
        const interval = setInterval(() => {
            setSelectedPlatforms(prev => {
                if (prev.length >= platforms.length) return []
                const next = prev.length
                return [...prev, next]
            })
        }, 800)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            setDuration(prev => (prev >= 60 ? 15 : prev + 5))
        }, 500)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="w-64 bg-background border rounded-2xl p-4 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <Video className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold">Conteúdo</span>
            </div>

            {/* Plataformas */}
            <div className="grid grid-cols-4 gap-2 mb-4">
                {platforms.map((platform, index) => (
                    <div
                        key={platform.name}
                        className={cn(
                            'aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-300',
                            selectedPlatforms.includes(index)
                                ? `bg-gradient-to-br ${platform.color} scale-105 shadow-lg`
                                : 'bg-muted/50'
                        )}
                    >
                        <span className="text-lg">{platform.icon}</span>
                        <span className={cn(
                            'text-[8px] mt-0.5',
                            selectedPlatforms.includes(index) ? 'text-white' : 'text-muted-foreground'
                        )}>
                            {platform.name}
                        </span>
                    </div>
                ))}
            </div>

            {/* Duração */}
            <div className="bg-muted/50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Duração
                    </span>
                    <span className="text-xs font-bold text-primary">{duration}s</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-300"
                        style={{ width: `${(duration / 60) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Widget: Filtros e Público (Animado)
// ─────────────────────────────────────────────────────────────────────────────

export function AudienceFiltersWidget() {
    const [activeFilter, setActiveFilter] = useState(0)
    const [matchCount, setMatchCount] = useState(0)

    const filters = [
        { icon: Users, label: 'Gênero', value: 'Todos', color: 'text-blue-500' },
        { icon: Calendar, label: 'Idade', value: '18-35', color: 'text-green-500' },
        { icon: MapPin, label: 'Estados', value: 'SP, RJ, MG', color: 'text-amber-500' },
        { icon: Target, label: 'Nicho', value: 'Música', color: 'text-purple-500' },
    ]

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFilter(prev => (prev + 1) % filters.length)
        }, 1200)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            setMatchCount(prev => {
                const target = 847
                const diff = target - prev
                return prev + Math.ceil(diff * 0.1)
            })
        }, 50)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="w-64 bg-background border rounded-2xl p-4 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <Filter className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold">Filtros</span>
            </div>

            {/* Filtros */}
            <div className="space-y-2 mb-4">
                {filters.map((filter, index) => (
                    <div
                        key={filter.label}
                        className={cn(
                            'flex items-center justify-between p-2 rounded-lg transition-all duration-300',
                            index === activeFilter
                                ? 'bg-primary/10 scale-[1.02]'
                                : 'bg-muted/30'
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <filter.icon className={cn('w-4 h-4', filter.color)} />
                            <span className="text-xs text-muted-foreground">{filter.label}</span>
                        </div>
                        <span className="text-xs font-medium">{filter.value}</span>
                    </div>
                ))}
            </div>

            {/* Match Counter */}
            <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-emerald-600">{matchCount}</div>
                <div className="text-[10px] text-muted-foreground">criadores disponíveis</div>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Widget: Orçamento e Cronograma (Animado)
// ─────────────────────────────────────────────────────────────────────────────

export function BudgetTimelineWidget() {
    const [budget, setBudget] = useState(0)
    const [creators, setCreators] = useState(0)
    const [dayProgress, setDayProgress] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setBudget(prev => Math.min(prev + 150, 5000))
            setCreators(prev => Math.min(prev + 1, 10))
        }, 100)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            setDayProgress(prev => (prev >= 100 ? 0 : prev + 5))
        }, 200)
        return () => clearInterval(interval)
    }, [])

    const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']

    return (
        <div className="w-64 bg-background border rounded-2xl p-4 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold">Orçamento</span>
            </div>

            {/* Budget Display */}
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-4 mb-4">
                <div className="text-center">
                    <div className="text-3xl font-bold text-amber-600">
                        R$ {budget.toLocaleString('pt-BR')}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                        {creators} criadores × R$ 500
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>Cronograma</span>
                    <span className="text-primary font-medium">7 dias</span>
                </div>
                <div className="flex gap-1">
                    {days.map((day, index) => (
                        <div key={day} className="flex-1 text-center">
                            <div
                                className={cn(
                                    'h-8 rounded-lg mb-1 transition-all duration-300',
                                    (dayProgress / 100) * 5 > index
                                        ? 'bg-gradient-to-t from-primary to-primary/60'
                                        : 'bg-muted/50'
                                )}
                            />
                            <span className="text-[8px] text-muted-foreground">{day}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Widget: Tudo Pronto (Celebração)
// ─────────────────────────────────────────────────────────────────────────────

export function ReadyToLaunchWidget() {
    const [pulse, setPulse] = useState(false)

    // Confetti pré-gerado (valores fixos)
    const confetti = [
        { id: 0, left: 10, delay: 0.2 }, { id: 1, left: 25, delay: 0.5 },
        { id: 2, left: 40, delay: 0.1 }, { id: 3, left: 55, delay: 0.8 },
        { id: 4, left: 70, delay: 0.3 }, { id: 5, left: 85, delay: 0.6 },
        { id: 6, left: 15, delay: 1.0 }, { id: 7, left: 30, delay: 1.2 },
        { id: 8, left: 45, delay: 0.4 }, { id: 9, left: 60, delay: 0.9 },
        { id: 10, left: 75, delay: 1.5 }, { id: 11, left: 90, delay: 0.7 },
        { id: 12, left: 20, delay: 1.8 }, { id: 13, left: 35, delay: 1.1 },
        { id: 14, left: 50, delay: 0.0 }, { id: 15, left: 65, delay: 1.4 },
        { id: 16, left: 80, delay: 1.6 }, { id: 17, left: 5, delay: 1.3 },
        { id: 18, left: 95, delay: 0.15 }, { id: 19, left: 48, delay: 1.7 },
    ]

    useEffect(() => {
        const interval = setInterval(() => {
            setPulse(prev => !prev)
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    const checkItems = [
        { label: 'Informações básicas', done: true },
        { label: 'Especificações', done: true },
        { label: 'Filtros configurados', done: true },
        { label: 'Orçamento definido', done: true },
    ]

    return (
        <div className="w-64 bg-background border rounded-2xl p-4 shadow-2xl relative overflow-hidden">
            {/* Confetti */}
            {confetti.map((particle) => (
                <div
                    key={particle.id}
                    className="absolute w-2 h-2 rounded-full animate-fall"
                    style={{
                        left: `${particle.left}%`,
                        top: -10,
                        backgroundColor: ['#ff7900', '#8b5cf6', '#10b981', '#f59e0b'][particle.id % 4],
                        animationDelay: `${particle.delay}s`,
                    }}
                />
            ))}

            {/* Header */}
            <div className="text-center mb-4 relative z-10">

                <h3 className="text-lg font-bold mt-3">Pronto para lançar!</h3>
            </div>

            {/* Checklist */}
            <div className="space-y-2 relative z-10">
                {checkItems.map((item, index) => (
                    <div
                        key={item.label}
                        className="flex items-center gap-2 p-2 bg-emerald-500/10 rounded-lg"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs text-foreground">{item.label}</span>
                    </div>
                ))}
            </div>

            {/* CTA */}
            <div className="mt-4 relative z-10">
                <div className="w-full py-2 bg-gradient-to-r from-primary to-orange-500 rounded-xl text-center text-white text-sm font-semibold shadow-lg">
                    Publicar Campanha
                </div>
            </div>
        </div>
    )
}
