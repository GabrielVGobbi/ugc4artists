import AdminLayout from '@/layouts/app-layout'
import { Head, router } from '@inertiajs/react'
import { CheckCircle2, Sparkles, Zap, ArrowRight, ArrowLeft } from 'lucide-react'
import wallet from '@/routes/app/wallet'
import { dashboard } from '@/routes/app'

interface Payment {
    uuid: string
    amount_formatted: string
    gateway_amount_formatted: string
    status_label: string
    payment_method_label: string
    paid_at: string
    description: string | null
}

interface Props {
    payment: Payment
}

export default function PaymentSuccess({ payment }: Props) {
    return (
        <AdminLayout>
            <Head title="Pagamento Confirmado" />

            <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500 animate-[progress_2s_ease-in-out]"></div>

            <div className="max-w-sm mx-auto w-full text-center space-y-8 pt-20">
                <div className="relative inline-block">
                    <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto shadow-2xl shadow-emerald-500/40 animate-bounce">
                        <CheckCircle2 size={48} strokeWidth={3} />
                    </div>
                    <div className="absolute -top-4 -right-4 bg-white p-2 rounded-xl shadow-lg border border-zinc-100">
                        <Sparkles className="text-emerald-500" size={20} />
                    </div>
                </div>

                <div className="space-y-3">
                    <h2 className="text-5xl font-black tracking-tighter text-secondary">
                        PAGAMENTO CONFIRMADO!
                    </h2>
                    <p className="text-zinc-500 font-medium text-lg">
                        {payment.gateway_amount_formatted} foram processados com sucesso.
                    </p>
                </div>

                <div className="bg-zinc-50 rounded-3xl p-6 space-y-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Método</span>
                        <span className="font-bold text-zinc-900">{payment.payment_method_label}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Data</span>
                        <span className="font-bold text-zinc-900">{payment.paid_at}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Status</span>
                        <span className="font-bold text-emerald-600">{payment.status_label}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-4 pt-4">
                    <button
                        onClick={() => router.visit(dashboard.url())}
                        className="cursor-pointer w-full bg-secondary text-white py-6 rounded-3xl font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-primary transition-all shadow-xl group"
                    >
                        Criar Campanha Agora
                    </button>
                    <button
                        onClick={() => router.visit(wallet.index.url())}
                        className="cursor-pointer w-full bg-white border-2 border-zinc-100 text-zinc-600 py-6 rounded-3xl font-black uppercase text-xs tracking-[0.3em] hover:border-secondary hover:text-secondary transition-all flex items-center justify-center gap-3 group"
                    >
                        <ArrowLeft size={18} className="group-hover:translate-x-1 transition-transform" />
                        Voltar à Carteira
                    </button>
                </div>
            </div>

            <style>{`
                    @keyframes progress {
                        0% { width: 0%; }
                        100% { width: 100%; }
                    }
                `}</style>
        </AdminLayout>
    )
}
