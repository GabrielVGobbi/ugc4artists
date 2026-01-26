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
				{/* Primary Highlight Card - Campaign Spotlight */}
				<div className="col-span-12 lg:col-span-8 bg-white rounded-[2.5rem] p-10 relative overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-500">
					<div className="flex justify-between items-start relative z-10">
						<div className="space-y-6 max-w-lg">
							<span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
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
					<div className="absolute top-[-10%] left-[60%] w-[500px] h-[500px] bg-primary/[0.02] rounded-full blur-[100px] -z-0"></div>
				</div>

				{/* Revenue Stats Card */}
				<div className="col-span-12 lg:col-span-4 bg-white rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between border-t-4 border-primary group">
					<div className="flex justify-between items-center">
						<div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
							<DollarSign size={24} />
						</div>
						<span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
							Receita Total
						</span>
					</div>
					<div>
						<h4 className="text-6xl font-bold tracking-tighter">
							{formatCurrency(stats.totalRevenue)}
						</h4>
						<p className="text-emerald-500 font-bold text-sm mt-2 flex items-center gap-1 italic">
							<ArrowUpRight size={16} /> +{stats.revenueGrowth}% este mês
						</p>
					</div>
					<div className="pt-8">
						<p className="text-zinc-400 text-sm font-medium leading-relaxed">
							Seu ecossistema está gerando{' '}
							<span className="text-[#0A0A0A] font-bold underline decoration-primary/30">
								resultados excepcionais
							</span>{' '}
							este trimestre.
						</p>
					</div>
				</div>

				{/* Quick Stats Grid */}
				<div className="col-span-12 lg:col-span-3 bg-white rounded-[2.5rem] p-8 shadow-sm hover:shadow-lg transition-all group">
					<div className="flex items-center justify-between mb-6">
						<div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
							<Briefcase size={20} className="text-emerald-600" />
						</div>
						<ArrowUpRight
							size={20}
							className="text-emerald-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
						/>
					</div>
					<h4 className="text-4xl font-bold mb-2">{stats.activeCampaigns}</h4>
					<p className="text-zinc-500 text-sm font-medium">Campanhas Ativas</p>
					<div className="mt-4 pt-4 border-t border-zinc-100">
						<p className="text-xs text-zinc-400">
							<span className="text-emerald-600 font-bold">
								+{stats.campaignsGrowth}%
							</span>{' '}
							vs. mês anterior
						</p>
					</div>
				</div>

				<div className="col-span-12 lg:col-span-3 bg-white rounded-[2.5rem] p-8 shadow-sm hover:shadow-lg transition-all group">
					<div className="flex items-center justify-between mb-6">
						<div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
							<Music size={20} className="text-purple-600" />
						</div>
						<TrendingUp
							size={20}
							className="text-purple-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
						/>
					</div>
					<h4 className="text-4xl font-bold mb-2">{stats.totalArtists}</h4>
					<p className="text-zinc-500 text-sm font-medium">Artistas Ativos</p>
					<div className="mt-4 pt-4 border-t border-zinc-100">
						<p className="text-xs text-zinc-400">Pool de talentos crescendo</p>
					</div>
				</div>

				<div className="col-span-12 lg:col-span-3 bg-white rounded-[2.5rem] p-8 shadow-sm hover:shadow-lg transition-all group">
					<div className="flex items-center justify-between mb-6">
						<div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
							<Users size={20} className="text-blue-600" />
						</div>
						<ArrowUpRight
							size={20}
							className="text-blue-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
						/>
					</div>
					<h4 className="text-4xl font-bold mb-2">{stats.totalBrands}</h4>
					<p className="text-zinc-500 text-sm font-medium">Marcas Parceiras</p>
					<div className="mt-4 pt-4 border-t border-zinc-100">
						<p className="text-xs text-zinc-400">Empresas confiando em nós</p>
					</div>
				</div>

				<div className="col-span-12 lg:col-span-3 bg-gradient-to-br from-primary to-[#FF6A33] rounded-[2.5rem] p-8 shadow-lg hover:shadow-2xl transition-all group text-white relative overflow-hidden">
					<div className="absolute top-[-50%] right-[-50%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
					<div className="relative z-10">
						<div className="flex items-center justify-between mb-6">
							<div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
								<Filter size={20} />
							</div>
							<span className="text-xs font-bold opacity-80 uppercase tracking-widest">
								Pendentes
							</span>
						</div>
						<h4 className="text-5xl font-bold mb-2">{stats.pendingProposals}</h4>
						<p className="text-white/90 text-sm font-medium">Propostas Aguardando</p>
						<button className="mt-6 w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl font-bold text-sm transition-all backdrop-blur-sm">
							Revisar Agora →
						</button>
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
											<div className="absolute -top-1 -right-1 w-4 h-4 bg-primary border-4 border-[#0A0A0A] rounded-full"></div>
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
												className="h-full bg-primary"
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
									<button className="p-3 bg-white/5 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all">
										<Plus size={20} />
									</button>
								</div>
							</div>
						))}
					</div>

					{/* Dynamic Background Circle */}
					<div className="absolute bottom-[-100px] right-[-100px] w-64 h-64 border border-white/5 rounded-full pointer-events-none"></div>
				</div>

				{/* AI Studio Card */}
				<div className="col-span-12 lg:col-span-5 bg-gradient-to-br from-zinc-50 to-zinc-100 border-2 border-zinc-200 rounded-[2.5rem] p-10 flex flex-col justify-between hover:border-primary/30 transition-all cursor-pointer group relative overflow-hidden">
					<div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
					<div className="relative z-10">
						<div className="w-16 h-16 bg-gradient-to-br from-primary to-[#FF6A33] rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 mb-6">
							<Play size={28} fill="white" className="text-white" />
						</div>
						<span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider mb-4">
							Novo Recurso
						</span>
						<h5 className="text-3xl font-bold mb-3">Studio AI</h5>
						<p className="text-zinc-600 text-base font-medium leading-relaxed mb-8">
							Crie briefings de campanhas inteligentes a partir de ideias. Deixe a IA
							encontrar os artistas perfeitos para sua marca.
						</p>
						<button className="w-full py-4 bg-[#0A0A0A] text-white rounded-2xl font-bold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2">
							Experimentar Agora
							<ArrowUpRight size={20} />
						</button>
					</div>
				</div>

				{/* Recent Activity */}
				<div className="col-span-12 bg-white rounded-[2.5rem] p-10 shadow-sm">
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

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{recentCampaigns.map((campaign) => (
							<div
								key={campaign.id}
								className="group cursor-pointer border-2 border-zinc-100 rounded-3xl p-6 hover:border-primary/30 hover:shadow-lg transition-all"
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
											<h5 className="font-bold text-lg group-hover:text-primary transition-colors truncate">
												{campaign.title}
											</h5>
											<span
												className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap ml-2 ${
													campaign.status === 'Em andamento'
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
											<span className="font-bold text-primary">
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

