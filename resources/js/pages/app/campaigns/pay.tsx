import { useState, useMemo } from 'react'
import { Head, router, useForm, usePage } from '@inertiajs/react'
import {
    ArrowLeft,
    CreditCard,
    QrCode,
    ShieldCheck,
    CheckCircle2,
    Sparkles,
    ChevronRight,
    Wallet,
    Users,
    Calendar,
    Target,
    Clock,
    Zap,
    Check,
    Minus,
    Plus,
} from 'lucide-react'
import { toast } from 'sonner'

import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import { CustomField } from '@/components/ui/custom-field'
import { AddressSelector } from '@/components/app/address-selector'
import { useHeaderActions } from '@/hooks/use-header-actions'
import { formatCurrency, formatCPF, validateCPF, isCPFComplete, formatPhoneFromDigits, formatCardNumber, formatCardDate, isMaskedCPF } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Campaign } from '@/types/campaign'
import type { SharedData, UserAuth } from '@/types'

interface PageProps {
    campaign: Campaign
    wallet_balance: number
    publication_fee: number
}

type PaymentMethod = 'pix' | 'card' | 'wallet'

interface FormData {
    payment_method: PaymentMethod
    use_wallet_balance: boolean
    wallet_amount: number
    name: string
    document: string
    phone: string
    address_id: string
    card_number: string
    card_holder_name: string
    card_expiry: string
    card_cvv: string
}

