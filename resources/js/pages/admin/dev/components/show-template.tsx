import { Head, Link, router } from '@inertiajs/react'
import {
    ArrowLeft,
    Ban,
    Briefcase,
    CreditCard,
    Droplets,
    FileCheck,
    FileUser,
    Gauge,
    MapPin,
    Pencil,
    Phone,
    ScrollText,
    Trash2,
    User,
    Wallet,
} from 'lucide-react'
import { useState } from 'react'

import ClientController from '@/actions/App/Http/Controllers/ClientController'
import { AddressManager } from '@/components/address/address-manager'
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
import { useDeleteResource } from '@/hooks/resources/generic'
import AppLayout from '@/layouts/app-layout'

import type { Client } from '@/types/app/client'
import type { BreadcrumbItem } from '@/types/navigation'
import { formatCurrency } from '@/lib/utils'

interface ShowProps {
    clientData: { data: Client }
}

function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    })
}

/** Label + value display block. */
function InfoField({ label, value, multiline = false }: {
    label: string
    value: string | null | undefined
    multiline?: boolean
}) {
    return (
        <div>
            <p className="text-xs font-medium text-muted-foreground">
                {label}
            </p>
            <p className={`text-sm ${multiline ? 'whitespace-pre-wrap' : ''}`}>
                {value || '-'}
            </p>
        </div>
    )
}

/** Boolean status pill. */
function BooleanField({ label, value }: {
    label: string
    value: boolean | null | undefined
}) {
    const isActive = value === true
    return (
        <div className="flex items-center gap-2">
            <div
                className={`size-2 shrink-0 rounded-full ${isActive ? 'bg-green-500' : 'bg-muted-foreground/30'
                    }`}
            />
            <div>
                <p className="text-xs font-medium text-muted-foreground">
                    {label}
                </p>
                <p className="text-sm">{isActive ? 'Sim' : 'Não'}</p>
            </div>
        </div>
    )
}

