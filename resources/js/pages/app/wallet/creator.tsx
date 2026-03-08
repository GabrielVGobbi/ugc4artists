import { useState } from 'react'
import AppLayout from '@/layouts/app-layout'
import { Head, Link } from '@inertiajs/react'
import { motion, AnimatePresence } from 'motion/react'
import { useForm } from '@inertiajs/react'
import {
    Wallet2,
    ArrowDownLeft,
    ArrowUpRight,
    Clock,
    CheckCircle2,
    DollarSign,
    Send,
    TrendingUp,
    AlertCircle,
    Loader2,
    Search,
    ChevronRight,
    Receipt,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'
import { apiPost } from '@/lib/api'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface WalletData {
    balance: number
    balanceFloat: number
    balanceFloatFormat: string
    transactions: {
        id: string
        type: 'deposit' | 'withdraw'
        amount: number
        amountFloat: number
        amount_float_formatted: string
        confirmed: boolean
        meta: Record<string, unknown>
        created_at: string
    }[]
    pending_payments: {
        uuid: string
        amount_cents: number
        payment_method: string
        created_at: string
    }[]
}

interface WithdrawalEntry {
    id: string
    amount: number
    amountFormatted: string
    confirmed: boolean
    status: 'completed' | 'pending'
    statusLabel: string
    pixKey: string | null
    pixKeyType: string | null
    description: string
    createdAt: string | null
}

interface EarningEntry {
    id: string
    amount: number
    amountFormatted: string
    description: string
    type: string
    createdAt: string | null
}

interface CreatorWalletProps {
    wallet: WalletData
    withdrawals: WithdrawalEntry[]
    earnings: EarningEntry[]
}

type TabId = 'withdraw' | 'earnings' | 'history'

const PIX_KEY_TYPES = [
    { value: 'cpf',     label: 'CPF' },
    { value: 'cnpj',    label: 'CNPJ' },
    { value: 'email',   label: 'E-mail' },
    { value: 'phone',   label: 'Telefone' },
    { value: 'random',  label: 'Chave Aleatória' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Withdrawal Form
// ─────────────────────────────────────────────────────────────────────────────

function WithdrawalForm({
    balance,
    onSuccess,
}: {
    balance: number
    onSuccess: () => void
}) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { data, setData, reset, errors, setError, clearErrors } = useForm({
        amount: '',
        pix_key: '',
        pix_key_type: 'cpf',
        description: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        clearErrors()

        const amount = parseFloat(data.amount.replace(',', '.'))
        if (!amount || amount < 10) {
            setError('amount', 'Valor mínimo de saque é R$ 10,00.')
            return
        }
        if (amount > balance) {
            setError('amount', 'Saldo insuficiente.')
            return
        }
        if (!data.pix_key.trim()) {
            setError('pix_key', 'Informe a chave PIX.')
            return
        }

        setIsSubmitting(true)
        try {
            await apiPost('/app/wallet/withdrawal', {
                amount,
                pix_key: data.pix_key,
                pix_key_type: data.pix_key_type,
                description: data.description || undefined,
            })
            toast.success('Saque solicitado! Você receberá em até 1 dia útil.')
            reset()
            onSuccess()
        } catch (err: unknown) {
            const apiErr = err as { errors?: Record<string, string[]>; message?: string }
            if (apiErr?.errors) {
                Object.entries(apiErr.errors).forEach(([field, msgs]) => {
                    setError(field as keyof typeof data, msgs[0] ?? 'Erro')
                })
            } else {
                toast.error(apiErr?.message ?? 'Erro ao solicitar saque.')
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const setMaxAmount = () => {
        setData('amount', balance.toFixed(2).replace('.', ','))
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Amount */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-zinc-600 uppercase tracking-wide">
                        Valor do Saque
                    </label>
                    <button
                        type="button"
                        onClick={setMaxAmount}
                        className="text-xs font-bold text-primary hover:underline"
                    >
                        Máximo: R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </button>
                </div>
                <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-sm pointer-events-none">R$</span>
                    <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="0,00"
                        value={data.amount}
                        onChange={e => setData('amount', e.target.value)}
                        className="pl-10 rounded-xl text-lg font-bold"
                    />
                </div>
                {errors.amount && (
                    <p className="text-xs text-red-500 mt-1">{errors.amount}</p>
                )}
            </div>

            {/* PIX key type */}
            <div>
                <label className="text-xs font-bold text-zinc-600 uppercase tracking-wide mb-2 block">
                    Tipo de Chave PIX
                </label>
                <Select value={data.pix_key_type} onValueChange={v => setData('pix_key_type', v)}>
                    <SelectTrigger className="rounded-xl h-11">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {PIX_KEY_TYPES.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* PIX key */}
            <div>
                <label className="text-xs font-bold text-zinc-600 uppercase tracking-wide mb-2 block">
                    Chave PIX
                </label>
                <Input
                    type="text"
                    placeholder={
                        data.pix_key_type === 'cpf'    ? '000.000.000-00' :
                        data.pix_key_type === 'cnpj'   ? '00.000.000/0000-00' :
                        data.pix_key_type === 'email'  ? 'seu@email.com' :
                        data.pix_key_type === 'phone'  ? '+55 (00) 00000-0000' :
                        'Chave aleatória'
                    }
                    value={data.pix_key}
                    onChange={e => setData('pix_key', e.target.value)}
                    className="rounded-xl"
                />
                {errors.pix_key && (
                    <p className="text-xs text-red-500 mt-1">{errors.pix_key}</p>
                )}
            </div>

            {/* Note */}
            <div>
                <label className="text-xs font-bold text-zinc-600 uppercase tracking-wide mb-2 block">
                    Observação (opcional)
                </label>
                <Input
                    type="text"
                    placeholder="Ex: Pagamento referente à campanha X"
                    value={data.description}
                    onChange={e => setData('description', e.target.value)}
                    className="rounded-xl"
                />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                    O processamento leva até <strong>1 dia útil</strong>. Certifique-se de que a chave PIX está correta antes de confirmar.
                </p>
            </div>

            <Button
                type="submit"
                disabled={isSubmitting || !data.amount || !data.pix_key}
                className="w-full rounded-xl font-bold gap-2 h-12"
            >
                {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                ) : (
                    <Send size={16} />
                )}
                {isSubmitting ? 'Processando...' : 'Solicitar Saque'}
            </Button>
        </form>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// History Row
// ─────────────────────────────────────────────────────────────────────────────

function WithdrawalRow({ entry }: { entry: WithdrawalEntry }) {
    return (
        <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-zinc-50 transition-colors">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                entry.confirmed ? 'bg-emerald-50' : 'bg-amber-50'
            }`}>
                {entry.confirmed ? (
                    <CheckCircle2 size={18} className="text-emerald-600" />
                ) : (
                    <Clock size={18} className="text-amber-600" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{entry.description}</p>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        entry.confirmed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                        {entry.statusLabel}
                    </span>
                    {entry.pixKeyType && (
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wide">
                            PIX {entry.pixKeyType}
                        </span>
                    )}
                    <span className="text-[10px] text-zinc-400">{entry.createdAt}</span>
                </div>
            </div>
            <span className="text-sm font-bold text-red-500 flex-shrink-0">
                - {entry.amountFormatted}
            </span>
        </div>
    )
}

function EarningRow({ entry }: { entry: EarningEntry }) {
    return (
        <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-zinc-50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <DollarSign size={18} className="text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{entry.description}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">{entry.createdAt}</p>
            </div>
            <span className="text-sm font-bold text-emerald-600 flex-shrink-0">
                + {entry.amountFormatted}
            </span>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function CreatorWallet({ wallet, withdrawals, earnings }: CreatorWalletProps) {
    const [activeTab, setActiveTab] = useState<TabId>('earnings')
    const [historySearch, setHistorySearch] = useState('')
    const [reloadKey, setReloadKey] = useState(0)

    const handleWithdrawalSuccess = () => {
        setActiveTab('history')
        setReloadKey(k => k + 1)
    }

    const filteredWithdrawals = withdrawals.filter(w =>
        !historySearch || w.description.toLowerCase().includes(historySearch.toLowerCase())
    )
    const filteredEarnings = earnings.filter(e =>
        !historySearch || e.description.toLowerCase().includes(historySearch.toLowerCase())
    )

    const totalWithdrawn = withdrawals
        .filter(w => w.confirmed)
        .reduce((sum, w) => sum + w.amount, 0)

    const totalEarned = earnings.reduce((sum, e) => sum + e.amount, 0)

    const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
        { id: 'earnings', label: 'Ganhos',          icon: TrendingUp },
        { id: 'history',  label: 'Saques',          icon: ArrowDownLeft },
        { id: 'withdraw', label: 'Solicitar Saque', icon: Send },
    ]

    return (
        <AppLayout>
            <Head title="Carteira" />

            <div className="space-y-6 pb-12">

                {/* ── Balance Hero ─────────────────────────────────────────── */}
                <div className="bg-foreground text-white rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl">
                    <div className="relative z-10 flex items-start justify-between">
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">
                                Saldo Disponível
                            </h4>
                            <motion.p
                                key={wallet.balanceFloat}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-6xl font-bold tracking-tighter"
                            >
                                {wallet.balanceFloatFormat}
                            </motion.p>
                        </div>
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                            <Wallet2 size={26} />
                        </div>
                    </div>

                    {/* Summary chips */}
                    <div className="relative z-10 flex gap-3 mt-6 flex-wrap">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                            <p className="text-[10px] text-zinc-400 uppercase tracking-wide">Total Ganho</p>
                            <p className="text-sm font-bold">
                                R$ {totalEarned.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                            <p className="text-[10px] text-zinc-400 uppercase tracking-wide">Sacado</p>
                            <p className="text-sm font-bold">
                                R$ {totalWithdrawn.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                            <p className="text-[10px] text-zinc-400 uppercase tracking-wide">Saques</p>
                            <p className="text-sm font-bold">{withdrawals.length}</p>
                        </div>
                    </div>

                    {/* BG pattern */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    <div className="absolute -right-10 -bottom-10 w-52 h-52 bg-white/5 rounded-full blur-3xl" />
                </div>

                {/* ── Tabs ────────────────────────────────────────────────── */}
                <div className="flex items-center gap-1 bg-zinc-100 rounded-2xl p-1 w-fit">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                                activeTab === tab.id
                                    ? 'bg-white text-foreground shadow-sm'
                                    : 'text-zinc-500 hover:text-zinc-700'
                            }`}
                        >
                            <tab.icon size={15} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── Tab Content ─────────────────────────────────────────── */}
                <AnimatePresence mode="wait">
                    {activeTab === 'withdraw' && (
                        <motion.div
                            key="withdraw"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                        >
                            {/* Form */}
                            <div className="bg-white border border-zinc-100 rounded-[2rem] p-8 shadow-sm">
                                <h2 className="text-base font-bold mb-6">Solicitar Saque via PIX</h2>
                                <WithdrawalForm
                                    balance={wallet.balanceFloat}
                                    onSuccess={handleWithdrawalSuccess}
                                />
                            </div>

                            {/* Info */}
                            <div className="space-y-4">
                                <div className="bg-white border border-zinc-100 rounded-[2rem] p-8 shadow-sm">
                                    <h3 className="text-sm font-bold mb-4">Como funciona</h3>
                                    <div className="space-y-4">
                                        {[
                                            { n: '01', text: 'Informe o valor e sua chave PIX' },
                                            { n: '02', text: 'O saque é processado em até 2 dia útil' },
                                            { n: '03', text: 'O valor é transferido diretamente para sua conta' },
                                        ].map(({ n, text }) => (
                                            <div key={n} className="flex items-start gap-3">
                                                <span className="text-xs font-black text-zinc-300 w-6 flex-shrink-0">{n}</span>
                                                <p className="text-sm text-zinc-600">{text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {wallet.balance === 0 && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-3">
                                        <AlertCircle size={18} className="text-amber-600 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-bold text-amber-800">Saldo zerado</p>
                                            <p className="text-xs text-amber-700 mt-1">
                                                Conclua campanhas para receber pagamentos em sua carteira.
                                            </p>
                                            <Link href="/app/campaigns" className="text-xs font-bold text-amber-700 underline mt-2 inline-block">
                                                Ver campanhas disponíveis →
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'earnings' && (
                        <motion.div
                            key="earnings"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="bg-white border border-zinc-100 rounded-[2rem] shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-zinc-50 flex items-center justify-between">
                                    <h2 className="text-base font-bold">Histórico de Ganhos</h2>
                                    <div className="relative w-56">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                        <Input
                                            type="text"
                                            placeholder="Buscar..."
                                            value={historySearch}
                                            onChange={e => setHistorySearch(e.target.value)}
                                            className="pl-8 h-9 rounded-xl text-sm"
                                        />
                                    </div>
                                </div>
                                {filteredEarnings.length > 0 ? (
                                    <div className="divide-y divide-zinc-50 p-2">
                                        {filteredEarnings.map(entry => (
                                            <EarningRow key={entry.id} entry={entry} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center mb-3">
                                            <Receipt size={24} className="text-zinc-300" />
                                        </div>
                                        <p className="font-semibold text-zinc-400 text-sm">Sem ganhos registrados</p>
                                        <p className="text-xs text-zinc-300 mt-1">Complete campanhas para receber pagamentos.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'history' && (
                        <motion.div
                            key={`history-${reloadKey}`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="bg-white border border-zinc-100 rounded-[2rem] shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-zinc-50 flex items-center justify-between">
                                    <h2 className="text-base font-bold">Saques Solicitados</h2>
                                    <div className="relative w-56">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                        <Input
                                            type="text"
                                            placeholder="Buscar..."
                                            value={historySearch}
                                            onChange={e => setHistorySearch(e.target.value)}
                                            className="pl-8 h-9 rounded-xl text-sm"
                                        />
                                    </div>
                                </div>
                                {filteredWithdrawals.length > 0 ? (
                                    <div className="divide-y divide-zinc-50 p-2">
                                        {filteredWithdrawals.map(entry => (
                                            <WithdrawalRow key={entry.id} entry={entry} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center mb-3">
                                            <ArrowDownLeft size={24} className="text-zinc-300" />
                                        </div>
                                        <p className="font-semibold text-zinc-400 text-sm">Nenhum saque solicitado</p>
                                        <p className="text-xs text-zinc-300 mt-1">Seus saques aparecerão aqui.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </AppLayout>
    )
}
