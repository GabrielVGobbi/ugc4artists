import { useState } from 'react'
import { Head, Link } from '@inertiajs/react'
import {
	ArrowLeft,
	Briefcase,
	CheckCircle2,
	Clock,
	CreditCard,
	DollarSign,
	ExternalLink,
	FileText,
	Globe,
	Image,
	Mail,
	MapPin,
	Megaphone,
	Music,
	Phone,
	Shield,
	Target,
	User,
	Users,
	Video,
	XCircle,
} from 'lucide-react'

import AppLayout from '@/layouts/app2-layout'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import type { BreadcrumbItem } from '@/types'
import type { Campaign, CampaignStatusValue } from '@/types/campaign'

import { StatusBadge } from './components/status-badge'
import { canApprove, canReject } from './components/campaign-preview-modal'
import { ApproveDialog } from './components/approve-dialog'
import { RejectDialog } from './components/reject-dialog'
import { formatCurrency } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STATUSES_WITH_CREATORS: CampaignStatusValue[] = [
	'approved',
	'sent_to_creators',
	'in_progress',
	'completed',
]

const PLATFORM_LABELS: Record<string, string> = {
	instagram: 'Instagram',
	tiktok: 'TikTok',
	youtube: 'YouTube',
	youtube_shorts: 'YouTube Shorts',
}

const AUDIO_FORMAT_LABELS: Record<string, string> = {
	music: 'Música',
	narration: 'Narração',
}

const GENDER_LABELS: Record<string, string> = {
	female: 'Feminino',
	male: 'Masculino',
	both: 'Ambos',
}