export default function ShowClient({ clientData }: ShowProps) {
    const client = clientData.data
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    const deleteClient = useDeleteResource('clients', {
        successMessage: 'Cliente removido com sucesso!',
    })

    const handleDeleteConfirm = () => {
        deleteClient.mutate(client.id, {
            onSuccess: () => {
                setIsDeleteOpen(false)
                router.visit(ClientController.index())
            },
        })
    }

    const initials = client.name
        ? client.name
            .split(' ')
            .map((word: string) => word[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()
        : 'CL'

    const personTypeLabel =
        client.person_type === 'pf'
            ? 'Pessoa Física'
            : client.person_type === 'pj'
                ? 'Pessoa Jurídica'
                : null

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Clientes', href: ClientController.index().url },
                { title: client.name, href: `/clients/${client.id}` },
            ] satisfies BreadcrumbItem[] as unknown as React.ReactNode}
        >
            <Head title={client.name} />

            <header className="flex border-b border-border bg-background sticky top-0 z-10 justify-between px-6 p-3">
                <div className="flex flex-col gap-1  justify-between">
                    <div className="flex align-content-end items-center gap-3 ">
                        <div className="flex gap-2 items-center">
                            <Link href={ClientController.index()} prefetch>
                                <Button variant="outline">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <h1 className="text-xl font-semibold">
                                Detalhes do Cliente
                            </h1>
                        </div>
                        <p className="text-sm text-muted-foreground"></p>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><div className="flex items-center gap-2">
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
                            <Link href={ClientController.edit(client.id)}>
                                <Pencil className="mr-2 size-4" />
                                Editar
                            </Link>
                        </Button>
                    </div>
                    </div>
                </div>
            </header >

            <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 md:flex-row md:p-8 pt-5">


                {/* ── Sidebar ── */}
                <aside className="w-full shrink-0 space-y-6 md:w-80">
                    <Card>
                        <CardContent className="flex flex-col gap-5 p-6">
                            <div className="flex flex-col items-center">
                                <div className="mb-3 flex size-20 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-semibold text-primary">
                                    {initials}
                                </div>
                                <h2 className="w-full text-center text-lg font-bold [word-break:break-word]">
                                    {client.name}
                                </h2>
                                {client.company_name && (
                                    <p className="text-center text-sm text-muted-foreground">
                                        {client.company_name}
                                    </p>
                                )}
                                <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                                    {personTypeLabel && (
                                        <Badge variant="secondary">
                                            {personTypeLabel}
                                        </Badge>
                                    )}
                                    {client.cod_client && (
                                        <Badge variant="outline">
                                            #{client.cod_client}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            <div className="flex flex-col gap-3 text-sm">
                                {client.email && (
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <User className="size-4 shrink-0" />
                                        <span className="truncate text-foreground">
                                            {client.email}
                                        </span>
                                    </div>
                                )}
                                {(client.formatted_document || client.document) && (
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <FileUser className="size-4 shrink-0" />
                                        <span>
                                            {client.formatted_document ?? client.document}
                                        </span>
                                    </div>
                                )}
                                {(client.formatted_phone || client.phone) && (
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <Phone className="size-4 shrink-0" />
                                        <span>
                                            {client.formatted_phone ?? client.phone}
                                        </span>
                                    </div>
                                )}
                                {client.phone2 && (
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <Phone className="size-4 shrink-0" />
                                        <span>{client.phone2}</span>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Status flags */}
                            <div className="flex flex-col gap-2">
                                {client.bloquear_vendas && (
                                    <Badge variant="destructive" className="gap-1.5">
                                        <Ban className="size-3" />
                                        Vendas bloqueadas
                                    </Badge>
                                )}
                                {client.tem_contrato && (
                                    <Badge variant="default" className="gap-1.5">
                                        <FileCheck className="size-3" />
                                        Possui contrato
                                    </Badge>
                                )}
                            </div>

                            <Separator />

                            <div className="space-y-1 text-xs text-muted-foreground">
                                <p>Criado em {formatDate(client.created_at)}</p>
                                <p>Atualizado em {formatDate(client.updated_at)}</p>
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
                                <User className="size-3.5" />
                                Cadastro
                            </TabsTrigger>
                            <TabsTrigger value="faturamento" className="gap-1.5">
                                <Wallet className="size-3.5" />
                                Faturamento
                            </TabsTrigger>
                            <TabsTrigger value="agua" className="gap-1.5">
                                <Droplets className="size-3.5" />
                                Água
                            </TabsTrigger>
                            <TabsTrigger value="enderecos" className="gap-1.5">
                                <MapPin className="size-3.5" />
                                Endereços
                            </TabsTrigger>
                        </TabsList>

                        {/* ── Tab: Cadastro ── */}
                        <TabsContent value="cadastro" className="space-y-6">
                            {/* Dados pessoais / empresa */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Dados Cadastrais</CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4 sm:grid-cols-2">
                                    <InfoField label="Nome" value={client.name} />
                                    <InfoField label="Razão Social" value={client.company_name} />
                                    <InfoField label="Código do cliente" value={client.cod_client} />
                                    <InfoField
                                        label="CPF / CNPJ"
                                        value={client.formatted_document ?? client.document}
                                    />
                                    <InfoField label="IE / RG" value={client.ie_rg} />
                                    <InfoField label="Inscrição Estadual" value={client.inscricao_estadual} />
                                    <InfoField label="Registro Estadual" value={client.state_registration} />
                                    <InfoField label="Tipo de pessoa" value={personTypeLabel} />
                                </CardContent>
                            </Card>

                            {/* Dados comerciais */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Briefcase className="size-5" />
                                        Dados Comerciais
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4 sm:grid-cols-2">
                                    <InfoField
                                        label="Tipo de contribuinte"
                                        value={client.type_of_taxpayer_label ?? client.type_of_taxpayer}
                                    />
                                    <InfoField
                                        label="Atividade comercial"
                                        value={client.atividade_comercial_label ?? client.atividade_comercial}
                                    />
                                    <InfoField
                                        label="Negociação"
                                        value={client.negotiation_label ?? client.negotiation}
                                    />
                                    <InfoField
                                        label="Mídia de captação"
                                        value={client.midia_captacao_label ?? client.midia_captacao}
                                    />
                                </CardContent>
                            </Card>

                            {/* Observações */}
                            {(client.observations || client.observation) && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ScrollText className="size-5" />
                                            Observações
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid gap-4 sm:grid-cols-1">
                                        {client.observations && (
                                            <InfoField
                                                label="Observações gerais"
                                                value={client.observations}
                                                multiline
                                            />
                                        )}
                                        {client.observation && (
                                            <InfoField
                                                label="Observação adicional"
                                                value={client.observation}
                                                multiline
                                            />
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        {/* ── Tab: Faturamento ── */}
                        <TabsContent value="faturamento" className="space-y-6">
                            {/* Preços */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Wallet className="size-5" />
                                        Preços
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4 sm:grid-cols-1">
                                    <InfoField
                                        label=""
                                        value={client.tipo_preco_label ?? client.tipo_preco ?? '-'}
                                    />


                                    <div className="grid sm:grid-cols-2">

                                        {client.tipo_preco === 'preco_m3' && (
                                            <div className="rounded-lg bg-muted/50 p-3">
                                                <p className="text-xs text-muted-foreground">
                                                    Preço por m³
                                                </p>
                                                <p className="text-lg font-semibold tracking-tight">
                                                    {formatCurrency(client.preco_m3 ?? undefined)}
                                                </p>
                                            </div>
                                        )}


                                        {client.tipo_preco === 'preco_caminhao' && (
                                            <>
                                                <div className="rounded-lg bg-muted/50 p-3">
                                                    <p className="text-xs text-muted-foreground">
                                                        Preço caminhão 10m³
                                                    </p>
                                                    <p className="text-lg font-semibold tracking-tight">
                                                        {formatCurrency(client.preco_10m3 ?? undefined)}
                                                    </p>
                                                </div>
                                                <div className="rounded-lg bg-muted/50 p-3">
                                                    <p className="text-xs text-muted-foreground">
                                                        Preço caminhão 20m³
                                                    </p>
                                                    <p className="text-lg font-semibold tracking-tight">
                                                        {formatCurrency(client.preco_20m3 ?? undefined)}
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Pagamento e cobrança */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="size-5" />
                                        Pagamento e Cobrança
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4 sm:grid-cols-2">
                                    <InfoField
                                        label="Forma de pagamento"
                                        value={client.forma_pagamento_label ?? client.forma_pagamento}
                                    />
                                    <InfoField
                                        label="Condição de pagamento"
                                        value={client.payment_condition}
                                    />
                                    <InfoField
                                        label="Hora parada"
                                        value={formatCurrency(client.hora_parada ?? undefined)}
                                    />
                                    <BooleanField
                                        label="Cobrar hora parada"
                                        value={client.cobra_hparada}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ── Tab: Água ── */}
                        <TabsContent value="agua" className="space-y-6">
                            {/* Tipo de água e operação */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Droplets className="size-5" />
                                        Tipo de Água e Operação
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4 sm:grid-cols-2">
                                    <InfoField
                                        label="Tipo de água"
                                        value={client.tipo_agua_label ?? client.tipo_agua}
                                    />
                                    <InfoField
                                        label="Metros de mangueira"
                                        value={client.metros_mangueira}
                                    />
                                </CardContent>
                            </Card>

                            {/* Hidrômetro */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Gauge className="size-5" />
                                        Hidrômetro
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4 sm:grid-cols-2">
                                    <BooleanField
                                        label="Possui hidrômetro"
                                        value={client.has_water_meter}
                                    />
                                    {client.has_water_meter && (
                                        <>
                                            <InfoField
                                                label="Leitura inicial (m³)"
                                                value={
                                                    client.initial_water_meter != null
                                                        ? String(client.initial_water_meter)
                                                        : null
                                                }
                                            />
                                            <InfoField
                                                label="Leitura final (m³)"
                                                value={
                                                    client.final_water_meter != null
                                                        ? String(client.final_water_meter)
                                                        : null
                                                }
                                            />
                                            <InfoField
                                                label="Data da leitura"
                                                value={client.water_meter_date}
                                            />
                                            {client.water_meter_observations && (
                                                <div className="sm:col-span-2">
                                                    <InfoField
                                                        label="Observações do hidrômetro"
                                                        value={client.water_meter_observations}
                                                        multiline
                                                    />
                                                </div>
                                            )}
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ── Tab: Endereços ── */}
                        <TabsContent value="enderecos">
                            <AddressManager model="client" modelId={client.id} />
                        </TabsContent>
                    </Tabs>
                </main>
            </div>

            <DeleteConfirmModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDeleteConfirm}
                isLoading={deleteClient.isPending}
                title="Remover Cliente"
                description={`Tem certeza que deseja remover o cliente "${client.name}"? Esta ação não pode ser desfeita.`}
            />
        </AppLayout>
    )
}
