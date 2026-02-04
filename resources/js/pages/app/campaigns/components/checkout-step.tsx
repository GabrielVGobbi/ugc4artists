import { useState } from 'react'
import { Link } from '@inertiajs/react'
import {
    ArrowLeft,
    ArrowRight,
    CreditCard,
    QrCode,
    ShieldCheck,
    Sparkles,
    Check,
    Clock,
    Users,
    Zap,
    DollarSign,
    Calendar,
    Target,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CustomField } from '@/components/ui/custom-field'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { CampaignFormData } from '../lib/form-config'

interface CheckoutStepProps {
    formData: CampaignFormData
    totalBudget: number
    publicationFee: number
    isSubmitting: boolean
    onBack: () => void
    onSubmit: () => void
}

type PaymentMethod = 'pix' | 'card' | 'wallet'

export function CheckoutStep({
    formData,
    totalBudget,
    publicationFee,
    isSubmitting,
    onBack,
    onSubmit,
}: CheckoutStepProps) {
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')

    const getPlanLabel = () => {
        const labels: Record<string, string> = {
            basic: 'Básico',
            highlight: 'Destaque',
            premium: 'Premium',
        }
        return labels[formData.publication_plan] || 'Básico'
    }

    const getDuration = () => {
        if (!formData.applications_open_date || !formData.applications_close_date) {
            return '—'
        }
        const start = new Date(formData.applications_open_date)
        const end = new Date(formData.applications_close_date)
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        return `${days} dias`
    }

    return (
        <div className="max-w-7xl mx-auto py-8 animate-in slide-in-from-right-8 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
                <button
                    type="button"
                    onClick={onBack}
                    className="group flex items-center gap-3 text-muted-foreground hover:text-foreground transition-all font-black uppercase text-[10px] tracking-[0.2em]"
                >
                    <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-foreground transition-colors">
                        <ArrowLeft size={14} />
                    </div>
                    Voltar
                </button>

                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                        <Check size={16} strokeWidth={3} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Passo Final
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-10">
                {/* Left Column - Payment */}
                <div className="col-span-12 lg:col-span-7 space-y-8">
                    {/* Title */}
                    <div className="space-y-3">
                        <h2 className="text-4xl font-black tracking-tighter text-foreground">
                            Finalize sua campanha
                        </h2>
                        <p className="text-muted-foreground text-lg font-medium">
                            {publicationFee > 0
                                ? 'Escolha o método de pagamento para publicar sua campanha.'
                                : 'Revise os detalhes e publique sua campanha.'}
                        </p>
                    </div>

                    {/* Campaign Summary Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-border shadow-sm space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                            Resumo da Campanha
                        </h3>

                        <div className="flex items-center gap-6">
                            {formData.cover_image_preview ? (
                                <img
                                    src={formData.cover_image_preview}
                                    alt="Cover"
                                    className="w-24 h-24 rounded-2xl object-cover border border-border"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center">
                                    <Target size={32} className="text-muted-foreground" />
                                </div>
                            )}
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                                    @{formData.brand_instagram || 'marca'}
                                </p>
                                <h4 className="text-xl font-bold text-foreground">
                                    {formData.name || 'Sem nome'}
                                </h4>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Users size={14} />
                                        {formData.slots_to_approve} vagas
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={14} />
                                        {getDuration()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    Tipo
                                </p>
                                <p className="font-bold text-foreground">
                                    {formData.kind === 'ugc' ? 'UGC' : 'Influencers'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    Valor/Criador
                                </p>
                                <p className="font-bold text-foreground">
                                    {formatCurrency(formData.price_per_influencer)}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    Orçamento Total
                                </p>
                                <p className="font-bold text-primary">
                                    {formatCurrency(totalBudget)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    {publicationFee > 0 && (
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                Método de Pagamento
                            </h3>

                            <div className="grid grid-cols-3 gap-4">
                                {/* PIX */}
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('pix')}
                                    className={cn(
                                        "p-6 rounded-[2rem] border-2 flex flex-col items-center gap-4 transition-all",
                                        paymentMethod === 'pix'
                                            ? "border-primary bg-white text-primary shadow-lg shadow-primary/5"
                                            : "bg-muted/50 border-border text-muted-foreground hover:border-primary/50"
                                    )}
                                >
                                    <QrCode size={32} />
                                    <span className="font-black uppercase tracking-widest text-[10px]">
                                        Pix
                                    </span>
                                </button>

                                {/* Card */}
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('card')}
                                    className={cn(
                                        "p-6 rounded-[2rem] border-2 flex flex-col items-center gap-4 transition-all",
                                        paymentMethod === 'card'
                                            ? "border-primary bg-white text-primary shadow-lg shadow-primary/5"
                                            : "bg-muted/50 border-border text-muted-foreground hover:border-primary/50"
                                    )}
                                >
                                    <CreditCard size={32} />
                                    <span className="font-black uppercase tracking-widest text-[10px]">
                                        Cartão
                                    </span>
                                </button>

                                {/* Wallet */}
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('wallet')}
                                    className={cn(
                                        "p-6 rounded-[2rem] border-2 flex flex-col items-center gap-4 transition-all",
                                        paymentMethod === 'wallet'
                                            ? "border-primary bg-white text-primary shadow-lg shadow-primary/5"
                                            : "bg-muted/50 border-border text-muted-foreground hover:border-primary/50"
                                    )}
                                >
                                    <DollarSign size={32} />
                                    <span className="font-black uppercase tracking-widest text-[10px]">
                                        Carteira
                                    </span>
                                </button>
                            </div>

                            {/* Payment Info */}
                            {paymentMethod === 'pix' && (
                                <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 space-y-3 animate-in slide-in-from-top-4 duration-300">
                                    <p className="font-bold text-emerald-900">
                                        Como funciona o pagamento via Pix?
                                    </p>
                                    <ol className="text-sm text-emerald-700/70 font-medium space-y-1 list-decimal list-inside">
                                        <li>Clique em "Publicar Campanha" abaixo</li>
                                        <li>Um QR Code será gerado na próxima tela</li>
                                        <li>Abra o app do seu banco e escaneie o código</li>
                                        <li>Sua campanha será publicada instantaneamente</li>
                                    </ol>
                                </div>
                            )}

                            {paymentMethod === 'wallet' && (
                                <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100 space-y-3 animate-in slide-in-from-top-4 duration-300">
                                    <p className="font-bold text-blue-900">
                                        Pagar com saldo da Carteira
                                    </p>
                                    <p className="text-sm text-blue-700/70 font-medium">
                                        O valor será debitado automaticamente do seu saldo.
                                        Caso não tenha saldo suficiente, você pode adicionar saldo
                                        antes de continuar.
                                    </p>
                                    <Link
                                        href="/app/wallet/add-balance"
                                        className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
                                    >
                                        Adicionar saldo <ArrowRight size={14} />
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="pt-6">
                        <Button
                            onClick={onSubmit}
                            disabled={isSubmitting}
                            className="w-full bg-primary text-primary-foreground py-6 rounded-[2rem] font-black uppercase text-sm tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-2xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed h-auto"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                    Publicando...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={20} />
                                    Publicar Campanha
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Right Column - Summary */}
                <div className="col-span-12 lg:col-span-5">
                    <div className="sticky top-8 space-y-6">
                        {/* Order Summary */}
                        <div className="bg-secondary rounded-[3rem] p-8 text-secondary-foreground relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />

                            <div className="relative z-10 space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                    Resumo do Pedido
                                </h3>

                                <div className="space-y-4">
                                    {/* Plan */}
                                    <div className="flex justify-between items-center py-3 border-b border-white/10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                                <Zap size={18} className="text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-secondary-foreground">
                                                    Plano {getPlanLabel()}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Taxa de publicação
                                                </p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-secondary-foreground">
                                            {formatCurrency(publicationFee)}
                                        </span>
                                    </div>

                                    {/* Budget Info */}
                                    <div className="flex justify-between items-center py-3 border-b border-white/10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                                <Users size={18} className="text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-secondary-foreground">
                                                    Orçamento Criadores
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formData.slots_to_approve}x {formatCurrency(formData.price_per_influencer)}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-muted-foreground text-sm">
                                            (pago após aprovação)
                                        </span>
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="pt-4 space-y-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                            Total a pagar agora
                                        </span>
                                    </div>
                                    <div className="bg-primary p-6 rounded-2xl flex items-center justify-between shadow-xl shadow-primary/10">
                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                            Total
                                        </span>
                                        <span className="text-3xl font-black">
                                            {formatCurrency(publicationFee)}
                                        </span>
                                    </div>
                                </div>

                                {/* Security Badge */}
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                                    <ShieldCheck className="text-emerald-500 shrink-0" size={20} />
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                        Ambiente 100% seguro e criptografado
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                            <p className="text-sm text-amber-800 font-medium">
                                <strong>Nota:</strong> O orçamento para criadores ({formatCurrency(totalBudget)})
                                só será debitado quando você aprovar os influencers selecionados.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
