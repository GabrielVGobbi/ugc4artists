"use client"

import { Link } from '@inertiajs/react'
import { ContainerSection } from '@/components/landing-page/container'
import { Button } from '@/components/ui/button'
import { StickyScroll } from '@/components/ui/sticky-scroll-reveal'
import { ArrowRight, Sparkles, Users, Zap, CheckCircle2 } from 'lucide-react'
import { describe } from 'zod/v4/core'

type AmbassadorTourProps = {
    artistCtaHref: string
    brandCtaHref: string
    artistName?: string
}

export function AmbassadorTour({
    artistCtaHref,
    brandCtaHref,
    artistName = "Luna Dias"
}: AmbassadorTourProps) {

    const tourSteps = [
        {
            length: 200,
            title: "Publique a sua ideia de campanha",
            //description: "Acesse um feed exclusivo de campanhas de marcas que valorizam autenticidade. Escolha projetos que fazem sentido com seu estilo e sua história.",
            description: "Crie o briefing da sua campanha e publique seu projeto no marketplace da Influentials para encontrar colaboradores e melhorar a qualidade do seu conteúdo.",
            content: (
                <div className="h-full w-full flex items-center justify-center p-8">
                    <div className="text-center space-y-4">
                        <img src="https://cdn.prod.website-files.com/64f4d939994e529cbf6c27c4/64f4d939994e529cbf6c2b08_publish%2520campaign-p-500.png" alt="" className="" />
                    </div>
                </div>
            )
        },
        {
            length: 200,
            title: "Selecione seus criadores favoritos",
            description: "Analise os portfólios e escolha os criadores com base em sua experiência, habilidades e adequação de forma mais holística para uma colaboração bem-sucedida.",
            content: (
                <div className="h-full w-full flex items-center justify-center p-8">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                            Card 2
                        </div>
                        <div className="space-y-2">
                            <p className="text-white font-semibold">
                                Foto Mavi
                            </p>

                        </div>
                    </div>
                </div>
            )
        },
        {
            length: 200,
            title: "Feche o negócio",
            description: "Já elaboramos os contratos de direitos autorais para você. Tudo o que você precisa fazer é enviá-los para evitar mal-entendidos ou conflitos.",
            content: (
                <div className="h-full w-full flex items-center justify-center p-8">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                            Card 3
                        </div>
                        <div className="space-y-2">
                            <p className="text-white font-semibold">

                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores voluptates dolores vitae corporis nulla ratione vel, ad fuga deleniti cupiditate aspernatur accusamus, tenetur quaerat voluptas, unde hic! Obcaecati, corporis placeat.
                            </p>

                        </div>
                    </div>
                </div>
            )
        },
        {
            length: 200,
            title: "Comunique-se com seus criadores.",
            description: " O Influentials Messenger permite que você converse com todos os seus colaboradores em um só lugar — troque ideias, mantenha todos atualizados e cumpra seus prazos.",
            content: (
                <div className="h-full w-full flex items-center justify-center p-8">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                            Card 4
                        </div>
                        <div className="space-y-2">
                            <p className="text-white font-semibold">Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus obcaecati, neque consequuntur cupiditate ratione harum deserunt dicta nulla quibusdam vel porro nihil quia animi, distinctio temporibus. Officiis tenetur rem aliquam?</p>

                        </div>
                    </div>
                </div>
            )
        }
    ]

    return (
        <section id="como-funciona-artistas" className="py-24 bg-[#040404]">
            <ContainerSection>
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <span className="inline-block px-4 py-1.5 bg-[#fc7c04] text-white text-sm font-medium rounded-full mb-4">
                            Para Artistas e Criadores
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 text-balance">
                            Transforme sua criatividade em <span className="text-[#fc7c04]">renda</span>
                        </h2>
                        <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
                            Veja como funciona o processo completo, do cadastro ao pagamento.
                        </p>
                    </div>

                    {/* Sticky Scroll */}
                    <div className="mb-16">
                        <StickyScroll
                            content={tourSteps}
                            contentClassName="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur"
                        />
                    </div>

                    {/* Ambassador Testimonial */}
                    <div className="relative rounded-3xl bg-gradient-to-br from-[#fc7c04]/20 to-purple-500/20 border border-[#fc7c04]/30 p-8 md:p-12 overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#fc7c04]/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

                        <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className="h-5 w-5 text-[#fc7c04]" />
                                    <span className="text-sm font-semibold text-[#fc7c04] uppercase tracking-wide">
                                        Embaixadora {artistName}
                                    </span>
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                                    "Aqui você não precisa fingir ser alguém que não é"
                                </h3>
                                <p className="text-gray-300 leading-relaxed mb-6">
                                    O UGC valoriza sua verdade. Trabalhe com marcas que respeitam sua autenticidade,
                                    no seu tempo, do seu jeito. Sem roteiros forçados, sem perder sua essência.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <span className="px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium">
                                        💰 Até R$2.000/mês
                                    </span>
                                    <span className="px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium">
                                        📱 Use seu celular
                                    </span>
                                    <span className="px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium">
                                        ⏰ Horários flexíveis
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="p-6 rounded-2xl bg-white/5 backdrop-blur border border-white/10">
                                    <p className="text-white text-sm leading-relaxed mb-4">
                                        "Comecei criando conteúdo por hobby. Hoje, trabalho com marcas incríveis e
                                        ganho uma renda extra que faz diferença na minha vida."
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#fc7c04] to-pink-500" />
                                        <div>
                                            <p className="text-white font-semibold text-sm">{artistName}</p>
                                            <p className="text-gray-400 text-xs">Criadora UGC</p>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    asChild
                                    size="lg"
                                    className="bg-[#fc7c04] hover:bg-[#fc7c04]/90 text-white w-full"
                                >
                                    <Link href={artistCtaHref}>
                                        Quero começar agora
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>


                </div>
            </ContainerSection>
        </section>
    )
}
