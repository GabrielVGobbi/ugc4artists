import AdminLayout from '@/layouts/app-layout'
import { Head, router } from '@inertiajs/react'
import { XCircle, RefreshCw, MessageCircle, ArrowLeft } from 'lucide-react'
import wallet from '@/routes/app/wallet'

interface Payment {
    uuid: string
    amount_formatted: string
    gateway_amount_formatted: string
    status: string
    status_label: string
    status_color: string
    payment_method_label: string
    created_at: string
    description: string | null
}

interface Props {
    payment: Payment
}

export default function PaymentFailed({ payment }: Props) {
    const isCanceled = payment.status === 'canceled'
    const isRefunded = payment.status === 'refunded'

    return (
        <AdminLayout>
            <Head title={isCanceled ? 'Pagamento Cancelado' : 'Pagamento Falhou'} />


            <div className="flex flex-col animate-in slide-in-from-bottom-4 duration-700 ">
                <div className="max-w-2xl mx-auto flex-1 grid grid-cols-12 gap-12">
                    <div className="col-span-12 space-y-8 text-center justify-center items-center">
                        <div
                            className={`w-24 h-24 rounded-full flex items-center justify-center text-white mx-auto shadow-2xl ${isRefunded
                                ? 'bg-blue-500 shadow-blue-500/40'
                                : isCanceled
                                    ? 'bg-zinc-500 shadow-zinc-500/40'
                                    : 'bg-red-500 shadow-red-500/40'
                                }`}
                        >
                            <XCircle size={48} strokeWidth={2} />
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-4xl font-black tracking-tighter text-secondary">
                                {isRefunded
                                    ? 'PAGAMENTO REEMBOLSADO'
                                    : isCanceled
                                        ? 'PAGAMENTO CANCELADO'
                                        : 'PAGAMENTO FALHOU'}
                            </h2>
                            <p className="text-zinc-500 font-medium text-lg">
                                {isRefunded
                                    ? 'O valor foi devolvido para sua forma de pagamento original.'
                                    : isCanceled
                                        ? 'Este pagamento foi cancelado.'
                                        : 'Não foi possível processar seu pagamento.'}
                            </p>
                        </div>

                        <div className="bg-zinc-50 rounded-3xl p-6 space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Valor</span>
                                <span className="font-bold text-zinc-900">{payment.gateway_amount_formatted}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Método</span>
                                <span className="font-bold text-zinc-900">{payment.payment_method_label}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Status</span>
                                <span
                                    className={`font-bold ${isRefunded
                                        ? 'text-blue-600'
                                        : isCanceled
                                            ? 'text-zinc-600'
                                            : 'text-red-600'
                                        }`}
                                >
                                    {payment.status_label}
                                </span>
                            </div>
                        </div>

                        {!isRefunded && !isCanceled && (
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left">
                                <p className="text-amber-800 text-sm font-medium">
                                    <strong>Possíveis motivos:</strong>
                                </p>
                                <ul className="text-amber-700 text-sm mt-2 space-y-1 list-disc list-inside">
                                    <li>Saldo insuficiente</li>
                                    <li>Cartão bloqueado ou expirado</li>
                                    <li>Limite excedido</li>
                                    <li>Dados incorretos</li>
                                </ul>
                            </div>
                        )}

                        <div className="flex flex-col gap-4 pt-4">
                            {!isRefunded && (
                                <button
                                    onClick={() => router.visit(wallet.create.url())}
                                    className="cursor-pointer w-full bg-secondary text-white py-6 rounded-3xl font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-primary transition-all shadow-xl group"
                                >
                                    <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                                    Tentar Novamente
                                </button>
                            )}

                            <button
                                onClick={() => router.visit(wallet.index.url())}
                                className="cursor-pointer w-full bg-white border-2 border-zinc-100 text-zinc-600 py-6 rounded-3xl font-black uppercase text-xs tracking-[0.3em] hover:border-secondary hover:text-secondary transition-all flex items-center justify-center gap-3 group"
                            >
                                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                                Voltar à Carteira
                            </button>


                            <a
                                href="https://wa.me/550000000000"
                                target="_blank"
                                rel="noreferrer"
                                className="button-helper-whats cursor-pointer w-full bg-[#25D366]/10 text-[#25D366] py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-[#25D366] hover:text-white transition-all border border-[#25D366]/20"
                            >
                                <MessageCircle size={18} />
                                Preciso de Ajuda
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
