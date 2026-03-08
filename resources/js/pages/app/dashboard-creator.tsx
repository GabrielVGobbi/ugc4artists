import AppLayout from '@/layouts/app-layout'
import { Head, Link, usePage } from '@inertiajs/react'
import { motion } from 'motion/react'
import {
    TrendingUp,
    Wallet,
    PlayCircle,
    CheckCircle,
    Clock,
    Sparkles,
    ArrowUpRight,
    Star,
    DollarSign,
    Layers,
    ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { SharedData } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface CreatorStats {
    totalAccepted: number
    inProgress: number
    completed: number
    available: number
    totalEarned: number
    pendingEarnings: number
    balanceFloat: number
    balanceFormatted: string
}

interface CampaignCard {
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
    artist?: {
        id: number
        name: string
        avatar: string | null
    }
}

interface EarningEntry {
    id: string
    amount: number
    amountFloat: number
    amountFormatted: string
    description: string
    type: string
    createdAt: string | null
}

interface CreatorDashboardProps {
    stats: CreatorStats
    activeCampaigns: CampaignCard[]
    availableCampaigns: CampaignCard[]
    recentEarnings: EarningEntry[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
    sent_to_creators: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-primary/10 text-primary',
    cancelled: 'bg-red-100 text-red-700',
}

const PLATFORM_LABEL: Record<string, string> = {
    instagram: 'Instagram',
    tiktok: 'TikTok',
    youtube: 'YouTube',
    twitter: 'Twitter/X',
}

function PlatformBadge({ platform }: { platform: string }) {
    return (
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
            {PLATFORM_LABEL[platform] ?? platform}
        </span>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({
    label,
    value,
    sub,
    icon: Icon,
    accent,
}: {
    label: string
    value: string | number
    sub?: string
    icon: React.ElementType
    accent?: string
}) {
    return (
        <div className={`rounded-[2rem] p-7 flex flex-col justify-between h-full relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 ${accent ?? 'bg-white border border-zinc-100 shadow-sm'}`}>
            <div className="flex justify-between items-start relative z-10">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                    <Icon size={22} />
                </div>
            </div>
            <div className="relative z-10 mt-6">
                <h4 className="text-xs font-bold uppercase tracking-widest mb-1 opacity-70">{label}</h4>
                <div className="flex items-end gap-2">
                    <span className="text-5xl font-bold tracking-tighter">{value}</span>
                    {sub && (
                        <span className="text-xs font-bold mb-1.5 opacity-60">{sub}</span>
                    )}
                </div>
            </div>
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Campaign Row (active/in progress)
// ─────────────────────────────────────────────────────────────────────────────

function ActiveCampaignRow({ campaign }: { campaign: CampaignCard }) {
    return (
        <Link href={`/app/campaigns/${campaign.uuid}/view`} className="block">
            <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-zinc-50 transition-colors group cursor-pointer">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0">
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
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {(campaign.contentPlatforms ?? []).slice(0, 2).map(p => (
                            <PlatformBadge key={p} platform={p} />
                        ))}
                    </div>
                </div>
                <div className="text-right flex-shrink-0">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[campaign.status] ?? 'bg-zinc-100 text-zinc-600'}`}>
                        {campaign.statusLabel}
                    </span>
                    <p className="text-xs text-zinc-400 mt-1">
                        R$ {campaign.pricePerInfluencer.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <ChevronRight size={16} className="text-zinc-300 group-hover:text-zinc-500 transition-colors flex-shrink-0" />
            </div>
        </Link>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Available Campaign Card
// ─────────────────────────────────────────────────────────────────────────────

function AvailableCampaignCard({ campaign }: { campaign: CampaignCard }) {
    return (
        <Link href={`/app/campaigns/${campaign.uuid}/view`} className="block">
            <div className="bg-white border border-zinc-100 rounded-[1.75rem] overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
                <div className="h-32 bg-zinc-100 relative overflow-hidden">
                    {campaign.coverImage ? (
                        <img src={campaign.coverImage} alt={campaign.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Sparkles size={32} className="text-zinc-300" />
                        </div>
                    )}
                    <div className="absolute top-3 right-3 flex gap-1">
                        {(campaign.contentPlatforms ?? []).slice(0, 2).map(p => (
                            <PlatformBadge key={p} platform={p} />
                        ))}
                    </div>
                </div>
                <div className="p-5">
                    <p className="font-bold text-sm leading-tight line-clamp-2 mb-3">{campaign.title}</p>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-zinc-400">Pagamento por vaga</p>
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
                </div>
            </div>
        </Link>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function DashboardCreator({
    stats,
    activeCampaigns,
    availableCampaigns,
    recentEarnings,
}: CreatorDashboardProps) {
    const { auth } = usePage<SharedData>().props
    const userName = auth.user.data.name.split(' ')[0]

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="space-y-8 pb-12">

                {/* ── Welcome ──────────────────────────────────────────────── */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Olá, {userName} 👋
                        </h1>
                        <p className="text-zinc-500 text-sm mt-1">Veja suas campanhas e ganhos de hoje.</p>
                    </div>
                    <Link href="/app/campaigns">
                        <Button variant="secondary" className="rounded-2xl font-bold gap-2">
                            Ver Campanhas <ArrowUpRight size={16} />
                        </Button>
                    </Link>
                </div>

                {/* ── Stats Row ────────────────────────────────────────────── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Balance */}
                    <motion.div
                        className="col-span-2 lg:col-span-2"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="bg-foreground text-white rounded-[2rem] p-7 h-full relative overflow-hidden group hover:scale-[1.01] transition-all duration-500 shadow-2xl">
                            <div className="relative z-10 flex items-start justify-between">
                                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                    <Wallet size={22} />
                                </div>
                                <Link href="/app/wallet" className="text-xs font-bold opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1">
                                    Sacar <ArrowUpRight size={12} />
                                </Link>
                            </div>
                            <div className="relative z-10 mt-6">
                                <h4 className="text-xs font-bold uppercase tracking-widest mb-1 text-zinc-400">Saldo Disponível</h4>
                                <span className="text-5xl font-bold tracking-tighter">{stats.balanceFormatted}</span>
                                {stats.pendingEarnings > 0 && (
                                    <p className="text-xs text-zinc-400 mt-2">
                                        + {(stats.pendingEarnings / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} a receber
                                    </p>
                                )}
                            </div>
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                        </div>
                    </motion.div>

                    {/* In Progress */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                    >
                        <StatCard
                            label="Em Andamento"
                            value={stats.inProgress}
                            icon={PlayCircle}
                            accent="bg-primary text-white shadow-xl shadow-orange-500/10"
                        />
                    </motion.div>

                    {/* Available */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                    >
                        <StatCard
                            label="Disponíveis"
                            value={stats.available}
                            sub="para se candidatar"
                            icon={Sparkles}
                        />
                    </motion.div>
                </div>

                {/* ── Second Stats Row ─────────────────────────────────────── */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white border border-zinc-100 rounded-[1.75rem] p-6 flex items-center gap-4 shadow-sm">
                        <div>
                            <p className="text-3xl font-bold tracking-tight">{stats.completed}</p>
                            <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Concluídas</p>
                        </div>
                    </div>
                    <div className="bg-white border border-zinc-100 rounded-[1.75rem] p-6 flex items-center gap-4 shadow-sm">

                        <div>
                            <p className="text-3xl font-bold tracking-tight">{stats.totalAccepted}</p>
                            <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Total Aceitas</p>
                        </div>
                    </div>
                    <div className="bg-white border border-zinc-100 rounded-[1.75rem] p-6 flex items-center gap-4 shadow-sm">

                        <div>
                            <p className="text-3xl font-bold tracking-tight">
                                {(stats.totalEarned / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                            <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Total Ganho</p>
                        </div>
                    </div>
                </div>

                {/* ── Main Content Grid ────────────────────────────────────── */}
                <div className="grid grid-cols-12 gap-6">

                    {/* Active Campaigns */}
                    <div className="col-span-12 lg:col-span-7 bg-white border border-zinc-100 rounded-[2rem] p-7 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-base font-bold tracking-tight">Campanhas Ativas</h2>
                            <Link href="/app/campaigns" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                                Ver todas <ChevronRight size={14} />
                            </Link>
                        </div>

                        {activeCampaigns.length > 0 ? (
                            <div className="space-y-1">
                                {activeCampaigns.map(campaign => (
                                    <ActiveCampaignRow key={campaign.id} campaign={campaign} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mb-4">
                                    <PlayCircle size={28} className="text-zinc-300" />
                                </div>
                                <p className="font-semibold text-zinc-400">Nenhuma campanha ativa</p>
                                <p className="text-sm text-zinc-300 mt-1">Candidate-se a campanhas disponíveis abaixo.</p>
                            </div>
                        )}
                    </div>

                    {/* Recent Earnings */}
                    <div className="col-span-12 lg:col-span-5 bg-white border border-zinc-100 rounded-[2rem] p-7 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-base font-bold tracking-tight">Ganhos Recentes</h2>
                            <Link href="/app/wallet" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                                Ver carteira <ChevronRight size={14} />
                            </Link>
                        </div>

                        {recentEarnings.length > 0 ? (
                            <div className="space-y-3">
                                {recentEarnings.map(earning => (
                                    <div key={earning.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 transition-colors">
                                        <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <DollarSign size={16} className="text-emerald-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{earning.description}</p>
                                            <p className="text-xs text-zinc-400">{earning.createdAt}</p>
                                        </div>
                                        <span className="text-sm font-bold text-emerald-600 flex-shrink-0">
                                            + {earning.amountFormatted}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mb-4">
                                    <DollarSign size={28} className="text-zinc-300" />
                                </div>
                                <p className="font-semibold text-zinc-400">Sem ganhos ainda</p>
                                <p className="text-sm text-zinc-300 mt-1">Complete campanhas para receber pagamentos.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Available Campaigns ──────────────────────────────────── */}
                {availableCampaigns.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-lg font-bold tracking-tight">Campanhas Disponíveis</h2>
                                <p className="text-sm text-zinc-400 mt-0.5">Oportunidades abertas para candidatura</p>
                            </div>
                            <Link href="/app/campaigns">
                                <Button variant="outline" className="rounded-xl text-sm font-bold gap-2">
                                    Ver todas <ArrowUpRight size={14} />
                                </Button>
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            {availableCampaigns.map(campaign => (
                                <motion.div
                                    key={campaign.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <AvailableCampaignCard campaign={campaign} />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </AppLayout>
    )
}
