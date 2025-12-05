import { CreditCard, LineChart, Users2 } from 'lucide-react'
import type { ComponentType } from 'react'

type SolutionCard = {
	title: string
	description: string
	icon: ComponentType<{ className?: string }>
	highlight: string
}

const solutionCards: SolutionCard[] = [
	{
		title: 'Criadores selecionados por nicho',
		description:
			'Descubra creators com autoridade em segmentos específicos, com métricas e portfólio validados.',
		icon: Users2,
		highlight: 'Rede exclusiva',
	},
	{
		title: 'ROI mensurável em cada entrega',
		description:
			'Acompanhe visualmente indicadores de desempenho, garantindo previsibilidade e escala.',
		icon: LineChart,
		highlight: '+48% engajamento médio',
	},
	{
		title: 'Pagamentos simples e seguros',
		description:
			'Pagou, recebeu. Sem taxas escondidas: use carteira digital integrada e aprovação instantânea.',
		icon: CreditCard,
		highlight: 'Split automático',
	},
]

export function SolutionSection() {
	return (
		<section id="solucao" className="bg-white py-16 sm:py-20">
			<div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
				<div className="space-y-3 text-center">
					<span className="text-sm font-semibold uppercase tracking-widest text-[#fc7c04]">
						A solução
					</span>
					<h2 className="text-3xl font-semibold text-[#040404] sm:text-4xl">
						Noovid é o seu parceiro na criação de conteúdo
					</h2>
					<p className="text-base text-gray-600">
						Uma plataforma completa que garante o sucesso de cada campanha com criadores UGC
						em todo o Brasil.
					</p>
				</div>
				<div className="grid gap-6 md:grid-cols-3">
					{solutionCards.map((card) => (
						<article
							key={card.title}
							className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-gradient-to-br from-white to-purple-50/70 p-6 text-left shadow-[0_25px_60px_-30px_rgba(59,7,153,0.5)]"
							tabIndex={0}
							aria-label={card.title}
						>
							<div className="inline-flex items-center gap-2 text-sm font-medium text-purple-600">
								<span className="rounded-full bg-white/70 px-3 py-1 shadow-sm">
									{card.highlight}
								</span>
							</div>
							<div className="inline-flex rounded-2xl bg-purple-100/70 p-3 text-purple-600">
								<card.icon className="h-5 w-5" aria-hidden="true" />
							</div>
							<h3 className="text-xl font-semibold text-[#040404]">{card.title}</h3>
							<p className="text-sm text-gray-600">{card.description}</p>
						</article>
					))}
				</div>
			</div>
		</section>
	)
}

