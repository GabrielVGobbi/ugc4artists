import { Head, Link, router } from '@inertiajs/react'
import {
    ArrowLeft,
    Calendar,
    FileText,
    Music,
    Target,
    Users,
    Wallet,
    Edit3,
    CreditCard,
    Instagram,
    Clock,
    CheckCircle2,
    XCircle,
    Filter,
    User,
    Phone,
    Mail,
    Shield,
    Package,
    Receipt,
    Star,
    ArrowRight,
    Search,
    Paperclip,
    ExternalLink,
    PlayCircle,
    Send,
    Files,
} from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { CampaignResource, CampaignStatus as CampaignStatusType } from '@/types/campaign'
import { getCampaignStatusColor, PUBLICATION_PLAN_LABELS } from '@/types/campaign'
import { formatCurrency } from '@/lib/utils'
import type { SharedData } from '@/types'
import { cn } from '@/lib/utils'

interface CampaignShowProps {
    campaign: { data?: CampaignResource } | CampaignResource
    auth: SharedData['auth']
}

const CONTENT_PLATFORM_LABELS: Record<string, string> = {
    instagram: 'Instagram',
    tiktok: 'TikTok',
    youtube: 'YouTube',
    youtube_shorts: 'YouTube Shorts',
}

const GENDER_LABELS: Record<string, string> = {
    female: 'Feminino',
    male: 'Masculino',
    both: 'Ambos',
}

const OBJECTIVE_TAG_LABELS: Record<string, string> = {
    divulgar_musica: 'Divulgar Música',
    divulgar_clipe: 'Divulgar Clipe',
    divulgar_perfil: 'Divulgar Perfil',
    divulgar_trend: 'Divulgar Trend',
    outros: 'Outros',
}

const STATUS_STEPS: { value: CampaignStatusType; label: string; icon: any }[] = [
    { value: 'draft', label: 'Rascunho', icon: Edit3 },
    { value: 'awaiting_payment', label: 'Pagamento', icon: Wallet },
    { value: 'under_review', label: 'Revisão', icon: Search },
    { value: 'sent_to_creators', label: 'Enviado para os creators', icon: Send },
    { value: 'in_progress', label: 'Andamento', icon: PlayCircle },
    { value: 'completed', label: 'Finalizada', icon: CheckCircle2 },
]