export default function CampaignCheckout() {
    const { campaign, wallet_balance, publication_fee } = usePage<PageProps>().props
    const { props } = usePage<SharedData>()
    const user = props.auth?.user.data as UserAuth

    const [isSuccess, setIsSuccess] = useState(false)
    const [pixData, setPixData] = useState<{ payload: string; qr_code_image: string } | null>(null)

    // Header actions
    const headerContent = useMemo(() => (
        <Button
            size="none"
            variant="none"
            onClick={() => router.visit(`/app/campaigns/${campaign.uuid}/edit`)}
            className="group flex items-center gap-3 text-zinc-500 hover:text-secondary transition-all font-black uppercase text-[10px] tracking-[0.3em]"
        >
            <div className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center group-hover:border-secondary transition-colors">
                <ArrowLeft size={16} />
            </div>
            Voltar para Campanha
        </Button>
    ), [campaign.uuid])

    useHeaderActions(headerContent)

    const { data, setData, post, processing, errors } = useForm<FormData>({
        payment_method: wallet_balance >= publication_fee ? 'wallet' : 'pix',
        use_wallet_balance: wallet_balance > 0,
        wallet_amount: Math.min(wallet_balance, publication_fee),
        name: user?.name || '',
        document: user?.document || '',
        phone: user?.phone || '',
        address_id: '',
        card_number: '',
        card_holder_name: '',
        card_expiry: '',
        card_cvv: '',
    })

    // Calculations
    const walletAmountToUse = data.use_wallet_balance ? Math.min(data.wallet_amount, wallet_balance, publication_fee) : 0
    const remainingAmount = Math.max(0, publication_fee - walletAmountToUse)
    const canPayWithWalletOnly = wallet_balance >= publication_fee

    // Validation
    const isFormValid = () => {
        if (data.payment_method === 'wallet') {
            return canPayWithWalletOnly
        }

        if (data.payment_method === 'card') {
            return data.card_number && data.card_holder_name && data.card_expiry && data.card_cvv && data.address_id
        }

        // PIX
        return data.address_id || remainingAmount === 0
    }

    const handlePayment = () => {
        post(`/app/campaigns/${campaign.uuid}/checkout`, {
            onSuccess: (page) => {
                const response = page.props as unknown as { pix?: typeof pixData; redirect?: string; paid_with_wallet?: boolean }

                if (response.pix) {
                    setPixData(response.pix)
                } else if (response.redirect) {
                    if (response.paid_with_wallet) {
                        setIsSuccess(true)
                    } else {
                        router.visit(response.redirect)
                    }
                }
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0]
                if (firstError) {
                    toast.error(firstError as string)
                }
            },
        })
    }

    // Success screen
    if (isSuccess) {
        return (
            <AppLayout>
                <Head title="Campanha Publicada!" />
                <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
                    <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500 animate-[progress_2s_ease-in-out]" />

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
                            <h2 className="text-4xl font-black tracking-tighter text-secondary">
                                CAMPANHA ENVIADA!
                            </h2>
                            <p className="text-zinc-500 font-medium text-lg">
                                Sua campanha <strong>{campaign.name}</strong> foi enviada para revisão.
                                Em breve você receberá uma notificação.
                            </p>
                        </div>

                        <div className="flex flex-col gap-4 pt-4">
                            <button
                                onClick={() => router.visit('/app/campaigns')}
                                className="cursor-pointer w-full bg-secondary text-white py-6 rounded-3xl font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-primary transition-all shadow-xl"
                            >
                                Ver Minhas Campanhas
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
            </AppLayout>
        )
    }

    // PIX QR Code screen
    if (pixData) {
        return (
            <AppLayout>
                <Head title="Pagamento PIX" />
                <div className="max-w-2xl mx-auto py-12 space-y-8 animate-in fade-in duration-500">
                    <div className="text-center space-y-4">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                            <QrCode size={40} className="text-emerald-600" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tighter text-secondary">
                            Escaneie o QR Code
                        </h2>
                        <p className="text-zinc-500 font-medium">
                            Abra o app do seu banco e escaneie o código para pagar
                        </p>
                    </div>

                    <div className="bg-white rounded-[3rem] p-10 border border-zinc-100 shadow-sm">
                        <div className="flex flex-col items-center gap-6">
                            {pixData.qr_code_image && (
                                <img
                                    src={`data:image/png;base64,${pixData.qr_code_image}`}
                                    alt="QR Code PIX"
                                    className="w-64 h-64 rounded-2xl border border-zinc-100"
                                />
                            )}

                            <div className="w-full space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">
                                    Ou copie o código
                                </p>
                                <div className="relative">
                                    <input
                                        type="text"
                                        readOnly
                                        value={pixData.payload}
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-mono text-zinc-600 pr-24"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            navigator.clipboard.writeText(pixData.payload)
                                            toast.success('Código copiado!')
                                        }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg"
                                    >
                                        Copiar
                                    </Button>
                                </div>
                            </div>

                            <div className="text-center space-y-2 pt-4">
                                <p className="text-3xl font-black text-primary">
                                    {formatCurrency(remainingAmount)}
                                </p>
                                <p className="text-sm text-zinc-500">
                                    Aguardando confirmação do pagamento...
                                </p>
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => router.visit('/app/campaigns')}
                        className="w-full py-5 rounded-2xl"
                    >
                        Voltar para Campanhas
                    </Button>
                </div>
            </AppLayout>
        )
    }

    return (
        <AppLayout>
            <Head title={`Checkout - ${campaign.name}`} />

            <div className="flex flex-col animate-in slide-in-from-bottom-4 duration-700 py-5">
                <div className="max-w-7xl mx-auto w-full flex-1 grid grid-cols-12 gap-10">
                    {/* Main Content */}
                    <div className="col-span-12 lg:col-span-7 space-y-8">
                        {/* Campaign Summary */}
                        <div className="bg-white rounded-[2.5rem] p-8 border border-zinc-100 shadow-sm">
                            <div className="flex items-start gap-6">
                                {campaign.cover_image_url ? (
                                    <img
                                        src={campaign.cover_image_url}
                                        alt={campaign.name}
                                        className="w-24 h-24 rounded-2xl object-cover border border-zinc-100"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-2xl bg-zinc-100 flex items-center justify-center">
                                        <Target size={32} className="text-zinc-400" />
                                    </div>
                                )}
                                <div className="flex-1 space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                                        @{campaign.brand_instagram || 'marca'}
                                    </p>
                                    <h3 className="text-xl font-bold text-secondary">{campaign.name}</h3>
                                    <div className="flex items-center gap-4 text-sm text-zinc-500">
                                        <span className="flex items-center gap-1">
                                            <Users size={14} /> {campaign.slots_to_approve} vagas
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Zap size={14} /> {campaign.publication_plan === 'premium' ? 'Premium' : campaign.publication_plan === 'highlight' ? 'Destaque' : 'Básico'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Wallet Balance Option */}
                        {wallet_balance > 0 && (
                            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-[2rem] p-6 border border-emerald-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                                            <Wallet size={24} className="text-white" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-emerald-900">
                                                Usar saldo da carteira
                                            </p>
                                            <p className="text-sm text-emerald-700">
                                                Disponível: {formatCurrency(wallet_balance)}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setData('use_wallet_balance', !data.use_wallet_balance)}
                                        className={cn(
                                            "relative w-14 h-8 rounded-full transition-all duration-300",
                                            data.use_wallet_balance ? "bg-emerald-500" : "bg-zinc-300"
                                        )}
                                    >
                                        <div className={cn(
                                            "absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 flex items-center justify-center",
                                            data.use_wallet_balance ? "translate-x-6" : "translate-x-0"
                                        )}>
                                            {data.use_wallet_balance && <Check size={14} className="text-emerald-500" />}
                                        </div>
                                    </button>
                                </div>

                                {data.use_wallet_balance && publication_fee > wallet_balance && (
                                    <div className="mt-4 pt-4 border-t border-emerald-200">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-emerald-700">Valor a usar:</p>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setData('wallet_amount', Math.max(0, data.wallet_amount - 10))}
                                                    className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-emerald-600 border border-emerald-200"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="font-bold text-emerald-900 min-w-[80px] text-center">
                                                    {formatCurrency(walletAmountToUse)}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setData('wallet_amount', Math.min(wallet_balance, publication_fee, data.wallet_amount + 10))}
                                                    className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-emerald-600 border border-emerald-200"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}


                        <div className="bg-white rounded-[2.5rem] p-8 border border-zinc-100 shadow-sm space-y-6">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black tracking-tighter text-secondary">
                                    Método de Pagamento
                                </h3>
                                <p className="text-zinc-500">
                                    {walletAmountToUse > 0
                                        ? `Pague os ${formatCurrency(remainingAmount)} restantes`
                                        : `Escolha como pagar ${formatCurrency(publication_fee)}`
                                    }
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* PIX */}
                                <button
                                    type="button"
                                    onClick={() => setData('payment_method', 'pix')}
                                    className={cn(
                                        "cursor-pointer p-6 rounded-[2rem] border-2 flex flex-col items-center gap-4 transition-all",
                                        data.payment_method === 'pix'
                                            ? "border-primary bg-white text-primary shadow-lg"
                                            : "border-zinc-100 bg-zinc-50 text-zinc-600 hover:border-zinc-200"
                                    )}
                                >
                                    <QrCode size={32} />
                                    <span className="font-black uppercase tracking-widest text-[10px]">PIX</span>
                                </button>

                                {/* Card */}
                                <button
                                    type="button"
                                    onClick={() => setData('payment_method', 'card')}
                                    className={cn(
                                        "cursor-pointer p-6 rounded-[2rem] border-2 flex flex-col items-center gap-4 transition-all",
                                        data.payment_method === 'card'
                                            ? "border-primary bg-white text-primary shadow-lg"
                                            : "border-zinc-100 bg-zinc-50 text-zinc-600 hover:border-zinc-200"
                                    )}
                                >
                                    <CreditCard size={32} />
                                    <span className="font-black uppercase tracking-widest text-[10px]">Cartão</span>
                                </button>
                            </div>

                            {/* Card Form */}
                            {data.payment_method === 'card' && (
                                <div className="space-y-6 animate-in slide-in-from-top-4 duration-300 pt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <CustomField
                                                label="Nome no Cartão"
                                                placeholder="Como está no cartão"
                                                value={data.card_holder_name}
                                                onChange={(e) => setData('card_holder_name', e.target.value)}
                                                error={errors.card_holder_name}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <CustomField
                                                label="Número do Cartão"
                                                placeholder="0000 0000 0000 0000"
                                                value={data.card_number}
                                                onChange={(e) => setData('card_number', formatCardNumber(e.target.value))}
                                                error={errors.card_number}
                                            />
                                        </div>
                                        <CustomField
                                            label="Validade"
                                            placeholder="MM/AAAA"
                                            value={data.card_expiry}
                                            onChange={(e) => setData('card_expiry', formatCardDate(e.target.value))}
                                            error={errors.card_expiry}
                                        />
                                        <CustomField
                                            label="CVV"
                                            placeholder="000"
                                            value={data.card_cvv}
                                            onChange={(e) => setData('card_cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                                            error={errors.card_cvv}
                                        />
                                    </div>

                                    <AddressSelector
                                        value={data.address_id}
                                        onChange={(id) => setData('address_id', id)}
                                        error={errors.address_id}
                                    />
                                </div>
                            )}

                            {/* PIX Info */}
                            {data.payment_method === 'pix' && (
                                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 animate-in slide-in-from-top-4 duration-300">
                                    <p className="font-bold text-emerald-900 mb-2">Pagamento instantâneo</p>
                                    <p className="text-sm text-emerald-700">
                                        Ao clicar em "Finalizar", um QR Code será gerado para você escanear com o app do seu banco.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Wallet Only Payment */}
                        {canPayWithWalletOnly && data.use_wallet_balance && remainingAmount === 0 && (
                            <div className="bg-emerald-50 rounded-[2rem] p-6 border border-emerald-200">
                                <div className="flex items-center gap-4">
                                    <CheckCircle2 size={24} className="text-emerald-600" />
                                    <div>
                                        <p className="font-bold text-emerald-900">Pagamento com saldo da carteira</p>
                                        <p className="text-sm text-emerald-700">
                                            O valor de {formatCurrency(publication_fee)} será debitado da sua carteira.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            onClick={handlePayment}
                            disabled={!isFormValid() || processing}
                            className="w-full bg-primary text-white py-6 rounded-[2rem] font-black uppercase text-sm tracking-[0.2em] h-auto hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary/20"
                        >
                            {processing ? (
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Sparkles size={20} className="mr-3" />
                                    {publication_fee > 0 ? 'Finalizar e Publicar' : 'Publicar Campanha'}
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Sidebar */}
                    <div className="col-span-12 lg:col-span-5">
                        <div className="sticky top-8 space-y-6">
                            {/* Order Summary */}
                            <div className="bg-secondary rounded-[3rem] p-8 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />

                                <div className="relative z-10 space-y-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                        Resumo do Pedido
                                    </h4>

                                    <div className="space-y-4">
                                        {/* Plan */}
                                        <div className="flex justify-between items-center py-3 border-b border-white/10">
                                            <div className="flex items-center gap-3">

                                                <div>
                                                    <p className="font-bold">
                                                        Plano {campaign.publication_plan === 'premium' ? 'Premium' : campaign.publication_plan === 'highlight' ? 'Destaque' : 'Básico'}
                                                    </p>
                                                    <p className="text-xs text-zinc-400">Taxa de publicação</p>
                                                </div>
                                            </div>
                                            <span className="font-bold">{formatCurrency(publication_fee)}</span>
                                        </div>

                                        {/* Wallet Discount */}
                                        {walletAmountToUse > 0 && (
                                            <div className="flex justify-between items-center py-3 border-b border-white/10">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                                        <Wallet size={18} className="text-emerald-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold">Saldo da Carteira</p>
                                                        <p className="text-xs text-zinc-400">Desconto aplicado</p>
                                                    </div>
                                                </div>
                                                <span className="font-bold text-emerald-400">
                                                    -{formatCurrency(walletAmountToUse)}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Total */}
                                    <div className="pt-4 space-y-4">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                                Total a pagar
                                            </span>
                                        </div>
                                        <div className="bg-primary p-5 rounded-2xl flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-widest">Total</span>
                                            <span className="text-3xl font-black">{formatCurrency(remainingAmount)}</span>
                                        </div>
                                    </div>

                                    {/* Security Badge */}
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                                        <ShieldCheck className="text-emerald-500 shrink-0" size={20} />
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                                            Pagamento 100% seguro
                                        </p>
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
