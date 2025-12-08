import { Link } from '@inertiajs/react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

type HeroSectionProps = {
	primaryHref: string
	primaryLabel: string
	secondaryHref: string
	secondaryLabel: string
}

type BrandLogo = {
	name: string
	logo: string
}

const brandLogos: BrandLogo[] = [
	{ name: 'TechCorp', logo: 'TechCorp' },
	{ name: 'MediaFlow', logo: 'MediaFlow' },
	{ name: 'BrandSync', logo: 'BrandSync' },
	{ name: 'ContentHub', logo: 'ContentHub' },
	{ name: 'CreatorLab', logo: 'CreatorLab' },
]

export function HeroSection({
	primaryHref,
	primaryLabel,
	secondaryHref,
	secondaryLabel,
}: HeroSectionProps) {
	return (
		<section
			id="inicio"
			className="relative overflow-hidden bg-gradient-to-b from-orange-50/50 to-white py-16 lg:py-24"
		>
			<div className="mx-auto flex max-w-7xl flex-col gap-16 px-4 sm:px-6 lg:px-8">
				<div className="grid items-center gap-12 lg:grid-cols-2">
					<div className="space-y-8">
						<div>
							<span className="mb-4 inline-block rounded-full bg-[#fc7c04]/10 px-4 py-1.5 text-sm font-medium text-[#fc7c04]">
								A plataforma #1 para marcas e creators
							</span>
							<h1 className="text-balance text-4xl font-bold leading-tight text-[#040404] sm:text-5xl lg:text-6xl">
								Onde marcas e criadores se conectam
							</h1>
						</div>
						<p className="max-w-lg text-lg leading-relaxed text-gray-600">
							Se você é um creator em busca do próximo projeto ou uma marca
							contratando criadores UGC para sua próxima campanha, aqui é o
							lugar certo.
						</p>
						<div className="flex flex-col gap-4 sm:flex-row">
							<Button
								asChild
								size="lg"
								className="h-12 bg-[#fc7c04] px-8 font-semibold text-white hover:bg-[#e06f00]"
							>
								<Link
									href={primaryHref}
									aria-label={primaryLabel}
									tabIndex={0}
								>
									{primaryLabel}
									<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
								</Link>
							</Button>
							<Button
								asChild
								size="lg"
								variant="outline"
								className="h-12 border-[#040404] bg-transparent px-8 font-semibold text-[#040404] hover:bg-gray-50"
							>
								<Link
									href={secondaryHref}
									aria-label={secondaryLabel}
									tabIndex={0}
								>
									{secondaryLabel}
								</Link>
							</Button>
						</div>
						<p className="text-sm text-gray-500">Mais de 3.000 criadores cadastrados</p>
					</div>
					<div className="relative">
						<div className="relative mx-auto aspect-square w-full max-w-md">
							<div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#fc7c04]/20 to-orange-100" />
							<img
								src="/female-content-creator-with-camera-making-ugc-vide.jpg"
								alt="Criadora produzindo conteúdo UGC"
								className="relative z-10 h-full w-full rounded-3xl object-cover"
								loading="lazy"
								decoding="async"
								draggable={false}
							/>
							<div
								className="absolute -top-4 left-1/4 z-20 rounded-full bg-white p-3 shadow-lg"
								aria-hidden="true"
							>
								<svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
									<path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
								</svg>
							</div>
							<div
								className="absolute top-1/4 -right-2 z-20 rounded-full bg-white p-3 shadow-lg"
								aria-hidden="true"
							>
								<svg className="h-6 w-6 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
									<path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 011.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772 4.915 4.915 0 01-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm6.5-.25a1.25 1.25 0 10-2.5 0 1.25 1.25 0 002.5 0zM12 9a3 3 0 110 6 3 3 0 010-6z" />
								</svg>
							</div>
							<div
								className="absolute bottom-1/3 -left-4 z-20 rounded-full bg-white p-3 shadow-lg"
								aria-hidden="true"
							>
								<svg className="h-6 w-6 text-red-500" viewBox="0 0 24 24" fill="currentColor">
									<path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
								</svg>
							</div>
							<div
								className="absolute -bottom-2 right-1/4 z-20 rounded-full bg-white p-3 shadow-lg"
								aria-hidden="true"
							>
								<svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
									<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
								</svg>
							</div>
						</div>
					</div>
				</div>
				<div className="border-t border-gray-100 pt-12">
					<div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
						{brandLogos.map((brand) => (
							<span
								key={brand.name}
								className="text-lg font-semibold tracking-wide text-gray-400"
								aria-label={`Marca ${brand.name}`}
							>
								{brand.logo}
							</span>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}


