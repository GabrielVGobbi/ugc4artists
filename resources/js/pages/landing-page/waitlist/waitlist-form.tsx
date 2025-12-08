
import { useMemo, useState } from 'react'
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
            errorMap: () => ({
                message: 'Escolha sua disponibilidade.',
            }),
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

/**
 * Formulário multi-etapas para captar artistas interessados na lista de espera UGC 4ARTISTS.
 */
export function WaitListForm(): JSX.Element {
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
        setData(field, value)
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
                <div className='animate-in fade-in slide-in-from-right-4 space-y-6 rounded-3xl border border-emerald-100  p-20 text-center shadow-[0_40px_120px_-60px_rgba(16,185,129,0.8)] '>
                    <div className='mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 animate-pulse'>
                        <CheckCircle2 className='size-8' />
                    </div>
                    <div className='space-y-4'>
                        <h3 className='text-2xl font-semibold text-slate-300'>
                            Você está oficialmente inscrito no movimento <span className="text-primary">UGC 4ARTISTS!</span>
                        </h3>
                        <p className='text-base text-slate-300'>
                            Aguarde nosso contato para a sua primeira campanha. Fique de olho no seu Direct e e-mail
                            para não perder nenhuma oportunidade.
                        </p>
                    </div>
                    <div className='rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 p-6 text-sm font-medium text-slate-700'>
                        @ugcparamusicos | #UGCparamusicos
                    </div>
                    <Button
                        type='button'
                        className='rounded-2xl'
                        onClick={() => setCurrentStep(0)}
                    >
                        Fazer nova inscrição
                    </Button>
                </div>
            )
        }

        const step = steps[currentStep]

        return (
            <form className='space-y-10' onSubmit={handleSubmit}>
                <div className='space-y-2'>
                    <h3 className='text-2xl font-semibold text-white'>{step.title}</h3>
                    <p className='text-sm text-slate-500'>{step.subtitle}</p>
                </div>
                {currentStep === 0 && renderProfileStep()}
                {currentStep === 1 && renderParticipationStep()}
                {currentStep === 2 && renderTermsStep()}
                <div className='flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between'>
                    {currentStep > 0 ? (
                        <Button
                            type='button'
                            variant='outline'
                            onClick={handlePrevStep}
                            className='h-10 rounded-2xl border-slate-200 text-slate-700'
                        >
                            <CornerUpLeft />
                            Voltar
                        </Button>
                    ) : (
                        <div />
                    )}
                    {currentStep < totalSteps - 1 ? (
                        <Button
                            type='button'
                            className='h-10 rounded-2xl bg-gradient-to-r from-primary to-gray-600 px-8 text-white shadow-lg shadow-indigo-300/50 hover:bg-primary/10'
                            onClick={handleNextStep}
                        >
                            Continuar
                            <ArrowRight className='size-4' />
                        </Button>
                    ) : (
                        <Button
                            type='submit'
                            disabled={processing}
                            className='h-10 rounded-2xl bg-gradient-to-r from-primary to-rose-500 px-8 text-white shadow-lg shadow-rose-300/60'
                        >
                            {processing ? 'Enviando…' : 'Confirmar inscrição'}
                        </Button>
                    )}
                </div>
            </form>
        )
    }

    const renderProfileStep = () => (
        <div className='space-y-8'>
            <div className='grid gap-6 md:grid-cols-2'>
                <div className='space-y-2'>
                    <Label htmlFor='stage_name'>Nome artístico</Label>
                    <Input
                        id='stage_name'
                        name='stage_name'
                        placeholder='Como você é conhecido?'
                        value={data.stage_name}
                        className="border-gray-700"
                        onChange={(event) => handleFieldChange('stage_name', event.target.value)}
                        aria-invalid={Boolean(getError('stage_name'))}
                    />
                    <p className='text-sm text-slate-500'>Como você assina nos palcos e nas redes.</p>
                    {getError('stage_name') && (
                        <p className='text-sm text-rose-500'>{getError('stage_name')}</p>
                    )}
                </div>
                <div className='space-y-2'>
                    <Label htmlFor='contact_email'>E-mail de contato</Label>
                    <Input
                        id='contact_email'
                        name='contact_email'
                        type='email'
                        placeholder='nome@email.com'
                        value={data.contact_email}
                        className="border-gray-700"
                        onChange={(event) => handleFieldChange('contact_email', event.target.value)}
                        aria-invalid={Boolean(getError('contact_email'))}
                    />
                    <p className='text-sm text-slate-500'>Usaremos para comunicações oficiais.</p>
                    {getError('contact_email') && (
                        <p className='text-sm text-rose-500'>{getError('contact_email')}</p>
                    )}
                </div>
            </div>
            <div className='rounded-2xl border border-gray-700 bg-foreground/20 p-6'>
                <p className='text-sm font-medium text-slate-300'>
                    @ do Instagram · @ do YouTube · @ do TikTok
                </p>
                <p className='text-sm text-slate-500'>
                    Precisamos para ver seu conteúdo e adicionar às campanhas (obrigatório ao menos um).
                </p>
                <div className='mt-6 grid gap-4 md:grid-cols-3'>
                    <div className='space-y-1'>
                        <Label htmlFor='instagram_handle'>Instagram</Label>
                        <Input
                            className="border-gray-700"
                            id='instagram_handle'
                            placeholder='@seuartista'
                            value={data.instagram_handle}
                            onChange={(event) =>
                                handleHandleChange('instagram_handle', event.target.value)
                            }
                            aria-invalid={Boolean(getError('instagram_handle'))}
                        />
                    </div>
                    <div className='space-y-1'>
                        <Label htmlFor='youtube_handle'>YouTube</Label>
                        <Input
                            className="border-gray-700"
                            id='youtube_handle'
                            placeholder='@seu-canal'
                            value={data.youtube_handle}
                            onChange={(event) =>
                                handleHandleChange('youtube_handle', event.target.value)
                            }
                            aria-invalid={Boolean(getError('youtube_handle'))}
                        />
                    </div>
                    <div className='space-y-1'>
                        <Label htmlFor='tiktok_handle'>TikTok</Label>
                        <Input
                            className="border-gray-700"
                            id='tiktok_handle'
                            placeholder='@seu.tiktok'
                            value={data.tiktok_handle}
                            onChange={(event) => handleHandleChange('tiktok_handle', event.target.value)}
                            aria-invalid={Boolean(getError('tiktok_handle'))}
                        />
                    </div>
                </div>
                {getError('instagram_handle') && (
                    <p className='mt-3 text-sm text-rose-500'>{getError('instagram_handle')}</p>
                )}
            </div>
            <div className='space-y-4'>
                <p className='text-sm font-medium text-slate-300'>
                    Você é...
                </p>
                <div className='grid gap-4 md:grid-cols-2'>
                    {artistProfiles.map((option) => {
                        const Icon = option.icon
                        const isActive = data.artist_types.includes(option.value)

                        return (
                            <button
                                key={option.value}
                                type='button'
                                onClick={() => handleChipToggle('artist_types', option.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault()
                                        handleChipToggle('artist_types', option.value)
                                    }
                                }}
                                className={cn(
                                    'cursor-pointer flex items-start gap-3 rounded-2xl border p-4 text-left transition',
                                    isActive
                                        ? 'border-blue-500 bg-blue-100/20  shadow-[0_15px_60px_-35px_rgba(59,130,246,1)]'
                                        : 'border-gray-700 hover:border-slate-200'
                                )}
                                aria-pressed={isActive}
                                aria-label={option.title}
                            >
                                <div className='flex size-11 items-center justify-center rounded-xl bg-white text-slate-700'>
                                    <Icon className='size-5' />
                                </div>
                                <div>
                                    <p className='font-semibold text-slate-300'>{option.title}</p>
                                    <p className='text-sm text-slate-500'>{option.description}</p>
                                </div>
                            </button>
                        )
                    })}
                </div>
                {getError('artist_types') && (
                    <p className='text-sm text-rose-500'>{getError('artist_types')}</p>
                )}
                {data.artist_types.includes('other') && (
                    <div className='space-y-2'>
                        <Label htmlFor='other_artist_type'>Outro — qual?</Label>
                        <Input
                            className="border-gray-700"
                            id='other_artist_type'
                            placeholder='Ex: produtor musical, maestro...'
                            value={data.other_artist_type}
                            onChange={(event) => handleFieldChange('other_artist_type', event.target.value)}
                            aria-invalid={Boolean(getError('other_artist_type'))}
                        />
                        {getError('other_artist_type') && (
                            <p className='text-sm text-rose-500'>{getError('other_artist_type')}</p>
                        )}
                    </div>
                )}
            </div>
            <div className='space-y-2'>
                <Label htmlFor='main_genre'>Estilo musical principal</Label>
                <Input
                    className="border-gray-700"
                    id='main_genre'
                    placeholder='MPB, pop, rap, sertanejo, gospel...'
                    value={data.main_genre}
                    onChange={(event) => handleFieldChange('main_genre', event.target.value)}
                />
                {getError('main_genre') && (
                    <p className='text-sm text-rose-500'>{getError('main_genre')}</p>
                )}
            </div>
        </div>
    )

    const renderParticipationStep = () => (
        <div className='space-y-8'>
            <div className='space-y-3'>
                <p className='text-sm font-medium text-slate-300'>Você quer...</p>
                <div className='grid gap-4 md:grid-cols-2'>
                    {participationOptions.map((option) => {
                        const Icon = option.icon
                        const isActive = data.participation_types.includes(option.value)

                        return (
                            <button
                                key={option.value}
                                type='button'
                                onClick={() => handleChipToggle('participation_types', option.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault()
                                        handleChipToggle('participation_types', option.value)
                                    }
                                }}
                                className={cn(
                                    'flex items-start gap-3 rounded-2xl border p-4 text-left transition',
                                    isActive
                                        ? 'border-indigo-500 bg-blue-100/20 shadow-[0_15px_60px_-35px_rgba(255,121,0)]'
                                        : 'border-gray-700 hover:border-slate-200'
                                )}
                                aria-pressed={isActive}
                                aria-label={option.title}
                            >
                                <div className='flex size-11 items-center justify-center rounded-xl bg-white text-slate-700'>
                                    <Icon className='size-5' />
                                </div>
                                <div>
                                    <p className='font-semibold text-slate-300'>{option.title}</p>
                                    <p className='text-sm text-slate-500'>{option.description}</p>
                                </div>
                            </button>
                        )
                    })}
                </div>
                {getError('participation_types') && (
                    <p className='text-sm text-rose-500'>{getError('participation_types')}</p>
                )}
            </div>
            <div className='grid gap-6 md:grid-cols-2'>
                <div className='space-y-2'>
                    <Label htmlFor='portfolio_link'>Link de um vídeo seu</Label>
                    <Input
                        className="border-gray-700"
                        id='portfolio_link'
                        placeholder='https://instagram.com/reel/...'
                        value={data.portfolio_link}
                        onChange={(event) => handleFieldChange('portfolio_link', event.target.value)}
                        aria-invalid={Boolean(getError('portfolio_link'))}
                    />
                    <p className='text-sm text-slate-500'>
                        Reel, TikTok ou YouTube (cantando, tocando ou apresentando).
                    </p>
                    {getError('portfolio_link') && (
                        <p className='text-sm text-rose-500'>{getError('portfolio_link')}</p>
                    )}
                </div>
                <div className='space-y-2'>
                    <Label htmlFor='city_state'>Cidade e Estado (opcional)</Label>
                    <Input
                        className="border-gray-700"
                        id='city_state'
                        placeholder='Ex: Recife / PE'
                        value={data.city_state}
                        onChange={(event) => handleFieldChange('city_state', event.target.value)}
                        aria-invalid={Boolean(getError('city_state'))}
                    />
                    <p className='text-sm text-slate-500'>
                        Usaremos para campanhas regionais e ações presenciais.
                    </p>
                    {getError('city_state') && (
                        <p className='text-sm text-rose-500'>{getError('city_state')}</p>
                    )}
                </div>
            </div>
            <div className='space-y-3'>
                <p className='text-sm font-medium text-slate-300'>
                    Qual é a sua disponibilidade de criação de conteúdo?
                </p>
                <div className='rounded-2xl border border-gray-700 p-6'>
                    <div className='relative mb-6 h-2 rounded-full bg-slate-100'>
                        <div
                            className='absolute inset-y-0 rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 transition-all'
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
                    <div className='grid gap-3 md:grid-cols-3'>
                        {availabilityOptions.map((option) => {
                            const isActive = data.creation_availability === option.value

                            return (
                                <button
                                    key={option.value}
                                    type='button'
                                    onClick={() => handleAvailabilityChange(option.value)}
                                    className={cn(
                                        'cursor-pointer rounded-2xl border p-4 text-left transition',
                                        isActive
                                            ? 'border-emerald-500 bg-emerald-100/80 shadow-[0_15px_60px_-35px_rgba(16,185,129,1)]'
                                            : 'border-gray-700 hover:border-slate-200'
                                    )}
                                    aria-pressed={isActive}
                                >
                                    <p className=
                                        {cn(
                                            'font-semibold text-slate-300',
                                            isActive
                                                ? 'text-slate-900'
                                                : ''
                                        )}>{option.title}</p>
                                    <p className='text-sm text-slate-500'>{option.description}</p>
                                </button>
                            )
                        })}
                    </div>
                    {getError('creation_availability') && (
                        <p className='mt-3 text-sm text-rose-500'>{getError('creation_availability')}</p>
                    )}
                </div>
            </div>
        </div>
    )

    const renderTermsStep = () => (
        <div className='space-y-8'>
            <div className='rounded-3xl border border-gray-700  p-8 shadow-[0_40px_120px_-80px_rgba(255,121,0)]'>
                <h4 className='mt-4 text-2xl font-semibold text-slate-300'>
                    Regulamento Oficial — UGC 4ARTISTS
                </h4>
                <p className='mt-3 text-sm text-slate-500'>
                    Leia atentamente antes de confirmar sua inscrição. O movimento conecta artistas,
                    criadores e gravadoras para campanhas de divulgação musical remuneradas. Ao confirmar,
                    você declara estar ciente das regras e da exclusividade de 24 meses.
                </p>
                <Button
                    asChild
                    className='mt-6 h-12 rounded-2xl border-slate-200 text-white '
                >
                    <a
                        href={waitlist.regulation.url()}
                        target='_blank'
                        rel='noreferrer'
                        aria-label='Acessar Regulamento Oficial'
                    >
                        <FileText />
                        Acesse o Regulamento Oficial
                    </a>
                </Button>
            </div>
            <label className='flex cursor-pointer items-start gap-3 rounded-2xl border border-gray-700  p-6 shadow-[0_30px_80px_-70px_rgba(15,23,42,1)]'>
                <Checkbox
                    checked={data.terms}
                    onCheckedChange={(checked) => handleFieldChange('terms', Boolean(checked))}
                    className='mt-1'
                    aria-label='Li e concordo com o Regulamento Oficial'
                />
                <div className='space-y-1 text-sm text-slate-300'>
                    <p className='font-semibold text-slate-300'>
                        Li e concordo com o Regulamento Oficial de Participação
                    </p>
                    <p>
                        Confirmo que estou apto(a) a participar das campanhas
                    </p>
                    {getError('terms') && (
                        <p className='text-sm text-rose-500'>{getError('terms')}</p>
                    )}
                </div>
            </label>
        </div>
    )

    return (
        <>
            {/* Left Column - Steps & Info */}
            <div id="form" className=" lg:w-[420px] shrink-0 lg:border-r pr-12 border-white/5">
                <div className=" lg:sticky lg:top-8 space-y-10" >
                    {/* Progress Bar */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-white/40">Progresso</span>
                            <span className="text-primary font-medium">{progressValue}%</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-[#ff9a3c] rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${progressValue}%` }}
                            />
                        </div>
                    </div>

                    <div className="space-y-2" >
                        {steps.map((step, index) => {
                            const Icon = step.icon
                            const isActive = currentStep === step.number
                            const isCompleted = currentStep > step.number

                            console.log(currentStep)
                            console.log(step.number)

                            return (
                                <div
                                    key={step.id}
                                    className={`
                      group relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300
                      ${isActive ? "bg-primary/5" : "hover:bg-primary/[0.02]"}
                    `}
                                >
                                    {/* Step Number/Icon */}
                                    <div
                                        className={`
                      relative flex items-center justify-center w-14 h-14 rounded-xl transition-all duration-300
                      ${isActive
                                                ? "bg-primary"
                                                : isCompleted
                                                    ? "bg-primary/10 border border-primary/30"
                                                    : "bg-white/5 border border-white/10"
                                            }
                    `}
                                    >
                                        {isCompleted ? (
                                            <Check className="w-6 h-6 text-primary" />
                                        ) : (
                                            <Icon className={`w-6 h-6 ${isActive ? "text-black" : "text-white/30"}`} />
                                        )}
                                    </div>

                                    {/* Step Info */}
                                    <div className="flex-1">
                                        <p className={`font-semibold transition-colors ${isActive ? "text-white" : "text-white/40"}`}>
                                            {step.title}
                                        </p>
                                        <p className={`text-sm ${isActive ? "text-white/60" : "text-white/20"}`}>{step.subtitle}</p>
                                    </div>

                                    {/* Active Indicator */}
                                    {isActive && <div className="absolute right-4 w-2 h-2 bg-primary rounded-full animate-pulse" />}

                                    {/* Connection Line */}
                                    {index < steps.length - 1 && (
                                        <div
                                            className={`
                        absolute left-[43px] top-[72px] w-0.5 h-6
                        ${isCompleted ? "bg-primary/30" : "bg-white/5"}
                      `}
                                        />
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Social Links */}
                    <div className="hidden lg:block pt-8 border-t border-white/5">
                        <p className="text-xs text-white/30 uppercase tracking-wider mb-4">Siga-nos</p>
                        <div className="flex items-center gap-3">
                            {[
                                { icon: Instagram, href: "#", label: "Instagram" },
                            ].map(({ icon: SocialIcon, href, label }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center justify-center w-11 h-11 rounded-xl border-white/5 hover:border-[#fc7c04]/30 hover:bg-[#fc7c04]/5 transition-all duration-300"
                                >
                                    <SocialIcon className="w-5 h-5 text-white/40 group-hover:text-[#fc7c04] transition-colors" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column - Form */}
            <div className="flex-1 flex items-start justify-center">
                <div className="w-full max-w-2xl">
                    {/* Form Container */}
                    <div className="container relative">
                        {/* Glassmorphism Card */}
                        <div className="  relative border border-white/10 rounded-3xl p-8 md:p-10 overflow-hidden">
                            {renderSection()}
                        </div>
                    </div>
                </div>
            </div>
        </ >
    )
}

