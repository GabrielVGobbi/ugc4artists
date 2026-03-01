import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AppLayout from '@/layouts/app-layout'
import { Head, router } from '@inertiajs/react'
import {
    TrendingUp,
    ArrowUpRight,
    ArrowDownLeft,
    Clock,
    Download,
    ChevronRight,
    Plus,
    Search,
    CheckCircle2,
    AlertCircle,
    Loader2,
    X,
    Receipt,
    FileText,
    Wallet2,
    CreditCard,
} from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'
import walletRoutes from '@/routes/app/wallet'
import { formatCurrency } from '@/lib/utils'
import payments from '@/routes/app/payments'
import { usePayments, Payment, useAccountStatement, AccountStatement } from '@/hooks'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ExpandableTruncateControlled } from '@/components/ui/data-table/expanded-cell'

interface WalletData {
    balance: number
    balanceFloat: number
    balanceFloatFormat: string
}

interface ChartDataPoint {
    name: string
    value: number
    month: string
    deposits: number
}

interface ChartData {
    data: ChartDataPoint[]
    growth: number
}

interface Props {
    wallet: WalletData
    chart: ChartData
}

function formatDate(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
        return `Hoje, ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    }
    if (diffDays === 1) {
        return `Ontem, ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    }
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay)
        return () => clearTimeout(timer)
    }, [value, delay])

    return debouncedValue
}

