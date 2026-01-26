import { Button } from '@/components/ui/button'
import AdminLayout from '@/layouts/app-layout'
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
    Zap,
    Wallet,
} from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'
import walletRoutes from '@/routes/app/wallet'

interface Transaction {
    id: string
    type: 'deposit' | 'withdraw'
    amount: number
    amountFloat: number
    confirmed: boolean
    meta: {
        description?: string
        brand?: string
        method?: string
        category?: string
    }
    created_at: string
}

interface WalletData {
    balance: number
    balanceFloat: number
    transactions: Transaction[]
}

interface Props {
    wallet: WalletData
}

// Mock chart data - em produção viria do backend
const chartData = [
    { name: '01/Jan', value: 400 },
    { name: '05/Jan', value: 800 },
    { name: '10/Jan', value: 650 },
    { name: '15/Jan', value: 1100 },
    { name: '20/Jan', value: 1250 },
]

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(amount / 100)
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

export default function WalletPage({ wallet }: Props) {
    const { balance, transactions } = wallet

    return (
        <AdminLayout>
            <Head title="Minha Carteira" />

            <div className="space-y-10 animate-in fade-in duration-700 pb-20">
                {/* Balance Hero Section */}
                <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-12 lg:col-span-7">
                        <div className="bg-[#0A0A0A] rounded-[3.5rem] p-12 text-white relative overflow-hidden group shadow-2xl">
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
                                            {formatCurrency(balance)}
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
                                    <Button
                                        size="none"
                                        className="bg-white/5 border border-white/10 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] flex items-center gap-3 hover:bg-white/10 transition-all"
                                    >
                                        <ArrowUpRight size={18} /> Solicitar Saque
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-5">
                        <div className="bg-white rounded-[3.5rem] p-10 shadow-sm border border-zinc-100 flex flex-col h-full relative overflow-hidden group">
                            <div className="space-y-1 mb-8">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                                    Rendimento Mensal
                                </p>
                                <h4 className="text-3xl font-bold tracking-tight text-[#0A0A0A]">+ 12.5%</h4>
                            </div>

                            <div className="flex-1 min-h-[150px]">
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
                                            itemStyle={{ fontWeight: 'bold', color: '#0A0A0A' }}
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
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transaction Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <div className="space-y-1">
                            <h3 className="text-3xl font-bold tracking-tighter text-[#0A0A0A]">Extrato Detalhado</h3>
                            <p className="text-sm font-medium text-zinc-400">
                                Histórico de rendimentos e movimentações da sua conta UGC.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative group hidden sm:block">
                                <Search
                                    size={16}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors"
                                />
                                <input
                                    type="text"
                                    placeholder="Buscar transação..."
                                    className="bg-white border border-zinc-100 rounded-xl py-3 pl-10 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/10 transition-all w-48 focus:w-64"
                                />
                            </div>
                            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-zinc-100 rounded-xl text-xs font-bold text-zinc-500 hover:bg-[#0A0A0A] hover:text-white transition-all shadow-sm">
                                <Download size={16} /> Exportar
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-[3.5rem] border border-zinc-100 shadow-sm overflow-hidden divide-y divide-zinc-50">
                        {transactions.length === 0 ? (
                            <div className="p-20 text-center">
                                <div className="max-w-md mx-auto space-y-4">
                                    <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto">
                                        <Clock size={32} className="text-zinc-300" />
                                    </div>
                                    <h4 className="text-xl font-bold text-zinc-400">Nenhuma transação ainda</h4>
                                    <p className="text-sm text-zinc-400">
                                        Suas transações aparecerão aqui quando você receber pagamentos ou fazer saques.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            transactions.map((tx) => (
                                <TransactionItem key={tx.id} transaction={tx} />
                            ))
                        )}
                    </div>

                    {transactions.length > 0 && (
                        <div className="flex justify-center">
                            <Button variant={"none"} size="none" className="group flex items-center gap-3 px-7 py-5 bg-white border border-zinc-100 rounded-3xl text-[0.7em] font-black uppercase tracking-[0.4em] text-zinc-400 hover:text-[#0A0A0A] hover:border-zinc-200 transition-all shadow-sm">
                                Carregar mais atividades{' '}
                                <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}

function TransactionItem({ transaction: tx }: { transaction: Transaction }) {
    const isIncome = tx.type === 'deposit'
    const category = tx.meta?.category || (isIncome ? 'Recebimento' : 'Saque')
    const description = tx.meta?.description || (isIncome ? 'Depósito' : 'Saque')
    const brand = tx.meta?.brand || 'Carteira'
    const method = tx.meta?.method || 'Transferência pix'

    return (
        <div className="group hover:bg-[#FAF9F6] transition-all duration-300">
            <div className="p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                {/* Left Side: Icon & Meta */}
                <div className="flex items-center gap-8">
                    <div
                        className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 relative ${isIncome
                                ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white group-hover:rotate-6'
                                : 'bg-zinc-50 text-zinc-400 group-hover:bg-[#0A0A0A] group-hover:text-white group-hover:-rotate-6'
                            }`}
                    >
                        {isIncome ? <ArrowDownLeft size={28} /> : <ArrowUpRight size={28} />}
                        {tx.confirmed ? (
                            <div className="absolute -right-1 -bottom-1 bg-white rounded-full p-0.5 shadow-sm">
                                <CheckCircle2 size={16} className="text-emerald-500" />
                            </div>
                        ) : (
                            <div className="absolute -right-1 -bottom-1 bg-white rounded-full p-0.5 shadow-sm">
                                <AlertCircle size={16} className="text-primary" />
                            </div>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                            <span
                                className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${isIncome ? 'bg-orange-50 text-primary' : 'bg-zinc-100 text-zinc-500'
                                    }`}
                            >
                                {category}
                            </span>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Clock size={12} /> {formatDate(tx.created_at)}
                            </p>
                        </div>
                        <h5 className="text-xl font-bold text-[#0A0A0A] tracking-tight group-hover:text-primary transition-colors leading-none">
                            {description}
                        </h5>
                        <div className="flex items-center gap-4 text-xs font-medium text-zinc-400">
                            <span className="flex items-center gap-1.5">
                                <Wallet size={12} /> {brand}
                            </span>
                            <span className="w-1 h-1 bg-zinc-200 rounded-full"></span>
                            <span className="flex items-center gap-1.5">
                                <Zap size={12} /> {method}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Value & Action */}
                <div className="flex items-center justify-between sm:justify-end gap-12">
                    <div className="text-right space-y-1">
                        <p
                            className={`text-3xl font-black tracking-tighter ${isIncome ? 'text-emerald-600' : 'text-[#0A0A0A]'
                                }`}
                        >
                            {isIncome ? '+ ' : '- '}
                            {formatCurrency(Math.abs(tx.amount))}
                        </p>
                        <p
                            className={`text-[10px] font-black uppercase tracking-[0.2em] ${tx.confirmed ? 'text-zinc-300' : 'text-primary italic'
                                }`}
                        >
                            {tx.confirmed ? 'Processado' : 'Aguardando'}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button className="p-3 text-black hover:text-[#0A0A0A] transition-colors rounded-xl hover:bg-white shadow-none hover:shadow-sm">
                            <ChevronRight
                                size={20}
                                className="text-zinc-200 group-hover:text-[#0A0A0A] group-hover:translate-x-1 transition-all"
                            />
                        </Button>

                    </div>
                </div>
            </div>
        </div>
    )
}
