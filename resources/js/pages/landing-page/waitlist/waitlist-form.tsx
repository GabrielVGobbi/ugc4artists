import { useMemo, useState, useEffect } from 'react'
import type { ComponentType, FormEvent } from 'react'
import { Link, useForm } from '@inertiajs/react'
import { z } from 'zod'
import waitlist from '@/routes/waitlist'
import { Container, ContainerSection } from '@/components/landing-page/container'
import { FadeIn } from '@/components/fade-in'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import {
    Mail,
    Phone,
    MapPin,
    Mic2,
    Sparkles,
    Headphones,
    CheckCircle2,
    ArrowRight,
    X,
    Check,
    User,
    Instagram,
    Youtube,
    Twitter,
    Guitar,
    Badge,
    PiggyBank,
    FastForward,
    FileText,
    CornerUpLeft,
    Handshake,
} from 'lucide-react'
import { home } from '@/routes'

type ArtistType = 'singer' | 'instrumentalist' | 'content_creator' | 'other'
type ParticipationType = 'paid_campaign' | 'music_launch'
type AvailabilityLevel = 'high' | 'medium' | 'low'

const waitlistSchema = z
    .object({
        stage_name: z
            .string()
            .trim()
            .min(2, 'Compartilhe seu nome artístico.'),
        instagram_handle: z
            .string()
            .trim()
            .max(120, 'Use até 120 caracteres.')
            .refine(
                (value) => value === '' || /^@[\w._]{3,30}$/i.test(value),
                'Inclua @ e ao menos 3 caracteres.'
            ),
        youtube_handle: z
            .string()
            .trim()
            .max(120, 'Use até 120 caracteres.')
            .refine(
                (value) => value === '' || /^@?[\w._-]{3,60}$/i.test(value),
                'Informe o usuário ou deixe vazio.'
            ),
        tiktok_handle: z
            .string()
            .trim()
            .max(120, 'Use até 120 caracteres.')
            .refine(
                (value) => value === '' || /^@[\w._]{3,30}$/i.test(value),
                'Inclua @ e ao menos 3 caracteres.'
            ),
        contact_email: z
            .string()
            .trim()
            .email('E-mail inválido.'),
        artist_types: z
            .array(z.enum(['singer', 'instrumentalist', 'content_creator', 'other']))
            .nonempty('Selecione ao menos um perfil.'),
        other_artist_type: z
            .string()
            .trim()
            .max(160, 'Use até 160 caracteres.')
            .optional(),
        main_genre: z
            .string()
            .trim()
            .max(160, 'Use até 160 caracteres.')
            .optional(),
        participation_types: z
            .array(z.enum(['paid_campaign', 'music_launch']))
            .nonempty('Escolha uma forma de participação.'),
        portfolio_link: z
            .string()
            .trim()
            .max(255, 'Use até 255 caracteres.')
            .refine(
                (value) => value === '' || /^https?:\/\//i.test(value),
                'Informe um link completo (https://).'
            ),
        city_state: z
            .string()
            .trim()
            .max(160, 'Use até 160 caracteres.')
            .optional(),
        creation_availability: z.enum(['high', 'medium', 'low'], {
            message: 'Escolha sua disponibilidade.',
        }),
        terms: z.boolean().refine((value) => value, {
            message: 'É necessário aceitar o regulamento.',
        }),
    })
    .superRefine((values, ctx) => {
        if (!values.instagram_handle && !values.youtube_handle && !values.tiktok_handle) {
            ctx.addIssue({
                path: ['instagram_handle'],
                code: z.ZodIssueCode.custom,
                message: 'Informe ao menos uma @ de rede social.',
            })
        }

        if (values.artist_types.includes('other') && !values.other_artist_type) {
            ctx.addIssue({
                path: ['other_artist_type'],
                code: z.ZodIssueCode.custom,
                message: 'Conte qual é o outro perfil artístico.',
            })
        }
    })

type WaitlistFormValues = z.infer<typeof waitlistSchema>

