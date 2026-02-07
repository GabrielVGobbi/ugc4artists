import { ArrowRight, Users } from 'lucide-react'
import { Link, router } from '@inertiajs/react'
import type { CampaignResource } from '@/types/campaign'
import { getCampaignStatusColor } from '@/types/campaign'
import { cn, formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface CampaignCardProps {
    campaign: CampaignResource
}

export function CampaignCard({ campaign }: CampaignCardProps) {
    const status = campaign.status ?? { value: campaign.review.status, label: '', color: 'gray', icon: 'circle' }
    const statusColor = getCampaignStatusColor(status)
    const isActive = status.value === 'in_progress' || status.value === 'sent_to_creators'

    //onClick={() => router.visit(`/app/campaigns/${campaign.uuid}`)}
    return (
        <div  className="cursor-pointer  group relative bg-white rounded-[1.5rem] overflow-hidden border border-border hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
            {/* Hero Image Section */}
            <div className="aspect-[3/2] relative overflow-hidden bg-muted">
                <img
                    src={campaign.cover_image_url || '/assets/images/blank.jpg'}
                    alt={campaign.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-70" />

                {/* Floating Status & Kind */}
                <div className="hidden top-4 left-4 right-4 flex justify-between items-start gap-2">
                    <span className="bg-white/10 backdrop-blur-md border border-white/10 text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg">
                        {campaign.kind === 'ugc' ? 'UGC' : 'Influencers'}
                    </span>
                    <Badge className={cn('text-xs px-2 font-medium backdrop-blur-md shadow-lg', campaign.status?.classes)}>
                        <div
                            className={`w-1.5 h-1.5 rounded-full ${statusColor} mr-1.5 ${isActive ? 'animate-pulse' : ''}`}
                        />
                        {campaign.status?.label}
                    </Badge>
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-5 left-5 right-5">
                    <p className="text-primary text-[8px] font-black uppercase tracking-[0.3em] mb-1">
                        {campaign.brand_instagram || 'marca'}
                    </p>
                    <h4 className="text-white text-lg font-bold tracking-tight leading-none mb-4 italic truncate">
                        {campaign.name}
                    </h4>

                    <div className="relative items-center justify-between">

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
                    <Badge className={cn('mb-3 text-xs px-2 font-medium backdrop-blur-md shadow-lg', campaign.status?.classes)}>
                        <div
                            className={`w-1.5 h-1.5 rounded-full ${statusColor} mr-1.5 ${isActive ? 'animate-pulse' : ''}`}
                        />
                        {campaign.status?.label}
                    </Badge>
                    <p className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-widest">
                        Orçamento
                    </p>
                    <p className="text-xl font-black tracking-tighter text-foreground">
                        {formatCurrency(campaign.total_budget ?? 0)}
                    </p>
                </div>
                <div className="text-right space-y-0.5">
                    <p className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-widest">
                        Vagas
                    </p>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground">
                        <Users size={14} />
                        <span>{campaign.applications_count}/{campaign.slots_to_approve}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
