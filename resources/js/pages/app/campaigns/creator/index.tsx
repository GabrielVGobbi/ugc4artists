import { useState, useEffect, useRef } from 'react'
import AppLayout from '@/layouts/app-layout'
import { Head, router } from '@inertiajs/react'
import { motion, AnimatePresence } from 'motion/react'
import {
    Search,
    Sparkles,
    PlayCircle,
    CheckCircle,
    Clock,
    ArrowUpRight,
    Layers,
    ChevronRight,
    Send,
    Filter,
    Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { apiPost } from '@/lib/api'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface CampaignSubmission {
    contentUrl: string | null
    notes: string | null
    submittedAt: string | null
}

interface CreatorCampaign {
    id: number
    uuid: string
    slug: string
    title: string
    brandInstagram: string | null
    budget: number
    pricePerInfluencer: number
    status: string
    statusLabel: string
    statusColor: string
    coverImage: string | null
    slotsToApprove: number
    contentPlatforms: string[]
    applicationCloseDate: string | null
    createdAt: string | null
    updatedAt: string | null
    submission?: CampaignSubmission
    artist?: {
        id: number
        name: string
        avatar: string | null
    }
}

interface PaginationMeta {
    current_page: number
    last_page: number
    total: number
    per_page: number
}

interface CreatorCampaignsProps {
    available: {
        data: CreatorCampaign[]
        meta: PaginationMeta
    }
    active: CreatorCampaign[]
    completed: CreatorCampaign[]
}

type TabId = 'available' | 'active' | 'completed'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CLASS: Record<string, string> = {
    sent_to_creators: 'bg-blue-100 text-blue-700',
    in_progress:      'bg-emerald-100 text-emerald-700',
    completed:        'bg-primary/10 text-primary',
    cancelled:        'bg-red-100 text-red-700',
}

const PLATFORM_LABEL: Record<string, string> = {
    instagram:      'Instagram',
    tiktok:         'TikTok',
    youtube:        'YouTube',
    youtube_shorts: 'YT Shorts',
    twitter:        'Twitter/X',
}

function PlatformChip({ p }: { p: string }) {
    return (
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
            {PLATFORM_LABEL[p] ?? p}
        </span>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Available Campaign Card
// ─────────────────────────────────────────────────────────────────────────────

function AvailableCard({
    campaign,
    onApply,
    isApplying,
}: {
    campaign: CreatorCampaign
    onApply: (uuid: string) => void
    isApplying: boolean
}) {
    return (
        <div className="bg-white border border-zinc-100 rounded-[1.75rem] overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300 group flex flex-col">
            <div className="h-36 bg-zinc-100 relative overflow-hidden flex-shrink-0">
                {campaign.coverImage ? (
                    <img
                        src={campaign.coverImage}
                        alt={campaign.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Layers size={32} className="text-zinc-300" />
                    </div>
                )}
                {campaign.artist && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                        {campaign.artist.avatar ? (
                            <img
                                src={campaign.artist.avatar}
                                alt={campaign.artist.name}
                                className="w-5 h-5 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-5 h-5 rounded-full bg-zinc-600 flex items-center justify-center">
                                <span className="text-[8px] text-white font-bold">
                                    {campaign.artist.name.charAt(0)}
                                </span>
                            </div>
                        )}
                        <span className="text-white text-[10px] font-medium">{campaign.artist.name}</span>
                    </div>
                )}
            </div>
            <div className="p-5 flex flex-col flex-1">
                <p className="font-bold text-sm leading-tight line-clamp-2 mb-2">{campaign.title}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                    {campaign.contentPlatforms.slice(0, 3).map(p => (
                        <PlatformChip key={p} p={p} />
                    ))}
                </div>
                <div className="flex items-center justify-between mt-auto">
                    <div>
                        <p className="text-xs text-zinc-400">Por vaga</p>
                        <p className="text-base font-bold text-emerald-600">
                            R$ {campaign.pricePerInfluencer.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                    {campaign.applicationCloseDate && (
                        <div className="text-right">
                            <p className="text-[10px] text-zinc-400 uppercase tracking-wide">Fecha em</p>
                            <p className="text-xs font-bold text-amber-600">{campaign.applicationCloseDate}</p>
                        </div>
                    )}
                </div>
                <Button
                    onClick={() => onApply(campaign.uuid)}
                    disabled={isApplying}
                    className="mt-4 w-full rounded-xl font-bold gap-2"
                    size="sm"
                >
                    {isApplying ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : (
                        <Send size={14} />
                    )}
                    Candidatar-se
                </Button>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Active / Completed Campaign Row
// ─────────────────────────────────────────────────────────────────────────────

function CampaignRow({
    campaign,
    showSubmission = false,
}: {
    campaign: CreatorCampaign
    showSubmission?: boolean
}) {
    return (
        <a href={`/app/campaigns/${campaign.uuid}/view`} className="block">
            <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-zinc-50 transition-colors group cursor-pointer">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0">
                    {campaign.coverImage ? (
                        <img src={campaign.coverImage} alt={campaign.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Layers size={20} className="text-zinc-400" />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{campaign.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        {campaign.contentPlatforms.slice(0, 2).map(p => (
                            <PlatformChip key={p} p={p} />
                        ))}
                    </div>
                    {showSubmission && campaign.submission && (
                        <p className="text-xs mt-1 text-zinc-400">
                            {campaign.submission.submittedAt
                                ? `Entregue em ${campaign.submission.submittedAt}`
                                : 'Entrega pendente'}
                        </p>
                    )}
                </div>
                <div className="text-right flex-shrink-0">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_CLASS[campaign.status] ?? 'bg-zinc-100 text-zinc-600'}`}>
                        {campaign.statusLabel}
                    </span>
                    <p className="text-xs font-bold text-emerald-600 mt-1">
                        R$ {campaign.pricePerInfluencer.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <ChevronRight size={16} className="text-zinc-300 group-hover:text-zinc-500 transition-colors flex-shrink-0" />
            </div>
        </a>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mb-4">
                <Icon size={28} className="text-zinc-300" />
            </div>
            <p className="font-semibold text-zinc-400 text-sm">{title}</p>
            <p className="text-xs text-zinc-300 mt-1">{description}</p>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function CreatorCampaignsIndex({
    available,
    active,
    completed,
}: CreatorCampaignsProps) {
    const [activeTab, setActiveTab] = useState<TabId>('available')
    const [search, setSearch] = useState('')
    const [applyingId, setApplyingId] = useState<string | null>(null)

    const TABS: { id: TabId; label: string; count: number; icon: React.ElementType }[] = [
        { id: 'available', label: 'Disponíveis',  count: available.meta.total, icon: Sparkles },
        { id: 'active',    label: 'Em Andamento', count: active.length,        icon: PlayCircle },
        { id: 'completed', label: 'Concluídas',   count: completed.length,     icon: CheckCircle },
    ]

    const handleApply = async (campaignUuid: string) => {
        setApplyingId(campaignUuid)
        try {
            await apiPost(`/app/campaigns/${campaignUuid}/apply`)
            toast.success('Candidatura enviada com sucesso!')
            router.reload({ only: ['available', 'active'] })
        } catch {
            toast.error('Não foi possível enviar a candidatura. Tente novamente.')
        } finally {
            setApplyingId(null)
        }
    }

    const filteredAvailable = available.data.filter(c =>
        !search || c.title.toLowerCase().includes(search.toLowerCase())
    )
    const filteredActive = active.filter(c =>
        !search || c.title.toLowerCase().includes(search.toLowerCase())
    )
    const filteredCompleted = completed.filter(c =>
        !search || c.title.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <AppLayout>
            <Head title="Campanhas" />

            <div className="space-y-6 pb-12">

                {/* ── Header ──────────────────────────────────────────────── */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Campanhas</h1>
                        <p className="text-sm text-zinc-400 mt-0.5">Gerencie suas candidaturas e entregas</p>
                    </div>
                </div>

                {/* ── Tabs + Search ────────────────────────────────────────── */}
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-1 bg-zinc-100 rounded-2xl p-1">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                                    activeTab === tab.id
                                        ? 'bg-white text-foreground shadow-sm'
                                        : 'text-zinc-500 hover:text-zinc-700'
                                }`}
                            >
                                <tab.icon size={15} />
                                {tab.label}
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                                    activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-zinc-200 text-zinc-500'
                                }`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="relative flex-1 max-w-xs">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                        <Input
                            type="text"
                            placeholder="Buscar campanhas..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-9 rounded-xl h-10 bg-white border-zinc-200 text-sm"
                        />
                    </div>
                </div>

                {/* ── Tab Content ─────────────────────────────────────────── */}
                <AnimatePresence mode="wait">
                    {activeTab === 'available' && (
                        <motion.div
                            key="available"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                        >
                            {filteredAvailable.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {filteredAvailable.map(campaign => (
                                        <AvailableCard
                                            key={campaign.id}
                                            campaign={campaign}
                                            onApply={handleApply}
                                            isApplying={applyingId === campaign.uuid}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={Sparkles}
                                    title="Nenhuma campanha disponível"
                                    description="Volte em breve para novas oportunidades."
                                />
                            )}

                            {available.meta.last_page > 1 && (
                                <div className="mt-6 flex justify-center">
                                    <p className="text-sm text-zinc-400">
                                        Página {available.meta.current_page} de {available.meta.last_page} — {available.meta.total} campanhas
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'active' && (
                        <motion.div
                            key="active"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white border border-zinc-100 rounded-[2rem] shadow-sm overflow-hidden"
                        >
                            {filteredActive.length > 0 ? (
                                <div className="divide-y divide-zinc-50">
                                    {filteredActive.map(campaign => (
                                        <CampaignRow
                                            key={campaign.id}
                                            campaign={campaign}
                                            showSubmission
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={PlayCircle}
                                    title="Nenhuma campanha em andamento"
                                    description="Candidate-se às campanhas disponíveis."
                                />
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'completed' && (
                        <motion.div
                            key="completed"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white border border-zinc-100 rounded-[2rem] shadow-sm overflow-hidden"
                        >
                            {filteredCompleted.length > 0 ? (
                                <div className="divide-y divide-zinc-50">
                                    {filteredCompleted.map(campaign => (
                                        <CampaignRow
                                            key={campaign.id}
                                            campaign={campaign}
                                            showSubmission
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={CheckCircle}
                                    title="Nenhuma campanha concluída"
                                    description="Suas campanhas finalizadas aparecerão aqui."
                                />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </AppLayout>
    )
}
