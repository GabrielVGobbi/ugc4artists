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

export const ADMIN_NAV_ITEMS: NavItem[] = [
	{
		id: 'overview',
		label: 'Overview',
		icon: LayoutDashboard,
		href: '/admin/dashboard',
	},
	{
		id: 'campaigns',
		label: 'Minhas Campanhas',
		icon: Briefcase,
		href: '/admin/campaigns',
	},
	{
		id: 'artists',
		label: 'Artistas',
		icon: Music,
		href: '/admin/artists',
	},
	{
		id: 'brands',
		label: 'Marcas',
		icon: Users,
		href: '/admin/brands',
	},
	{
		id: 'proposals',
		label: 'Propostas',
		icon: FileText,
		href: '/admin/proposals',
		badge: 5,
	},
	{
		id: 'analytics',
		label: 'Analytics',
		icon: PieChart,
		href: '/admin/analytics',
	},
	{
		id: 'inbox',
		label: 'Mensagens',
		icon: MessageSquare,
		href: '/admin/inbox',
		badge: 3,
	},
	{
		id: 'payments',
		label: 'Pagamentos',
		icon: DollarSign,
		href: '/admin/payments',
	},
]

export const ADMIN_BOTTOM_NAV: NavItem[] = [
	{
		id: 'studio',
		label: 'Studio AI',
		icon: Zap,
		href: '/admin/studio',
	},
	{
		id: 'settings',
		label: 'Configurações',
		icon: Settings,
		href: '/admin/settings',
	},
]

export const ADMIN_COLORS = {
	primary: '#FF4D00',
	bg: '#FAF9F6',
	sidebar: '#0A0A0A',
	surface: '#FFFFFF',
	text: '#0A0A0A',
	muted: '#71717A',
}

export const getPageTitle = (pathname: string): { title: string; subtitle: string } => {
	const titles: Record<string, { title: string; subtitle: string }> = {
		'/admin/dashboard': {
			title: 'Bem vindo, Gabriel',
			subtitle: '',
		},
		'/admin/campaigns': {
			title: 'Campanhas Ativas',
			//subtitle: 'Conectando marcas com artistas autênticos.',
		},
		'/admin/artists': {
			title: 'Artistas',
			//subtitle: 'Descubra e gerencie artistas incríveis.',
		},
		'/admin/brands': {
			title: 'Marcas Parceiras',
			subtitle: 'Empresas que confiam no UGC 4Artists.',
		},
		'/admin/proposals': {
			title: 'Propostas',
			subtitle: 'Gerencie ofertas e negociações.',
		},
		'/admin/analytics': {
			title: 'Analytics & Insights',
			subtitle: 'Dados em tempo real do ecossistema.',
		},
		'/admin/inbox': {
			title: 'Mensagens',
			subtitle: 'Comunicação direta com artistas e marcas.',
		},
		'/admin/payments': {
			title: 'Gestão Financeira',
			subtitle: 'Carteiras, transações e comissões.',
		},
		'/admin/studio': {
			title: 'Studio AI',
			subtitle: 'Crie campanhas com inteligência artificial.',
		},
		'/admin/settings': {
			title: 'Configurações',
			subtitle: 'Personalize sua experiência.',
		},
	}

	return titles[pathname] || { title: 'Admin', subtitle: 'Plataforma UGC 4Artists' }
}