export default function CampaignShow({ campaign: campaignProp }: CampaignShowProps) {
    const campaign =
        'data' in campaignProp && campaignProp.data
            ? campaignProp.data
            : (campaignProp as CampaignResource)

    const currentStatus = campaign.status?.value || 'draft'
    const statusLabel = campaign.status?.label || 'Rascunho'
    const statusColor = getCampaignStatusColor(campaign.status)

    const isActive = currentStatus === 'in_progress' || currentStatus === 'sent_to_creators'
    const canEdit = currentStatus === 'draft'
    const canPay = currentStatus === 'awaiting_payment'

    const coverUrl = campaign.cover_image_url || '/assets/images/blank_v3.jpg'
    const brandLabel = campaign.brand_instagram || 'Marca'
    const kindLabel = campaign.kind === 'ugc' ? 'UGC' : 'Influencers'
    const filters = campaign.filters
    const responsible = campaign.responsible
    const review = campaign.review
    const summary = campaign.summary

    const hasFilters = summary?.has_optional_filters ?? false
    const hasResponsible = !!(responsible?.name || responsible?.email || responsible?.phone)

    // Current step in the timeline
    const currentStepIndex = STATUS_STEPS.findIndex(s => s.value === currentStatus)
    const activeStepIndex = currentStatus === 'cancelled' ? -1 : currentStepIndex

    return (
        <AppLayout>
            <Head title={campaign.name} />

            <div className="max-w-7xl mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">

                {/* ── HEADER & TIMELINE ── */}
                <header className="relative bg-white rounded-[2.5rem] border border-border/50 shadow-sm overflow-hidden p-8 lg:p-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

                    <div className="grid space-y-6">
                        <div className="flex justify-between gap-8 relative z-10">
                            <Link href="/app/campaigns"
                                className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit">
                                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Campanhas</span>
                            </Link>
                            <div className="flex flex-wrap gap-4">
                                {canEdit && (
                                    <Button onClick={() => router.visit(`/app/campaigns/${campaign.uuid}/edit`)}
                                        variant="outline"
                                        size={'sm'}
                                        className="rounded-2xl font-black uppercase  "
                                    >
                                        <Edit3 size={18} className="mr-2 group-hover:rotate-12 transition-transform" />
                                        Editar Campanha
                                    </Button>
                                )}

                                <Button onClick={() => router.visit(`/app/campaigns/${campaign.uuid}/edit`)}
                                    variant="secondary"
                                    size={'sm'}
                                    className="rounded-2xl font-black uppercase"
                                >
                                    <Files size={18} className="mr-2 group-hover:rotate-12 transition-transform" />
                                    Baixar Midia KIT
                                </Button>

                                {canPay && (
                                    <Button onClick={() => router.visit(`/app/campaigns/${campaign.uuid}/pay`)}
                                        className="h-14 px-8 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black uppercase text-[10px]
        tracking-[0.2em] shadow-lg shadow-amber-500/20 group pb-1"
                                    >
                                        <CreditCard size={18} className="mr-2 group-hover:scale-110 transition-transform" />
                                        Realizar Pagamento
                                    </Button>
                                )}
                            </div>

                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <Badge
                                    className="bg-primary/10 text-primary border-0 text-[10px] font-black uppercase tracking-widest px-3 py-1">
                                    {kindLabel}
                                </Badge>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full">
                                    <div className={cn("w-1.5 h-1.5 rounded-full", statusColor, isActive && "animate-pulse")} />
                                    <span
                                        className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{statusLabel}</span>
                                </div>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground italic leading-none">
                                {campaign.name}
                            </h1>
                            <p className="text-lg text-muted-foreground italic font-medium">
                                @{brandLabel.replace(/^@/, '')}
                            </p>
                        </div>

                        <div className="flex items-center gap-4 bg-zinc-50 p-2 rounded-2xl border border-zinc-100">
                            {STATUS_STEPS.map((step, idx) => {
                                const isCompleted = idx < activeStepIndex;
                                const isCurrent = idx === activeStepIndex;
                                const Icon = step.icon;

                                return (
                                    <div key={step.value} className="flex items-center gap-2">
                                        <div
                                            className={cn(
                                                "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1",
                                                isCurrent
                                                    ? "bg-primary text-white shadow-lg shadow-orange-500/20"
                                                    : isCompleted
                                                        ? "text-emerald-500"
                                                        : "text-zinc-400"
                                            )}
                                        >
                                            {isCompleted && <CheckCircle2 size={12} className="inline mr-1" />}
                                            <Icon size={12} strokeWidth={isCurrent ? 3 : 2} />
                                            {step.label}
                                        </div>
                                        {idx < STATUS_STEPS.length - 1 && (
                                            <div className="w-4 h-[1px] bg-zinc-200"></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Horizontal Timeline
                    <div className="mt-12 pt-8 border-t border-border/40">
                        <div className="relative flex justify-between">
                            <div className="absolute top-5 left-0 w-full h-0.5 bg-muted rounded-full z-0" />

                            {activeStepIndex > 0 && (
                                <div
                                    className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-1000 ease-out z-0"
                                    style={{ width: `${(activeStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                                />
                            )}

                            {STATUS_STEPS.map((step, idx) => {
                                const isCompleted = idx < activeStepIndex;
                                const isCurrent = idx === activeStepIndex;
                                const Icon = step.icon;

                                return (
                                    <div key={step.value} className="relative z-10 flex flex-col items-center gap-3">
                                        <div
                                            className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 border-2",
                                                isCompleted ? "bg-primary border-primary text-white" :
                                                    isCurrent ? "bg-white border-primary text-primary shadow-[0_0_20px_rgba(255,77,0,0.3)]" :
                                                        "bg-white border-muted text-muted-foreground"
                                            )}
                                        >
                                            <Icon size={18} strokeWidth={isCurrent ? 3 : 2} />
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest",
                                            isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                                        )}>
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    */}


                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* ── MAIN CONTENT ── */}
                    <main className="lg:col-span-8 space-y-8">

                        {/* Metric Cards Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <MetricCard
                                icon={Wallet}
                                label="Investimento"
                                value={formatCurrency(summary?.grand_total ?? campaign.total_budget ?? 0)}
                                trend="Total Bruto"
                                variant="primary"
                            />
                            <MetricCard
                                icon={Users}
                                label="Vagas Totais"
                                value={`${campaign.slots_to_approve}`}
                                trend={`${campaign.applications_count ?? 0} inscritos`}
                            />
                            <MetricCard
                                icon={Target}
                                label="Custo p/ Creator"
                                value={formatCurrency(campaign.price_per_influencer ?? 0)}
                            />
                            <MetricCard
                                icon={Calendar}
                                label="Duração Estimada"
                                value={summary?.duration_days ? `${summary.duration_days} dias` : '—'}
                            />
                        </div>

                        {/* Sent Creators Section */}
                        <SectionCard icon={Send} title="Creators Enviados" badge={String(campaign.applications_count || 0)}>
                            {campaign.applications_count && campaign.applications_count > 0 ? (
                                <div className="space-y-4">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-border/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground pb-4">
                                                    <th className="pb-4 font-black">Criador</th>
                                                    <th className="pb-4 font-black">Status</th>
                                                    <th className="pb-4 font-black">Envio</th>
                                                    <th className="pb-4 text-right font-black">Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/30">
                                                {/* Mock rows since we don't have the data yet, but providing the structure */}
                                                {[1, 2, 3].map((i) => (
                                                    <tr key={i} className="group hover:bg-muted/50 transition-colors">
                                                        <td className="py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                                                                    <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="" className="w-full h-full object-cover" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-foreground">Creator Name {i}</p>
                                                                    <p className="text-xs text-muted-foreground italic">@creator_handle_{i}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-4">
                                                            <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border-emerald-100">
                                                                Aprovado
                                                            </Badge>
                                                        </td>
                                                        <td className="py-4 text-xs font-medium text-muted-foreground italic">
                                                            12 Out, 2023
                                                        </td>
                                                        <td className="py-4 text-right">
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                                                                <ArrowRight size={14} className="text-muted-foreground" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <Button variant="link" className="text-xs font-bold p-0 text-primary h-auto group">
                                        Ver todos os criadores <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-border/40 rounded-3xl bg-muted/20">
                                    <div className="p-4 rounded-full bg-muted/50 mb-4">
                                        <Users className="text-muted-foreground/40" size={32} />
                                    </div>
                                    <p className="text-muted-foreground text-sm font-medium italic">Aguardando inscrição de criadores...</p>
                                </div>
                            )}
                        </SectionCard>

                        {/* Consolidate Sections into Tabs */}
                        <section className="bg-white rounded-[2.5rem] border border-border/50 shadow-sm overflow-hidden flex flex-col">
                            <Tabs defaultValue="briefing" className="w-full">
                                <div className="px-8 lg:px-10 pt-8 lg:pt-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-neutral-50 text-primary flex items-center justify-center border border-primary/10">
                                            <FileText size={22} />
                                        </div>
                                        <h2 className="text-xl font-black tracking-tighter uppercase italic">Dados da Campanha</h2>
                                    </div>

                                    <TabsList className="bg-muted/50 p-1.5 h-auto self-start">
                                        <TabsTrigger value="briefing">Briefing</TabsTrigger>
                                        <TabsTrigger value="criativo">Diretrizes</TabsTrigger>
                                        <TabsTrigger value="cronograma">Cronograma</TabsTrigger>
                                        {hasFilters && <TabsTrigger value="filtros">Filtros</TabsTrigger>}
                                    </TabsList>
                                </div>

                                <div className="px-8 lg:px-10 pb-10">
                                    <TabsContent value="briefing" className="mt-0 animate-in fade-in slide-in-from-left-2 duration-300">
                                        <div className="space-y-8">
                                            {campaign.description ? (
                                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{campaign.description}</p>
                                            ) : (
                                                <p className="text-sm text-muted-foreground/60 italic">Nenhum briefing detalhado informado.</p>
                                            )}

                                            {campaign.objective && (
                                                <div className="pt-6 border-t border-border/50">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Objetivo Principal</p>
                                                    <p className="text-foreground font-bold italic">{campaign.objective}</p>
                                                </div>
                                            )}

                                            {campaign.objective_tags?.length > 0 && (
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {campaign.objective_tags.map((tag) => (
                                                        <Badge key={tag} variant="secondary" className="bg-primary/80 text-primary-foreground/80 hover:bg-primary/10 hover:text-black border-0 text-[10px] font-bold px-3 py-1">
                                                            {OBJECTIVE_TAG_LABELS[tag] ?? tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="criativo" className="mt-0 animate-in fade-in slide-in-from-left-2 duration-300">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <DetailItem icon={Instagram} label="Plataformas">
                                                {campaign.content_platforms?.length
                                                    ? campaign.content_platforms.map((p) => CONTENT_PLATFORM_LABELS[p] ?? p).join(', ')
                                                    : 'Instagram'}
                                            </DetailItem>
                                            <DetailItem icon={PlayCircle} label="Duração & Formato">
                                                {[campaign.video_duration_min, campaign.video_duration_max].filter((v) => v != null).join(' – ')}s •
                                                {campaign.influencer_post_mode === 'collab' ? ' Collab' : ' Perfil próprio'}
                                            </DetailItem>
                                            {campaign.music_link && (
                                                <DetailItem icon={Music} label="Música Atribuída">
                                                    <a href={campaign.music_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1.5 font-bold italic">
                                                        {campaign.music_platform || 'Spotify'} Track <ExternalLink size={12} />
                                                    </a>
                                                </DetailItem>
                                            )}
                                            {campaign.audio_format && (
                                                <DetailItem icon={Clock} label="Referência Sonora">
                                                    {campaign.audio_format === 'music' ? 'Foco na Música' : 'Narração / Voz'}
                                                </DetailItem>
                                            )}
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="cronograma" className="mt-0 animate-in fade-in slide-in-from-left-2 duration-300">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <DetailItem icon={Package} label="Abertura de Inscrições">
                                                    {campaign.applications_open_date ?? 'Não definida'}
                                                </DetailItem>
                                                <DetailItem icon={Calendar} label="Encerramento de Inscrições">
                                                    {campaign.applications_close_date ?? 'Não definido'}
                                                </DetailItem>
                                                {campaign.requires_product_shipping && (
                                                    <div className="flex items-center gap-2 p-4 bg-amber-50 text-amber-700 rounded-3xl border border-amber-100/50 text-xs font-bold transition-all hover:bg-amber-100 italic">
                                                        <Package size={16} />
                                                        Requer envio de amostras físicas
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-6">
                                                <div className="p-6 bg-muted/30 rounded-[2rem] space-y-4">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Configurações de Faturamento</p>
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center px-1">
                                                            <span className="text-xs text-muted-foreground font-medium italic">Plano Contratado:</span>
                                                            <Badge variant="outline" className="text-[9px] font-black tracking-widest uppercase bg-primary/5 text-primary border-primary/20">
                                                                {PUBLICATION_PLAN_LABELS[campaign.publication_plan] ?? campaign.publication_plan}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex justify-between items-center px-1">
                                                            <span className="text-xs text-muted-foreground font-medium italic">Emissão de NF-e:</span>
                                                            <span className="text-xs font-bold">{campaign.requires_invoice ? 'Sim' : 'Não'}</span>
                                                        </div>
                                                        {campaign.payment_date && (
                                                            <div className="flex justify-between items-center px-1">
                                                                <span className="text-xs text-muted-foreground font-medium italic">Data do Pagamento:</span>
                                                                <span className="text-xs font-bold">{campaign.payment_date}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {hasFilters && (
                                        <TabsContent value="filtros" className="mt-0 animate-in fade-in slide-in-from-left-2 duration-300">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                {filters.gender && (
                                                    <DetailItem label="Gênero Desejado">
                                                        {GENDER_LABELS[filters.gender] || filters.gender}
                                                    </DetailItem>
                                                )}
                                                {(filters.age_min || filters.age_max) && (
                                                    <DetailItem label="Faixa Etária">
                                                        {[filters.age_min, filters.age_max].filter(Boolean).join(' – ')} anos
                                                    </DetailItem>
                                                )}
                                                {filters.min_followers && (
                                                    <DetailItem label="Seguidores Mínimos">
                                                        {filters.min_followers.toLocaleString()}
                                                    </DetailItem>
                                                )}
                                                {filters.niches?.length > 0 && (
                                                    <div className="md:col-span-3 space-y-3 pt-4 border-t border-border/50">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nichos e Categorias</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {filters.niches.map((n) => (
                                                                <Badge key={n} variant="outline" className="text-[10px] font-bold bg-neutral-50 px-4 py-1 rounded-full">{n}</Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {filters.states?.length > 0 && (
                                                    <div className="md:col-span-3 space-y-3 pt-2">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Localização (Estados)</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {filters.states.map((s) => (
                                                                <Badge key={s} variant="secondary" className="bg-primary text-secondary-foreground text-[10px] font-bold px-4 py-1 rounded-full uppercase">{s}</Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </TabsContent>
                                    )}
                                </div>
                            </Tabs>
                        </section>

                    </main>

                    {/* ── SIDEBAR ── */}
                    <aside className="lg:col-span-4 space-y-8">

                        {/* Cover Image Card */}
                        <div className="bg-white rounded-[2.5rem] border border-border/50 shadow-sm overflow-hidden p-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 px-2">Identidade Visual</h3>
                            <div className="relative aspect-video rounded-3xl overflow-hidden bg-black group">
                                <img src={coverUrl} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                                    <p className="text-white text-lg font-black tracking-tight italic">@{brandLabel.replace(/^@/, '')}</p>
                                    {campaign.product_or_service && (
                                        <p className="text-white/60 text-xs italic line-clamp-1">{campaign.product_or_service}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Logs / Histórico Section */}
                        <SectionCard icon={Clock} title="LOGS DA CAMPANHA" compact>
                            <div className="space-y-6 relative ml-1 pt-2">
                                {/* Vertical line */}
                                <div className="absolute left-[11px] top-6 bottom-4 w-0.5 bg-gradient-to-b from-primary/40 via-border to-border/10" />

                                <ActivityLogItem
                                    label="Criação"
                                    date={campaign.created_at ? new Date(campaign.created_at).toLocaleDateString('pt-BR') : null}
                                    desc="Campanha registrada no sistema"
                                    isDone
                                />
                                <ActivityLogItem
                                    label="Pagamento"
                                    date={review?.submitted_at}
                                    desc="Checkout realizado pelo usuário"
                                    isDone={!!review?.submitted_at}
                                />
                                <ActivityLogItem
                                    label="Em Análise"
                                    date={review?.reviewed_at}
                                    desc="Nossa equipe está revisando o briefing"
                                    isDone={!!review?.reviewed_at}
                                />
                                {review?.rejected_at ? (
                                    <ActivityLogItem
                                        label="Ajustes Necessários"
                                        date={review?.rejected_at}
                                        desc={review?.rejection_reason || "Requer revisões"}
                                        isDanger
                                        isDone
                                    />
                                ) : (
                                    <ActivityLogItem
                                        label="Aprovação"
                                        date={review?.approved_at}
                                        desc="Briefing validado e aprovado"
                                        isDone={!!review?.approved_at}
                                    />
                                )}
                                <ActivityLogItem
                                    label="Início"
                                    date={review?.started_at}
                                    desc="Campanha aberta para creators"
                                    isDone={!!review?.started_at}
                                />
                                <ActivityLogItem
                                    label="Finalização"
                                    date={review?.completed_at}
                                    desc="Campanha concluída com sucesso"
                                    isDone={!!review?.completed_at}
                                />
                                {review?.cancelled_at && (
                                    <ActivityLogItem
                                        label="Cancelada"
                                        date={review?.cancelled_at}
                                        desc="Esta campanha foi cancelada"
                                        isDanger
                                        isDone
                                    />
                                )}
                            </div>
                        </SectionCard>


                        {/* Responsible */}
                        {hasResponsible && (
                            <SectionCard icon={Shield} title="Suporte Interno" compact>
                                <div className="p-4 bg-muted/30 rounded-3xl space-y-3">
                                    <p className="text-sm font-bold text-foreground italic">{responsible.name}</p>
                                    <div className="space-y-2">
                                        {responsible.email && (
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground truncate underline">
                                                <Mail size={12} className="shrink-0" />
                                                <span>{responsible.email}</span>
                                            </div>
                                        )}
                                        {responsible.phone && (
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Phone size={12} className="shrink-0" />
                                                <span>{responsible.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </SectionCard>
                        )}
                    </aside>
                </div>
            </div>
        </AppLayout>
    )
}

/* ─── UI COMPONENTS ─── */

function MetricCard({
    icon: Icon,
    label,
    value,
    trend,
    variant = "default"
}: {
    icon: any,
    label: string,
    value: string,
    trend?: string,
    variant?: "default" | "primary"
}) {
    return (
        <div className={cn(
            "rounded-[2.5rem] border p-6 flex flex-col justify-between h-44 transition-all duration-300 group hover:-translate-y-1 shadow-sm",
            variant === "primary" ? "bg-white border-primary/20" : "bg-white border-border"
        )}>
            <div className="flex justify-between items-start">
                <div className={cn(
                    "p-3 rounded-2xl group-hover:rotate-12 transition-transform duration-500",
                    variant === "primary" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>
                    <Icon size={20} />
                </div>
            </div>
            <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">{label}</p>
                <p className="text-2xl font-black tracking-tighter text-foreground italic leading-tight">{value}</p>
                {trend && (
                    <p className="text-[10px] font-bold text-muted-foreground mt-2 italic flex items-center gap-1 opacity-60">
                        {trend}
                    </p>
                )}
            </div>
        </div>
    )
}

function SectionCard({
    icon: Icon,
    title,
    children,
    compact,
    badge
}: {
    icon: any,
    title: string,
    children: React.ReactNode,
    compact?: boolean,
    badge?: string
}) {
    return (
        <section className={cn(
            "bg-white rounded-[2.5rem] border border-border/50 shadow-sm transition-all hover:shadow-md",
            compact ? "p-6" : "p-8 lg:p-10"
        )}>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "rounded-2xl bg-neutral-50 text-primary flex items-center justify-center border border-primary/10",
                        compact ? "w-10 h-10" : "w-12 h-12"
                    )}>
                        <Icon size={compact ? 18 : 22} />
                    </div>
                    <h2 className={cn(
                        "font-black tracking-tighter uppercase italic",
                        compact ? "text-sm" : "text-xl"
                    )}>{title}</h2>
                </div>
                {badge && (
                    <div className="px-3 py-1 bg-primary text-white text-[10px] font-black rounded-full shadow-lg shadow-primary/20">
                        {badge}
                    </div>
                )}
            </div>
            {children}
        </section>
    )
}

function DetailItem({ icon: Icon, label, children }: { icon?: any, label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-start gap-4">
            {Icon && (
                <div className="mt-1 p-2 rounded-xl bg-muted/50 text-muted-foreground shrink-0">
                    <Icon size={14} />
                </div>
            )}
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">{label}</p>
                <div className="text-sm text-foreground font-bold italic py-0.5">{children}</div>
            </div>
        </div>
    )
}

function ActivityLogItem({ label, date, desc, isDone, isDanger }: { label: string; date?: string | null; desc: string; isDone?: boolean; isDanger?: boolean }) {
    return (
        <div className="relative pl-8 group">
            <div className={cn(
                "absolute left-0 top-1 w-6 h-6 rounded-lg border-2 z-10 flex items-center justify-center transition-all duration-300",
                isDone && !isDanger ? "bg-emerald-500 border-emerald-500 text-white" :
                    isDanger ? "bg-red-500 border-red-500 text-white ring-4 ring-red-50 shadow-lg shadow-red-200" :
                        "bg-white border-muted text-muted-foreground group-hover:border-primary/50"
            )}>
                {isDone && !isDanger ? <CheckCircle2 size={12} /> : isDanger ? <XCircle size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
            </div>
            <div className="space-y-0.5">
                <div className="flex items-center justify-between gap-4">
                    <p className={cn(
                        "text-[10px] font-black uppercase tracking-[0.2em] italic",
                        isDone && !isDanger ? "text-foreground" : isDanger ? "text-red-600" : "text-muted-foreground/80"
                    )}>{label}</p>
                    {date && <span className="text-[10px] font-bold text-muted-foreground/40 italic">{date}</span>}
                </div>
                <p className={cn(
                    "text-xs font-medium italic",
                    isDone ? "text-muted-foreground" : "text-muted-foreground/60"
                )}>{desc}</p>
            </div>
        </div>
    )
}
