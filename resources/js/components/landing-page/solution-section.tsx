import { ContainerSection } from '@/components/landing-page/container'
import { FadeIn, FadeInStagger } from '@/components/fade-in'
import { motion } from 'framer-motion'
import {
	ArrowUpRight,
	CreditCard,
	Filter,
	Flame,
	LineChart,
	Users2,
} from 'lucide-react'
import type { ComponentType } from 'react'

type SolutionCard = {
	title: string
	description: string
	icon: ComponentType<{ className?: string }>
	highlight: string
}

const solutionCards: SolutionCard[] = [
	{
		title: 'Criadores certos para cada nicho',
		description:
			'Encontre creators com autoridade real no seu segmento. Portfólio validado, métricas transparentes.',
		icon: Users2,
		highlight: 'Rede exclusiva',
	},
	{
		title: 'Resultados que você consegue medir',
		description:
			'Acompanhe cada entrega com indicadores visuais de performance. Previsibilidade e escala de verdade.',
		icon: LineChart,
		highlight: '+48% engajamento',
	},
	{
		title: 'Pagamentos sem dor de cabeça',
		description:
			'Carteira digital integrada, split automático e aprovação instantânea. Sem taxas escondidas.',
		icon: CreditCard,
		highlight: 'Split automático',
	},
]

/* ── Mini Dashboard Widget ── */
function DashboardWidget() {
	const artists = [
		{ name: 'Marina S.', genre: 'Pop', match: 98, active: true },
		{ name: 'Pedro R.', genre: 'Hip Hop', match: 94, active: false },
		{ name: 'Julia M.', genre: 'MPB', match: 91, active: true },
	]

	return (
		<div className="relative w-full overflow-hidden rounded-[2rem] border border-zinc-100 bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.12)]">
			{/* Top bar */}
			<div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
				<div className="flex items-center gap-3">
					<div className="flex gap-1.5">
						<span className="h-3 w-3 rounded-full bg-red-400" />
						<span className="h-3 w-3 rounded-full bg-amber-400" />
						<span className="h-3 w-3 rounded-full bg-emerald-400" />
					</div>
					<span className="text-xs font-semibold text-zinc-400">Dashboard</span>
				</div>
				<div className="flex items-center gap-2">
					<Filter size={14} className="text-zinc-300" />
				</div>
			</div>

			{/* Stats row */}
			<div className="grid grid-cols-3 gap-px bg-zinc-100">
				{[
					{ label: 'Campanhas', value: '24', icon: Flame, accent: 'text-orange-500 bg-orange-50' },
					{ label: 'Artistas', value: '158', icon: Users2, accent: 'text-purple-500 bg-purple-50' },
					{ label: 'Receita', value: 'R$ 842k', icon: LineChart, accent: 'text-emerald-500 bg-emerald-50' },
				].map((stat) => (
					<div key={stat.label} className="flex flex-col items-center gap-2 bg-white py-5">
						<div className={`rounded-xl p-2 ${stat.accent}`}>
							<stat.icon size={16} />
						</div>
						<span className="text-xl font-bold tracking-tight text-zinc-900">{stat.value}</span>
						<span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{stat.label}</span>
					</div>
				))}
			</div>

			{/* Artists list */}
			<div className="space-y-1 p-4">
				<div className="mb-3 flex items-center justify-between px-2">
					<span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Top Artistas</span>
					<span className="text-[10px] font-semibold text-orange-500">Ver todos</span>
				</div>
				{artists.map((artist) => (
					<div
						key={artist.name}
						className="flex items-center justify-between rounded-2xl px-3 py-3 transition-colors hover:bg-zinc-50"
					>
						<div className="flex items-center gap-3">
							<div className="relative">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-sm font-bold text-zinc-500">
									{artist.name.charAt(0)}
								</div>
								{artist.active && (
									<span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
								)}
							</div>
							<div>
								<p className="text-sm font-semibold text-zinc-800">{artist.name}</p>
								<p className="text-xs text-zinc-400">{artist.genre}</p>
							</div>
						</div>
						<div className="flex items-center gap-3">
							<div className="hidden sm:block">
								<div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-100">
									<div className="h-full rounded-full bg-orange-500" style={{ width: `${artist.match}%` }} />
								</div>
							</div>
							<span className="text-xs font-bold text-zinc-500">{artist.match}%</span>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

/* ── Main Section ── */
export function SolutionSection() {
	return (
		<section id="solucao" className="relative overflow-hidden bg-white py-24 dark:bg-zinc-950">
			{/* Background accents */}
			<div className="pointer-events-none absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-orange-500/5 to-transparent blur-3xl" />
			<div className="pointer-events-none absolute bottom-0 left-0 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-purple-500/5 to-transparent blur-3xl" />

			<ContainerSection>
				{/* Header */}
				<FadeIn>
					<div className="mb-20 text-center">
						<span className="mb-4 inline-block text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
							A solução
						</span>
						<h2 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
							Tudo que você precisa para{' '}
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
								escalar conteúdo UGC
							</span>
						</h2>
						<p className="mx-auto mt-5 max-w-xl text-lg text-zinc-500 dark:text-zinc-400">
							Uma plataforma completa que conecta marcas, artistas e criadores com
							resultados reais em todo o Brasil.
						</p>
					</div>
				</FadeIn>

				{/* Two-column layout: cards + dashboard widget */}
				<div className="grid items-center gap-16 lg:grid-cols-2">
					{/* Left: Solution Cards */}
					<FadeInStagger>
						<div className="space-y-6">
							{solutionCards.map((card) => (
								<FadeIn key={card.title}>
									<article
										className="group relative flex gap-6 rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm transition-all duration-300 hover:border-orange-200 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
										tabIndex={0}
										aria-label={card.title}
									>
										{/* Icon */}
										<div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 text-orange-500 transition-transform duration-300 group-hover:scale-110 dark:from-orange-500/10 dark:to-orange-500/5">
											<card.icon className="h-6 w-6" aria-hidden="true" />
										</div>

										{/* Content */}
										<div className="flex-1">
											<div className="mb-2 flex items-center gap-3">
												<h3 className="text-lg font-bold text-zinc-900 dark:text-white">
													{card.title}
												</h3>
												<span className="rounded-full bg-orange-50 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:bg-orange-500/10">
													{card.highlight}
												</span>
											</div>
											<p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
												{card.description}
											</p>
										</div>

										{/* Arrow */}
										<div className="flex items-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
											<ArrowUpRight size={20} className="text-orange-500" />
										</div>
									</article>
								</FadeIn>
							))}
						</div>
					</FadeInStagger>

					{/* Right: Dashboard Widget */}
					<FadeIn>
						<motion.div
							initial={{ opacity: 0, rotate: 2, y: 40 }}
							whileInView={{ opacity: 1, rotate: 1, y: 0 }}
							transition={{ duration: 0.8, ease: 'easeOut' }}
							viewport={{ once: true, margin: '-100px' }}
						>
							<DashboardWidget />
						</motion.div>
					</FadeIn>
				</div>
			</ContainerSection>
		</section>
	)
}
