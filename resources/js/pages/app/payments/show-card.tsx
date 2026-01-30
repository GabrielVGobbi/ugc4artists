import AdminLayout from '@/layouts/app-layout'
import { Head, router, useForm } from '@inertiajs/react'
import { useState, useMemo } from 'react'
import {
    ArrowLeft,
    CreditCard,
    Lock,
    Wallet,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CustomField } from '@/components/ui/custom-field'
import { useHeaderActions } from '@/hooks/use-header-actions'
import wallet from '@/routes/app/wallet'
import { dashboard } from '@/routes/app'

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
    payment_method: string
    payment_method_label: string
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

interface CardFormData {
    card_number: string
    card_holder_name: string
    card_expiry_month: string
    card_expiry_year: string
    card_cvv: string
}

export default function ShowCardPayment({ payment }: Props) {
    const [isSuccess, setIsSuccess] = useState(false)

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

    const { data, setData, post, processing, errors } = useForm<CardFormData>({
        card_number: '',
        card_holder_name: '',
        card_expiry_month: '',
        card_expiry_year: '',
        card_cvv: '',
    })

    const formatCardNumber = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 16)
        return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
    }

    const handleSubmit = () => {
        post(`/app/payments/${payment.uuid}/pay-with-card`, {
            onSuccess: () => {
                setIsSuccess(true)
            },
        })
    }

    const isFormValid = () => {
        return (
            data.card_number.replace(/\s/g, '').length >= 13 &&
            data.card_holder_name.trim() !== '' &&
            data.card_expiry_month.length === 2 &&
            data.card_expiry_year.length === 4 &&
            data.card_cvv.length >= 3
        )
    }

    // Show success screen
    if (isSuccess) {
        return (
            <AdminLayout>
                <Head title="Pagamento Confirmado" />
                <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
                    <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500 animate-[progress_2s_ease-in-out]"></div>

                    <div className="max-w-md w-full text-center space-y-8">
                        <div className="relative inline-block">
                            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto shadow-2xl shadow-emerald-500/40 animate-bounce">
                                <CheckCircle2 size={48} strokeWidth={3} />
                            </div>
                            <div className="absolute -top-4 -right-4 bg-white p-2 rounded-xl shadow-lg border border-zinc-100">
                                <Sparkles className="text-emerald-500" size={20} />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-5xl font-black tracking-tighter text-[#0A0A0A]">
                                PAGAMENTO CONFIRMADO!
                            </h2>
                            <p className="text-zinc-500 font-medium text-lg">
                                {payment.gateway_amount_formatted} foram processados com sucesso.
                            </p>
                        </div>

                        <div className="flex flex-col gap-4 pt-4">
                            <button
                                onClick={() => router.visit(dashboard.url())}
                                className="cursor-pointer w-full bg-[#0A0A0A] text-white py-6 rounded-3xl font-black uppercase text-xs tracking-[0.3em] hover:bg-primary transition-all shadow-xl"
                            >
                                Ir para Dashboard
                            </button>
                            <button
                                onClick={() => router.visit(wallet.index.url())}
                                className="cursor-pointer w-full bg-white border-2 border-zinc-100 text-zinc-600 py-6 rounded-3xl font-black uppercase text-xs tracking-[0.3em] hover:border-[#0A0A0A] hover:text-[#0A0A0A] transition-all"
                            >
                                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
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
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <Head title="Pagamento com Cartão" />

            <div className="flex flex-col animate-in slide-in-from-bottom-4 duration-700 py-12">
                <div className="max-w-7xl mx-auto w-full flex-1 grid grid-cols-12 gap-12">
                    {/* Main Content */}
                    <div className="col-span-12 lg:col-span-8 space-y-8">
                        {/* Card Form */}
                        <div className="bg-white p-12 rounded-[3.5rem] border border-zinc-100 shadow-sm space-y-10">
                            <div className="text-center space-y-2">
                                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <CreditCard size={32} className="text-blue-600" />
                                </div>
                                <h2 className="text-3xl font-black tracking-tighter text-[#0A0A0A]">
                                    Pagamento com Cartão
                                </h2>
                                <p className="text-zinc-500 font-medium">
                                    Insira os dados do seu cartão de crédito
                                </p>
                            </div>

                            <div className="space-y-6">
                                <CustomField
                                    label="Número do Cartão"
                                    placeholder="0000 0000 0000 0000"
                                    value={data.card_number}
                                    onChange={(e) => setData('card_number', formatCardNumber(e.target.value))}
                                    error={errors.card_number}
                                />

                                <CustomField
                                    label="Nome no Cartão"
                                    placeholder="Como está no cartão"
                                    value={data.card_holder_name}
                                    onChange={(e) => setData('card_holder_name', e.target.value.toUpperCase())}
                                    error={errors.card_holder_name}
                                />

                                <div className="grid grid-cols-3 gap-4">
                                    <CustomField
                                        label="Mês"
                                        placeholder="MM"
                                        maxLength={2}
                                        value={data.card_expiry_month}
                                        onChange={(e) =>
                                            setData('card_expiry_month', e.target.value.replace(/\D/g, '').slice(0, 2))
                                        }
                                        error={errors.card_expiry_month}
                                    />
                                    <CustomField
                                        label="Ano"
                                        placeholder="AAAA"
                                        maxLength={4}
                                        value={data.card_expiry_year}
                                        onChange={(e) =>
                                            setData('card_expiry_year', e.target.value.replace(/\D/g, '').slice(0, 4))
                                        }
                                        error={errors.card_expiry_year}
                                    />
                                    <CustomField
                                        label="CVV"
                                        placeholder="000"
                                        maxLength={4}
                                        value={data.card_cvv}
                                        onChange={(e) =>
                                            setData('card_cvv', e.target.value.replace(/\D/g, '').slice(0, 4))
                                        }
                                        error={errors.card_cvv}
                                    />
                                </div>
                            </div>

                            {/* Security Info */}
                            <div className="bg-zinc-50 rounded-3xl p-6 flex items-start gap-4">
                                <Lock className="text-zinc-400 shrink-0" size={20} />
                                <p className="text-zinc-500 text-sm">
                                    Seus dados são criptografados e processados de forma segura.
                                    Não armazenamos informações do cartão.
                                </p>
                            </div>

                            {/* Submit Button */}
                            <Button
                                onClick={handleSubmit}
                                disabled={!isFormValid() || processing}
                                className="w-full bg-[#0A0A0A] text-white py-6 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Lock size={16} className="mr-2" />
                                        Pagar {payment.gateway_amount_formatted}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="col-span-12 lg:col-span-4">
                        <div className="sticky top-12 space-y-6">
                            {/* Payment Summary */}
                            <div className="bg-[#0A0A0A] rounded-[3rem] p-10 text-white space-y-8 relative overflow-hidden shadow-2xl">
                                <div className="absolute top-[-2%] right-[1%] text-[24rem] font-bold text-white/[0.1] pointer-events-none select-none z-0 rotate-[-5deg]">
                                    <Wallet size={100} fill="white" />
                                </div>

                                <div className="relative z-10 flex items-center gap-3">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">
                                        Resumo do Pagamento
                                    </h4>
                                </div>

                                <div className="relative z-10 space-y-4">
                                    <div className="flex justify-between items-center text-zinc-400 font-medium">
                                        <span>Valor Total</span>
                                        <span className="text-white">{payment.amount_formatted}</span>
                                    </div>

                                    {payment.wallet_applied > 0 && (
                                        <div className="flex justify-between items-center text-zinc-400 font-medium">
                                            <span>Saldo da Carteira</span>
                                            <span className="text-emerald-400">
                                                -{payment.wallet_applied_formatted}
                                            </span>
                                        </div>
                                    )}

                                    <div className="pt-6 border-t border-white/10 grid justify-between items-end">
                                        <span className="text-[11px] font-black uppercase tracking-widest">
                                            Total no Cartão
                                        </span>
                                        <span className="text-5xl font-black tracking-tighter text-primary">
                                            {payment.gateway_amount_formatted}
                                        </span>
                                    </div>
                                </div>

                                <div className="relative z-10 p-6 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4">
                                    <ShieldCheck className="text-emerald-500" size={24} />
                                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                                        Ambiente 100% criptografado
                                    </p>
                                </div>
                            </div>

                            {/* Info Card */}
                            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 space-y-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="text-blue-500 shrink-0" size={20} />
                                    <div className="space-y-1">
                                        <p className="font-bold text-blue-900 text-sm">Pagamento com Cartão</p>
                                        <p className="text-blue-700 text-xs">
                                            A confirmação pode levar até 15 minutos após a aprovação
                                            da operadora do cartão.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
