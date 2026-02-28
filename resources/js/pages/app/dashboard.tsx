import AppLayout from '@/layouts/app-layout'
import {
    ArrowUpRight,
    Plus,
    MoreHorizontal,
    Filter,
    Clock,
    Flame,
    Sparkles,
    Users,
    CreditCard,
    FileText,
    CheckCircle,
    XCircle,
    AlertCircle,
} from 'lucide-react'
import { Head, Link } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { getAllPeople, getAvatarUrl } from '@/lib/examples/data'
import { motion } from "motion/react";
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import type { CampaignStatus } from '@/types/campaign'
import CampaignController from '@/actions/App/Http/Controllers/App/CampaignController'

// ─────────────────────────────────────────────────────────────────────────────
// Types (espelho do DashboardService)
// ─────────────────────────────────────────────────────────────────────────────

interface DashboardStats {
    totalCampaigns: number
    activeCampaigns: number
    underReview: number
    completed: number
    drafts: number
    awaitingPayment: number
    totalInvested: number
}

interface CampaignCard {
    id: number
    uuid: string
    slug: string
    title: string
    brandInstagram: string | null
    budget: number
    status: CampaignStatus
    statusLabel: string
    statusColor: string
    coverImage: string | null
    slotsToApprove: number
    pricePerInfluencer: number
    createdAt: string | null
    updatedAt: string | null
}

interface RecentPayment {
    id: number
    uuid: string
    amount: number
    status: string
    statusLabel: string
    statusColor: string
    paymentMethod: string | null
    createdAt: string | null
    paidAt: string | null
}

interface TopArtist {
    id: number
    name: string
    genre: string
    avatar: string
    matchPercentage: number
    isActive: boolean
    engagement: string
}

