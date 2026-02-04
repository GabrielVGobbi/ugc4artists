import { FileText, Clock, Zap, CheckCircle, DollarSign, Users, Layers, Flame, CheckCircle2 } from 'lucide-react'
import { useCampaignStats } from '@/hooks/use-campaigns'
import { formatCurrency } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

export function CampaignStats() {
    const { data: stats, isLoading } = useCampaignStats()

    const statItems = [
        {
            label: 'Total de Campanhas',
            value: stats?.total ?? 0,
            icon: FileText,
            color: 'text-primary',
            bgColor: 'bg-primary/10',
        },
        {
            label: 'Rascunhos',
            value: stats?.draft ?? 0,
            icon: Clock,
            color: 'text-zinc-500',
            bgColor: 'bg-zinc-100',
        },
        {
            label: 'Aguardando Revisão',
            value: stats?.pending_review ?? 0,
            icon: Clock,
            color: 'text-amber-500',
            bgColor: 'bg-amber-50',
        },
        {
            label: 'Ativas',
            value: stats?.active ?? 0,
            icon: Zap,
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-50',
        },
        {
            label: 'Concluídas',
            value: stats?.completed ?? 0,
            icon: CheckCircle,
            color: 'text-blue-500',
            bgColor: 'bg-blue-50',
        },
    ]

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-2xl" />
                ))}
            </div>
        )
    }

    return (

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {statItems.map((item) => (
                <div
                    key={item.label}
                    className="bg-white p-6 rounded-[2.5rem] border border-zinc-100 shadow-sm hover:shadow-md transition-all duration-500 group relative overflow-hidden"
                >
                    <div className="relative z-10 flex justify-between items-start">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">{item.label}</p>
                            <h4 className="text-4xl font-black tracking-tighter text-[#0A0A0A]">{item.value.toString().padStart(2, '0')}</h4>
                        </div>

                    </div>
                    {/* Decorative background number */}
                    <div className="absolute -bottom-4 -right-2 text-6xl font-black text-black/[0.01] pointer-events-none select-none italic group-hover:text-black/[0.03] transition-colors">
                        {item.value}
                    </div>
                </div>
            ))}

            {/*
            {statItems.map((item) => (
                <div
                    key={item.label}
                    className={`${item.bgColor === 'bg-primary/10' ? 'bg-primary rounded-[1.5rem] text-white' : 'bg-white'} rounded-2xl p-5 border ${item.bgColor === 'bg-primary/10' ? 'border-primary/20' : 'border-border'} hover:shadow-md transition-shadow h-full flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-all duration-500`}
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl ${item.bgColor === 'bg-primary/10' ? 'bg-white/20' : item.bgColor} flex items-center justify-center`}>
                            <item.icon size={18} className={item.bgColor === 'bg-primary/10' ? 'text-white' : item.color} />
                        </div>
                        {item.bgColor === 'bg-primary/10' && (
                            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">Active</span>
                        )}
                    </div>
                    <div>
                        <p className={`text-2xl font-black tracking-tighter ${item.bgColor === 'bg-primary/10' ? 'text-white' : 'text-foreground'}`}>{item.value}</p>
                        <p className={`text-[10px] font-bold ${item.bgColor === 'bg-primary/10' ? 'text-white/70' : 'text-muted-foreground'} uppercase tracking-widest mt-1`}>
                            {item.label}
                        </p>
                    </div>
                    {item.bgColor === 'bg-primary/10' && (
                        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                    )}
                </div>
            ))}
                */}
        </div>


    )
}

export function CampaignBudgetSummary() {
    const { data: stats, isLoading } = useCampaignStats()

    if (isLoading) {
        return <Skeleton className="h-28 rounded-2xl" />
    }

    return (
        <div className="bg-secondary text-secondary-foreground rounded-[2rem] p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center">
                    <DollarSign size={24} className="text-primary" />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-secondary-foreground/60">
                        Orçamento Total (Campanhas Ativas)
                    </p>
                    <p className="text-3xl font-black tracking-tighter text-primary">
                        {formatCurrency(stats?.total_budget ?? 0)}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-secondary-foreground/60">
                        Total de Aplicações
                    </p>
                    <div className="flex items-center gap-2 justify-end">
                        <Users size={16} className="text-primary" />
                        <p className="text-2xl font-black tracking-tighter">
                            {stats?.total_applications ?? 0}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