export default function WalletPage({ wallet, chart }: Props) {
    const { balanceFloatFormat } = wallet
    const chartData = chart.data
    const growth = chart.growth
    const [activeTab, setActiveTab] = useState('statements')

    return (
        <AppLayout>
            <Head title="Minha Carteira" />

            <div className="space-y-10 animate-in fade-in duration-700 pb-20">
                {/* Balance Hero Section */}
                <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-12 lg:col-span-7">
                        <div className="bg-secondary rounded-[3.5rem] p-12 text-white relative overflow-hidden group shadow-2xl">
                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>

                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">
                                                Saldo Disponível
                                            </p>
                                        </div>
                                        <h3 className="text-7xl font-bold tracking-tighter">
                                            {balanceFloatFormat}
                                        </h3>
                                    </div>
                                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                                        <TrendingUp className="text-emerald-500" size={32} />
                                    </div>
                                </div>

                                <div className="mt-16 flex items-center gap-6">
                                    <Button
                                        size="none"
                                        onClick={() => router.visit(walletRoutes.create.url())}
                                        className="bg-primary text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] flex items-center gap-3 hover:bg-[#E64500] transition-all shadow-xl shadow-primary/20"
                                    >
                                        <Plus size={18} /> Adicionar Saldo
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-5">
                        <div className="bg-white rounded-[3.5rem] p-10 shadow-sm border border-zinc-100 flex flex-col h-full relative overflow-hidden group">
                            <div className="space-y-1 mb-8">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                                    Evolução do Saldo nos últimos 4 meses
                                </p>
                                <h4 className={`text-3xl font-bold tracking-tight ${growth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {growth >= 0 ? '+' : ''}{growth}%
                                </h4>
                            </div>

                            <div className="flex-1 min-h-[150px]">
                                {chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#FF4D00" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#FF4D00" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Tooltip
                                                contentStyle={{
                                                    borderRadius: '16px',
                                                    border: 'none',
                                                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                                                }}
                                                formatter={(value) => [formatCurrency((value as number) * 100), 'Saldo']}
                                                labelFormatter={(label) => String(label)}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="value"
                                                stroke="#FF4D00"
                                                strokeWidth={4}
                                                fillOpacity={1}
                                                fill="url(#colorValue)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-zinc-400 text-sm">
                                        Sem dados suficientes
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <TabsList className="bg-white border border-zinc-100 p-1.5 h-auto rounded-2xl">
                            <TabsTrigger
                                value="statements"
                                className="data-[state=active]:bg-secondary data-[state=active]:text-white rounded-xl px-6 py-3 text-xs font-black uppercase tracking-wider"
                            >
                                <FileText size={16} className="mr-2" />
                                Extrato Completo
                            </TabsTrigger>
                            <TabsTrigger
                                value="payments"
                                className="data-[state=active]:bg-secondary data-[state=active]:text-white rounded-xl px-6 py-3 text-xs font-black uppercase tracking-wider"
                            >
                                <Receipt size={16} className="mr-2" />
                                Pagamentos
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Extrato Completo Tab */}
                    <TabsContent value="statements" className="mt-0">
                        <StatementsTab />
                    </TabsContent>

                    {/* Pagamentos Tab */}
                    <TabsContent value="payments" className="mt-0">
                        <PaymentsTab />
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    )
}

// Statements Tab Component
function StatementsTab() {
    const [searchInput, setSearchInput] = useState('')
    const debouncedSearch = useDebounce(searchInput, 400)
    const initialFetchDone = useRef(false)

    const {
        statements,
        isLoading,
        isFetchingMore,
        hasMore,
        fetchStatements,
        loadMore,
        setSearch,
        meta,
        summary,
        search,
    } = useAccountStatement(20)

    // Initial fetch
    useEffect(() => {
        if (!initialFetchDone.current) {
            initialFetchDone.current = true
            fetchStatements(1, {})
        }
    }, [fetchStatements])

    // Search effect
    useEffect(() => {
        if (initialFetchDone.current) {
            setSearch(debouncedSearch)
            fetchStatements(1, { search: debouncedSearch })
        }
    }, [debouncedSearch, fetchStatements, setSearch])

    const handleClearSearch = useCallback(() => {
        setSearchInput('')
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-4">
                <div className="space-y-1">
                    <h3 className="text-3xl font-bold tracking-tighter text-secondary">Extrato </h3>
                    <p className="text-sm font-medium text-zinc-400">
                        Todas as movimentações da sua conta (depósitos, pagamentos, reembolsos).
                        {meta && (
                            <span className="ml-2 text-zinc-300">
                                ({meta.total} {meta.total === 1 ? 'movimento' : 'movimentos'})
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Search Input */}
                    <div className="relative group hidden sm:block">
                        <Search
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors"
                        />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Buscar movimento..."
                            className="bg-white border border-zinc-100 rounded-xl py-3 pl-10 pr-10 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/10 transition-all w-48 focus:w-64"
                        />
                        {searchInput && (
                            <button
                                onClick={handleClearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-4">
                    <div className="bg-white rounded-2xl p-6 border border-zinc-100">
                        <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2">Entradas</p>
                        <p className="text-2xl font-bold text-emerald-600">{formatCurrency(summary.total_in )}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-zinc-100">
                        <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2">Saídas</p>
                        <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.total_out )}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-zinc-100">
                        <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2">Saldo Período</p>
                        <p className={`text-2xl font-bold ${summary.period_balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formatCurrency(summary.period_balance )}
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-zinc-100">
                        <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2">Saldo Atual</p>
                        <p className="text-2xl font-bold text-secondary">{formatCurrency(summary.current_balance )}</p>
                    </div>
                </div>
            )}

            {/* Search indicator */}
            {search && (
                <div className="px-4 flex items-center gap-2">
                    <span className="text-xs text-zinc-400">
                        Buscando por: <span className="font-bold text-zinc-600">"{search}"</span>
                    </span>
                    <button
                        onClick={handleClearSearch}
                        className="text-xs text-primary hover:underline"
                    >
                        Limpar busca
                    </button>
                </div>
            )}

            <div className="bg-white rounded-[1.5rem] border border-zinc-100 shadow-sm overflow-hidden">
                {/* Table Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-10 py-4 bg-zinc-50/50 border-b border-zinc-100 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                   {/* <div className="col-span-5">Descrição</div>*/}
                    <div className="col-span-5">Categoria</div>
                    <div className="col-span-2">Método</div>
                    <div className="col-span-2 text-right">Valor</div>
                    <div className="col-span-1"></div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="p-20 text-center">
                        <Loader2 size={32} className="animate-spin text-zinc-300 mx-auto" />
                        <p className="text-sm text-zinc-400 mt-4">Carregando extrato...</p>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && statements.length === 0 && (
                    <div className="p-20 text-center">
                        <div className="max-w-md mx-auto space-y-4">
                            <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto">
                                {search ? <Search size={32} className="text-zinc-300" /> : <Clock size={32} className="text-zinc-300" />}
                            </div>
                            <h4 className="text-xl font-bold text-zinc-400">
                                {search ? 'Nenhum resultado encontrado' : 'Nenhuma movimentação ainda'}
                            </h4>
                            <p className="text-sm text-zinc-400">
                                {search
                                    ? `Não encontramos movimentações para "${search}". Tente outro termo.`
                                    : 'Suas movimentações aparecerão aqui quando você adicionar saldo ou realizar pagamentos.'
                                }
                            </p>
                        </div>
                    </div>
                )}

                {/* Statements List */}
                {!isLoading && statements.length > 0 && (
                    <div className="divide-y divide-zinc-50">
                        {statements.map((statement) => (
                            <StatementRow key={statement.uuid} statement={statement} />
                        ))}
                    </div>
                )}
            </div>

            {/* Load More */}
            {hasMore && (
                <div className="flex justify-center">
                    <Button
                        variant="none"
                        size="none"
                        onClick={loadMore}
                        disabled={isFetchingMore}
                        className="group flex items-center gap-3 px-7 py-5 bg-white border border-zinc-100 rounded-3xl text-[0.7em] font-black uppercase tracking-[0.4em] text-zinc-400 hover:text-secondary hover:border-zinc-200 transition-all shadow-sm disabled:opacity-50"
                    >
                        {isFetchingMore ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Carregando...
                            </>
                        ) : (
                            <>
                                Carregar mais
                                <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    )
}

// Payments Tab Component (original content)
function PaymentsTab() {
    const [searchInput, setSearchInput] = useState('')
    const debouncedSearch = useDebounce(searchInput, 400)
    const initialFetchDone = useRef(false)

    const {
        payments: paymentsList,
        isLoading,
        isFetchingMore,
        hasMore,
        fetchPayments,
        loadMore,
        setSearch,
        exportUrl,
        meta,
        search,
    } = usePayments(10)

    // Initial fetch
    useEffect(() => {
        if (!initialFetchDone.current) {
            initialFetchDone.current = true
            fetchPayments(1, '')
        }
    }, [fetchPayments])

    // Search effect
    useEffect(() => {
        if (initialFetchDone.current) {
            setSearch(debouncedSearch)
            fetchPayments(1, debouncedSearch)
        }
    }, [debouncedSearch, fetchPayments, setSearch])

    const handleClearSearch = useCallback(() => {
        setSearchInput('')
    }, [])

    const handleExport = useCallback(() => {
        window.open(exportUrl, '_blank')
    }, [exportUrl])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-4">
                <div className="space-y-1">
                    <h3 className="text-3xl font-bold tracking-tighter text-secondary">Extrato de Pagamentos</h3>
                    <p className="text-sm font-medium text-zinc-400">
                        Histórico de pagamentos e movimentações da sua conta.
                        {meta && (
                            <span className="ml-2 text-zinc-300">
                                ({meta.total} {meta.total === 1 ? 'pagamento' : 'pagamentos'})
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Search Input */}
                    <div className="relative group hidden sm:block">
                        <Search
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors"
                        />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Buscar pagamento..."
                            className="bg-white border border-zinc-100 rounded-xl py-3 pl-10 pr-10 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/10 transition-all w-48 focus:w-64"
                        />
                        {searchInput && (
                            <button
                                onClick={handleClearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={handleExport}
                        disabled={!meta || meta.total === 0}
                        className="cursor-pointer flex items-center gap-2 px-6 py-3 bg-white border border-zinc-100 rounded-xl text-xs font-bold text-zinc-500 hover:bg-secondary hover:text-white transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download size={16} /> Exportar
                    </button>
                </div>
            </div>

            {/* Search indicator */}
            {search && (
                <div className="px-4 flex items-center gap-2">
                    <span className="text-xs text-zinc-400">
                        Buscando por: <span className="font-bold text-zinc-600">"{search}"</span>
                    </span>
                    <button
                        onClick={handleClearSearch}
                        className="text-xs text-primary hover:underline"
                    >
                        Limpar busca
                    </button>
                </div>
            )}

            <div className="bg-white rounded-[1.5rem] border border-zinc-100 shadow-sm overflow-hidden">
                {/* Table Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-10 py-4 bg-zinc-50/50 border-b border-zinc-100 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                    <div className="col-span-5">Descrição</div>
                    <div className="col-span-2">Método</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2 text-right">Valor</div>
                    <div className="col-span-1"></div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="p-20 text-center">
                        <Loader2 size={32} className="animate-spin text-zinc-300 mx-auto" />
                        <p className="text-sm text-zinc-400 mt-4">Carregando pagamentos...</p>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && paymentsList.length === 0 && (
                    <div className="p-20 text-center">
                        <div className="max-w-md mx-auto space-y-4">
                            <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto">
                                {search ? <Search size={32} className="text-zinc-300" /> : <Clock size={32} className="text-zinc-300" />}
                            </div>
                            <h4 className="text-xl font-bold text-zinc-400">
                                {search ? 'Nenhum resultado encontrado' : 'Nenhum pagamento ainda'}
                            </h4>
                            <p className="text-sm text-zinc-400">
                                {search
                                    ? `Não encontramos pagamentos para "${search}". Tente outro termo.`
                                    : 'Seus pagamentos aparecerão aqui quando você adicionar saldo ou receber pagamentos.'
                                }
                            </p>
                            {search && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClearSearch}
                                >
                                    Limpar busca
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* Payments List */}
                {!isLoading && paymentsList.length > 0 && (
                    <div className="divide-y divide-zinc-50">
                        {paymentsList.map((payment) => (
                            <PaymentRow key={payment.id} payment={payment} />
                        ))}
                    </div>
                )}
            </div>

            {/* Load More */}
            {hasMore && (
                <div className="flex justify-center">
                    <Button
                        variant="none"
                        size="none"
                        onClick={loadMore}
                        disabled={isFetchingMore}
                        className="group flex items-center gap-3 px-7 py-5 bg-white border border-zinc-100 rounded-3xl text-[0.7em] font-black uppercase tracking-[0.4em] text-zinc-400 hover:text-secondary hover:border-zinc-200 transition-all shadow-sm disabled:opacity-50"
                    >
                        {isFetchingMore ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Carregando...
                            </>
                        ) : (
                            <>
                                Carregar mais
                                <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    )
}

// Statement Row Component
function StatementRow({ statement }: { statement: AccountStatement }) {
    const [isExpanded, setIsExpanded] = useState(false)
    const isIncome = statement.is_income
    const statusColors: Record<string, string> = {
        success: 'bg-emerald-50 text-emerald-600',
        warning: 'bg-amber-50 text-amber-600',
        danger: 'bg-red-50 text-red-600',
        info: 'bg-blue-50 text-blue-600',
        secondary: 'bg-zinc-100 text-zinc-500',
    }

    const getIcon = () => {
        switch (statement.type) {
            case 'deposit':
                return <ArrowDownLeft size={20} />
            case 'service_payment':
                return <CreditCard size={20} />
            case 'refund':
                return <ArrowDownLeft size={20} />
            case 'withdrawal':
                return <ArrowUpRight size={20} />
            default:
                return <Wallet2 size={20} />
        }
    }

    const description = statement.description || statement.type_label
    const shouldTruncate = false

    return (
        <div className="group hover:bg-[#FAF9F6] transition-all duration-300">
            {/* Desktop View */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-10 py-6 items-center">
                {/* Description
                <div className="col-span-5 flex items-center gap-4">
                    <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${isIncome
                                ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white'
                                : 'bg-zinc-50 text-zinc-400 group-hover:bg-zinc-800 group-hover:text-white'
                            }`}
                    >
                        {getIcon()}
                    </div>

                    {shouldTruncate ? (
                        <ExpandableTruncateControlled
                            isOpen={isExpanded}
                            onOpen={() => setIsExpanded(true)}
                            onClose={() => setIsExpanded(false)}
                            maxWidth={100}
                            expandedContent={
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-50 text-zinc-400'
                                            }`}
                                        >
                                            {getIcon()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-secondary text-sm">{statement.type_label}</p>
                                            <p className="text-xs text-zinc-400">{statement.category_label}</p>
                                        </div>
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-medium text-zinc-700">{description}</p>
                                        {statement.breakdown && (
                                            <div className="mt-2 space-y-1 text-xs text-zinc-500">
                                                {statement.wallet_amount !== 0 && (
                                                    <p>Carteira: {formatCurrency(Math.abs(statement.wallet_amount) * 100)}</p>
                                                )}
                                                {statement.gateway_amount !== 0 && (
                                                    <p>Gateway: {formatCurrency(Math.abs(statement.gateway_amount) * 100)}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                                        <Clock size={12} />
                                        {formatDate(statement.created_at)}
                                    </p>
                                </div>
                            }
                        >
                            <div className="min-w-0 flex-1">
                                <p className="font-bold text-secondary truncate">
                                    {description}
                                </p>
                                <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                                    <Clock size={12} />
                                    {formatDate(statement.created_at)}
                                </p>
                            </div>
                        </ExpandableTruncateControlled>
                    ) : (
                        <div className="min-w-0 flex-1">
                            <p className="font-bold text-secondary">
                                {description}
                            </p>
                            <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                                <Clock size={12} />
                                {formatDate(statement.created_at)}
                            </p>
                        </div>
                    )}
                </div>
*/}
                {/* Category */}
                <div className="col-span-5">
                    <span className="text-sm font-medium text-zinc-600">
                        {statement.category_label}
                    </span>
                </div>

                {/* Method */}
                <div className="col-span-2">
                    {statement.payment_method ? (
                        <span className="text-sm font-medium text-zinc-600 capitalize">
                            {statement.payment_method === 'mixed' ? 'Misto' : statement.payment_method}
                        </span>
                    ) : (
                        <span className="text-sm text-zinc-400">-</span>
                    )}
                </div>

                {/* Amount */}
                <div className="col-span-2 text-right">
                    <p className={`text-lg font-black tracking-tight ${statement.status === 'completed'
                            ? isIncome ? 'text-emerald-600' : 'text-red-600'
                            : 'text-amber-600'
                        }`}>
                        {statement.formatted_amount}
                    </p>
                </div>

                {/* Action */}
                <div className="col-span-1 flex justify-end">
                    {statement.service && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-zinc-300 hover:text-secondary hover:bg-white"
                        >
                            <ChevronRight size={18} />
                        </Button>
                    )}
                </div>
            </div>

            {/* Mobile View */}
            <div className="md:hidden px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${isIncome
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : 'bg-zinc-50 text-zinc-400'
                                }`}
                        >
                            {getIcon()}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-sm text-secondary truncate">
                                {statement.description || statement.type_label}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${statusColors[statement.status_color] || statusColors.secondary}`}>
                                    {statement.status_label}
                                </span>
                                <span className="text-[10px] text-zinc-400">
                                    {formatDate(statement.created_at)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right shrink-0">
                        <p className={`text-base font-black ${isIncome ? 'text-emerald-600' : 'text-red-600'
                            }`}>
                            {statement.formatted_amount}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Payment Row Component (original)
function PaymentRow({ payment }: { payment: Payment }) {
    const isDeposit = payment.amount_cents > 0
    const statusColors: Record<string, string> = {
        green: 'bg-emerald-50 text-emerald-600',
        yellow: 'bg-amber-50 text-amber-600',
        orange: 'bg-orange-50 text-orange-600',
        red: 'bg-red-50 text-red-600',
        blue: 'bg-blue-50 text-blue-600',
        gray: 'bg-zinc-100 text-zinc-500',
    }

    return (
        <div className="group hover:bg-[#FAF9F6] transition-all duration-300">
            {/* Desktop View */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-10 py-6 items-center">
                {/* Description */}
                <div className="col-span-5 flex items-center gap-4">
                    <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${isDeposit
                                ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white'
                                : 'bg-zinc-50 text-zinc-400 group-hover:bg-zinc-800 group-hover:text-white'
                            }`}
                    >
                        {isDeposit ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-secondary truncate">
                            {payment.meta?.description || (isDeposit ? 'Depósito' : 'Saque')}
                        </p>
                        <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                            <Clock size={12} />
                            {formatDate(payment.created_at)}
                        </p>
                    </div>
                </div>

                {/* Method */}
                <div className="col-span-2">
                    {payment.payment_method ? (
                        <span className="text-sm font-medium text-zinc-600">
                            {payment.payment_method.label}
                        </span>
                    ) : (
                        <span className="text-sm text-zinc-400">-</span>
                    )}
                </div>

                {/* Status */}
                <div className="col-span-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[payment.status.color] || statusColors.gray}`}>
                        {payment.status.is_final ? (
                            <CheckCircle2 size={12} />
                        ) : (
                            <AlertCircle size={12} />
                        )}
                        {payment.status.label}
                    </span>
                </div>

                {/* Amount */}
                <div className="col-span-2 text-right">
                    <p className={`text-lg font-black tracking-tight ${payment.status.value === 'paid'
                            ? 'text-emerald-600'
                            : payment.status.is_pending
                                ? 'text-amber-600'
                                : 'text-zinc-400'
                        }`}>
                        {isDeposit ? '+ ' : '- '}
                        {payment.amount_cents_format}
                    </p>
                </div>

                {/* Action */}
                <div className="col-span-1 flex justify-end">
                    <Button
                        onClick={() => router.visit(payments.show(payment.uuid))}
                        variant="ghost"
                        size="icon"
                        className="text-zinc-300 hover:text-secondary hover:bg-white"
                    >
                        <ChevronRight size={18} />
                    </Button>
                </div>
            </div>

            {/* Mobile View */}
            <div className="md:hidden px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDeposit
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : 'bg-zinc-50 text-zinc-400'
                                }`}
                        >
                            {isDeposit ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-sm text-secondary truncate">
                                {payment.meta?.description || (isDeposit ? 'Depósito' : 'Saque')}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${statusColors[payment.status.color] || statusColors.gray}`}>
                                    {payment.status.label}
                                </span>
                                <span className="text-[10px] text-zinc-400">
                                    {formatDate(payment.created_at)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right shrink-0">
                        <p className={`text-base font-black ${payment.status.value === 'paid' ? 'text-emerald-600' : 'text-zinc-600'
                            }`}>
                            {isDeposit ? '+' : '-'} {formatCurrency(Math.abs(payment.amount_cents))}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
