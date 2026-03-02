import { Head, Link, router } from '@inertiajs/react'
import {
    ArrowLeft,
    Ban,
    Briefcase,
    Calendar,
    CheckCircle2,
    CreditCard,
    FileText,
    Mail,
    Pencil,
    Phone,
    Shield,
    Trash2,
    User as UserIcon,
    Wallet,
    XCircle,
} from 'lucide-react'
import { useState } from 'react'

import UsersController from '@/actions/App/Http/Controllers/Admin/UsersController'
import { DeleteConfirmModal } from '@/components/delete-confirm-modal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'
import { AdminLayoutWrapper } from '@/components/admin-layout'

import type { UserAdminDetail } from '@/types'

interface ShowProps {
    userData: {
        data: UserAdminDetail;
    };
}

/** Label + value display block. */
function InfoField({
    label,
    value,
    multiline = false,
}: {
    label: string
    value: string | null | undefined
    multiline?: boolean
}) {
    return (
        <div>
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className={`text-sm ${multiline ? 'whitespace-pre-wrap' : ''}`}>
                {value || '-'}
            </p>
        </div>
    )
}


/** Boolean status with icon. */
function BooleanField({
    label,
    value,
}: {
    label: string
    value: boolean | null | undefined
}) {
    const isActive = value === true
    return (
        <div className="flex items-center gap-2">
            {isActive ? (
                <CheckCircle2 className="size-4 shrink-0 text-green-500" />
            ) : (
                <XCircle className="size-4 shrink-0 text-muted-foreground/30" />
            )}
            <div>
                <p className="text-xs font-medium text-muted-foreground">
                    {label}
                </p>
                <p className="text-sm">{isActive ? 'Sim' : 'Não'}</p>
            </div>
        </div>
    )
}

