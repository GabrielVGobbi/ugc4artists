import { Clock, ExternalLink, Trash2, Copy, Send } from 'lucide-react'
import { Link } from '@inertiajs/react'
import type { Campaign } from '@/types/campaign'
import { CAMPAIGN_STATUS_COLORS, CAMPAIGN_STATUS_LABELS } from '@/types/campaign'
import { formatCurrency } from '@/lib/utils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'

interface CampaignTableRowProps {
    campaign: Campaign
    onDelete?: (key: string) => void
    onDuplicate?: (key: string) => void
    onSubmit?: (key: string) => void
}

export function CampaignTableRow({
    campaign,
    onDelete,
    onDuplicate,
    onSubmit,
}: CampaignTableRowProps) {
    const statusColor = CAMPAIGN_STATUS_COLORS[campaign.status] ?? 'bg-zinc-300'
    const statusLabel = CAMPAIGN_STATUS_LABELS[campaign.status] ?? campaign.status

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '—'
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
    }

    return (
        <tr className="group hover:bg-accent/30 transition-all duration-300">
            <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden border border-border shrink-0 bg-muted">
                        {campaign.cover_image_url ? (
                            <img
                                src={campaign.cover_image_url}
                                alt={campaign.name}
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary/40 font-bold text-lg">
                                {campaign.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">
                            {campaign.brand_instagram || 'marca'}
                        </p>
                        <Link
                            href={`/app/campaigns/${campaign.uuid}`}
                            className="text-sm font-bold text-foreground tracking-tight group-hover:text-primary transition-colors"
                        >
                            {campaign.name}
                        </Link>
                    </div>
                </div>
            </td>
            <td className="px-8 py-6">
                <div className="flex items-center gap-2">
                    <div
                        className={`w-1.5 h-1.5 rounded-full ${statusColor} ${campaign.status === 'active' ? 'animate-pulse' : ''}`}
                    />
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                        {statusLabel}
                    </span>
                </div>
            </td>
            <td className="px-8 py-6">
                <p className="text-sm font-black text-foreground tracking-tight">
                    {formatCurrency(campaign.total_budget)}
                </p>
                <p className="text-[10px] text-muted-foreground">
                    {campaign.slots_to_approve}x {formatCurrency(campaign.price_per_influencer)}
                </p>
            </td>
            <td className="px-8 py-6">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-foreground tracking-tighter">
                        {campaign.applications_count} / {campaign.slots_to_approve}
                    </span>
                    <span className="text-[9px] text-muted-foreground">Aplicações</span>
                </div>
            </td>
            <td className="px-8 py-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock size={12} className="text-primary" />
                    <span className="text-[11px] font-medium">
                        {formatDate(campaign.applications_close_date)}
                    </span>
                </div>
            </td>
            <td className="px-8 py-6 text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <MoreHorizontal size={16} />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                            <Link href={`/app/campaigns/${campaign.uuid}`} className="flex items-center gap-2">
                                <ExternalLink size={14} />
                                Ver Detalhes
                            </Link>
                        </DropdownMenuItem>
                        {campaign.status === 'draft' && onSubmit && (
                            <DropdownMenuItem
                                onClick={() => onSubmit(campaign.uuid)}
                                className="flex items-center gap-2"
                            >
                                <Send size={14} />
                                Enviar para Revisão
                            </DropdownMenuItem>
                        )}
                        {onDuplicate && (
                            <DropdownMenuItem
                                onClick={() => onDuplicate(campaign.uuid)}
                                className="flex items-center gap-2"
                            >
                                <Copy size={14} />
                                Duplicar
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {campaign.status === 'draft' && onDelete && (
                            <DropdownMenuItem
                                onClick={() => onDelete(campaign.uuid)}
                                className="flex items-center gap-2 text-destructive focus:text-destructive"
                            >
                                <Trash2 size={14} />
                                Excluir
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </td>
        </tr>
    )
}
