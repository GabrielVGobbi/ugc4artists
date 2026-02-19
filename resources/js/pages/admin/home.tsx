import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, DataTablePagination, type Column } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { http } from '@/lib/http';
import AppLayout from '@/layouts/app2-layout';
import { CampaignModerationBoard } from '@/pages/admin/components/campaign-moderation-board';
import { type BreadcrumbItem } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { Head } from '@inertiajs/react';
import { Activity, CreditCard, RefreshCw, TrendingUp, UserPlus, Wallet } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '',
    },
];

type DashboardPeriod = 'day' | 'week' | 'month' | 'custom';

type DashboardFilterState = {
    period: DashboardPeriod;
    startDate: string;
    endDate: string;
    search: string;
    page: number;
    perPage: number;
};

type PaymentRow = {
    id: number;
    uuid: string;
    user_name: string | null;
    user_email: string | null;
    status: string;
    payment_method: string | null;
    gateway: string | null;
    amount_cents: number;
    gateway_amount_cents: number;
    wallet_applied_cents: number;
    due_date: string | null;
    paid_at: string | null;
    created_at: string | null;
};

type WaitlistRow = {
    id: number;
    stage_name: string;
    contact_email: string;
    city_state: string | null;
    creation_availability: string;
    artist_types: string[];
    participation_types: string[];
    created_at: string | null;
};

type ApiTableMeta = {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

type PaymentsResponse = {
    summary: {
        total_payments: number;
        paid_payments: number;
        pending_payments: number;
        failed_payments: number;
        paid_revenue_cents: number;
        wallet_applied_cents: number;
        gateway_amount_cents: number;
        average_ticket_cents: number;
        paid_conversion_rate: number;
        status_breakdown?: Array<{
            status: string;
            total: number;
            amount_cents: number;
        }>;
    };
    series: Array<{
        date: string;
        payments_count: number;
        paid_revenue_cents: number;
    }>;
    table: {
        data: PaymentRow[];
        meta: ApiTableMeta;
    };
};

type WaitlistResponse = {
    summary: {
        total_registrations: number;
        unique_emails: number;
        registrations_today: number;
    };
    series: Array<{
        date: string;
        registrations_count: number;
    }>;
    table: {
        data: WaitlistRow[];
        meta: ApiTableMeta;
    };
};

const periodOptions: { label: string; value: DashboardPeriod }[] = [
    { label: 'Hoje', value: 'day' },
    { label: 'Semana', value: 'week' },
    { label: 'Mes', value: 'month' },
    { label: 'Periodo', value: 'custom' },
];

const moneyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

function formatCurrency(cents: number): string {
    return moneyFormatter.format((cents ?? 0) / 100);
}

function formatDate(date: string | null): string {
    if (!date) return '-';
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(date));
}

function buildFilterParams(filters: DashboardFilterState): Record<string, string | number> {
    const params: Record<string, string | number> = {
        period: filters.period,
        page: filters.page,
        per_page: filters.perPage,
    };

    if (filters.search.trim().length > 0) {
        params.search = filters.search.trim();
    }

    if (filters.period === 'custom') {
        if (filters.startDate) params.start_date = filters.startDate;
        if (filters.endDate) params.end_date = filters.endDate;
    }

    return params;
}

function statusBadgeClass(status: string): string {
    if (status === 'paid') return 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30';
    if (status === 'pending' || status === 'requires_action' || status === 'draft') return 'bg-amber-500/15 text-amber-700 border-amber-500/30';
    if (status === 'failed') return 'bg-rose-500/15 text-rose-700 border-rose-500/30';
    if (status === 'canceled') return 'bg-slate-500/15 text-slate-700 border-slate-500/30';
    return 'bg-blue-500/15 text-blue-700 border-blue-500/30';
}

function statusLabel(status: string): string {
    if (status === 'paid') return 'Pago';
    if (status === 'pending') return 'Pendente';
    if (status === 'requires_action') return 'Acao necessaria';
    if (status === 'draft') return 'Rascunho';
    if (status === 'failed') return 'Falhou';
    if (status === 'canceled') return 'Cancelado';
    if (status === 'refunded') return 'Reembolsado';
    return status;
}

function paginationBounds(meta: ApiTableMeta): { from: number | null; to: number | null } {
    if (meta.total === 0) {
        return { from: null, to: null };
    }
    const from = (meta.current_page - 1) * meta.per_page + 1;
    const to = Math.min(meta.current_page * meta.per_page, meta.total);
    return { from, to };
}

