import { Head, Link } from '@inertiajs/react'
import {
    ArrowLeft,
    Banknote,
    Calendar,
    Check,
    Clock,
    CreditCard,
    DollarSign,
    ExternalLink,
    FileText,
    Hash,
    Info,
    User,
    Wallet,
    X,
} from 'lucide-react'

import { AdminLayoutWrapper } from '@/components/admin-layout'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { CopyText } from '@/components/copy-text'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface PaymentStatus {
    value: string
    label: string
    color: string
    icon: string
}

interface PaymentMethod {
    value: string
    label: string
    color: string
    icon: string
}

interface Payment {
    id: number
    uuid: string
    amount_formatted: string
    amount: number
    status: PaymentStatus
    payment_method: PaymentMethod | null
    gateway: string | null
    gateway_reference: string | null
    user: {
        id: number
        name: string
        email: string
        avatar: string | null
    } | null
    billable: {
        type: string
        id: number
        name?: string
        title?: string
    } | null
    gateway_data: Record<string, any> | null
    metadata: Record<string, any> | null
    created_at: string
    paid_at: string | null
    failed_at: string | null
    refunded_at: string | null
    expires_at: string | null
}

interface PageProps {
    paymentData: {
        data: Payment
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
    gray: 'bg-zinc-100 text-zinc-700 border-zinc-300',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    orange: 'bg-orange-100 text-orange-700 border-orange-300',
    green: 'bg-green-100 text-green-700 border-green-300',
    red: 'bg-red-100 text-red-700 border-red-300',
    blue: 'bg-blue-100 text-blue-700 border-blue-300',
}

const METHOD_COLORS: Record<string, string> = {
    green: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    blue: 'bg-blue-100 text-blue-700 border-blue-300',
    purple: 'bg-purple-100 text-purple-700 border-purple-300',
    teal: 'bg-teal-100 text-teal-700 border-teal-300',
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

const formatDate = (date: string | null): string => {
    if (!date) return '-'
    return new Date(date).toLocaleString('pt-BR')
}

const getInitials = (name: string): string =>
    name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

interface InfoRowProps {
    icon: React.ReactNode
    label: string
    children: React.ReactNode
}

function InfoRow({ icon, label, children }: InfoRowProps) {
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

function SectionCard({
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

function StatusTimelineItem({
    label,
    date,
    isLast = false,
}: StatusTimelineItemProps) {
    const hasDate = date !== null

    return (
        <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
                <div
                    className={`size-3 rounded-full border-2 mt-1 ${hasDate
                        ? 'border-emerald-500 bg-emerald-500'
                        : 'border-zinc-300 bg-white'
                        }`}
                />
                {!isLast && (
                    <div
                        className={`w-0.5 flex-1 min-h-6 ${hasDate ? 'bg-emerald-200' : 'bg-zinc-200'
                            }`}
                    />
                )}
            </div>
            <div className="pb-4">
                <p
                    className={`text-sm font-medium ${hasDate ? 'text-zinc-800' : 'text-zinc-400'
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

export default function PaymentShow({ paymentData }: PageProps) {
    const payment = paymentData.data;

    const statusTimeline = [
        { label: 'Criado', date: payment.created_at },
        { label: 'Pago', date: payment.paid_at },
        { label: 'Falhou', date: payment.failed_at },
        { label: 'Reembolsado', date: payment.refunded_at },
    ]

    return (
        <AdminLayoutWrapper title={`Pagamento #${payment.uuid.slice(0, 8)}`}>
            <Head title={`Pagamento #${payment.uuid.slice(0, 8)}`} />

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
                                href="/admin/payments"
                                aria-label="Voltar para listagem de pagamentos"
                            >
                                <ArrowLeft className="size-4" />
                            </Link>
                        </Button>

                        <div className="flex items-start gap-3">
                            <div className="rounded-xl bg-zinc-900 p-2.5">
                                <Wallet className="size-5 text-emerald-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                                    Pagamento
                                </h1>
                                <div className="mt-1.5 flex items-center gap-2">
                                    <Badge className={`border ${STATUS_COLORS[payment.status.color] || STATUS_COLORS.gray}`}>
                                        {payment.status.icon} {payment.status.label}
                                    </Badge>
                                    <span className="font-mono text-xs text-zinc-500">
                                        #{payment.uuid.slice(0, 8)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Content Grid ────────────────────────────────── */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left column — 2/3 width */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Payment Info */}
                        <SectionCard
                            icon={<Banknote className="size-4" />}
                            title="Informações do Pagamento"
                            description="Dados principais da transação"
                        >
                            <div className="space-y-0.5">
                                <InfoRow
                                    icon={<Hash className="size-4" />}
                                    label="UUID"
                                >
                                    <div className="font-mono">
                                        <CopyText text={payment.uuid}>
                                            {payment.uuid}
                                        </CopyText>
                                    </div>
                                </InfoRow>

                                {payment.gateway_reference && (
                                    <InfoRow
                                        icon={<FileText className="size-4" />}
                                        label="Referência do Gateway"
                                    >
                                        <div className="font-mono text-xs">
                                            <CopyText text={payment.gateway_reference}>
                                                {payment.gateway_reference}
                                            </CopyText>
                                        </div>
                                    </InfoRow>
                                )}

                                {payment.gateway && (
                                    <InfoRow
                                        icon={<CreditCard className="size-4" />}
                                        label="Gateway"
                                    >
                                        <span className="font-mono uppercase">{payment.gateway}</span>
                                    </InfoRow>
                                )}

                                <InfoRow
                                    icon={<Info className="size-4" />}
                                    label="Status"
                                >
                                    <Badge className={`border ${STATUS_COLORS[payment.status.color] || STATUS_COLORS.gray}`}>
                                        {payment.status.icon} {payment.status.label}
                                    </Badge>
                                </InfoRow>

                                {payment.payment_method && (
                                    <InfoRow
                                        icon={<CreditCard className="size-4" />}
                                        label="Método de Pagamento"
                                    >
                                        <Badge className={`border ${METHOD_COLORS[payment.payment_method.color] || METHOD_COLORS.blue}`}>
                                            {payment.payment_method.icon} {payment.payment_method.label}
                                        </Badge>
                                    </InfoRow>
                                )}

                                {payment.expires_at && (
                                    <InfoRow
                                        icon={<Clock className="size-4" />}
                                        label="Expira em"
                                    >
                                        {formatDate(payment.expires_at)}
                                    </InfoRow>
                                )}
                            </div>
                        </SectionCard>

                        {/* User Info */}
                        {payment.user && (
                            <SectionCard
                                icon={<User className="size-4" />}
                                title="Usuário"
                                description="Informações do pagador"
                            >
                                <div className="flex items-center gap-3 rounded-lg border border-zinc-100 bg-zinc-50/50 p-4">
                                    <Avatar className="size-12">
                                        {payment.user.avatar ? (
                                            <AvatarImage
                                                src={payment.user.avatar}
                                                alt={payment.user.name}
                                            />
                                        ) : null}
                                        <AvatarFallback className="bg-zinc-200 text-zinc-600">
                                            {getInitials(payment.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-zinc-800 truncate">
                                            {payment.user.name}
                                        </p>
                                        <p className="text-xs text-zinc-500 truncate">
                                            {payment.user.email}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="shrink-0"
                                        asChild
                                    >
                                        <Link
                                            href={`/admin/users/${payment.user.id}`}
                                            aria-label={`Ver perfil de ${payment.user.name}`}
                                        >
                                            <ExternalLink className="size-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </SectionCard>
                        )}

                        {/* Billable (Related Entity) */}
                        {payment.billable && (
                            <SectionCard
                                icon={<FileText className="size-4" />}
                                title="Relacionado a"
                                description={`Tipo: ${payment.billable.type}`}
                            >
                                <div className="space-y-0.5">
                                    <InfoRow
                                        icon={<Hash className="size-4" />}
                                        label="Tipo"
                                    >
                                        {payment.billable.type}
                                    </InfoRow>
                                    <InfoRow
                                        icon={<Hash className="size-4" />}
                                        label="ID"
                                    >
                                        {payment.billable.id}
                                    </InfoRow>
                                    {(payment.billable.name || payment.billable.title) && (
                                        <InfoRow
                                            icon={<FileText className="size-4" />}
                                            label="Nome"
                                        >
                                            {payment.billable.name || payment.billable.title}
                                        </InfoRow>
                                    )}
                                </div>
                            </SectionCard>
                        )}

                        {/* Gateway Data */}
                        {payment.gateway_data && Object.keys(payment.gateway_data).length > 0 && (
                            <SectionCard
                                icon={<CreditCard className="size-4" />}
                                title="Dados do Gateway"
                                description="Informações fornecidas pelo gateway de pagamento"
                            >
                                <pre className="rounded-lg bg-zinc-900 p-4 text-xs text-zinc-100 overflow-x-auto">
                                    {JSON.stringify(payment.gateway_data, null, 2)}
                                </pre>
                            </SectionCard>
                        )}

                        {/* Metadata */}
                        {payment.metadata && Object.keys(payment.metadata).length > 0 && (
                            <SectionCard
                                icon={<Info className="size-4" />}
                                title="Metadados"
                                description="Informações adicionais sobre o pagamento"
                            >
                                <pre className="rounded-lg bg-zinc-50 p-4 text-xs text-zinc-800 overflow-x-auto border border-zinc-200">
                                    {JSON.stringify(payment.metadata, null, 2)}
                                </pre>
                            </SectionCard>
                        )}
                    </div>

                    {/* Right column — 1/3 width */}
                    <div className="space-y-6">
                        {/* Amount */}
                        <SectionCard
                            icon={<DollarSign className="size-4" />}
                            title="Valor"
                        >
                            <div className="space-y-3">
                                <div className="rounded-lg bg-emerald-50 px-4 py-3 border border-emerald-100">
                                    <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">
                                        Valor Total
                                    </p>
                                    <p className="text-2xl font-bold text-emerald-700 tabular-nums mt-1">
                                        {payment.amount_formatted}
                                    </p>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Status Timeline */}
                        <SectionCard
                            icon={<Clock className="size-4" />}
                            title="Histórico de Status"
                        >
                            <div className="pt-1">
                                {statusTimeline
                                    .filter(item => item.date !== null || item.label === 'Criado')
                                    .map((item, index, arr) => (
                                        <StatusTimelineItem
                                            key={item.label}
                                            label={item.label}
                                            date={item.date}
                                            isLast={index === arr.length - 1}
                                        />
                                    ))}
                            </div>
                        </SectionCard>

                        {/* Dates */}
                        <SectionCard
                            icon={<Calendar className="size-4" />}
                            title="Datas Importantes"
                        >
                            <div className="space-y-3">
                                <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                                    <span className="text-xs text-zinc-500">Criado em</span>
                                    <span className="text-xs font-medium text-zinc-800 tabular-nums">
                                        {formatDate(payment.created_at)}
                                    </span>
                                </div>
                                {payment.paid_at && (
                                    <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                                        <span className="text-xs text-zinc-500">Pago em</span>
                                        <span className="text-xs font-medium text-emerald-600 tabular-nums">
                                            {formatDate(payment.paid_at)}
                                        </span>
                                    </div>
                                )}
                                {payment.failed_at && (
                                    <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                                        <span className="text-xs text-zinc-500">Falhou em</span>
                                        <span className="text-xs font-medium text-red-600 tabular-nums">
                                            {formatDate(payment.failed_at)}
                                        </span>
                                    </div>
                                )}
                                {payment.refunded_at && (
                                    <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                                        <span className="text-xs text-zinc-500">Reembolsado em</span>
                                        <span className="text-xs font-medium text-orange-600 tabular-nums">
                                            {formatDate(payment.refunded_at)}
                                        </span>
                                    </div>
                                )}
                                {payment.expires_at && (
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-xs text-zinc-500">Expira em</span>
                                        <span className="text-xs font-medium text-zinc-800 tabular-nums">
                                            {formatDate(payment.expires_at)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </SectionCard>
                    </div>
                </div>
            </div>
        </AdminLayoutWrapper>
    )
}
