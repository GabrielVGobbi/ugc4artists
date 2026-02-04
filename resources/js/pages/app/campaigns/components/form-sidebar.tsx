import { Clock, Users, Zap, DollarSign, Calendar, Info, ArrowRight } from 'lucide-react'
import type { CampaignFormData, StepConfig } from '../lib/form-config'
import { formatCurrency } from '@/lib/utils'

interface FormSidebarProps {
    formData: CampaignFormData
    totalBudget: number
    publicationFee: number
    currentStep: number
    steps: StepConfig[]
}

export function FormSidebar({
    formData,
    totalBudget,
    publicationFee,
    currentStep,
    steps,
}: FormSidebarProps) {
    // Calculate campaign duration
    const parseDate = (str: string) => {
        const [day, month, year] = str.split('/');
        return new Date(`${year}-${month}-${day}`);
    };

    const getDuration = () => {
        if (!formData.applications_open_date || !formData.applications_close_date) {
            return '—';
        }

        const start = parseDate(formData.applications_open_date);
        const end = parseDate(formData.applications_close_date);

        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return `${days} dias`;
    };


    const getPlanLabel = () => {
        const labels: Record<string, string> = {
            basic: 'Básico',
            highlight: 'Destaque',
            premium: 'Premium',
        }
        return labels[formData.publication_plan] || 'Básico'
    }

    return (
        <div className="space-y-6">
            {/* Main Summary Card */}
            <div className="bg-secondary rounded-[3rem] p-8 text-secondary-foreground relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />

                <div className="relative z-10 space-y-8">


                    {/* Campaign Name */}
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                                Campanha
                            </p>
                            <p className="font-bold text-lg leading-tight line-clamp-2">
                                {formData.name || 'Sem nome'}
                            </p>
                        </div>

                        {/* Budget Box */}
                        <div className="bg-white/5 p-6 rounded-[2rem] space-y-4 border border-white/10">
                            <div className="grid justify-between items-end border-b border-white/10 pb-4">
                                <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                                    Investimento
                                </span>
                                <span className="text-3xl font-black tracking-tighter text-primary">
                                    {formatCurrency(totalBudget)}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        Influencers
                                    </p>
                                    <p className="font-bold text-secondary-foreground">
                                        {formData.slots_to_approve}x
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        Unidade
                                    </p>
                                    <p className="font-bold text-secondary-foreground">
                                        {formatCurrency(formData.price_per_influencer)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Info */}
                        <div className="space-y-4 text-sm font-medium">
                            <div className="flex justify-between items-center text-muted-foreground border-b border-white/5 pb-2">
                                <div className="flex items-center gap-2 font-bold">
                                    <Clock size={14} className="text-primary" />
                                    Duração
                                </div>
                                <span className="text-secondary-foreground">{getDuration()}</span>
                            </div>
                            <div className="flex justify-between items-center text-muted-foreground border-b border-white/5 pb-2">
                                <div className="flex items-center gap-2 font-bold">
                                    <Users size={14} className="text-primary" />
                                    Tipo
                                </div>
                                <span className="text-secondary-foreground">
                                    {formData.kind === 'ugc' ? 'UGC' : 'Influencers'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-muted-foreground">
                                <div className="flex items-center gap-2 font-bold">
                                    <Zap size={14} className="text-primary" />
                                    Plano
                                </div>
                                <span className="text-emerald-400 font-bold uppercase tracking-widest text-[10px]">
                                    {getPlanLabel()}
                                </span>
                            </div>
                        </div>

                        {/* Total to Pay */}
                        <div className="hidden pt-6 border-t border-white/10 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                                    Taxa de Publicação
                                </span>
                                <span className="font-bold text-secondary-foreground text-lg">
                                    {formatCurrency(publicationFee)}
                                </span>
                            </div>
                            <div className="bg-primary p-5 rounded-2xl flex items-center justify-between shadow-xl shadow-primary/10">
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                    Total a pagar hoje
                                </span>
                                <span className="text-2xl font-black">
                                    {formatCurrency(publicationFee)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
