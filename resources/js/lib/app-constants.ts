import {
	LayoutDashboard,
	Users,
	Zap,
	MessageSquare,
	Settings,
	PieChart,
	Briefcase,
	Music,
	DollarSign,
	FileText,
	type LucideIcon,
} from 'lucide-react'

export interface NavItem {
	id: string
	label: string
	icon: LucideIcon
	href: string
	badge?: number
}

export const APP_NAV_ITEMS: NavItem[] = [
	{
		id: 'overview',
		label: 'Overview',
		icon: LayoutDashboard,
		href: '/app/dashboard',
	},
	{
		id: 'campaigns',
		label: 'Minhas Campanhas',
		icon: Briefcase,
		href: '/app/campaigns',
	},
	{
		id: 'artists',
		label: 'Artistas',
		icon: Music,
		href: '/app/artists',
	},
	//{
	//	id: 'brands',
	//	label: 'Marcas',
	//	icon: Users,
	//	href: '/app/brands',
	//},
	//{
	//	id: 'proposals',
	//	label: 'Propostas',
	//	icon: FileText,
	//	href: '/app/proposals',
	//	badge: 5,
	//},
	{
		id: 'analytics',
		label: 'Analytics',
		icon: PieChart,
		href: '/app/analytics',
	},
	//{
	//	id: 'inbox',
	//	label: 'Mensagens',
	//	icon: MessageSquare,
	//	href: '/app/inbox',
	//	badge: 3,
	//},
	//{
	//	id: 'payments',
	//	label: 'Pagamentos',
	//	icon: DollarSign,
	//	href: '/app/payments',
	//},
]

export const APP_BOTTOM_NAV: NavItem[] = [
	{
		id: 'studio',
		label: 'Studio AI',
		icon: Zap,
		href: '/app/studio',
	},
	{
		id: 'settings',
		label: 'Configurações',
		icon: Settings,
		href: '/app/settings',
	},
]

export const APP_COLORS = {
	primary: '#FF4D00',
	bg: '#FAF9F6',
	sidebar: '#0A0A0A',
	surface: '#FFFFFF',
	text: '#0A0A0A',
	muted: '#71717A',
}

export const getPageTitle = (pathname: string): { title: string; subtitle: string } => {
	const titles: Record<string, { title: string; subtitle: string }> = {
		'/app/dashboard': {
			title: 'Bem vindo, Gabriel',
			subtitle: '',
		},
		'/app/campaigns': {
			title: 'Campanhas Ativas',
			subtitle: 'Conectando marcas com artistas autênticos.',
		},
		'/app/artists': {
			title: 'Artistas',
			subtitle: 'Descubra e gerencie artistas incríveis.',
		},
		'/app/brands': {
			title: 'Marcas Parceiras',
			subtitle: 'Empresas que confiam no UGC 4Artists.',
		},
		'/app/proposals': {
			title: 'Propostas',
			subtitle: 'Gerencie ofertas e negociações.',
		},
		'/app/analytics': {
			title: 'Analytics & Insights',
			subtitle: 'Dados em tempo real do ecossistema.',
		},
		'/app/inbox': {
			title: 'Mensagens',
			subtitle: 'Comunicação direta com artistas e marcas.',
		},
		'/app/payments': {
			title: 'Gestão Financeira',
			subtitle: 'Carteiras, transações e comissões.',
		},
		'/app/studio': {
			title: 'Studio AI',
			subtitle: 'Crie campanhas com inteligência artificial.',
		},
		'/app/settings': {
			title: 'Configurações',
			subtitle: 'Personalize sua experiência.',
		},
        '/app/wallet': {
			title: 'Minha Carteira',
			subtitle: 'Visualize saldo, histórico de transações e recebimentos.',
		},
        '/app/wallet/add-balance': {
			title: 'Adicionar Saldo',
			subtitle: 'Adicionar saldo na carteira.',
		},
	}

	return titles[pathname] || { title: '', subtitle: '' }
}





