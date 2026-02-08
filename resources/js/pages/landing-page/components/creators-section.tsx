
'use client'

import { ContainerSection } from "@/components/landing-page/container";
import { FadeIn } from "@/components/fade-in";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const creators = [
    {
        name: "Cris (BBB1)",
        role: "Criadora",
        image: "/assets/landing_page/images/cris.jpeg",
        description: [
            "Cris ficou conhecida nacionalmente no primeiro BBB, mas a história dela vai muito além da TV.",
            "Ela construiu carreira entendendo pessoas, comportamento e comunicação real.",
            "Na UGC4Artists, ela traz o olhar humano: entender o que conecta, o que emociona e o que faz as pessoas quererem compartilhar.",
            "Ela é parte do DNA da plataforma que acredita que conteúdo bom não é artificial, é humano."
        ],
        highlight: "conteúdo bom não é artificial, é humano.",
        tags: ["Comportamento", "Comunicação Real"]
    },
    {
        name: "Best Play Music",
        role: "Parceiro",
        image: "/assets/landing_page/images/best_play.png",
        description: [
            "A Best Play Music é uma das maiores estruturas de crescimento para artistas independentes do Brasil.",
            "Há anos trabalhando com lançamento, playlist, tráfego, conteúdo e estratégia musical.",
            "A UGC4Artists nasce também da experiência da Best Play em entender: como a música circula, como o público descobre artistas, e como conteúdo virou parte central dessa jornada.",
            "Aqui entra o lado técnico, estratégico e de performance."
        ],
        highlight: "Aqui entra o lado técnico, estratégico e de performance.",
        tags: ["Estratégia", "Performance"]
    },
    {
        name: "Liz",
        role: "Influenciadora",
        image: "/assets/landing_page/images/liz.jpeg",
        description: [
            "Liz vive na prática o que muita gente só estuda.",
            "Ela cria, testa, posta, erra, acerta e entende o que funciona de verdade nas redes.",
            "A linguagem da UGC4Artists passa por ela: simples, direta, real e próxima das pessoas.",
            "Ela representa o lado criador da plataforma. Quem entende trends, formato, ritmo de vídeo e o que faz alguém parar de rolar o feed."
        ],
        highlight: "faz alguém parar de rolar o feed.",
        tags: ["Trends", "Ritmo"]
    }
];

export const CreatorsSection = () => {
    return (
        <section className="py-24 bg-zinc-950 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

            <ContainerSection>
                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-5xl md:text-6xl font-medium tracking-tight text-white mb-6"
                    >
                        Quem faz a <span className="text-orange-500 font-bold">mágica acontecer</span>
                    </motion.h2>
                    <p className="text-2xl text-zinc-400 ">
                        Conheça os especialistas que transformam música em movimento.

                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                    {creators.map((creator, index) => (
                        <motion.div
                            className="group relative h-full flex flex-col"
                        >
                            {/* Card Container */}
                            <div className="rounded-[2.5rem] bg-zinc-900/30 border border-white/5 overflow-hidden backdrop-blur-sm h-full flex flex-col transition-all duration-500 hover:bg-zinc-900/50 hover:border-orange-500/20">

                                {/* Large Hero Image */}
                                <div className="relative w-full aspect-[4/5] overflow-hidden">
                                    <div className="inset-0 bg-zinc-800" />
                                    <img
                                        src={creator.image}
                                        alt={creator.name}
                                        className="w-full h-full object-cover "
                                    />

                                    {/* Gradient Overlay for text readability if needed, but keeping image clean is better */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-90" />

                                    {/* Name & Role Overlay - Positioned at bottom of image */}
                                    <div className="absolute bottom-0 left-0 right-0 p-8 pb-4">
                                        <div className="inline-flex items-center gap-2 mb-3">
                                            <span className="bg-orange-500 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded">
                                                {creator.role}
                                            </span>
                                        </div>
                                        <h3 className="text-3xl font-bold text-white leading-none tracking-tight">
                                            {creator.name}
                                        </h3>
                                    </div>
                                </div>

                                {/* Content Body */}
                                <div className="p-8 pt-6 flex-1 flex flex-col">
                                    <div className="space-y-4 text-zinc-400 text-base leading-relaxed font-light flex-1">
                                        {creator.description.map((paragraph, i) => (
                                            <p key={i} className={cn(
                                                paragraph.includes(creator.highlight) && "text-zinc-100"
                                            )}>
                                                {paragraph.includes(creator.highlight) ? (
                                                    <>
                                                        {paragraph.split(creator.highlight)[0]}
                                                        <span className="text-orange-400 font-medium relative inline-block">
                                                            {creator.highlight}
                                                            <span className="absolute bottom-0 left-0 w-full h-[1px] bg-orange-500/50"></span>
                                                        </span>
                                                        {paragraph.split(creator.highlight)[1]}
                                                    </>
                                                ) : paragraph}
                                            </p>
                                        ))}
                                    </div>

                                    {/* Footer tags */}
                                    <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap gap-2">
                                        {creator.tags.map((tag) => (
                                            <span key={tag} className="text-xs text-zinc-500 font-medium px-3 py-1.5 rounded-full bg-white/5 border border-white/5 group-hover:border-orange-500/20 group-hover:text-orange-200/70 transition-colors">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </motion.div>
                    ))}
                </div>
            </ContainerSection>
        </section>
    );
};