export default function Dashboard() {
    const [paymentFilters, setPaymentFilters] = useState<DashboardFilterState>({
        period: 'month',
        startDate: '',
        endDate: '',
        search: '',
        page: 1,
        perPage: 10,
    });

    const [waitlistFilters, setWaitlistFilters] = useState<DashboardFilterState>({
        period: 'month',
        startDate: '',
        endDate: '',
        search: '',
        page: 1,
        perPage: 10,
    });

    const paymentsQuery = useQuery({
        queryKey: ['admin-dashboard-payments', paymentFilters],
        queryFn: async () => {
            const response = await http.get<PaymentsResponse>('/api/v1/admin/dashboard/payments', {
                params: buildFilterParams(paymentFilters),
            });
            return response.data;
        },
    });

    const waitlistQuery = useQuery({
        queryKey: ['admin-dashboard-waitlist', waitlistFilters],
        queryFn: async () => {
            const response = await http.get<WaitlistResponse>('/api/v1/admin/dashboard/waitlist', {
                params: buildFilterParams(waitlistFilters),
            });
            return response.data;
        },
    });

    const paymentColumns = useMemo<Column<PaymentRow>[]>(
        () => [
            {
                key: 'user',
                header: 'Usuario',
                cell: (item) => (
                    <div className="flex flex-col">
                        <span className="font-medium">{item.user_name ?? 'Sem usuario'}</span>
                        <span className="text-xs text-muted-foreground">{item.user_email ?? '-'}</span>
                    </div>
                ),
            },
            {
                key: 'status',
                header: 'Status',
                cell: (item) => <Badge className={statusBadgeClass(item.status)}>{statusLabel(item.status)}</Badge>,
            },
            {
                key: 'amount_cents',
                header: 'Valor',
                cell: (item) => <span className="font-medium">{formatCurrency(item.amount_cents)}</span>,
            },
            {
                key: 'wallet_applied_cents',
                header: 'Carteira',
                cell: (item) => formatCurrency(item.wallet_applied_cents),
                hideOnMobile: true,
            },
            {
                key: 'payment_method',
                header: 'Metodo',
                cell: (item) => item.payment_method ?? '-',
                hideOnMobile: true,
            },
            {
                key: 'created_at',
                header: 'Criado em',
                cell: (item) => formatDate(item.created_at),
                hideOnMobile: true,
            },
        ],
        [],
    );

    const waitlistColumns = useMemo<Column<WaitlistRow>[]>(
        () => [
            {
                key: 'stage_name',
                header: 'Nome artistico',
                cell: (item) => <span className="font-medium">{item.stage_name}</span>,
            },
            {
                key: 'contact_email',
                header: 'Contato',
                accessorKey: 'contact_email',
                hideOnMobile: true,
            },
            {
                key: 'city_state',
                header: 'Cidade/UF',
                cell: (item) => item.city_state ?? '-',
                hideOnMobile: true,
            },
            {
                key: 'creation_availability',
                header: 'Disponibilidade',
                accessorKey: 'creation_availability',
            },
            {
                key: 'created_at',
                header: 'Cadastro',
                cell: (item) => formatDate(item.created_at),
            },
        ],
        [],
    );

    const paymentsMeta = paymentsQuery.data?.table.meta;
    const waitlistMeta = waitlistQuery.data?.table.meta;
    const paymentBounds = paymentsMeta ? paginationBounds(paymentsMeta) : { from: null, to: null };
    const waitlistBounds = waitlistMeta ? paginationBounds(waitlistMeta) : { from: null, to: null };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="relative flex flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="pointer-events-none absolute inset-0 opacity-40">
                    <div className="absolute -top-20 left-10 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
                    <div className="absolute right-10 top-30 h-72 w-72 rounded-full bg-orange-300/25 blur-3xl" />
                </div>

                <section className="relative grid gap-4 lg:grid-cols-12">
                    <Card className="relative col-span-12 overflow-hidden border-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 text-zinc-100 lg:col-span-8">
                        <CardContent className="p-6 md:p-8">
                            <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">CRM Admin</p>
                            <h1 className="mt-2 text-2xl font-semibold md:text-4xl">Operacao financeira com leitura rapida e foco no que importa.</h1>
                            <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                    <p className="text-xs text-zinc-400">Receita aprovada</p>
                                    <p className="mt-1 text-xl font-semibold">{formatCurrency(paymentsQuery.data?.summary.paid_revenue_cents ?? 0)}</p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                    <p className="text-xs text-zinc-400">Taxa de conversao</p>
                                    <p className="mt-1 text-xl font-semibold">{paymentsQuery.data?.summary.paid_conversion_rate ?? 0}%</p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                    <p className="text-xs text-zinc-400">Leads no periodo</p>
                                    <p className="mt-1 text-xl font-semibold">{waitlistQuery.data?.summary.total_registrations ?? 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="col-span-12 grid gap-4 lg:col-span-4">
                        <Card className="border-cyan-500/30 bg-cyan-500/5">
                            <CardContent className="flex items-center justify-between p-5">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Ticket medio</p>
                                    <p className="text-2xl font-semibold">{formatCurrency(paymentsQuery.data?.summary.average_ticket_cents ?? 0)}</p>
                                </div>
                                <Wallet className="size-6 text-cyan-600" />
                            </CardContent>
                        </Card>
                        <Card className="border-orange-500/30 bg-orange-500/5">
                            <CardContent className="flex items-center justify-between p-5">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Novos hoje</p>
                                    <p className="text-2xl font-semibold">{waitlistQuery.data?.summary.registrations_today ?? 0}</p>
                                </div>
                                <UserPlus className="size-6 text-orange-600" />
                            </CardContent>
                        </Card>
                    </div>
                </section>

                <section className="relative rounded-3xl border border-sidebar-border/70 bg-background/85 p-4 backdrop-blur md:p-6">
                    <CampaignModerationBoard />
                </section>

                <section className="relative rounded-3xl border border-sidebar-border/70 bg-background/85 p-4 backdrop-blur md:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Financeiro</p>
                            <h2 className="mt-1 text-2xl font-semibold">Pagamentos</h2>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {periodOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setPaymentFilters((current) => ({ ...current, period: option.value, page: 1 }))}
                                    className={`rounded-full px-4 py-1.5 text-sm transition ${paymentFilters.period === option.value
                                        ? 'bg-zinc-900 text-white'
                                        : 'bg-zinc-200/70 text-zinc-700 hover:bg-zinc-300/70'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                            <Input
                                placeholder="Buscar pagamento"
                                value={paymentFilters.search}
                                onChange={(event) => setPaymentFilters((current) => ({ ...current, search: event.target.value, page: 1 }))}
                                className="w-44"
                            />
                            <Button variant="outline" size="sm" onClick={() => paymentsQuery.refetch()} disabled={paymentsQuery.isFetching}>
                                <RefreshCw className={`size-4 ${paymentsQuery.isFetching ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>

                    {paymentFilters.period === 'custom' && (
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            <Input type="date" value={paymentFilters.startDate} onChange={(event) => setPaymentFilters((current) => ({ ...current, startDate: event.target.value, page: 1 }))} />
                            <Input type="date" value={paymentFilters.endDate} onChange={(event) => setPaymentFilters((current) => ({ ...current, endDate: event.target.value, page: 1 }))} />
                        </div>
                    )}

                    <div className="mt-5 grid gap-4 xl:grid-cols-12">
                        <Card className="xl:col-span-8">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="size-4 text-cyan-600" /> Receita diaria</CardTitle>
                                <CardDescription>Linha de faturamento pago no periodo.</CardDescription>
                            </CardHeader>
                            <CardContent className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={paymentsQuery.data?.series ?? []}>
                                        <defs>
                                            <linearGradient id="paymentsGradientModern" x1="0" x2="0" y1="0" y2="1">
                                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.42} />
                                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.03} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="4 4" opacity={0.18} />
                                        <XAxis dataKey="date" />
                                        <Tooltip formatter={(value: number | undefined) => formatCurrency(value ?? 0)} />
                                        <Area type="monotone" dataKey="paid_revenue_cents" stroke="#0891b2" fill="url(#paymentsGradientModern)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="xl:col-span-4">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base"><Activity className="size-4 text-orange-600" /> Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {(paymentsQuery.data?.summary.status_breakdown ?? []).map((item) => (
                                    <div key={item.status} className="flex items-center justify-between rounded-xl border p-3">
                                        <span className="text-sm">{statusLabel(item.status)}</span>
                                        <span className="font-semibold">{item.total}</span>
                                    </div>
                                ))}
                                {(paymentsQuery.data?.summary.status_breakdown ?? []).length === 0 && (
                                    <p className="text-sm text-muted-foreground">Sem dados para status no periodo.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="mt-5">
                        <DataTable<PaymentRow>
                            data={paymentsQuery.data?.table.data ?? []}
                            columns={paymentColumns}
                            keyExtractor={(row) => row.id}
                            isLoading={paymentsQuery.isLoading}
                            isFetching={paymentsQuery.isFetching}
                            emptyMessage="Nenhum pagamento encontrado no periodo."
                        />

                        {paymentsMeta && (
                            <DataTablePagination
                                currentPage={paymentsMeta.current_page}
                                lastPage={paymentsMeta.last_page}
                                perPage={paymentsMeta.per_page}
                                total={paymentsMeta.total}
                                from={paymentBounds.from}
                                to={paymentBounds.to}
                                onPageChange={(page) => setPaymentFilters((current) => ({ ...current, page }))}
                                onPerPageChange={(perPage) => setPaymentFilters((current) => ({ ...current, perPage, page: 1 }))}
                            />
                        )}
                    </div>
                </section>

                <section className="relative rounded-3xl border border-sidebar-border/70 bg-background/85 p-4 backdrop-blur md:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Base</p>
                            <h2 className="mt-1 text-2xl font-semibold">Leads / Waitlist</h2>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {periodOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setWaitlistFilters((current) => ({ ...current, period: option.value, page: 1 }))}
                                    className={`rounded-full px-4 py-1.5 text-sm transition ${waitlistFilters.period === option.value
                                        ? 'bg-zinc-900 text-white'
                                        : 'bg-zinc-200/70 text-zinc-700 hover:bg-zinc-300/70'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                            <Input
                                placeholder="Buscar cadastro"
                                value={waitlistFilters.search}
                                onChange={(event) => setWaitlistFilters((current) => ({ ...current, search: event.target.value, page: 1 }))}
                                className="w-44"
                            />
                            <Button variant="outline" size="sm" onClick={() => waitlistQuery.refetch()} disabled={waitlistQuery.isFetching}>
                                <RefreshCw className={`size-4 ${waitlistQuery.isFetching ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>

                    {waitlistFilters.period === 'custom' && (
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            <Input type="date" value={waitlistFilters.startDate} onChange={(event) => setWaitlistFilters((current) => ({ ...current, startDate: event.target.value, page: 1 }))} />
                            <Input type="date" value={waitlistFilters.endDate} onChange={(event) => setWaitlistFilters((current) => ({ ...current, endDate: event.target.value, page: 1 }))} />
                        </div>
                    )}

                    <div className="mt-5 grid gap-4 xl:grid-cols-12">
                        <Card className="xl:col-span-8">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base"><CreditCard className="size-4 text-emerald-600" /> Cadastros por dia</CardTitle>
                                <CardDescription>Velocidade de entrada da base.</CardDescription>
                            </CardHeader>
                            <CardContent className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={waitlistQuery.data?.series ?? []}>
                                        <CartesianGrid strokeDasharray="4 4" opacity={0.18} />
                                        <XAxis dataKey="date" />
                                        <Tooltip formatter={(value: number | undefined) => `${value ?? 0} cadastros`} />
                                        <Bar dataKey="registrations_count" radius={[8, 8, 0, 0]} fill="#16a34a" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <div className="grid gap-4 xl:col-span-4">
                            <Card className="border-emerald-500/30 bg-emerald-500/5">
                                <CardContent className="p-5">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Total</p>
                                    <p className="mt-1 text-3xl font-semibold">{waitlistQuery.data?.summary.total_registrations ?? 0}</p>
                                </CardContent>
                            </Card>
                            <Card className="border-cyan-500/30 bg-cyan-500/5">
                                <CardContent className="p-5">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Emails unicos</p>
                                    <p className="mt-1 text-3xl font-semibold">{waitlistQuery.data?.summary.unique_emails ?? 0}</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="mt-5">
                        <DataTable<WaitlistRow>
                            data={waitlistQuery.data?.table.data ?? []}
                            columns={waitlistColumns}
                            keyExtractor={(row) => row.id}
                            isLoading={waitlistQuery.isLoading}
                            isFetching={waitlistQuery.isFetching}
                            emptyMessage="Nenhum cadastro encontrado no periodo."
                        />

                        {waitlistMeta && (
                            <DataTablePagination
                                currentPage={waitlistMeta.current_page}
                                lastPage={waitlistMeta.last_page}
                                perPage={waitlistMeta.per_page}
                                total={waitlistMeta.total}
                                from={waitlistBounds.from}
                                to={waitlistBounds.to}
                                onPageChange={(page) => setWaitlistFilters((current) => ({ ...current, page }))}
                                onPerPageChange={(perPage) => setWaitlistFilters((current) => ({ ...current, perPage, page: 1 }))}
                            />
                        )}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
