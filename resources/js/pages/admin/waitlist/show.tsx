import { Head, Link } from '@inertiajs/react'
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    ExternalLink,
    FileText,
    Mail,
    MapPin,
    Music,
    User as UserIcon,
    XCircle,
} from 'lucide-react'

import WaitlistController from '@/actions/App/Http/Controllers/Admin/WaitlistController'
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

import type { WaitlistRegistration } from '@/types'

interface ShowProps {
    registrationData: {
        data: WaitlistRegistration
    }
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

/** Array field display */
function ArrayField({
    label,
    values,
}: {
    label: string
    values: string[] | null | undefined
}) {
    return (
        <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">{label}</p>
            <div className="flex flex-wrap gap-1.5">
                {values && values.length > 0 ? (
                    values.map((value, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                            {value}
                        </Badge>
                    ))
                ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                )}
            </div>
        </div>
    )
}

const AVAILABILITY_LABELS: Record<string, string> = {
    immediate: 'Imediato',
    '1-2_weeks': '1-2 semanas',
    '1_month': '1 mês',
    not_sure: 'Não tenho certeza',
}

const AVATAR_GRADIENTS = [
    'from-violet-400 to-purple-600',
    'from-blue-400 to-cyan-600',
    'from-emerald-400 to-teal-600',
    'from-orange-400 to-red-500',
    'from-pink-400 to-rose-600',
    'from-amber-400 to-yellow-600',
    'from-indigo-400 to-blue-600',
    'from-teal-400 to-emerald-600',
]

function getAvatarGradient(id: number): string {
    return AVATAR_GRADIENTS[id % AVATAR_GRADIENTS.length]
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join('')
}

export default function ShowWaitlist({ registrationData }: ShowProps) {
    const registration = registrationData.data

    // Generate initials from stage name
    const initials = registration.stage_name
        ? getInitials(registration.stage_name)
        : 'A'

    return (
        <AdminLayoutWrapper title={`Waitlist - ${registration.stage_name}`}>
            <Head title={registration.stage_name} />

            {/* Header */}
            <header className="sticky top-0 z-10 flex justify-between border-b border-border bg-background px-6 p-3">
                <div className="flex flex-col justify-between gap-1">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Link href={WaitlistController.index()} prefetch>
                                <Button
                                    size={'none'}
                                    variant="outline"
                                    className="p-2 border-1"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <h1 className="text-xl font-semibold">
                                Detalhes do Cadastro
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 pt-5 md:flex-row md:p-8">
                {/* ── Sidebar ── */}
                <aside className="w-full shrink-0 space-y-6 md:w-80">
                    <Card>
                        <CardContent className="flex flex-col gap-5 p-6">
                            <div className="flex flex-col items-center">
                                {/* Avatar with initials */}
                                <div
                                    className={`mb-3 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br ${getAvatarGradient(registration.id)}`}
                                >
                                    <span className="text-2xl font-bold text-white">
                                        {initials}
                                    </span>
                                </div>

                                <h2 className="w-full text-center text-lg font-bold [word-break:break-word]">
                                    {registration.stage_name}
                                </h2>

                                <p className="text-center text-sm text-muted-foreground">
                                    {registration.contact_email}
                                </p>

                                <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                                    <Badge variant="outline" className="gap-1">
                                        <Music className="size-3" />
                                        Artista
                                    </Badge>
                                    <Badge variant="outline">#{registration.id}</Badge>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex flex-col gap-3 text-sm">
                                {registration.city_state && (
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <MapPin className="size-4 shrink-0" />
                                        <span className="text-foreground">
                                            {registration.city_state}
                                        </span>
                                    </div>
                                )}

                                {registration.creation_availability && (
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <Calendar className="size-4 shrink-0" />
                                        <span className="text-foreground">
                                            {AVAILABILITY_LABELS[
                                                registration.creation_availability
                                            ] || registration.creation_availability}
                                        </span>
                                    </div>
                                )}

                                {registration.main_genre && (
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <Music className="size-4 shrink-0" />
                                        <span className="text-foreground">
                                            {registration.main_genre}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Status badges */}
                            <div className="flex flex-col gap-2">
                                {registration.email_sent ? (
                                    <Badge
                                        variant="default"
                                        className="gap-1.5 bg-green-500/10 text-green-600 hover:bg-green-500/20"
                                    >
                                        <CheckCircle2 className="size-3" />
                                        Email enviado
                                    </Badge>
                                ) : (
                                    <Badge
                                        variant="outline"
                                        className="gap-1.5 border-amber-500/20 bg-amber-500/10 text-amber-600"
                                    >
                                        <Mail className="size-3" />
                                        Email pendente
                                    </Badge>
                                )}

                                {registration.terms_accepted ? (
                                    <Badge
                                        variant="default"
                                        className="gap-1.5 bg-green-500/10 text-green-600 hover:bg-green-500/20"
                                    >
                                        <CheckCircle2 className="size-3" />
                                        Termos aceitos
                                    </Badge>
                                ) : (
                                    <Badge
                                        variant="outline"
                                        className="gap-1.5 border-amber-500/20 bg-amber-500/10 text-amber-600"
                                    >
                                        <FileText className="size-3" />
                                        Termos pendentes
                                    </Badge>
                                )}
                            </div>

                            <Separator />

                            <div className="space-y-1 text-xs text-muted-foreground">
                                <p>
                                    Cadastrado {registration.created_at_human}
                                </p>
                                {registration.created_at_formatted && (
                                    <p className="text-[10px]">
                                        {registration.created_at_formatted}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
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
                            <TabsTrigger value="social" className="gap-1.5">
                                <ExternalLink className="size-3.5" />
                                Redes Sociais
                            </TabsTrigger>
                            <TabsTrigger value="detalhes" className="gap-1.5">
                                <FileText className="size-3.5" />
                                Detalhes Artísticos
                            </TabsTrigger>
                        </TabsList>

                        {/* ── Tab: Dados Cadastrais ── */}
                        <TabsContent value="cadastro" className="space-y-6">
                            {/* Personal data */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Informações Básicas</CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4 sm:grid-cols-2">
                                    <InfoField
                                        label="Nome artístico"
                                        value={registration.stage_name}
                                    />
                                    <InfoField
                                        label="E-mail de contato"
                                        value={registration.contact_email}
                                    />
                                    <InfoField
                                        label="Cidade/Estado"
                                        value={registration.city_state}
                                    />
                                    <InfoField
                                        label="Disponibilidade"
                                        value={
                                            registration.creation_availability
                                                ? AVAILABILITY_LABELS[
                                                      registration.creation_availability
                                                  ] || registration.creation_availability
                                                : null
                                        }
                                    />
                                    <InfoField
                                        label="Gênero principal"
                                        value={registration.main_genre}
                                    />
                                    <InfoField
                                        label="ID"
                                        value={registration.id.toString()}
                                    />
                                </CardContent>
                            </Card>

                            {/* Status da conta */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Mail className="size-5" />
                                        Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4 sm:grid-cols-2">
                                    <BooleanField
                                        label="Email enviado"
                                        value={registration.email_sent}
                                    />
                                    <BooleanField
                                        label="Termos aceitos"
                                        value={registration.terms_accepted}
                                    />
                                    <InfoField
                                        label="Data de envio do email"
                                        value={registration.email_sent_at_formatted}
                                    />
                                    <InfoField
                                        label="Data de aceitação dos termos"
                                        value={registration.terms_accepted_at_formatted}
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
                                        label="Cadastrado em"
                                        value={registration.created_at_formatted}
                                    />
                                    <InfoField
                                        label="Atualizado em"
                                        value={registration.updated_at_formatted}
                                    />
                                    <InfoField
                                        label="Cadastrado há"
                                        value={registration.created_at_human}
                                    />
                                    <InfoField
                                        label="Atualizado há"
                                        value={registration.updated_at_human}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ── Tab: Redes Sociais ── */}
                        <TabsContent value="social" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ExternalLink className="size-5" />
                                        Redes Sociais e Portfólio
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4 sm:grid-cols-2">
                                    <InfoField
                                        label="Instagram"
                                        value={
                                            registration.instagram_handle
                                                ? `@${registration.instagram_handle}`
                                                : null
                                        }
                                    />
                                    <InfoField
                                        label="TikTok"
                                        value={
                                            registration.tiktok_handle
                                                ? `@${registration.tiktok_handle}`
                                                : null
                                        }
                                    />
                                    <InfoField
                                        label="YouTube"
                                        value={registration.youtube_handle}
                                    />
                                    <div className="sm:col-span-2">
                                        {registration.portfolio_link ? (
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                                    Link do Portfólio
                                                </p>
                                                <a
                                                    href={registration.portfolio_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-primary hover:underline flex items-center gap-1"
                                                >
                                                    {registration.portfolio_link}
                                                    <ExternalLink className="size-3" />
                                                </a>
                                            </div>
                                        ) : (
                                            <InfoField
                                                label="Link do Portfólio"
                                                value={null}
                                            />
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ── Tab: Detalhes Artísticos ── */}
                        <TabsContent value="detalhes" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Music className="size-5" />
                                        Informações Artísticas
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <ArrayField
                                        label="Tipos de artista"
                                        values={registration.artist_types}
                                    />

                                    {registration.other_artist_type && (
                                        <InfoField
                                            label="Outro tipo de artista"
                                            value={registration.other_artist_type}
                                        />
                                    )}

                                    <Separator />

                                    <ArrayField
                                        label="Tipos de participação desejada"
                                        values={registration.participation_types}
                                    />

                                    <Separator />

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <InfoField
                                            label="Gênero musical principal"
                                            value={registration.main_genre}
                                        />
                                        <InfoField
                                            label="Disponibilidade para criação"
                                            value={
                                                registration.creation_availability
                                                    ? AVAILABILITY_LABELS[
                                                          registration.creation_availability
                                                      ] ||
                                                      registration.creation_availability
                                                    : null
                                            }
                                        />
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