const KIND_LABELS: Record<string, string> = {
	ugc: 'UGC',
	influencers: 'Influenciadores',
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const formatPlatforms = (platforms: string[]): string => {
	if (platforms.length === 0) return '—'
	return platforms
		.map((p) => PLATFORM_LABELS[p] ?? p)
		.join(', ')
}

const getInitials = (name: string): string =>
	name
		.split(' ')
		.slice(0, 2)
		.map((w) => w[0])
		.join('')
		.toUpperCase()

const formatCpf = (cpf: string): string => {
	const digits = cpf.replace(/\D/g, '')
	if (digits.length !== 11) return cpf
	return digits.replace(
		/(\d{3})(\d{3})(\d{3})(\d{2})/,
		'$1.$2.$3-$4',
	)
}

const formatPhone = (phone: string): string => {
	const digits = phone.replace(/\D/g, '')
	if (digits.length === 11) {
		return digits.replace(
			/(\d{2})(\d{5})(\d{4})/,
			'($1) $2-$3',
		)
	}
	if (digits.length === 10) {
		return digits.replace(
			/(\d{2})(\d{4})(\d{4})/,
			'($1) $2-$3',
		)
	}
	return phone
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface CampaignShowProps {
	campaign: Campaign
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

interface InfoRowProps {
	icon: React.ReactNode
	label: string
	children: React.ReactNode
}

function InfoRow ({ icon, label, children }: InfoRowProps) {
	return (
		<div className="flex items-start gap-3 py-2.5">
			<div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
				{icon}
			</div>
			<div className="min-w-0 flex-1">
				<p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
					{label}
				</p>
				<div className="mt-0.5 text-sm text-zinc-800">
					{children}
				</div>
			</div>
		</div>
	)
}

interface SectionCardProps {
	icon: React.ReactNode
	title: string
	description?: string
	children: React.ReactNode
	className?: string
}

function SectionCard ({
	icon,
	title,
	description,
	children,
	className,
}: SectionCardProps) {
	return (
		<Card className={className}>
			<CardHeader>
				<div className="flex items-center gap-2.5">
					<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-white">
						{icon}
					</div>
					<div>
						<CardTitle className="text-base">
							{title}
						</CardTitle>
						{description && (
							<CardDescription>
								{description}
							</CardDescription>
						)}
					</div>
				</div>
			</CardHeader>
			<CardContent>{children}</CardContent>
		</Card>
	)
}

interface StatusTimelineItemProps {
	label: string
	date: string | null
	isLast?: boolean
}

function StatusTimelineItem ({
	label,
	date,
	isLast = false,
}: StatusTimelineItemProps) {
	const hasDate = date !== null

	return (
		<div className="flex items-start gap-3">
			<div className="flex flex-col items-center">
				<div
					className={`size-3 rounded-full border-2 mt-1 ${
						hasDate
							? 'border-emerald-500 bg-emerald-500'
							: 'border-zinc-300 bg-white'
					}`}
				/>
				{!isLast && (
					<div
						className={`w-0.5 flex-1 min-h-6 ${
							hasDate ? 'bg-emerald-200' : 'bg-zinc-200'
						}`}
					/>
				)}
			</div>
			<div className="pb-4">
				<p
					className={`text-sm font-medium ${
						hasDate ? 'text-zinc-800' : 'text-zinc-400'
					}`}
				>
					{label}
				</p>
				{hasDate ? (
					<p className="text-xs text-zinc-500 tabular-nums">
						{formatDate(date)}
					</p>
				) : (
					<p className="text-xs text-zinc-400 italic">
						Pendente
					</p>
				)}
			</div>
		</div>
	)
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Campaign detail page for admin review and analysis.
 * Displays all campaign data organized in sections with
 * contextual action buttons based on campaign status.
 *
 * Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6
 */
export default function CampaignShow ({ campaign }: CampaignShowProps) {
	// State for approve/reject dialogs
	const [isApproveOpen, setIsApproveOpen] = useState(false)
	const [isRejectOpen, setIsRejectOpen] = useState(false)

	const isApprovable = canApprove(campaign.status.value)
	const isRejectable = canReject(campaign.status.value)
	const shouldShowCreators =
		STATUSES_WITH_CREATORS.includes(campaign.status.value)

	const breadcrumbs: BreadcrumbItem[] = [
		{ title: 'Admin', href: '/admin' },
		{ title: 'Campanhas', href: '/admin/campaigns' },
		{ title: campaign.name, href: `/admin/campaigns/${campaign.id}` },
	]

	const statusTimeline = [
		{ label: 'Submetida', date: campaign.review.submitted_at },
		{ label: 'Revisada', date: campaign.review.reviewed_at },
		{ label: 'Aprovada', date: campaign.review.approved_at },
		{ label: 'Recusada', date: campaign.review.rejected_at },
		{ label: 'Iniciada', date: campaign.review.started_at },
		{ label: 'Concluída', date: campaign.review.completed_at },
		{ label: 'Cancelada', date: campaign.review.cancelled_at },
	]

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title={`${campaign.name} — Campanha`} />

			<div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
				{/* ── Header ──────────────────────────────────────── */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="flex items-start gap-4">
						<Button
							variant="ghost"
							size="icon"
							className="mt-0.5 shrink-0"
							asChild
						>
							<Link
								href="/admin/campaigns"
								aria-label="Voltar para listagem de campanhas"
							>
								<ArrowLeft className="size-4" />
							</Link>
						</Button>

						<div className="flex items-start gap-3">
							<div className="rounded-xl bg-zinc-900 p-2.5">
								<Megaphone className="size-5 text-amber-400" />
							</div>
							<div>
								<h1 className="text-2xl font-bold tracking-tight text-zinc-900">
									{campaign.name}
								</h1>
								<div className="mt-1.5 flex items-center gap-2">
									<StatusBadge status={campaign.status} />
									{campaign.user && (
										<span className="text-sm text-zinc-500">
											por {campaign.user.name}
										</span>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* Action buttons */}
					{(isApprovable || isRejectable) && (
						<div className="flex gap-2 shrink-0">
							{isApprovable && (
								<Button
									variant="default"
									size="sm"
									onClick={() => setIsApproveOpen(true)}
									aria-label={`Aprovar campanha ${campaign.name}`}
								>
									<CheckCircle2 className="size-4" />
									Aprovar
								</Button>
							)}
							{isRejectable && (
								<Button
									variant="destructive"
									size="sm"
									onClick={() => setIsRejectOpen(true)}
									aria-label={`Recusar campanha ${campaign.name}`}
								>
									<XCircle className="size-4" />
									Recusar
								</Button>
							)}
						</div>
					)}
				</div>

				{/* ── Content Grid ────────────────────────────────── */}
				<div className="grid gap-6 lg:grid-cols-3">
					{/* Left column — 2/3 width */}
					<div className="space-y-6 lg:col-span-2">
						{/* General Info */}
						<SectionCard
							icon={<Megaphone className="size-4" />}
							title="Informações Gerais"
							description="Dados principais da campanha"
						>
							<div className="space-y-0.5">
								<InfoRow
									icon={<FileText className="size-4" />}
									label="Nome"
								>
									{campaign.name}
								</InfoRow>

								{campaign.description && (
									<InfoRow
										icon={<FileText className="size-4" />}
										label="Descrição"
									>
										<p className="text-zinc-600 whitespace-pre-line">
											{campaign.description}
										</p>
									</InfoRow>
								)}

								{campaign.objective && (
									<InfoRow
										icon={<Target className="size-4" />}
										label="Objetivo"
									>
										{campaign.objective}
									</InfoRow>
								)}

								<InfoRow
									icon={<Briefcase className="size-4" />}
									label="Tipo"
								>
									{KIND_LABELS[campaign.kind] ?? campaign.kind}
								</InfoRow>

								<InfoRow
									icon={<Globe className="size-4" />}
									label="Plataformas"
								>
									{formatPlatforms(campaign.content_platforms)}
								</InfoRow>
							</div>
						</SectionCard>

						{/* Cover Image */}
						{campaign.cover_image_url && (
							<SectionCard
								icon={<Image className="size-4" />}
								title="Imagem de Capa"
							>
								<div className="overflow-hidden rounded-lg">
									<img
										src={campaign.cover_image_url}
										alt={`Capa da campanha ${campaign.name}`}
										className="w-full max-h-64 object-cover rounded-lg"
										loading="lazy"
									/>
								</div>
							</SectionCard>
						)}

						{/* Content Settings */}
						<SectionCard
							icon={<Video className="size-4" />}
							title="Configurações de Conteúdo"
							description="Formato e especificações do conteúdo"
						>
							<div className="space-y-0.5">
								{campaign.audio_format && (
									<InfoRow
										icon={<Music className="size-4" />}
										label="Formato de Áudio"
									>
										{AUDIO_FORMAT_LABELS[campaign.audio_format] ??
											campaign.audio_format}
									</InfoRow>
								)}

								{(campaign.video_duration_min !== null ||
									campaign.video_duration_max !== null) && (
									<InfoRow
										icon={<Video className="size-4" />}
										label="Duração do Vídeo"
									>
										{campaign.video_duration_min !== null &&
										campaign.video_duration_max !== null
											? `${campaign.video_duration_min}s — ${campaign.video_duration_max}s`
											: campaign.video_duration_min !== null
												? `Mín. ${campaign.video_duration_min}s`
												: `Máx. ${campaign.video_duration_max}s`}
									</InfoRow>
								)}

								{campaign.briefing_mode && (
									<InfoRow
										icon={<FileText className="size-4" />}
										label="Briefing"
									>
										{campaign.briefing_mode === 'has_briefing'
											? 'Briefing fornecido'
											: 'Criar para mim'}
									</InfoRow>
								)}
							</div>
						</SectionCard>

						{/* Creator Filters */}
						<SectionCard
							icon={<Users className="size-4" />}
							title="Filtros de Creators"
							description="Critérios de seleção do público-alvo"
						>
							<div className="space-y-0.5">
								{(campaign.filters.age_min !== null ||
									campaign.filters.age_max !== null) && (
									<InfoRow
										icon={<User className="size-4" />}
										label="Faixa Etária"
									>
										{campaign.filters.age_min !== null &&
										campaign.filters.age_max !== null
											? `${campaign.filters.age_min} — ${campaign.filters.age_max} anos`
											: campaign.filters.age_min !== null
												? `A partir de ${campaign.filters.age_min} anos`
												: `Até ${campaign.filters.age_max} anos`}
									</InfoRow>
								)}

								{campaign.filters.gender && (
									<InfoRow
										icon={<Users className="size-4" />}
										label="Gênero"
									>
										{GENDER_LABELS[campaign.filters.gender] ??
											campaign.filters.gender}
									</InfoRow>
								)}

								{campaign.filters.niches.length > 0 && (
									<InfoRow
										icon={<Target className="size-4" />}
										label="Nichos"
									>
										<div className="flex flex-wrap gap-1.5">
											{campaign.filters.niches.map((niche) => (
												<span
													key={niche}
													className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700"
												>
													{niche}
												</span>
											))}
										</div>
									</InfoRow>
								)}

								{campaign.filters.states.length > 0 && (
									<InfoRow
										icon={<MapPin className="size-4" />}
										label="Estados"
									>
										<div className="flex flex-wrap gap-1.5">
											{campaign.filters.states.map((state) => (
												<span
													key={state}
													className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700"
												>
													{state}
												</span>
											))}
										</div>
									</InfoRow>
								)}

								{campaign.filters.min_followers !== null && (
									<InfoRow
										icon={<Users className="size-4" />}
										label="Seguidores Mínimos"
									>
										{campaign.filters.min_followers.toLocaleString('pt-BR')}
									</InfoRow>
								)}
							</div>
						</SectionCard>

						{/* Approved Creators */}
						{shouldShowCreators && campaign.approved_creators.length > 0 && (
							<SectionCard
								icon={<CheckCircle2 className="size-4" />}
								title="Creators Aprovados"
								description={`${campaign.approved_creators.length} creator${campaign.approved_creators.length !== 1 ? 's' : ''} aprovado${campaign.approved_creators.length !== 1 ? 's' : ''}`}
							>
								<div className="space-y-3">
									{campaign.approved_creators.map((creator) => (
										<div
											key={creator.id}
											className="flex items-center gap-3 rounded-lg border border-zinc-100 bg-zinc-50/50 p-3"
										>
											<Avatar className="size-10">
												{creator.avatar ? (
													<AvatarImage
														src={creator.avatar}
														alt={creator.name}
													/>
												) : null}
												<AvatarFallback className="text-xs bg-zinc-200 text-zinc-600">
													{getInitials(creator.name)}
												</AvatarFallback>
											</Avatar>
											<div className="min-w-0 flex-1">
												<p className="text-sm font-medium text-zinc-800 truncate">
													{creator.name}
												</p>
												<p className="text-xs text-zinc-500 truncate">
													{creator.email}
												</p>
											</div>
										</div>
									))}
								</div>
							</SectionCard>
						)}
					</div>

					{/* Right column — 1/3 width */}
					<div className="space-y-6">
						{/* Financial Data */}
						<SectionCard
							icon={<DollarSign className="size-4" />}
							title="Dados Financeiros"
						>
							<div className="space-y-3">
								<div className="flex items-center justify-between py-2 border-b border-zinc-100">
									<span className="text-sm text-zinc-500">
										Orçamento Total
									</span>
									<span className="text-sm font-semibold text-zinc-800 tabular-nums">
										{formatCurrency(campaign.total_budget)}
									</span>
								</div>
								<div className="flex items-center justify-between py-2 border-b border-zinc-100">
									<span className="text-sm text-zinc-500">
										Vagas
									</span>
									<span className="text-sm font-semibold text-zinc-800 tabular-nums">
										{campaign.slots_to_approve}
									</span>
								</div>
								<div className="flex items-center justify-between py-2 border-b border-zinc-100">
									<span className="text-sm text-zinc-500">
										Preço por Influenciador
									</span>
									<span className="text-sm font-semibold text-zinc-800 tabular-nums">
										{formatCurrency(campaign.price_per_influencer)}
									</span>
								</div>
								<div className="flex items-center justify-between py-2 border-b border-zinc-100">
									<span className="text-sm text-zinc-500">
										Taxa de Publicação
									</span>
									<span className="text-sm font-semibold text-zinc-800 tabular-nums">
										{formatCurrency(campaign.publication_fee)}
									</span>
								</div>
								<div className="flex items-center justify-between py-2 rounded-lg bg-zinc-50 px-3">
									<span className="text-sm font-medium text-zinc-700">
										Total Geral
									</span>
									<span className="text-base font-bold text-zinc-900 tabular-nums">
										{formatCurrency(campaign.summary.grand_total)}
									</span>
								</div>
							</div>
						</SectionCard>

						{/* Responsible */}
						<SectionCard
							icon={<Shield className="size-4" />}
							title="Responsável"
						>
							<div className="space-y-0.5">
								{campaign.responsible.name && (
									<InfoRow
										icon={<User className="size-4" />}
										label="Nome"
									>
										{campaign.responsible.name}
									</InfoRow>
								)}
								{campaign.responsible.cpf && (
									<InfoRow
										icon={<CreditCard className="size-4" />}
										label="CPF"
									>
										{formatCpf(campaign.responsible.cpf)}
									</InfoRow>
								)}
								{campaign.responsible.phone && (
									<InfoRow
										icon={<Phone className="size-4" />}
										label="Telefone"
									>
										{formatPhone(campaign.responsible.phone)}
									</InfoRow>
								)}
								{campaign.responsible.email && (
									<InfoRow
										icon={<Mail className="size-4" />}
										label="Email"
									>
										{campaign.responsible.email}
									</InfoRow>
								)}
							</div>
						</SectionCard>

						{/* Advertiser */}
						{campaign.user && (
							<SectionCard
								icon={<User className="size-4" />}
								title="Anunciante"
							>
								<div className="flex items-center gap-3">
									<Avatar className="size-12">
										{campaign.user.avatar ? (
											<AvatarImage
												src={campaign.user.avatar}
												alt={campaign.user.name}
											/>
										) : null}
										<AvatarFallback className="bg-zinc-200 text-zinc-600">
											{getInitials(campaign.user.name)}
										</AvatarFallback>
									</Avatar>
									<div className="min-w-0 flex-1">
										<p className="text-sm font-medium text-zinc-800 truncate">
											{campaign.user.name}
										</p>
										<p className="text-xs text-zinc-500 truncate">
											{campaign.user.email}
										</p>
									</div>
									<Button
										variant="ghost"
										size="icon"
										className="shrink-0"
										asChild
									>
										<Link
											href={`/admin/users/${campaign.user.id}`}
											aria-label={`Ver perfil de ${campaign.user.name}`}
										>
											<ExternalLink className="size-4" />
										</Link>
									</Button>
								</div>
							</SectionCard>
						)}

						{/* Status History */}
						<SectionCard
							icon={<Clock className="size-4" />}
							title="Histórico de Status"
						>
							<div className="pt-1">
								{statusTimeline.map((item, index) => (
									<StatusTimelineItem
										key={item.label}
										label={item.label}
										date={item.date}
										isLast={index === statusTimeline.length - 1}
									/>
								))}
							</div>
						</SectionCard>
					</div>
				</div>
			</div>

			{/* ── Approve / Reject Dialogs ────────────────────────────── */}
			<ApproveDialog
				campaignId={campaign.id}
				isOpen={isApproveOpen}
				onClose={() => setIsApproveOpen(false)}
			/>
			<RejectDialog
				campaignId={campaign.id}
				isOpen={isRejectOpen}
				onClose={() => setIsRejectOpen(false)}
			/>
		</AppLayout>
	)
}
