import { ArrowRight, Clock, Users } from 'lucide-react'
import { Link } from '@inertiajs/react'
import type { Campaign } from '@/types/campaign'
import { CAMPAIGN_STATUS_COLORS } from '@/types/campaign'
import { formatCurrency } from '@/lib/utils'

interface CampaignCardProps {
    campaign: Campaign
}

export function CampaignCard({ campaign }: CampaignCardProps) {
    const statusColor = CAMPAIGN_STATUS_COLORS[campaign.status] ?? 'bg-zinc-300'

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '—'
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
    }

    return (
        <div className="group relative bg-white rounded-[1.5rem] overflow-hidden border border-border hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
            {/* Hero Image Section */}
            <div className="aspect-[3/2] relative overflow-hidden bg-muted">
                {campaign.cover_image_url ? (
                    <img
                        src={campaign.cover_image_url}
                        alt={campaign.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center">
                        <span className="text-6xl font-bold text-primary/20">
                            {campaign.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-70" />

                {/* Floating Status & Kind */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    <span className="bg-white/10 backdrop-blur-md border border-white/10 text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg">
                        {campaign.kind === 'ugc' ? 'UGC' : 'Influencers'}
                    </span>
                    <div
                        className={`w-2 h-2 rounded-full ${statusColor} border-2 border-white shadow-sm ${campaign.status === 'active' ? 'animate-pulse' : ''}`}
                    />
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-5 left-5 right-5">
                    <p className="text-primary text-[8px] font-black uppercase tracking-[0.3em] mb-1">
                        {campaign.brand_instagram || 'marca'}
                    </p>
                    <h4 className="text-white text-lg font-bold tracking-tight leading-none mb-4 italic truncate">
                        {campaign.name}
                    </h4>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white/70">
                            <Users size={14} />
                            <span className="text-xs font-medium">
                                {campaign.applications_count}/{campaign.slots_to_approve} vagas
                            </span>
                        </div>
                        <Link
                            href={`/app/campaigns/${campaign.uuid}`}
                            className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-secondary hover:bg-primary hover:text-white transition-all"
                        >
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer Info (Compact) */}
            <div className="p-5 flex justify-between items-end bg-white">
                <div className="space-y-0.5">
                    <p className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-widest">
                        Orçamento
                    </p>
                    <p className="text-xl font-black tracking-tighter text-foreground">
                        {formatCurrency(campaign.total_budget)}
                    </p>
                </div>
                <div className="text-right space-y-0.5">
                    <p className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-widest">
                        Encerramento
                    </p>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                        <Clock size={10} className="text-primary" />
                        {formatDate(campaign.applications_close_date)}
                    </div>
                </div>
            </div>
        </div>
    )
}
