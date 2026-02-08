"use client"

import { OptimizedImage } from "@/components/utils/optimized-image"
import { ArrowDownLeft, ArrowUpRight, Check, Clock, Flame, TrendingUp } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { motion } from 'framer-motion'

const solutions = [
    "Acesso a criadores UGC alinhados com música, cultura e performance",
    "Processos claros de contratação, alinhamento e entrega",
    "Briefings estruturados para facilitar a criação e manter consistência",
    "Conteúdo pensado para TikTok, Reels e Shorts, desde a origem",
]

function DashboardWidget() {
    const artists = [
        { name: 'Marina S.', genre: 'Pop', match: 98, active: true },
        { name: 'Pedro R.', genre: 'Hip Hop', match: 94, active: false },
        { name: 'Julia M.', genre: 'MPB', match: 91, active: true },
        { name: 'Lucas T.', genre: 'Funk', match: 88, active: true },
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            viewport={{ once: true, margin: '-80px' }}
            className="relative z-10"
        >
            <div className="rounded-[2rem] border border-zinc-100 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.12)] overflow-hidden">
                <OptimizedImage
                    src="/assets/landing_page/images/modern-dashboard.jpeg"
                    alt="Plataforma UGC Dashboard"
                    priority={false}
                    aspectRatio='auto'
                    className="rounded-2xl shadow-2xl hover:scale-[1.02] transition-transform duration-500"
                    width={550}
                    height={400}
                />
            </div>
        </motion.div>
    )
}

function CampaignWidget() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30, rotate: 2 }}
            whileInView={{ opacity: 1, y: 0, rotate: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
            viewport={{ once: true, margin: '-80px' }}
            className="absolute -top-4 -left-4 z-20 w-[280px]"
        >
            <div className="bg-white rounded-[1.8rem] border border-zinc-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] p-5 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                            <Flame size={16} className="text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-zinc-800">Campanhas Ativas</p>
                            <p className="text-[10px] text-zinc-400 font-medium">Atualizado agora</p>
                        </div>
                    </div>
                    <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Live
                    </span>
                </div>

                {/* Stats */}
                <div className="flex items-end gap-3">
                    <span className="text-5xl font-bold tracking-tighter text-zinc-900">24</span>
                    <span className="text-sm font-bold text-emerald-500 mb-2 flex items-center gap-1">
                        <ArrowUpRight size={14} /> +4 esta semana
                    </span>
                </div>

                {/* Mini bar chart */}
                <div className="flex items-end gap-1 h-10">
                    {[35, 50, 40, 65, 55, 80, 70, 90, 75, 95, 85, 100].map((h, i) => (
                        <div
                            key={i}
                            className="flex-1 rounded-full transition-all duration-500"
                            style={{
                                height: `${h}%`,
                                backgroundColor: i >= 10 ? '#FF4D00' : i >= 8 ? '#FF4D0066' : '#f4f4f5',
                            }}
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    )
}

/* ── Wallet Widget ── */
function WalletWidget() {
    const transactions = [
        { name: 'Campanha Verão', type: 'in', amount: 'R$ 2.400', time: 'Hoje', status: 'paid' },
        { name: 'Split Criador', type: 'out', amount: 'R$ 850', time: 'Ontem', status: 'paid' },
        { name: 'Campanha Urban', type: 'in', amount: 'R$ 5.200', time: '2 dias', status: 'pending' },
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 40, rotate: -1 }}
            whileInView={{ opacity: 1, y: 0, rotate: -2 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            viewport={{ once: true, margin: '-80px' }}
            className="absolute -bottom-6 -right-4 z-30 w-[300px]"
        >
            <div className="bg-zinc-900 rounded-[1.8rem] border border-zinc-800 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.4)] p-5 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">
                                Saldo Disponível
                            </p>
                        </div>
                        <p className="text-2xl font-bold tracking-tighter text-white">R$ 12.840</p>
                    </div>
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10">
                        <TrendingUp className="text-emerald-500" size={18} />
                    </div>
                </div>

                {/* Transactions */}
                <div className="space-y-2">
                    {transactions.map((tx, i) => (
                        <div key={i} className="flex items-center justify-between py-2 px-2 rounded-xl hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-2.5">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'in'
                                    ? 'bg-emerald-500/10 text-emerald-400'
                                    : 'bg-zinc-800 text-zinc-500'
                                    }`}>
                                    {tx.type === 'in' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-white">{tx.name}</p>
                                    <p className="text-[10px] text-zinc-600 flex items-center gap-1">
                                        <Clock size={8} /> {tx.time}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`text-xs font-bold ${tx.status === 'paid' ? 'text-emerald-400' : 'text-amber-400'
                                    }`}>
                                    {tx.type === 'in' ? '+' : '-'} {tx.amount}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Action */}
                <div className="flex gap-2">
                    <div className="flex-1 bg-primary text-white text-[10px] font-bold uppercase tracking-widest text-center py-2.5 rounded-xl">
                        Adicionar Saldo
                    </div>
                    <div className="bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest text-center py-2.5 px-4 rounded-xl">
                        Sacar
                    </div>
                </div>
            </div>
        </motion.div>
    )
}


export function SolutionSection() {
    const [isVisible, setIsVisible] = useState(false)
    const sectionRef = useRef<HTMLElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                }
            },
            { threshold: 0.2 },
        )
        if (sectionRef.current) observer.observe(sectionRef.current)
        return () => observer.disconnect()
    }, [])

    return (
        <section ref={sectionRef} id="como-funciona" className="py-20 bg-[#040404] overflow-hidden">
            <div className="max-w-6xl mx-auto ">
                <div className="grid lg:grid-cols-2 gap-30 items-center" >
                    <div
                        className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-16"
                            }`}
                    >

                        {/* Central dashboard */}
                        <div className="relative pt-8 px-4">
                            <DashboardWidget />
                        </div>

                        {/* Floating campaign widget */}
                        <CampaignWidget />

                        {/* Floating wallet widget */}
                        <WalletWidget />
                    </div>

                    <div
                        className={`space-y-8 transition-all duration-1000 delay-200 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-16"
                            }`}
                    >
                        <div>

                            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 text-balance">
                                Tudo o que você precisa em um único
                                <span className="text-primary"> ecossistema</span>
                            </h2>
                            <p className="text-lg text-gray-300 leading-relaxed">
                                Simplificamos a conexão entre marcas, artistas e criadores UGC para que o foco esteja no que realmente importa: criar conteúdo que performa. Da escolha dos criadores à entrega final, estruturamos processos que tornam campanhas mais rápidas, profissionais e escaláveis.
                            </p>
                        </div>

                        <ul className="space-y-4">
                            {solutions.map((solution, index) => (
                                <li
                                    key={index}
                                    className={`flex items-start gap-3 transition-all duration-500 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
                                        }`}
                                    style={{ transitionDelay: isVisible ? `${400 + index * 100}ms` : "0ms" }}
                                >
                                    <div className="flex-shrink-0 w-6 h-6 bg-[#fc7c04] rounded-full flex items-center justify-center mt-0.5">
                                        <Check className="h-4 w-4 text-white" />
                                    </div>
                                    <span className="text-white text-lg">{solution}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    )
}