interface DashboardProps {
    stats: DashboardStats
    featuredCampaign: CampaignCard | null
    recentCampaigns: CampaignCard[]
    recentPayments: RecentPayment[]
    topArtists: TopArtist[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatCurrency(cents: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(cents / 100)
}

function formatCurrencyFromFloat(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value)
}

const STATUS_BADGE_CLASSES: Record<string, string> = {
    draft: 'bg-zinc-100 text-zinc-700',
    under_review: 'bg-amber-100 text-amber-700',
    awaiting_payment: 'bg-amber-100 text-amber-700',
    sent_to_creators: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-primary/10 text-primary',
    cancelled: 'bg-red-100 text-red-700',
}

const PAYMENT_STATUS_BADGE: Record<string, string> = {
    draft: 'bg-zinc-100 text-zinc-600',
    pending: 'bg-amber-100 text-amber-700',
    requires_action: 'bg-orange-100 text-orange-700',
    paid: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-red-100 text-red-700',
    canceled: 'bg-zinc-100 text-zinc-600',
    refunded: 'bg-blue-100 text-blue-700',
}

const PAYMENT_STATUS_ICON: Record<string, React.ReactNode> = {
    paid: <CheckCircle size={14} className="text-emerald-600" />,
    pending: <Clock size={14} className="text-amber-600" />,
    requires_action: <AlertCircle size={14} className="text-orange-600" />,
    failed: <XCircle size={14} className="text-red-600" />,
    canceled: <XCircle size={14} className="text-zinc-500" />,
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function Dashboard({
    stats,
    featuredCampaign,
    recentCampaigns,
    recentPayments,
}: DashboardProps) {

    const artists = {
        avatars: getAllPeople()
            .slice(0, 5)
            .map((person) => ({
                src: getAvatarUrl(person.avatar, 90),
                alt: `${person.name} avatar`,
            })),
    };

    const topArtists = {
        avatars: getAllPeople()
            .slice(0, 5)
            .map((person) => ({
                src: getAvatarUrl(person.avatar, 90),
                alt: `${person.name} avatar`,
                name: `${person.name}`,
            })),
    }

    const hasFeatured = featuredCampaign !== null

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="grid grid-cols-12 gap-8 pb-12">

                {/* ── Card: Artistas (mock por enquanto) ─────────────────────── */}
                <div className="col-span-12 lg:col-span-6">
                    <div className="bg-foreground rounded-[2.5rem] p-8 h-full flex items-center justify-between text-white relative overflow-hidden group shadow-2xl">
                        <div className="relative z-10">
                            <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">Artistas Ativos</h4>
                            <div className="flex items-center gap-4">
                                <span className="text-7xl font-bold tracking-tighter italic">158</span>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                        <span>82 Online</span>
                                    </div>
                                    <p className="text-zinc-500 text-xs font-medium max-w-[120px]">Novos talentos ingressando agora.</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative z-10 flex -space-x-4">
                            {artists.avatars.map((avatar, index) => (
                                <motion.div
                                    key={`${avatar.src}-${index}`}
                                    style={{ display: "inline-block" }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 20,
                                    }}
                                    whileHover={{ y: -8 }}
                                >
                                    <Avatar className="size-16 border">
                                        <AvatarImage className=' rounded-3xl border-4 border-secondary object-cover hover:-translate-y-2 transition-transform cursor-pointer' alt={avatar.alt} src={avatar.src} />
                                    </Avatar>
                                </motion.div>
                            ))}
                        </div>
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                    </div>
                </div>

                {/* ── Card: Campanhas Ativas ──────────────────────────────────── */}
                <div className="col-span-12 lg:col-span-3">
                    <div className="bg-primary rounded-[2.5rem] p-8 h-full flex flex-col justify-between text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 shadow-xl shadow-orange-500/10">
                        <div className="relative z-10 flex justify-between items-start">
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                <Flame size={24} />
                            </div>
                        </div>
                        <div className="relative z-10 mt-8">
                            <h4 className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">Campanhas Ativas</h4>
                            <div className="flex items-end gap-2">
                                <span className="text-6xl font-bold tracking-tighter">{stats.activeCampaigns}</span>
                                {stats.totalCampaigns > 0 && (
                                    <span className="text-sm font-bold mb-2 bg-white/20 px-2 py-0.5 rounded-lg">
                                        {stats.totalCampaigns} total
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                    </div>
                </div>

                {/* ── Card: Em Análise ────────────────────────────────────────── */}
                <div className="col-span-12 lg:col-span-3">
                    <div className="bg-white rounded-[2.5rem] p-8 h-full flex flex-col justify-between shadow-sm border border-zinc-100 group hover:border-primary/20 transition-all duration-500">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-zinc-100 rounded-2xl text-zinc-500 group-hover:bg-secondary group-hover:text-white transition-all">
                                <Clock size={24} />
                            </div>
                        </div>
                        <div className="mt-8">
                            <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1">Em Análise</h4>
                            <div className="flex items-end gap-2">
                                <span className="text-6xl font-bold tracking-tighter text-foreground">{stats.underReview}</span>
                                {stats.awaitingPayment > 0 && (
                                    <span className="text-xs font-bold mb-2 text-orange-500 italic">
                                        {stats.awaitingPayment} aguardando pgto
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Row: Nova Campanha + Destaque ───────────────────────────── */}
                <div className="grid grid-cols-12 gap-8 lg:col-span-12">
                    <Link href={CampaignController.create()} className="col-span-12 lg:col-span-4 group cursor-pointer">
                        <div className="bg-white border-2 border-zinc-100 rounded-[3rem] p-5 h-full flex flex-col items-center justify-center text-center relative overflow-hidden hover:border-primary transition-all duration-500 group">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-50/50 group-hover:text-primary/5 transition-colors duration-500">
                                <Plus size={300} strokeWidth={1} />
                            </div>

                            <div className="relative z-10 mb-8">
                                <div className="w-24 h-24 bg-[#FAF9F6] rounded-[2rem] flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-500 group-hover:rotate-90 group-hover:scale-110">
                                    <Plus size={40} strokeWidth={3} />
                                </div>
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-3xl font-bold tracking-tight text-foreground mb-3">Nova Campanha</h3>
                                <p className="text-zinc-400 text-sm font-medium max-w-[200px] mx-auto leading-relaxed">
                                    Crie um novo briefing criativo e conecte-se com os melhores talentos UGC.
                                </p>
                            </div>

                            <div className="mt-5 relative z-10 flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-[0.2em] opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                                <span>Começar agora</span>
                            </div>
                        </div>
                    </Link>

                    {/* Campanha em Destaque */}
                    <div className="col-span-12 lg:col-span-8 bg-white rounded-[2.5rem] p-10 relative overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-500">
                        <div className="flex justify-between items-start relative z-10">
                            <div className="space-y-6 max-w-lg">
                                <span className="hidden  px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
                                    {hasFeatured ? 'Campanha em Destaque' : 'Comece aqui'}
                                </span>
                                <h3 className="text-5xl font-bold leading-tight">
                                    {hasFeatured
                                        ? featuredCampaign.title
                                        : 'Crie sua primeira campanha'}
                                </h3>
                                <p className="text-zinc-500 text-lg leading-relaxed">
                                    {hasFeatured
                                        ? `${featuredCampaign.statusLabel} — ${featuredCampaign.slotsToApprove} vagas a ${formatCurrencyFromFloat(featuredCampaign.pricePerInfluencer)} cada.`
                                        : 'Monte seu briefing, defina o orçamento e conecte-se com criadores de conteúdo autênticos para sua marca.'}
                                </p>
                                <div className="flex items-center gap-4 pt-4">
                                    {hasFeatured ? (
                                        <>
                                            <Link href={`/app/campaigns/${featuredCampaign.slug}`}>
                                                <Button variant={"secondary"} className="rounded-2xl font-bold flex items-center gap-3 transition-colors">
                                                    Gerenciar Campanha <ArrowUpRight size={20} />
                                                </Button>
                                            </Link>
                                            <Button size={"none"} className="p-4 border-2 border-zinc-100 rounded-2xl hover:border-zinc-200 transition-colors">
                                                <MoreHorizontal size={24} />
                                            </Button>
                                        </>
                                    ) : (
                                        <Link href="/app/campaigns/create">
                                            <Button variant={"secondary"} className="rounded-2xl font-bold flex items-center gap-3 transition-colors">
                                                Criar Campanha <Plus size={20} />
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Card visual lateral */}
                            <div className="hidden xl:block relative">
                                {hasFeatured ? (
                                    <div className="w-64 h-80 rounded-[2.5rem] overflow-hidden rotate-3 hover:rotate-0 transition-transform duration-700 shadow-2xl relative">
                                        <img
                                            src={featuredCampaign.coverImage || '/assets/images/blank_v2.jpg'}
                                            alt={featuredCampaign.title}
                                            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                        <div className="absolute top-5 right-5">
                                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase backdrop-blur-md ${STATUS_BADGE_CLASSES[featuredCampaign.status] || 'bg-white/20 text-white'}`}>
                                                {featuredCampaign.statusLabel}
                                            </span>
                                        </div>
                                        <div className="absolute bottom-6 left-6 right-6 text-white">
                                            <p className="text-xs font-medium uppercase tracking-widest opacity-70 mb-1">
                                                Orçamento
                                            </p>
                                            <p className="text-2xl font-bold tracking-tight">{formatCurrencyFromFloat(featuredCampaign.budget)}</p>
                                            <div className="flex items-center gap-2 mt-2 text-xs text-white/70">
                                                <Users size={12} />
                                                <span>{featuredCampaign.slotsToApprove} vagas</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-64 h-80 rounded-[2.5rem] overflow-hidden rotate-3 hover:rotate-0 transition-transform duration-700 shadow-2xl relative bg-gradient-to-br from-primary/90 to-primary">
                                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center">
                                            <div className="w-20 h-20 bg-white/20 rounded-[1.5rem] flex items-center justify-center mb-6 backdrop-blur-sm">
                                                <Sparkles size={36} />
                                            </div>
                                            <p className="text-lg font-bold leading-snug mb-2">Sua campanha aqui</p>
                                            <p className="text-sm text-white/70 leading-relaxed">
                                                Crie sua primeira campanha e veja ela em destaque.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="absolute top-[-10%] left-[60%] w-[500px] h-[500px] bg-primary/[0.02] rounded-full blur-[100px] -z-0"></div>
                    </div>
                </div>

                {/* ── Top Artistas (mock - implementar depois) ────────────────── */}
                <div className="col-span-12 lg:col-span-7 bg-foreground rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                    <div className="flex justify-between items-center mb-10 relative z-10">
                        <h4 className="text-2xl font-bold tracking-tight">
                            Top Artistas em Destaque
                        </h4>
                        <button className="cursor-pointer flex items-center gap-2 bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-full transition-all text-sm font-medium">
                            <Filter size={16} /> Filtrar
                        </button>
                    </div>

                    {topArtists.avatars.length > 0 ? (
                        <div className="space-y-6 relative z-10">
                            {topArtists.avatars.map((artist) => (
                                <div
                                    key={artist.id}
                                    className="flex items-center justify-between p-4 rounded-3xl hover:bg-white/5 transition-all group cursor-pointer border border-primary/35 hover:border-white/10"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="relative">
                                            <img
                                                src={artist.src}
                                                alt={artist.alt}
                                                className="w-14 h-14 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all"
                                            />
                                            {artist.isActive && (
                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary border-4 border-primary rounded-full"></div>
                                            )}
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-lg">{artist.name}</h5>

                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="hidden text-right   ">
                                            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">
                                                {artist.matchPercentage}% Match
                                            </p>
                                            <div className="h-1.5 w-24 bg-zinc-800 rounded-full mt-2 overflow-hidden ">
                                                <div
                                                    className="h-full bg-primary"
                                                    style={{ width: `${artist.matchPercentage}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className="text-right hidden md:block">
                                            <p className="text-xs text-zinc-500 font-medium">Engajamento</p>
                                            <p className="text-sm font-bold">{artist.engagement}</p>
                                        </div>
                                        <button className="p-3 bg-white/5 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all">
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 relative z-10 text-center">
                            <Sparkles size={48} className="text-zinc-600 mb-4" />
                            <h5 className="text-xl font-bold mb-2">Em breve</h5>
                            <p className="text-zinc-500 text-sm max-w-[280px]">
                                A seção de artistas em destaque está sendo preparada. Fique ligado!
                            </p>
                        </div>
                    )}

                    <div className="absolute bottom-[-100px] right-[-100px] w-64 h-64 border border-white/5 rounded-full pointer-events-none"></div>
                </div>

                {/* ── Atividades Recentes (campanhas + pagamentos) ────────────── */}
                <div className="col-span-12 lg:col-span-5 bg-white rounded-[2.5rem] p-10 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h4 className="text-2xl font-bold tracking-tight mb-1">
                            Atividades Recentes
                        </h4>
                        <Link href="/app/campaigns">
                            <Button size={"none"} className="px-6 py-3 bg-zinc-50 hover:bg-zinc-100 rounded-xl font-medium text-sm transition-all border border-zinc-200 text-foreground">
                                Ver Todas
                            </Button>
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {/* Campanhas recentes */}
                        {recentCampaigns.length > 0 ? (
                            recentCampaigns.map((campaign) => (
                                <Link
                                    key={`campaign-${campaign.id}`}
                                    href={`/app/campaigns/${campaign.slug}`}
                                    className="group cursor-pointer border-2 border-zinc-100 rounded-3xl p-5 hover:border-primary/30 hover:shadow-lg transition-all block"
                                >
                                    <div className="flex gap-4">
                                        {campaign.coverImage ? (
                                            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-zinc-100">
                                                <img
                                                    src={campaign.coverImage}
                                                    alt={campaign.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-20 h-20 rounded-2xl flex-shrink-0 bg-zinc-100 flex items-center justify-center">
                                                <FileText size={24} className="text-zinc-400" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-1">
                                                <h5 className="font-bold text-base group-hover:text-primary transition-colors truncate">
                                                    {campaign.title}
                                                </h5>
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap ml-2 ${STATUS_BADGE_CLASSES[campaign.status] || 'bg-zinc-100 text-zinc-700'}`}>
                                                    {campaign.statusLabel}
                                                </span>
                                            </div>
                                            {campaign.brandInstagram && (
                                                <p className="text-sm text-zinc-500 font-medium mb-2">
                                                    @{campaign.brandInstagram}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-bold text-primary">
                                                    {formatCurrencyFromFloat(campaign.budget)}
                                                </span>
                                                <span className="text-zinc-400">
                                                    {campaign.slotsToApprove} vagas
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <FileText size={32} className="text-zinc-300 mx-auto mb-3" />
                                <p className="text-zinc-400 text-sm">Nenhuma campanha ainda. Crie a primeira!</p>
                            </div>
                        )}

                        {/* Pagamentos recentes */}
                        {recentPayments.length > 0 && (
                            <>
                                <div className="pt-4 pb-2">
                                    <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                        <CreditCard size={14} />
                                        Últimos Pagamentos
                                    </h5>
                                </div>
                                {recentPayments.map((payment) => (
                                    <div
                                        key={`payment-${payment.id}`}
                                        className="flex items-center justify-between p-4 border border-zinc-100 rounded-2xl hover:border-zinc-200 transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            {PAYMENT_STATUS_ICON[payment.status] || <CreditCard size={14} className="text-zinc-400" />}
                                            <div>
                                                <p className="text-sm font-bold">{formatCurrency(payment.amount)}</p>
                                                <p className="text-xs text-zinc-400">{payment.createdAt}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${PAYMENT_STATUS_BADGE[payment.status] || 'bg-zinc-100 text-zinc-600'}`}>
                                            {payment.statusLabel}
                                        </span>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