export default function ShowUser({ userData }: ShowProps) {
    const user = userData.data;
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    // Generate initials from name
    const initials = user.name
        ? user.name
            .split(' ')
            .map((word: string) => word[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()
        : 'U'

    // Account type styling
    const typeStyles: Record<
        string,
        { label: string; class: string; icon: typeof UserIcon }
    > = {
        artist: {
            label: 'Artista',
            class: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
            icon: UserIcon,
        },
        brand: {
            label: 'Curador',
            class: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
            icon: Briefcase,
        },
        creator: {
            label: 'Criador',
            class: 'bg-green-500/10 text-green-600 border-green-500/20',
            icon: FileText,
        },
    }

    const accountType = typeStyles[user.account_type] || {
        label: user.account_type,
        class: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
        icon: UserIcon,
    }

    const AccountTypeIcon = accountType.icon

    return (
        <AdminLayoutWrapper title={`Usuário - ${user.name}`}>
            <Head title={user.name} />

            {/* Header */}
            <header className="sticky top-0 z-10 flex justify-between border-b border-border bg-background px-6 p-3">
                <div className="flex flex-col justify-between gap-1">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Link href={UsersController.index()} prefetch>
                                <Button size={'none'} variant="outline" className="p-2 border-1">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <h1 className="text-xl font-semibold">
                                Detalhes do Usuário
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="hidden">
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setIsDeleteOpen(true)}
                        >
                            <Trash2 className="mr-2 size-4" />
                            Excluir
                        </Button>
                        <Button size="sm" asChild>
                            <Link href={UsersController.edit(user.id)}>
                                <Pencil className="mr-2 size-4" />
                                Editar
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>

            <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 pt-5 md:flex-row md:p-8">
                {/* ── Sidebar ── */}
                <aside className="w-full shrink-0 space-y-6 md:w-80">
                    <Card>
                        <CardContent className="flex flex-col gap-5 p-6">
                            <div className="flex flex-col items-center">
                                {/* Avatar or initials */}
                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="mb-3 size-20 rounded-2xl object-cover"
                                    />
                                ) : (
                                    <div className="mb-3 flex size-20 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-semibold text-primary">
                                        {initials}
                                    </div>
                                )}

                                <h2 className="w-full text-center text-lg font-bold [word-break:break-word]">
                                    {user.name}
                                </h2>

                                <p className="text-center text-sm text-muted-foreground">
                                    {user.email}
                                </p>

                                <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                                    <Badge
                                        variant="outline"
                                        className={accountType.class}
                                    >
                                        <AccountTypeIcon className="mr-1 size-3" />
                                        {accountType.label}
                                    </Badge>
                                    <Badge variant="outline">#{user.uuid}</Badge>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex flex-col gap-3 text-sm">
                                {user.phone && (
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <Phone className="size-4 shrink-0" />
                                        <span className="text-foreground">
                                            {user.phone_formatted ?? user.phone}
                                        </span>
                                    </div>
                                )}

                                {user.document && (
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <FileText className="size-4 shrink-0" />
                                        <span className="text-foreground">
                                            {user.document_formatted ?? user.document}
                                        </span>
                                    </div>
                                )}

                                {user.balance && (
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <Wallet className="size-4 shrink-0" />
                                        <span className="font-semibold text-foreground">
                                            {user.balance}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Status badges */}
                            <div className="flex flex-col gap-2">
                                {user.email_verified ? (
                                    <Badge
                                        variant="default"
                                        className="gap-1.5 bg-green-500/10 text-green-600 hover:bg-green-500/20"
                                    >
                                        <CheckCircle2 className="size-3" />
                                        Email verificado
                                    </Badge>
                                ) : (
                                    <Badge
                                        variant="outline"
                                        className="gap-1.5 border-amber-500/20 bg-amber-500/10 text-amber-600"
                                    >
                                        <Mail className="size-3" />
                                        Email não verificado
                                    </Badge>
                                )}

                                {user.onboarding_completed ? (
                                    <Badge
                                        variant="default"
                                        className="gap-1.5 bg-green-500/10 text-green-600 hover:bg-green-500/20"
                                    >
                                        <CheckCircle2 className="size-3" />
                                        Onboarding completo
                                    </Badge>
                                ) : (
                                    <Badge
                                        variant="outline"
                                        className="gap-1.5 border-amber-500/20 bg-amber-500/10 text-amber-600"
                                    >
                                        <Calendar className="size-3" />
                                        Onboarding pendente
                                    </Badge>
                                )}
                            </div>

                            <Separator />

                            <div className="space-y-1 text-xs text-muted-foreground">
                                <p>
                                    Criado em{' '}
                                    {user.created_at}
                                </p>
                                <p>
                                    Atualizado em{' '}
                                    {user.updated_at}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Counts card */}
                    {(user.campaigns_count > 0 ||
                        user.campaign_transactions_count > 0 ||
                        user.account_statements_count > 0) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Estatísticas</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {user.campaigns_count > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Campanhas</span>
                                            <span className="font-semibold">{user.campaigns_count}</span>
                                        </div>
                                    )}

                                    {user.campaign_transactions_count > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Transações</span>
                                            <span className="font-semibold">{user.campaign_transactions_count}</span>
                                        </div>
                                    )}

                                    {user.account_statements_count > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Extratos</span>
                                            <span className="font-semibold">{user.account_statements_count}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                </aside>

                {/* ── Main content ── */}
                <main className="min-w-0 flex-1 space-y-6">
                    {/* ── Tabs ── */}
                    <Tabs defaultValue="cadastro" className="w-full">
                        <TabsList className="w-full justify-start">
                            <TabsTrigger value="cadastro" className="gap-1.5">
                                <UserIcon className="size-3.5" />
                                Dados Cadastrais
                            </TabsTrigger>
                            <TabsTrigger value="conta" className="gap-1.5">
                                <Shield className="size-3.5" />
                                Conta
                            </TabsTrigger>
                            <TabsTrigger value="financeiro" className="gap-1.5">
                                <CreditCard className="size-3.5" />
                                Financeiro
                            </TabsTrigger>
                        </TabsList>

                        {/* ── Tab: Dados Cadastrais ── */}
                        <TabsContent value="cadastro" className="space-y-6">
                            {/* Personal data */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Informações Pessoais</CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4 sm:grid-cols-2">
                                    <InfoField
                                        label="Nome completo"
                                        value={user.name}
                                    />
                                    <InfoField
                                        label="E-mail"
                                        value={user.email}
                                    />
                                    <InfoField
                                        label="Telefone"
                                        value={
                                            user.phone_formatted ?? user.phone
                                        }
                                    />
                                    <InfoField
                                        label="CPF"
                                        value={
                                            user.document_formatted ??
                                            user.document
                                        }
                                    />
                                    <InfoField
                                        label="Tipo de conta"
                                        value={accountType.label}
                                    />
                                    <InfoField
                                        label="UUID"
                                        value={user.uuid}
                                    />
                                </CardContent>
                            </Card>

                            {/* Bio */}
                            {user.bio && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Biografia</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <InfoField
                                            label=""
                                            value={user.bio}
                                            multiline
                                        />
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        {/* ── Tab: Conta ── */}
                        <TabsContent value="conta" className="space-y-6">
                            {/* Status da conta */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="size-5" />
                                        Status da Conta
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4 sm:grid-cols-2">
                                    <BooleanField
                                        label="Email verificado"
                                        value={user.email_verified}
                                    />
                                    <BooleanField
                                        label="Onboarding completado"
                                        value={user.onboarding_completed}
                                    />
                                    <InfoField
                                        label="Data de verificação do email"
                                        value={(
                                            user.email_verified_at
                                        )}
                                    />
                                    <InfoField
                                        label="Data de conclusão do onboarding"
                                        value={(
                                            user.onboarding_completed_at
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Timestamps */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="size-5" />
                                        Histórico
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4 sm:grid-cols-2">
                                    <InfoField
                                        label="Criado em"
                                        value={(user.created_at)}
                                    />
                                    <InfoField
                                        label="Atualizado em"
                                        value={(user.updated_at)}
                                    />
                                    <InfoField
                                        label="Criado há"
                                        value={user.created_at_human}
                                    />
                                    <InfoField
                                        label="Atualizado há"
                                        value={user.updated_at_human}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ── Tab: Financeiro ── */}
                        <TabsContent value="financeiro" className="space-y-6">
                            {/* Wallet */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Wallet className="size-5" />
                                        Carteira
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="rounded-lg bg-primary/5 p-4">
                                        <p className="text-sm text-muted-foreground">
                                            Saldo atual
                                        </p>
                                        <p className="text-3xl font-bold tracking-tight">
                                            {user.balance || 'R$ 0,00'}
                                        </p>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div className="rounded-lg border bg-card p-3">
                                            <p className="text-xs text-muted-foreground">
                                                Campanhas
                                            </p>
                                            <p className="text-lg font-semibold">
                                                {user.campaigns_count || 0}
                                            </p>
                                        </div>
                                        <div className="rounded-lg border bg-card p-3">
                                            <p className="text-xs text-muted-foreground">
                                                Transações
                                            </p>
                                            <p className="text-lg font-semibold">
                                                {user.campaign_transactions_count ||
                                                    0}
                                            </p>
                                        </div>
                                        <div className="rounded-lg border bg-card p-3">
                                            <p className="text-xs text-muted-foreground">
                                                Extratos
                                            </p>
                                            <p className="text-lg font-semibold">
                                                {user.account_statements_count ||
                                                    0}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>


        </AdminLayoutWrapper>
    )
}