const initialFormState: WaitlistFormValues = {
    stage_name: '',
    instagram_handle: '',
    youtube_handle: '',
    tiktok_handle: '',
    contact_email: '',
    artist_types: [],
    other_artist_type: '',
    main_genre: '',
    participation_types: [],
    portfolio_link: '',
    city_state: '',
    creation_availability: 'high',
    terms: false,
}

const artistProfiles: Array<{
    value: ArtistType
    title: string
    description: string
    icon: ComponentType<{ className?: string }>
}> = [
        { value: 'singer', title: 'Cantor(a)', description: 'Voz principal ou backing.', icon: Mic2 },
        { value: 'instrumentalist', title: 'Instrumentista', description: 'Cordas, percussão ou sopro.', icon: Guitar },
        { value: 'content_creator', title: 'Criador(a) musical', description: 'Faz conteúdos e trends.', icon: Headphones },
        { value: 'other', title: 'Outro', description: 'Conte seu formato exclusivo.', icon: Badge },
    ]

const participationOptions: Array<{
    value: ParticipationType
    title: string
    description: string
    icon: ComponentType<{ className?: string }>
}> = [
        {
            value: 'paid_campaign',
            title: 'Divulgar músicas e ser pago',
            description: 'Receba por vídeo aprovado.',
            icon: PiggyBank,
        },
        {
            value: 'music_launch',
            title: 'Lançar música',
            description: 'Conte com a UGC 4ARTISTS.',
            icon: FastForward,
        },
    ]

const availabilityOptions: Array<{
    value: AvailabilityLevel
    title: string
    description: string
}> = [
        { value: 'high', title: 'Alta', description: 'Gravo vídeos toda semana.' },
        { value: 'medium', title: 'Média', description: 'Produzo de vez em quando.' },
        { value: 'low', title: 'Baixa', description: 'Quero começar agora.' },
    ]

const steps = [
    {
        number: 0,
        id: 'profile',
        title: 'Seção 1 · Perfil do Artista',
        subtitle: 'Quem é você no palco e nas redes?',
        icon: User,
        fields: [
            'stage_name',
            'instagram_handle',
            'youtube_handle',
            'tiktok_handle',
            'contact_email',
            'artist_types',
            'other_artist_type',
            'main_genre',
        ] as Array<keyof WaitlistFormValues>,
    },
    {
        number: 1,
        id: 'participation',
        title: 'Seção 2 · Tipo de Participação',
        subtitle: 'Escolha como quer atuar nas campanhas.',
        icon: Handshake,
        fields: [
            'participation_types',
            'portfolio_link',
            'city_state',
            'creation_availability',
        ] as Array<keyof WaitlistFormValues>,
    },
    {
        number: 2,
        id: 'terms',
        icon: FileText,
        title: 'Seção 3 · Termos de Participação',
        subtitle: 'Leia e confirme o regulamento oficial.',
        fields: ['terms'] as Array<keyof WaitlistFormValues>,
    },
]

function formatHandle(value: string): string {
    const trimmed = value.trim()

    if (!trimmed) {
        return ''
    }

    const sanitized = trimmed.replace(/^@+/, '')

    return sanitized ? `@${sanitized}` : ''
}

function toggleSelection<T extends string>(current: T[], value: T): T[] {
    return current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
}

interface WaitListFormProps {
	onStepChange?: (step: number, isSuccess: boolean) => void
	onInteraction?: () => void
}

/**
 * Formulário multi-etapas para captar artistas interessados na lista de espera UGC 4ARTISTS.
 */
