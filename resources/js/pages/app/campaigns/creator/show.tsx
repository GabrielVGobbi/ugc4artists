import { useState } from 'react'
import AppLayout from '@/layouts/app-layout'
import { Head, Link, router } from '@inertiajs/react'
import { motion } from 'motion/react'
import {
    ArrowLeft,
    Instagram,
    Calendar,
    DollarSign,
    Users,
    Clock,
    CheckCircle,
    Send,
    ExternalLink,
    Loader2,
    FileText,
    Video,
    Tag,
    Music,
    Upload,
    Link2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useForm } from '@inertiajs/react'
import type { CampaignResource } from '@/types/campaign'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface CreatorShowProps {
    campaign: CampaignResource
    isApproved: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CLASS: Record<string, string> = {
    sent_to_creators: 'bg-blue-100 text-blue-700',
    in_progress:      'bg-emerald-100 text-emerald-700',
    completed:        'bg-primary/10 text-primary',
    cancelled:        'bg-red-100 text-red-700',
    approved:         'bg-teal-100 text-teal-700',
}

const PLATFORM_LABEL: Record<string, string> = {
    instagram:      'Instagram',
    tiktok:         'TikTok',
    youtube:        'YouTube',
    youtube_shorts: 'YT Shorts',
}

function InfoRow({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType
    label: string
    value: React.ReactNode
}) {
    return (
        <div className="flex items-start gap-3 py-3 border-b border-zinc-50 last:border-0">
            <div className="w-8 h-8 bg-zinc-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={15} className="text-zinc-500" />
            </div>
            <div>
                <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide">{label}</p>
                <div className="text-sm font-semibold text-foreground mt-0.5">{value}</div>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Submit Deliverable Form
// ─────────────────────────────────────────────────────────────────────────────

function SubmitDeliverableForm({ campaignUuid }: { campaignUuid: string }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        content_url: '',
        notes: '',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post(`/app/campaigns/${campaignUuid}/submit`, {
            onSuccess: () => {
                toast.success('Conteúdo enviado com sucesso! Aguardando revisão.')
                reset()
            },
            onError: (err) => {
                const msg = err.content_url ?? err.notes ?? 'Erro ao enviar conteúdo.'
                toast.error(msg)
            },
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="text-xs font-bold text-zinc-600 uppercase tracking-wide mb-2 block">
                    URL do Conteúdo
                </label>
                <div className="relative">
                    <Link2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    <Input
                        type="url"
                        placeholder="https://www.tiktok.com/@usuario/video/..."
                        value={data.content_url}
                        onChange={e => setData('content_url', e.target.value)}
                        className="pl-9 rounded-xl"
                    />
                </div>
                {errors.content_url && (
                    <p className="text-xs text-red-500 mt-1">{errors.content_url}</p>
                )}
            </div>

            <div>
                <label className="text-xs font-bold text-zinc-600 uppercase tracking-wide mb-2 block">
                    Observações (opcional)
                </label>
                <Textarea
                    placeholder="Adicione detalhes sobre o conteúdo entregue, hashtags usadas, etc."
                    value={data.notes}
                    onChange={e => setData('notes', e.target.value)}
                    className="rounded-xl resize-none"
                    rows={3}
                />
                {errors.notes && (
                    <p className="text-xs text-red-500 mt-1">{errors.notes}</p>
                )}
            </div>

            <Button
                type="submit"
                disabled={processing || !data.content_url}
                className="w-full rounded-xl font-bold gap-2"
            >
                {processing ? (
                    <Loader2 size={15} className="animate-spin" />
                ) : (
                    <Send size={15} />
                )}
                Enviar Conteúdo
            </Button>
        </form>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Apply Form (not yet approved)
// ─────────────────────────────────────────────────────────────────────────────

function ApplySection({
    campaignUuid,
    pricePerInfluencer,
}: {
    campaignUuid: string
    pricePerInfluencer: number
}) {
    const [applying, setApplying] = useState(false)

    const handleApply = async () => {
        setApplying(true)
        try {
            const csrfMeta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null
            const response = await fetch(`/app/campaigns/${campaignUuid}/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfMeta?.content ?? '',
                },
            })
            const json = await response.json()
            if (json.success) {
                toast.success('Candidatura enviada com sucesso!')
                router.reload()
            } else {
                toast.error(json.message ?? 'Erro ao candidatar-se.')
            }
        } catch {
            toast.error('Erro ao candidatar-se. Tente novamente.')
        } finally {
            setApplying(false)
        }
    }

    return (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Send size={20} className="text-primary" />
            </div>
            <h3 className="font-bold text-sm mb-1">Interessado nesta campanha?</h3>
            <p className="text-xs text-zinc-500 mb-4">
                Candidate-se para participar e ganhar{' '}
                <strong className="text-emerald-600">
                    R$ {pricePerInfluencer.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </strong>
            </p>
            <Button
                onClick={handleApply}
                disabled={applying}
                className="w-full rounded-xl font-bold gap-2"
            >
                {applying ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {applying ? 'Enviando...' : 'Candidatar-se'}
            </Button>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function CreatorCampaignShow({ campaign, isApproved }: CreatorShowProps) {
    const statusDisplay = campaign.status
    const statusValue   = typeof statusDisplay === 'string' ? statusDisplay : statusDisplay.value
    const statusLabel   = typeof statusDisplay === 'string' ? statusDisplay : statusDisplay.label
    const isClosed      = statusValue === 'completed' || statusValue === 'cancelled'
    const canApply      = statusValue === 'sent_to_creators' && !isApproved
    const canSubmit     = isApproved && (statusValue === 'sent_to_creators' || statusValue === 'in_progress')
    const hasSubmitted  = false // TODO: derive from pivot data

    return (
        <AppLayout>
            <Head title={campaign.name} />

            <div className="pb-12">

                {/* ── Back + Status ────────────────────────────────────────── */}
                <div className="flex items-center justify-between mb-6">
                    <Link
                        href="/app/campaigns"
                        className="flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-foreground transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Campanhas
                    </Link>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${STATUS_CLASS[statusValue] ?? 'bg-zinc-100 text-zinc-600'}`}>
                        {statusLabel}
                    </span>
                </div>

                <div className="grid grid-cols-12 gap-6">

                    {/* ── Main Content ─────────────────────────────────────── */}
                    <div className="col-span-12 lg:col-span-8 space-y-6">

                        {/* Cover + Title */}
                        <div className="bg-white border border-zinc-100 rounded-[2rem] overflow-hidden shadow-sm">
                            {campaign.cover_image_url && (
                                <div className="h-52 overflow-hidden">
                                    <img
                                        src={campaign.cover_image_url}
                                        alt={campaign.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <div className="p-8">
                                <h1 className="text-3xl font-bold tracking-tight mb-2">{campaign.name}</h1>
                                {campaign.brand_instagram && (
                                    <div className="flex items-center gap-2 text-zinc-500 text-sm">
                                        <Instagram size={15} />
                                        <span>@{campaign.brand_instagram}</span>
                                    </div>
                                )}
                                {campaign.content_platforms?.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {campaign.content_platforms.map(p => (
                                            <span
                                                key={p}
                                                className="text-xs font-bold px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 uppercase tracking-wide"
                                            >
                                                {PLATFORM_LABEL[p] ?? p}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Briefing */}
                        {campaign.description && (
                            <div className="bg-white border border-zinc-100 rounded-[2rem] p-8 shadow-sm">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4">Briefing</h2>
                                <p className="text-zinc-700 text-sm leading-relaxed whitespace-pre-line">
                                    {campaign.description}
                                </p>
                            </div>
                        )}

                        {/* Music */}
                        {campaign.music_link && (
                            <div className="bg-white border border-zinc-100 rounded-[2rem] p-8 shadow-sm">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                                    <Music size={14} /> Música
                                </h2>
                                <a
                                    href={campaign.music_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-primary font-semibold text-sm hover:underline"
                                >
                                    <ExternalLink size={14} />
                                    Ouvir música da campanha
                                </a>
                            </div>
                        )}

                        {/* Submitted content (if already submitted) */}
                        {isApproved && canSubmit && (
                            <div className="bg-white border border-zinc-100 rounded-[2rem] p-8 shadow-sm">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
                                    <Upload size={14} /> Enviar Entrega
                                </h2>
                                <SubmitDeliverableForm campaignUuid={campaign.uuid} />
                            </div>
                        )}

                        {canApply && (
                            <div className="bg-white border border-zinc-100 rounded-[2rem] p-8 shadow-sm">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
                                    <Send size={14} /> Participar
                                </h2>
                                <ApplySection
                                    campaignUuid={campaign.uuid}
                                    pricePerInfluencer={campaign.price_per_influencer}
                                />
                            </div>
                        )}
                    </div>

                    {/* ── Sidebar ──────────────────────────────────────────── */}
                    <div className="col-span-12 lg:col-span-4 space-y-4">

                        {/* Earning Card */}
                        <div className="bg-foreground text-white rounded-[2rem] p-7 relative overflow-hidden shadow-2xl">
                            <div className="relative z-10">
                                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Ganho por vaga</p>
                                <p className="text-4xl font-bold tracking-tighter">
                                    R$ {campaign.price_per_influencer.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                                <p className="text-zinc-500 text-xs mt-2">
                                    {campaign.slots_to_approve} vaga{campaign.slots_to_approve !== 1 ? 's' : ''} disponível{campaign.slots_to_approve !== 1 ? 'is' : ''}
                                </p>
                            </div>
                            {isApproved && (
                                <div className="relative z-10 mt-4 flex items-center gap-2 bg-emerald-500/20 rounded-xl px-3 py-2">
                                    <CheckCircle size={14} className="text-emerald-400" />
                                    <span className="text-xs font-bold text-emerald-300">Você está aprovado</span>
                                </div>
                            )}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                        </div>

                        {/* Details */}
                        <div className="bg-white border border-zinc-100 rounded-[2rem] p-6 shadow-sm">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Detalhes</h3>
                            <div>
                                {campaign.applications_open_date && (
                                    <InfoRow
                                        icon={Calendar}
                                        label="Inscrições"
                                        value={`${campaign.applications_open_date} até ${campaign.applications_close_date ?? '—'}`}
                                    />
                                )}
                                {campaign.video_duration_min !== null && campaign.video_duration_max !== null && (
                                    <InfoRow
                                        icon={Video}
                                        label="Duração do vídeo"
                                        value={`${campaign.video_duration_min}s – ${campaign.video_duration_max}s`}
                                    />
                                )}
                                {campaign.audio_format && (
                                    <InfoRow
                                        icon={Music}
                                        label="Formato de áudio"
                                        value={campaign.audio_format === 'music' ? 'Música' : 'Narração'}
                                    />
                                )}
                                {campaign.requires_product_shipping && (
                                    <InfoRow
                                        icon={Tag}
                                        label="Produto"
                                        value="Envio de produto incluso"
                                    />
                                )}
                                {campaign.payment_date && (
                                    <InfoRow
                                        icon={DollarSign}
                                        label="Previsão de pagamento"
                                        value={campaign.payment_date}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Filters */}
                        {campaign.filters?.gender && campaign.filters.gender !== 'both' && (
                            <div className="bg-white border border-zinc-100 rounded-[2rem] p-6 shadow-sm">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Perfil Buscado</h3>
                                <div className="space-y-2 text-sm">
                                    <p>
                                        <span className="text-zinc-400">Gênero: </span>
                                        <span className="font-medium">
                                            {campaign.filters.gender === 'female' ? 'Feminino' : 'Masculino'}
                                        </span>
                                    </p>
                                    {campaign.filters.age_min && campaign.filters.age_max && (
                                        <p>
                                            <span className="text-zinc-400">Idade: </span>
                                            <span className="font-medium">
                                                {campaign.filters.age_min} – {campaign.filters.age_max} anos
                                            </span>
                                        </p>
                                    )}
                                    {campaign.filters.min_followers && (
                                        <p>
                                            <span className="text-zinc-400">Seguidores mín.: </span>
                                            <span className="font-medium">
                                                {campaign.filters.min_followers.toLocaleString('pt-BR')}
                                            </span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>

                </div>
            </div>
        </AppLayout>
    )
}

