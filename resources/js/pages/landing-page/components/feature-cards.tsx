'use client';
import { Zap, Cpu, Fingerprint, Pencil, Settings2, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { FeatureCardGrid } from '@/components/grid-feature-cards';

const features = [
    {
        title: 'Gestão Completa de Campanhas',
        icon: Zap,
        description: 'Gerencie todo o ciclo da campanha em um só lugar: criação, briefing, aprovação e entrega.',
    },
    {
        title: 'Criadores Especializados',
        icon: Cpu,
        description: 'Acesso a criadores UGC alinhados com música, cultura e performance para suas campanhas.',
    },
    {
        title: 'Briefings Estruturados',
        icon: Fingerprint,
        description: 'Briefings padronizados que facilitam a criação e mantêm a consistência da sua marca.',
    },
    {
        title: 'Dashboard Intuitivo',
        icon: Pencil,
        description: 'Acompanhe métricas, entregas e resultados em tempo real com interface moderna e fácil.',
    },
    {
        title: 'Matching Inteligente',
        icon: Settings2,
        description: 'Conectamos você com os criadores ideais para o perfil e objetivos da sua campanha.',
    },
    {
        title: 'Otimização por Plataforma',
        icon: Sparkles,
        description: 'Conteúdo pensado para TikTok, Reels e Shorts, com formatos nativos que performam.',
    },
];

export default function FeatureCards() {
    return (
        <section className="py-16 md:py-32 bg-black ">
            <div className="mx-auto w-full max-w-5xl space-y-8 px-4" id="features">
                <AnimatedContainer className="mx-auto max-w-3xl text-center ">
                    <h2 className="text-white text-3xl font-bold tracking-wide text-balance md:text-4xl lg:text-5xl xl:font-extrabold">
                        Criar conteúdo é difícil
                    </h2>
                    <p className="text-muted-foreground mt-6 text-base tracking-wide text-balance md:text-lg lg:text-xl">
                        Sabemos o quão desafiador é produzir conteúdo de alta conversão com consistência. Por isso, oferecemos as ferramentas e conexões que você precisa para escalar seu negócio.
                    </p>
                </AnimatedContainer>

                <AnimatedContainer
                    delay={0.4}
                    className="grid grid-cols-1 divide-x divide-y divide-dashed border border-dashed sm:grid-cols-2 md:grid-cols-3"
                >
                    {features.map((feature, i) => (
                        <FeatureCardGrid key={i} feature={feature} />
                    ))}
                </AnimatedContainer>
            </div>
        </section>
    );
}

type ViewAnimationProps = {
    delay?: number;
    className?: React.ComponentProps<typeof motion.div>['className'];
    children: React.ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
    const shouldReduceMotion = useReducedMotion();

    if (shouldReduceMotion) {
        return children;
    }

    return (
        <motion.div
            initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
            whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.8 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
