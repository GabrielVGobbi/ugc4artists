'use client'

import { ContainerSection } from "@/components/landing-page/container"
import { FadeIn, FadeInStagger } from "@/components/fade-in"
import { ArrowRight } from "lucide-react"
import { Link } from "@inertiajs/react"
import SvgIcon from "@/components/svg-icon"

const audiences = [
    {
        icon: 'microphone',
        label: "Artistas",
        headline: "Você lança música. A gente coloca na mão de quem sabe criar conteúdo que funciona.",
        perks: [
            "UGC autêntico",
            "Vídeos prontos para trends",
            "Mais alcance, mais streams, mais demanda",
        ],
        cta: "Sou artista",
        href: "/waitlist",
        image: "/assets/landing_page/images/videos/image_video_1.png",
    },
    {
        icon: 'guitar',
        label: "Criadores",
        headline: "Transforme sua criatividade em renda criando vídeos para artistas e marcas musicais.",
        perks: [
            "Liberdade criativa",
            "Briefings claros",
            "Pagamento seguro pela plataforma",
        ],
        cta: "Sou criador",
        href: "/waitlist",
        image: "/assets/landing_page/images/videos/image_video_2.png",
    },
    {
        icon: 'banda',
        label: "Marcas Musicais",
        headline: "O mercado B2B cada vez mais utiliza creators para escalar a sua performance.",
        perks: [
            "Conteúdo nativo",
            "Performance orgânica e paga",
            "Escala com autenticidade",
        ],
        cta: "Sou marca",
        href: "/waitlist",
        image: "/assets/landing_page/images/videos/image_video_3.png",
    },
]

export function AudienceSection() {
    return (
        <ContainerSection id="para-quem" className="pb-5 bg-white">
            <div className="text-center mb-16">
                <FadeIn>
                    <span className="text-sm font-semibold uppercase tracking-widest text-primary">
                        Para quem é
                    </span>
                    <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold text-[#040404] tracking-tight text-balance">
                        Uma plataforma, três mundos
                        <span className="text-primary"> conectados</span>
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Cada lado foi pensado para resolver dores reais de quem vive de música, conteúdo e marketing.
                    </p>
                </FadeIn>
            </div>

            <FadeInStagger>
                <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                    {audiences.map((item, index) => (
                        <FadeIn key={index}>
                            <div className="group relative overflow-hidden bg-[#FAFAFA] rounded-2xl border border-gray-200 p-8 h-full flex flex-col justify-between hover:shadow-xl hover:border-gray-300 transition-all duration-700">
                                {/* Background icon — inspired by SelectionCard */}
                                <div className="absolute -right-6 -bottom-6 transition-all duration-700 group-hover:-rotate-12 group-hover:scale-125 text-black opacity-[0.03] group-hover:opacity-[0.06]">
                                    <SvgIcon name={item.icon} size={220} />
                                </div>

                                {/* Glow on hover */}
                                <div className="absolute top-0 right-0 h-48 w-48 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/0 group-hover:bg-primary/5 blur-[60px] transition-all duration-700" />

                                {/* Content */}
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                                <SvgIcon name={item.icon} size={24} />
                                        <span className="text-sm font-semibold uppercase tracking-wider text-[#040404]">
                                            {item.label}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-semibold text-[#040404] leading-snug mb-6">
                                        {item.headline}
                                    </h3>

                                    <ul className="space-y-3 mb-8">
                                        {item.perks.map((perk, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary" />
                                                <span className="text-sm text-gray-600">{perk}</span>
                                            </li>
                                        ))}
                                    </ul>

                                </div>

                                {/* CTA */}
                                <Link
                                    href={item.href}
                                    prefetch
                                    className="relative z-10 inline-flex items-center gap-2 text-sm font-semibold text-[#040404] group-hover:text-primary transition-colors duration-200"
                                >
                                    {item.cta}
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                                </Link>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </FadeInStagger>
        </ContainerSection>
    )
}
