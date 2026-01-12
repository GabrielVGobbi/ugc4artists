import AdminLayout from '@/layouts/admin-layout'
import {
    ArrowUpRight,
    ArrowDownRight,
    Play,
    Plus,
    MoreHorizontal,
    Filter,
    TrendingUp,
    Users,
    Briefcase,
    DollarSign,
    Music,
    Clock,
    Flame,
    Sparkles,
} from 'lucide-react'
import { Head } from '@inertiajs/react'
import { Button } from '@/components/ui/button'

interface DashboardStats {
    totalCampaigns: number
    activeCampaigns: number
    totalArtists: number
    totalBrands: number
    totalRevenue: number
    pendingProposals: number
    revenueGrowth: number
    campaignsGrowth: number
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

interface RecentCampaign {
    id: number
    title: string
    brand: string
    budget: string
    status: 'Em andamento' | 'Draft' | 'Completed'
    participants: number
    thumbnail: string
}

interface DashboardProps {
    stats: DashboardStats
    topArtists: TopArtist[]
    recentCampaigns: RecentCampaign[]
}

export default function Dashboard({
    stats = {
        totalCampaigns: 142,
        activeCampaigns: 38,
        totalArtists: 1284,
        totalBrands: 76,
        totalRevenue: 842350,
        pendingProposals: 23,
        revenueGrowth: 12.5,
        campaignsGrowth: 8.3,
    },
    topArtists = [
        {
            id: 1,
            name: 'Marina Silva',
            genre: 'Pop/Eletrônico',
            avatar: 'https://ui-avatars.com/api/?name=Marina+Silva&background=FF4D00&color=fff',
            matchPercentage: 98,
            isActive: true,
            engagement: '245K',
        },
        {
            id: 2,
            name: 'Pedro Santos',
            genre: 'Hip Hop/Trap',
            avatar: 'https://ui-avatars.com/api/?name=Pedro+Santos&background=0A0A0A&color=fff',
            matchPercentage: 94,
            isActive: false,
            engagement: '189K',
        },
        {
            id: 3,
            name: 'Julia Mendes',
            genre: 'MPB/Indie',
            avatar: 'https://ui-avatars.com/api/?name=Julia+Mendes&background=FF4D00&color=fff',
            matchPercentage: 91,
            isActive: true,
            engagement: '167K',
        },
    ],
    recentCampaigns = [
        {
            id: 1,
            title: 'Verão Autêntico 2025',
            brand: 'Natura',
            budget: 'R$ 85.000',
            status: 'Em Andamento' as const,
            participants: 12,
            thumbnail: 'https://picsum.photos/seed/campaign1/400/300',
        },
        {
            id: 2,
            title: 'Urban Style Collection',
            brand: 'Adidas',
            budget: 'R$ 120.000',
            status: 'Em Andamento' as const,
            participants: 18,
            thumbnail: 'https://picsum.photos/seed/campaign2/400/300',
        },
    ],
}: DashboardProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
        }).format(value)
    }

    return (
        <AdminLayout>
            <Head title="Dashboard - Admin" />

            <div className="grid grid-cols-12 gap-8 pb-12">

                <div className="col-span-12 lg:col-span-6">
                    <div className="bg-[#0A0A0A] rounded-[2.5rem] p-8 h-full flex items-center justify-between text-white relative overflow-hidden group shadow-2xl">
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
                            {[1, 2, 3, 4, 5].map(i => (
                                <img
                                    key={i}
                                    src={`https://picsum.photos/seed/creator${i}/100/100`}
                                    className="w-16 h-16 rounded-3xl border-4 border-[#0A0A0A] object-cover hover:-translate-y-2 transition-transform cursor-pointer"
                                    alt="Creator"
                                />
                            ))}
                        </div>
                        {/* Subtle grid pattern */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-3">
                    <div className="bg-[#FF4D00] rounded-[2.5rem] p-8 h-full flex flex-col justify-between text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 shadow-xl shadow-orange-500/10">
                        <div className="relative z-10 flex justify-between items-start">
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                <Flame size={24} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">Live Now</span>
                        </div>
                        <div className="relative z-10 mt-8">
                            <h4 className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">Campanhas Ativas</h4>
                            <div className="flex items-end gap-2">
                                <span className="text-6xl font-bold tracking-tighter">24</span>
                                <span className="text-sm font-bold mb-2 bg-white/20 px-2 py-0.5 rounded-lg">+4</span>
                            </div>
                        </div>
                        {/* Decorative element */}
                        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-3">
                    <div className="bg-white rounded-[2.5rem] p-8 h-full flex flex-col justify-between shadow-sm border border-zinc-100 group hover:border-[#FF4D00]/20 transition-all duration-500">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-zinc-100 rounded-2xl text-zinc-500 group-hover:bg-[#0A0A0A] group-hover:text-white transition-all">
                                <Clock size={24} />
                            </div>
                            <div className="flex -space-x-2">
                                {[1, 2].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-zinc-200 overflow-hidden">
                                        <img src={`https://picsum.photos/seed/a${i}/50/50`} alt="User" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-8">
                            <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1">Em Análise</h4>
                            <div className="flex items-end gap-2">
                                <span className="text-6xl font-bold tracking-tighter text-[#0A0A0A]">12</span>
                                <span className="text-xs font-bold mb-2 text-orange-500 italic">Reviewing</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-8 lg:col-span-12">
                    <div className="col-span-12 lg:col-span-4 group cursor-pointer">
                        <div className="bg-white border-2 border-zinc-100 rounded-[3rem] p-5 h-full flex flex-col items-center justify-center text-center relative overflow-hidden hover:border-[#FF4D00] transition-all duration-500 group">
                            {/* Animated Background Icon */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-50/50 group-hover:text-[#FF4D00]/5 transition-colors duration-500">
                                <Plus size={300} strokeWidth={1} />
                            </div>

                            <div className="relative z-10 mb-8">
                                <div className="w-24 h-24 bg-[#FAF9F6] rounded-[2rem] flex items-center justify-center text-[#FF4D00] shadow-sm group-hover:bg-[#FF4D00] group-hover:text-white transition-all duration-500 group-hover:rotate-90 group-hover:scale-110">
                                    <Plus size={40} strokeWidth={3} />
                                </div>
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-3xl font-bold tracking-tight text-[#0A0A0A] mb-3">Nova Campanha</h3>
                                <p className="text-zinc-400 text-sm font-medium max-w-[200px] mx-auto leading-relaxed">
                                    Crie um novo briefing criativo e conecte-se com os melhores talentos UGC.
                                </p>
                            </div>

                            <div className="mt-5 relative z-10 flex items-center gap-2 text-[#FF4D00] font-black uppercase text-[10px] tracking-[0.2em] opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                                <span>Começar agora</span>
                                <Sparkles size={14} />
                            </div>
                        </div>
                    </div>

                    {/* Primary Highlight Card - Campaign Spotlight */}
                    <div className="col-span-12 lg:col-span-8 bg-white rounded-[2.5rem] p-10 relative overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-500">
                        <div className="flex justify-between items-start relative z-10">
                            <div className="space-y-6 max-w-lg">
                                <span className="inline-block px-4 py-1.5 bg-[#FF4D00]/10 text-[#FF4D00] text-xs font-bold rounded-full uppercase tracking-wider">
                                    Campanha em Destaque
                                </span>
                                <h3 className="text-5xl font-bold leading-tight">
                                    {recentCampaigns[0]?.title || 'Verão Autêntico 2025'}
                                </h3>
                                <p className="text-zinc-500 text-lg leading-relaxed">
                                    Conectando marcas autênticas com artistas talentosos. Criando conteúdo
                                    que inspira e engaja audiências reais.
                                </p>
                                <div className="flex items-center gap-4 pt-4">
                                    <Button size={"none"} className="px-10 py-4 bg-[#0A0A0A] text-white rounded-2xl font-bold flex items-center gap-3 hover:bg-zinc-800 transition-colors">
                                        Gerenciar Campanha <ArrowUpRight size={20} />
                                    </Button>
                                    <Button size={"none"} className="p-4 border-2 border-zinc-100 rounded-2xl hover:border-zinc-200 transition-colors">
                                        <MoreHorizontal size={24} />
                                    </Button>
                                </div>
                            </div>

                            <div className="hidden xl:block relative">
                                <div className="w-64 h-80 rounded-[2.5rem] overflow-hidden rotate-3 hover:rotate-0 transition-transform duration-700 shadow-2xl relative">
                                    <img
                                        src={
                                            recentCampaigns[0]?.thumbnail ||
                                            'https://picsum.photos/seed/featured/400/600'
                                        }
                                        alt="Campaign"
                                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute bottom-6 left-6 text-white">
                                        <p className="text-xs font-medium uppercase tracking-widest opacity-80">
                                            Último Conteúdo
                                        </p>
                                        <p className="text-xl font-bold">São Paulo Drop</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Abstract shapes */}
                        <div className="absolute top-[-10%] left-[60%] w-[500px] h-[500px] bg-[#FF4D00]/[0.02] rounded-full blur-[100px] -z-0"></div>
                    </div>

                </div>



                {/* Top Artists Card */}
                <div className="col-span-12 lg:col-span-7 bg-[#0A0A0A] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                    <div className="flex justify-between items-center mb-10 relative z-10">
                        <h4 className="text-2xl font-bold tracking-tight">
                            Top Artistas em Destaque
                        </h4>
                        <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-full transition-all text-sm font-medium">
                            <Filter size={16} /> Filtrar
                        </button>
                    </div>

                    <div className="space-y-6 relative z-10">
                        {topArtists.map((artist, i) => (
                            <div
                                key={artist.id}
                                className="flex items-center justify-between p-4 rounded-3xl hover:bg-white/5 transition-all group cursor-pointer border border-transparent hover:border-white/10"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="relative">
                                        <img
                                            src={artist.avatar}
                                            alt={artist.name}
                                            className="w-14 h-14 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all"
                                        />
                                        {artist.isActive && (
                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF4D00] border-4 border-[#0A0A0A] rounded-full"></div>
                                        )}
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-lg">{artist.name}</h5>
                                        <p className="text-zinc-500 text-sm font-medium">
                                            {artist.genre}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">
                                            {artist.matchPercentage}% Match
                                        </p>
                                        <div className="h-1.5 w-24 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                                            <div
                                                className="h-full bg-[#FF4D00]"
                                                style={{ width: `${artist.matchPercentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="text-right hidden md:block">
                                        <p className="text-xs text-zinc-500 font-medium">
                                            Engajamento
                                        </p>
                                        <p className="text-sm font-bold">{artist.engagement}</p>
                                    </div>
                                    <button className="p-3 bg-white/5 rounded-2xl group-hover:bg-[#FF4D00] group-hover:text-white transition-all">
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Dynamic Background Circle */}
                    <div className="absolute bottom-[-100px] right-[-100px] w-64 h-64 border border-white/5 rounded-full pointer-events-none"></div>
                </div>



                {/* Recent Activity */}
                <div className="col-span-5 bg-white rounded-[2.5rem] p-10 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h4 className="text-2xl font-bold tracking-tight mb-1">
                                Atividades Recentes
                            </h4>
                        </div>
                        <Button className="px-6 py-3 bg-zinc-50 hover:bg-zinc-100 rounded-xl font-medium text-sm transition-all border border-zinc-200">
                            Ver Todas
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                        {recentCampaigns.map((campaign) => (
                            <div
                                key={campaign.id}
                                className="group cursor-pointer border-2 border-zinc-100 rounded-3xl p-6 hover:border-[#FF4D00]/30 hover:shadow-lg transition-all"
                            >
                                <div className="flex gap-4">
                                    <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-zinc-100">
                                        <img
                                            src={campaign.thumbnail}
                                            alt={campaign.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-2">
                                            <h5 className="font-bold text-lg group-hover:text-[#FF4D00] transition-colors truncate">
                                                {campaign.title}
                                            </h5>
                                            <span
                                                className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap ml-2 ${campaign.status === 'Em andamento'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : campaign.status === 'Draft'
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-zinc-100 text-zinc-700'
                                                    }`}
                                            >
                                                {campaign.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-zinc-500 font-medium mb-3">
                                            {campaign.brand}
                                        </p>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-bold text-[#FF4D00]">
                                                {campaign.budget}
                                            </span>
                                            <span className="text-zinc-400">
                                                {campaign.participants} artistas
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}