export function WaitListForm({ onStepChange, onInteraction }: WaitListFormProps) {
    const { data, setData, post, processing, errors, reset } = useForm<WaitlistFormValues>(
        initialFormState,
    )
    const [currentStep, setCurrentStep] = useState(0)
    const [clientErrors, setClientErrors] = useState<
        Partial<Record<keyof WaitlistFormValues, string>>
    >({})

    const totalSteps = steps.length
    const successStepIndex = totalSteps
    const isSuccessStep = currentStep === successStepIndex

    const progressValue = useMemo(() => {
        if (isSuccessStep) {
            return 100
        }

        const progressPerStep = 100 / totalSteps

        return Math.round((currentStep + 1) * progressPerStep)
    }, [currentStep, isSuccessStep, totalSteps])

    // Notify parent component about step changes
    useEffect(() => {
        if (onStepChange) {
            onStepChange(currentStep, isSuccessStep)
        }
    }, [currentStep, isSuccessStep, onStepChange])

    const clearClientError = (field: keyof WaitlistFormValues) => {
        setClientErrors((prev) => {
            if (!prev[field]) {
                return prev
            }

            const next = { ...prev }
            delete next[field]

            return next
        })
    }

    const validateStep = (index: number, validateAll = false): boolean => {
        const validation = waitlistSchema.safeParse(data)

        if (validation.success) {
            setClientErrors({})

            return true
        }

        const fieldsToCheck = validateAll
            ? (Object.keys(data) as Array<keyof WaitlistFormValues>)
            : steps[index]?.fields ?? []
        const issues = validation.error.issues.filter((issue) =>
            fieldsToCheck.includes(issue.path[0] as keyof WaitlistFormValues),
        )

        if (!issues.length) {
            return !validateAll
        }

        const nextErrors: Partial<Record<keyof WaitlistFormValues, string>> = {}

        issues.forEach((issue) => {
            const field = issue.path[0] as keyof WaitlistFormValues
            nextErrors[field] = issue.message
        })

        setClientErrors((prev) => ({ ...prev, ...nextErrors }))

        return false
    }

    const handleNextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => prev + 1)
            //window.scrollTo({ top: 500, behavior: 'smooth' })
        }
    }

    const handlePrevStep = () => {
        if (currentStep === 0) {
            return
        }

        setCurrentStep((prev) => Math.max(0, prev - 1))
        //window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!validateStep(totalSteps - 1, true)) {
            return
        }

        post(waitlist.store.url(), {
            preserveScroll: true,
            onSuccess: () => {
                reset()
                setClientErrors({})
                setCurrentStep(successStepIndex)
                //window.scrollTo({ top: 0, behavior: 'smooth' })
            },
        })
    }

    const getError = (field: keyof WaitlistFormValues) =>
        errors[field] ?? clientErrors[field]

    const handleFieldChange = <K extends keyof WaitlistFormValues>(
        field: K,
        value: WaitlistFormValues[K],
    ) => {
        // Notificar interação na primeira mudança
        if (onInteraction) {
            onInteraction()
        }
        setData(field, value as any)
        clearClientError(field)
    }

    const handleHandleChange = (
        field: 'instagram_handle' | 'youtube_handle' | 'tiktok_handle',
        value: string,
    ) => {
        const formatted = formatHandle(value)

        handleFieldChange(field, formatted as WaitlistFormValues[typeof field])
    }

    const handleChipToggle = (
        field: 'artist_types' | 'participation_types',
        value: ArtistType | ParticipationType,
    ) => {
        const current = data[field] as string[]
        const nextSelection = toggleSelection(current, value as string)

        handleFieldChange(field, nextSelection as WaitlistFormValues[typeof field])
    }

    const handleAvailabilityChange = (value: AvailabilityLevel) => {
        handleFieldChange('creation_availability', value)
    }

    const renderSection = () => {
        if (isSuccessStep) {
            return (
                <div className="animate-in fade-in slide-in-from-right-2 space-y-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-10 text-center shadow-[0_30px_80px_-50px_rgba(16,185,129,0.4)] backdrop-blur-sm m-10">
                    <div className="mx-auto flex size-16 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 animate-pulse border border-emerald-500/20">
                        <CheckCircle2 className="size-8" />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-white tracking-tight">
                            Você está oficialmente inscrito no movimento{' '}
                            <span className="text-[#fc7c04]">UGC 4ARTISTS!</span>
                        </h3>
                        <p className="text-sm text-white/70 font-medium max-w-md mx-auto">
                            Aguarde nosso contato para a sua primeira campanha. Fique de olho no seu Direct e e-mail
                            para não perder nenhuma oportunidade.
                        </p>
                    </div>
                    <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-sm font-bold text-[#fc7c04] backdrop-blur-sm">
                        @ugc4artists | #ugc4artists
                    </div>
                    <Button
                        type="button"
                        className="h-11 rounded-xl bg-[#fc7c04] hover:bg-[#ff9a3c] px-8 text-black font-bold shadow-lg shadow-[#fc7c04]/30 transition-all duration-300 text-sm"
                        onClick={() => setCurrentStep(0)}
                    >
                        Fazer nova inscrição
                    </Button>
                </div>
            )
        }

        const step = steps[currentStep]

        return (
            <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Section Header - Mais compacto */}
                <div className="space-y-2  border-b border-white/5">
                    <p className="text-[10px] uppercase tracking-widest text-[#fc7c04] font-bold">
                        Etapa {currentStep + 1} de {totalSteps}
                    </p>
                    <h3 className="text-2xl font-bold text-white tracking-tight">
                        {step.title}
                    </h3>
                    <p className="text-sm text-white/60 font-medium">
                        {step.subtitle}
                    </p>
                </div>

                {/* Form Content */}
                {currentStep === 0 && renderProfileStep()}
                {currentStep === 1 && renderParticipationStep()}
                {currentStep === 2 && renderTermsStep()}

                <div className="flex flex-col  sm:flex-row sm:items-center sm:justify-between border-t border-white/5 sticky bottom-0  backdrop-blur-sm -mx-6 md:-mx-8 px-6 md:px-8 py-4 rounded-b-[2rem]">
                    {currentStep > 0 ? (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handlePrevStep}
                            className="h-11 rounded-xl border-white/20 text-white hover:bg-white/5 hover:border-white/40 font-medium transition-all duration-300 bg-foreground"
                        >
                            <CornerUpLeft className="size-4" />
                            Voltar
                        </Button>
                    ) : (
                        <div />
                    )}
                    {currentStep < totalSteps - 1 ? (
                        <Button
                            type="button"
                            className="h-11 rounded-xl bg-gradient-to-r from-[#fc7c04] to-[#ff9a3c] px-8 text-black font-bold shadow-lg shadow-[#fc7c04]/30 hover:shadow-[#fc7c04]/50 hover:scale-105 transition-all duration-300"
                            onClick={handleNextStep}
                        >
                            Continuar
                            <ArrowRight className="size-4" />
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            disabled={processing}
                            className="h-11 rounded-xl bg-gradient-to-r from-[#fc7c04] to-[#ff9a3c] px-8 text-black font-bold shadow-lg shadow-[#fc7c04]/50 hover:shadow-[#fc7c04]/70 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {processing ? 'Enviando…' : 'Confirmar inscrição'}
                        </Button>
                    )}
                </div>
            </form>
        )
    }

    const renderProfileStep = () => (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="stage_name" className="text-white font-bold text-xs">
                        Nome artístico
                    </Label>
                    <Input
                        id="stage_name"
                        name="stage_name"
                        placeholder="Como você é conhecido?"
                        value={data.stage_name}
                        className="border-white/20 bg-white/5 text-white placeholder:text-white/30 h-10 rounded-lg focus:border-[#fc7c04] focus:ring-[#fc7c04]/20 text-sm"
                        onChange={(event) => handleFieldChange('stage_name', event.target.value)}
                        aria-invalid={Boolean(getError('stage_name'))}
                    />
                    {getError('stage_name') && (
                        <p className="text-xs text-rose-400 font-medium">{getError('stage_name')}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="contact_email" className="text-white font-bold text-xs">
                        E-mail de contato
                    </Label>
                    <Input
                        id="contact_email"
                        name="contact_email"
                        type="email"
                        placeholder="nome@email.com"
                        value={data.contact_email}
                        className="border-white/20 bg-white/5 text-white placeholder:text-white/30 h-10 rounded-lg focus:border-[#fc7c04] focus:ring-[#fc7c04]/20 text-sm"
                        onChange={(event) => handleFieldChange('contact_email', event.target.value)}
                        aria-invalid={Boolean(getError('contact_email'))}
                    />
                    {getError('contact_email') && (
                        <p className="text-xs text-rose-400 font-medium">{getError('contact_email')}</p>
                    )}
                </div>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/[0.02] p-5">
                <p className="text-xs font-bold text-white">
                    Redes Sociais (obrigatório ao menos uma)
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="instagram_handle" className="text-white/80 font-medium text-[10px]">
                            Instagram
                        </Label>
                        <Input
                            className="border-white/20 bg-white/5 text-white placeholder:text-white/30 h-9 rounded-lg focus:border-[#fc7c04] focus:ring-[#fc7c04]/20 text-sm"
                            id="instagram_handle"
                            placeholder="@seuartista"
                            value={data.instagram_handle}
                            onChange={(event) =>
                                handleHandleChange('instagram_handle', event.target.value)
                            }
                            aria-invalid={Boolean(getError('instagram_handle'))}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="youtube_handle" className="text-white/80 font-medium text-[10px]">
                            YouTube
                        </Label>
                        <Input
                            className="border-white/20 bg-white/5 text-white placeholder:text-white/30 h-9 rounded-lg focus:border-[#fc7c04] focus:ring-[#fc7c04]/20 text-sm"
                            id="youtube_handle"
                            placeholder="@seu-canal"
                            value={data.youtube_handle}
                            onChange={(event) =>
                                handleHandleChange('youtube_handle', event.target.value)
                            }
                            aria-invalid={Boolean(getError('youtube_handle'))}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="tiktok_handle" className="text-white/80 font-medium text-[10px]">
                            TikTok
                        </Label>
                        <Input
                            className="border-white/20 bg-white/5 text-white placeholder:text-white/30 h-9 rounded-lg focus:border-[#fc7c04] focus:ring-[#fc7c04]/20 text-sm"
                            id="tiktok_handle"
                            placeholder="@seu.tiktok"
                            value={data.tiktok_handle}
                            onChange={(event) => handleHandleChange('tiktok_handle', event.target.value)}
                            aria-invalid={Boolean(getError('tiktok_handle'))}
                        />
                    </div>
                </div>
                {getError('instagram_handle') && (
                    <p className="mt-2 text-xs text-rose-400 font-medium">{getError('instagram_handle')}</p>
                )}
            </div>
            <div className="space-y-4">
                <p className="text-xs font-bold text-white">Você é...</p>
                <div className="grid gap-3 md:grid-cols-2">
                    {artistProfiles.map((option) => {
                        const Icon = option.icon
                        const isActive = data.artist_types.includes(option.value)

                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleChipToggle('artist_types', option.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault()
                                        handleChipToggle('artist_types', option.value)
                                    }
                                }}
                                className={cn(
                                    'cursor-pointer flex items-center gap-3 rounded-lg border p-3 text-left transition-all duration-300',
                                    isActive
                                        ? 'border-[#fc7c04] bg-[#fc7c04]/10 shadow-[0_15px_50px_-35px_rgba(252,124,4,0.9)] scale-[1.02]'
                                        : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                                )}
                                aria-pressed={isActive}
                                aria-label={option.title}
                            >
                                <div className="flex size-10 items-center justify-center rounded-lg bg-white text-black shrink-0">
                                    <Icon className="size-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-white text-xs">{option.title}</p>
                                    <p className="text-[10px] text-white/50 font-medium">{option.description}</p>
                                </div>
                            </button>
                        )
                    })}
                </div>
                {getError('artist_types') && (
                    <p className="text-xs text-rose-400 font-medium">{getError('artist_types')}</p>
                )}
                {data.artist_types.includes('other') && (
                    <div className="space-y-2">
                        <Label htmlFor="other_artist_type" className="text-white font-bold text-xs">
                            Outro — qual?
                        </Label>
                        <Input
                            className="border-white/20 bg-white/5 text-white placeholder:text-white/30 h-10 rounded-lg focus:border-[#fc7c04] focus:ring-[#fc7c04]/20 text-sm"
                            id="other_artist_type"
                            placeholder="Ex: produtor musical, maestro..."
                            value={data.other_artist_type}
                            onChange={(event) => handleFieldChange('other_artist_type', event.target.value)}
                            aria-invalid={Boolean(getError('other_artist_type'))}
                        />
                        {getError('other_artist_type') && (
                            <p className="text-xs text-rose-400 font-medium">{getError('other_artist_type')}</p>
                        )}
                    </div>
                )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="main_genre" className="text-white font-bold text-xs">
                    Estilo musical principal
                </Label>
                <Input
                    className="border-white/20 bg-white/5 text-white placeholder:text-white/30 h-10 rounded-lg focus:border-[#fc7c04] focus:ring-[#fc7c04]/20 text-sm"
                    id="main_genre"
                    placeholder="MPB, pop, rap, sertanejo, gospel..."
                    value={data.main_genre}
                    onChange={(event) => handleFieldChange('main_genre', event.target.value)}
                />
                {getError('main_genre') && (
                    <p className="text-xs text-rose-400 font-medium">{getError('main_genre')}</p>
                )}
            </div>
        </div>
    )

    const renderParticipationStep = () => (
        <div className="space-y-6">
            <div className="space-y-4">
                <p className="text-xs font-bold text-white">Você quer...</p>
                <div className="grid gap-3 md:grid-cols-2">
                    {participationOptions.map((option) => {
                        const Icon = option.icon
                        const isActive = data.participation_types.includes(option.value)

                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleChipToggle('participation_types', option.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault()
                                        handleChipToggle('participation_types', option.value)
                                    }
                                }}
                                className={cn(
                                    'cursor-pointer flex items-center gap-3 rounded-lg border p-3 text-left transition-all duration-300',
                                    isActive
                                        ? 'border-[#fc7c04] bg-[#fc7c04]/10 shadow-[0_15px_50px_-35px_rgba(252,124,4,0.9)] scale-[1.02]'
                                        : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                                )}
                                aria-pressed={isActive}
                                aria-label={option.title}
                            >

                                <div className="flex-1">
                                    <p className="font-bold text-white text-xs">{option.title}</p>
                                    <p className="text-[10px] text-white/50 font-medium">{option.description}</p>
                                </div>
                            </button>
                        )
                    })}
                </div>
                {getError('participation_types') && (
                    <p className="text-xs text-rose-400 font-medium">{getError('participation_types')}</p>
                )}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="portfolio_link" className="text-white font-bold text-xs">
                        Link de um vídeo seu
                    </Label>
                    <Input
                        className="border-white/20 bg-white/5 text-white placeholder:text-white/30 h-10 rounded-lg focus:border-[#fc7c04] focus:ring-[#fc7c04]/20 text-sm"
                        id="portfolio_link"
                        placeholder="https://instagram.com/reel/..."
                        value={data.portfolio_link}
                        onChange={(event) => handleFieldChange('portfolio_link', event.target.value)}
                        aria-invalid={Boolean(getError('portfolio_link'))}
                    />
                    {getError('portfolio_link') && (
                        <p className="text-xs text-rose-400 font-medium">{getError('portfolio_link')}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="city_state" className="text-white font-bold text-xs">
                        Cidade e Estado (opcional)
                    </Label>
                    <Input
                        className="border-white/20 bg-white/5 text-white placeholder:text-white/30 h-10 rounded-lg focus:border-[#fc7c04] focus:ring-[#fc7c04]/20 text-sm"
                        id="city_state"
                        placeholder="Ex: Recife / PE"
                        value={data.city_state}
                        onChange={(event) => handleFieldChange('city_state', event.target.value)}
                        aria-invalid={Boolean(getError('city_state'))}
                    />
                    {getError('city_state') && (
                        <p className="text-xs text-rose-400 font-medium">{getError('city_state')}</p>
                    )}
                </div>
            </div>
            <div className="space-y-4">
                <p className="text-xs font-bold text-white">
                    Disponibilidade de criação
                </p>
                <div className="rounded-xl border border-white/20 bg-white/[0.02] p-4">
                    <div className="relative mb-5 h-1.5 rounded-full bg-white/10">
                        <div
                            className="absolute inset-y-0 rounded-full bg-gradient-to-r from-emerald-400 to-[#fc7c04] transition-all duration-500"
                            style={{
                                width:
                                    data.creation_availability === 'high'
                                        ? '100%'
                                        : data.creation_availability === 'medium'
                                            ? '66%'
                                            : '33%',
                            }}
                        />
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                        {availabilityOptions.map((option) => {
                            const isActive = data.creation_availability === option.value

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleAvailabilityChange(option.value)}
                                    className={cn(
                                        'cursor-pointer rounded-lg border p-3 text-center transition-all duration-300',
                                        isActive
                                            ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_15px_50px_-35px_rgba(16,185,129,0.9)] scale-[1.02]'
                                            : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                                    )}
                                    aria-pressed={isActive}
                                >
                                    <p className={cn(
                                        'font-bold text-xs',
                                        isActive ? 'text-emerald-400' : 'text-white'
                                    )}>
                                        {option.title}
                                    </p>
                                    <p className="text-[10px] text-white/50 font-medium mt-0.5">
                                        {option.description}
                                    </p>
                                </button>
                            )
                        })}
                    </div>
                    {getError('creation_availability') && (
                        <p className="mt-3 text-xs text-rose-400 font-medium">{getError('creation_availability')}</p>
                    )}
                </div>
            </div>
        </div>
    )

    const renderTermsStep = () => (
        <div className="space-y-6">
            <div className="rounded-xl border border-[#fc7c04]/30 bg-[#fc7c04]/5 p-6 shadow-[0_30px_80px_-60px_rgba(252,124,4,0.5)]">
                <h4 className="text-xl font-bold text-white tracking-tight">
                    Regulamento Oficial UGC 4ARTISTS
                </h4>
                <p className="mt-3 text-xs text-white/70 font-medium leading-relaxed">
                    Leia atentamente antes de confirmar sua inscrição. O movimento conecta artistas,
                    criadores e gravadoras para campanhas de divulgação musical remuneradas.
                </p>
                <Button
                    asChild
                    className="mt-5 h-10 rounded-xl bg-white text-black font-bold hover:bg-white/90 shadow-lg shadow-white/20 transition-all duration-300 text-xs"
                >
                    <a
                        href={'/regulamento'}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Acessar Regulamento Oficial"
                    >
                        <FileText className="size-4" />
                        Acesse o Regulamento Oficial
                    </a>
                </Button>
            </div>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/20 bg-white/[0.02] p-5 shadow-[0_20px_60px_-50px_rgba(252,124,4,0.3)] hover:bg-white/5 transition-all duration-300">
                <Checkbox
                    checked={data.terms}
                    onCheckedChange={(checked) => handleFieldChange('terms', Boolean(checked))}
                    className="mt-0.5 data-[state=checked]:bg-[#fc7c04] data-[state=checked]:border-[#fc7c04]"
                    aria-label="Li e concordo com o Regulamento Oficial"
                />
                <div className="space-y-1 text-xs">
                    <p className="font-bold text-white">
                        Li e concordo com o Regulamento Oficial de Participação
                    </p>
                    <p className="text-white/60 font-medium">
                        Confirmo que estou apto(a) a participar das campanhas
                    </p>
                    {getError('terms') && (
                        <p className="text-xs text-rose-400 font-medium mt-2">{getError('terms')}</p>
                    )}
                </div>
            </label>
        </div>
    )

    return (
        <div className="w-full max-w-3xl mx-auto">
            {/* Editorial Card Container - Mais compacto */}
            <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.02] backdrop-blur-sm px-6 md:px-8 pt-5 overflow-hidden shadow-[0_40px_120px_-80px_rgba(252,124,4,0.3)]">
                {/* Subtle Inner Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#fc7c04]/5 via-transparent to-transparent pointer-events-none rounded-[2rem]"></div>

                {/* Content */}
                <div className="relative z-10">
                    {renderSection()}
                </div>
            </div>
        </div>
    )
}

// Export steps for use in sidebar
export { steps }

