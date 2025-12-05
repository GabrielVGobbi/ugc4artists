import { AlertTriangle, FileText, Users } from 'lucide-react'
import type { ComponentType } from 'react'

type PainPoint = {
	title: string
	description: string
	icon: ComponentType<{ className?: string }>
}

const painPoints: PainPoint[] = [
	{
		title: 'Negociar preços, gerir contratos, acompanhar entregas',
		description:
			'Centralize tudo em um só fluxo para evitar retrabalho, atrasos e conversas perdidas.',
		icon: FileText,
	},
	{
		title: 'Acesso limitado a criadores UGC em nichos diversos',
		description:
			'Conecte-se a creators verificados com perfis variados, prontos para atender demandas específicas.',
		icon: Users,
	},
	{
		title: 'Qualidade inconsistente ou falta de expertise em roteirização',
		description:
			'Receba conteúdo guiado por roteiros inteligentes, revisões colaborativas e curadoria especializada.',
		icon: AlertTriangle,
	},
]

export function PainPointsSection() {
	return (
		<section
			id="desafios"
			className="bg-gradient-to-b from-white to-slate-50/70 py-16 lg:py-24"
		>
			<div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 text-center sm:px-6 lg:px-8">
				<div className="space-y-4">
					<h2 className="text-3xl font-semibold text-[#040404] sm:text-4xl">
						Criar conteúdo é difícil
					</h2>
					<p className="text-base text-gray-600">
						Sabemos o quão desafiador é produzir conteúdo de alta conversão com consistência.
					</p>
				</div>
				<div className="grid gap-6 md:grid-cols-3">
					{painPoints.map((painPoint) => (
						<div
							key={painPoint.title}
							className="group rounded-3xl border border-white/60 bg-white/80 p-6 text-left shadow-[0_20px_60px_-24px_rgba(15,23,42,0.4)] backdrop-blur"
							tabIndex={0}
							aria-label={painPoint.title}
						>
							<div className="mb-4 inline-flex rounded-2xl bg-orange-50 p-3 text-[#fc7c04]">
								<painPoint.icon className="h-5 w-5" aria-hidden="true" />
							</div>
							<h3 className="text-lg font-semibold text-[#040404]">{painPoint.title}</h3>
							<p className="mt-3 text-sm text-gray-600">{painPoint.description}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}

