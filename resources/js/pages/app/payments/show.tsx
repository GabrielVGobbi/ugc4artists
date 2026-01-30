import AdminLayout from '@/layouts/app-layout'
import { Head, router } from '@inertiajs/react'
import { useMemo } from 'react'
import {
    ArrowLeft,
    Clock,
    CreditCard,
    QrCode,
    Wallet,
    ShieldCheck,
    ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useHeaderActions } from '@/hooks/use-header-actions'
import wallet from '@/routes/app/wallet'
import payments from '@/routes/app/payments'

interface Payment {
    uuid: string
    amount: number
    amount_formatted: string
    gateway_amount: number
    gateway_amount_formatted: string
    wallet_applied: number
    wallet_applied_formatted: string
    status: string
    status_label: string
    status_color: string
    payment_method: string
    payment_method_label: string
    payment_method_icon: string
    gateway: string
    due_date: string
    created_at: string
    description: string | null
    is_pending: boolean
    is_paid: boolean
    is_final: boolean
}

interface Props {
    payment: Payment
}

export default function ShowPayment({ payment }: Props) {
    // Header actions
    const headerContent = useMemo(
        () => (
            <div className="flex items-center gap-4">
                <Button
                    size={'none'}
                    variant={'none'}
                    onClick={() => router.visit(wallet.index.url())}
                    className="group flex items-center gap-3 text-zinc-500 hover:text-[#0A0A0A] transition-all font-black uppercase text-[10px] tracking-[0.3em]"
                >
                    <div className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center group-hover:border-[#0A0A0A] transition-colors">
                        <ArrowLeft size={16} />
                    </div>
                    Voltar
                </Button>
            </div>
        ),
        [],
    )

    useHeaderActions(headerContent)

    const getMethodIcon = () => {
        switch (payment.payment_method) {
            case 'pix':
                return <QrCode size={24} className="text-emerald-500" />
            case 'credit_card':
                return <CreditCard size={24} className="text-blue-500" />
            default:
                return <Wallet size={24} className="text-zinc-500" />
        }
    }

    const getStatusBadgeClass = () => {
        switch (payment.status_color) {
            case 'green':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200'
            case 'yellow':
                return 'bg-amber-100 text-amber-700 border-amber-200'
            case 'red':
                return 'bg-red-100 text-red-700 border-red-200'
            case 'blue':
                return 'bg-blue-100 text-blue-700 border-blue-200'
            default:
                return 'bg-zinc-100 text-zinc-700 border-zinc-200'
        }
    }

    return (
        <AdminLayout>
            <Head title="Detalhes do Pagamento" />

            <div className="flex flex-col animate-in slide-in-from-bottom-4 duration-700 py-12">
                <div className="max-w-4xl mx-auto w-full space-y-8">
                    {/* Status Banner */}
                    {payment.is_pending && (
                        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                                <Clock className="text-amber-600" size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-amber-900">Pagamento Pendente</h3>
                                <p className="text-amber-700 text-sm">
                                    Complete o pagamento para liberar seu saldo
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Payment Card */}
                    <div className="bg-white rounded-[3rem] border border-zinc-100 shadow-sm overflow-hidden">
                        {/* Header */}
                        <div className="bg-[#0A0A0A] p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                            {getMethodIcon()}
                                        </div>
                                        <div>
                                            <p className="text-white/60 text-xs font-bold uppercase tracking-widest">
                                                {payment.payment_method_label}
                                            </p>
                                            <p className="text-white/40 text-xs">{payment.gateway}</p>
                                        </div>
                                    </div>
                                    <div
                                        className={`px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-widest ${getStatusBadgeClass()}`}
                                    >
                                        {payment.status_label}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-white/60 text-xs font-bold uppercase tracking-widest">
                                        Valor Total
                                    </p>
                                    <p className="text-5xl font-black tracking-tighter text-primary">
                                        {payment.gateway_amount_formatted}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
                                        Valor Original
                                    </p>
                                    <p className="text-zinc-900 font-bold text-lg">
                                        {payment.amount_formatted}
                                    </p>
                                </div>

                                {payment.wallet_applied > 0 && (
                                    <div className="space-y-1">
                                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
                                            Saldo Utilizado
                                        </p>
                                        <p className="text-emerald-600 font-bold text-lg">
                                            -{payment.wallet_applied_formatted}
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
                                        Criado em
                                    </p>
                                    <p className="text-zinc-900 font-bold">{payment.created_at}</p>
                                </div>

                                {payment.due_date && (
                                    <div className="space-y-1">
                                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
                                            Vencimento
                                        </p>
                                        <p className="text-zinc-900 font-bold">{payment.due_date}</p>
                                    </div>
                                )}
                            </div>

                            {payment.description && (
                                <div className="pt-4 border-t border-zinc-100">
                                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">
                                        Descrição
                                    </p>
                                    <p className="text-zinc-900">{payment.description}</p>
                                </div>
                            )}

                            <div className="pt-4 border-t border-zinc-100 flex items-center gap-4">
                                <ShieldCheck className="text-emerald-500" size={20} />
                                <p className="text-zinc-500 text-sm">
                                    Pagamento processado de forma segura via {payment.gateway}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        {payment.is_pending && (
                            <div className="p-8 pt-0">
                                <Button
                                    onClick={() => router.visit(payments.show.url(payment.uuid))}
                                    className="w-full bg-[#0A0A0A] text-white py-6 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-primary transition-all"
                                >
                                    <ExternalLink size={18} className="mr-2" />
                                    Completar Pagamento
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
