
'use client'

import { ContainerSection } from "@/components/landing-page/container";
import { FadeIn, FadeInStagger } from "@/components/fade-in";
import { motion } from "framer-motion";
import { Users, Music2, Clapperboard, CheckCircle2 } from "lucide-react";
import AppLogo from "@/components/app-logo";
import SvgIcon from "@/components/svg-icon";

const features = [
    {
        icon: 'people',
        title: "Quem entende pessoas.",
        subtitle: "Comportamento & Conexão",
        color: "text-orange-500",
    },
    {
        icon: 'music',
        title: "Quem entende música.",
        subtitle: "Ritmo, Vibe & Contexto",
        color: "text-purple-500",
    },
    {
        icon: 'video',
        title: "Quem entende conteúdo.",
        subtitle: "Retenção & Performance",
        color: "text-pink-500",
    }
];

export const PlatformAboutSection = () => {
    return (
        <section className="py-20 bg-white dark:bg-zinc-950 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-orange-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

            <ContainerSection>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

                    {/* Left content: Story & Pillars */}
                    <div>
                        <FadeIn>
                            <h2 className="text-2xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white leading-[1.1] mb-8">
                                A UGC4Artists <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">não nasceu</span> <br />
                                de uma sala de reunião.
                            </h2>
                            <p className="text-xl md:text-2xl font-medium text-zinc-500 dark:text-zinc-400 mb-12">
                                Nasceu da junção de três mundos:
                            </p>
                        </FadeIn>

                        <FadeInStagger>
                            <div className="space-y-10 relative">
                                {/* Connecting Line */}
                                <div className="absolute left-[1.65rem] top-4 bottom-4 w-0.5 bg-gradient-to-b from-zinc-200 via-zinc-200 to-transparent dark:from-zinc-800 dark:via-zinc-800" />

                                {features.map((feature, index) => (
                                    <FadeIn key={index}>
                                        <div className="flex items-start gap-8 relative group">
                                            {/* Icon Marker */}
                                            <div className="relative z-10 flex-shrink-0 w-14 h-14 rounded-full bg-white dark:bg-zinc-900 border-4 border-zinc-50 dark:border-zinc-950 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <SvgIcon name={feature.icon} size={35} />
                                            </div>

                                            {/* Content */}
                                            <div className="pt-1">
                                                <h3 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white group-hover:translate-x-1 transition-transform duration-300">
                                                    {feature.title}
                                                </h3>
                                                <p className="mt-1 text-sm md:text-base font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                                    {feature.subtitle}
                                                </p>
                                            </div>
                                        </div>
                                    </FadeIn>
                                ))}
                            </div>
                        </FadeInStagger>

                        <FadeIn className="mt-16 pt-8 border-t border-zinc-100 dark:border-zinc-900">
                            <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-300 leading-relaxed font-light">
                                Por isso a plataforma <strong className="font-semibold text-zinc-900 dark:text-white">não fala difícil</strong>.
                                Ela fala a língua de quem cria, de quem lança e de quem quer ver resultado.
                            </p>
                        </FadeIn>
                    </div>

                    {/* Right content: Visual Composition (Auth Cards) */}
                    <FadeIn delay={0.2} className="relative h-[650px] w-full hidden lg:block">
                        {/* Wrapper for perspective effect */}
                        <div className="relative w-full h-full perspective-1000">

                            {/* Back Card (Dark / Brand Side) */}
                            <motion.div
                                initial={{ opacity: 0, rotate: -5, y: 20 }}
                                whileInView={{ opacity: 1, rotate: -6, y: 0 }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                viewport={{ once: true, margin: "-100px" }}
                                className="absolute top-0 left-12 w-[80%] h-[500px] bg-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl z-0 border border-white/5"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-orange-500/20" />

                                {/* Decorative Typography */}
                                <div className="absolute top-[-15%] left-[-15%] text-[9rem] font-black text-white/[0.04] select-none rotate-[-12deg] tracking-tighter leading-none">
                                    UGC <br /> 4ART
                                </div>

                                <div className="relative p-10 flex flex-col h-full justify-between">
                                    <div>
                                        <AppLogo className="w-32 mb-8 opacity-80 filter grayscale invert" />
                                        <h3 className="text-4xl font-bold text-white mb-2 leading-tight">
                                            Conecte-se com <br /> <span className="text-orange-500">criadores</span>
                                        </h3>
                                    </div>

                                    <div className="flex gap-8 pt-8 border-t border-white/10">
                                        <div>
                                            <div className="text-2xl font-bold text-white">500+</div>
                                            <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Criadores</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-white">1.2k</div>
                                            <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Campanhas</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Front Card (Light / Login Side) */}
                            <motion.div
                                initial={{ opacity: 0, rotate: 5, y: 60 }}
                                whileInView={{ opacity: 1, rotate: 3, y: 0 }}
                                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                                viewport={{ once: true, margin: "-100px" }}
                                className="absolute bottom-12 right-0 w-[75%] h-[420px] bg-[#FAF9F6] rounded-[2.5rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] z-10 border border-zinc-100"
                            >
                                <div className="absolute right-[-30%] top-[-30%] w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

                                <div className="relative p-10 flex flex-col h-full justify-center items-center text-center">
                                    <h3 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-2 leading-[1.1]">
                                        A nova era do <br />
                                        <span className="italic font-light text-zinc-500">Marketing Musical.</span>
                                    </h3>
                                    <p className="text-zinc-400 text-sm md:text-base font-medium mb-10 max-w-xs mx-auto leading-relaxed mt-4">
                                        Simplificamos a conexão entre marcas, artistas e criadores.
                                    </p>

                                    {/* Mock Google Button */}
                                    <div className="w-full max-w-xs bg-white border border-zinc-200/80 rounded-full py-4 px-6 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
                                        <div className="flex-shrink-0">
                                            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                        </div>
                                        <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Entrar com Google</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </FadeIn>
                </div>
            </ContainerSection>
        </section>
    );
};
