import AdminLayout from '@/layouts/app-layout'
import { Head, router, useForm, usePage } from '@inertiajs/react'
import { useState } from 'react'
import {
    ArrowLeft,
    CreditCard,
    QrCode,
    ShieldCheck,
    HelpCircle,
    MessageCircle,
    CheckCircle2,
    Zap,
    ArrowRight,
    Wallet,
    Sparkles,
    AlertCircle,
} from 'lucide-react'
import wallet from '@/routes/app/wallet'
import { dashboard } from '@/routes/app'
import { Input } from '@/components/ui/input'
import { CustomField } from '@/components/ui/custom-field'
import { Button } from '@/components/ui/button'
import { SharedData } from '@/types'

interface FormData {
    amount: number
    payment_method: 'pix' | 'card'
    name: string
    cpf: string
    address: string
    card_number?: string
    card_expiry?: string
    card_cvv?: string
}

export default function AddBalance() {
    const [showHelp, setShowHelp] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [selectedAmount, setSelectedAmount] = useState<number>(500)

    const { url, props } = usePage<SharedData>()
    const user = props.auth?.user.data

    const { data, setData, post, processing, errors } = useForm<FormData>({
        amount: 500,
        payment_method: 'pix',
        name: user.name,
        cpf: '',
        address: '',
        card_number: '',
        card_expiry: '',
        card_cvv: '',
    })

    const isFormValid = () => {
        const basicInfo = data.name && data.cpf && data.address && data.amount > 0


        if (data.payment_method === 'card') {
            return basicInfo && data.card_number && data.card_expiry && data.card_cvv
        }
        return basicInfo
    }

    const handlePayment = () => {
        post(wallet.deposit.url(), {
            onSuccess: () => {
                setIsSuccess(true)
            },
        })
    }

    const handleAmountChange = (amount: number) => {
        setSelectedAmount(amount)
        setData('amount', amount)
    }

    if (isSuccess) {
        return (
            <AdminLayout>
                <Head title="Saldo Adicionado" />
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
                            <h2 className="text-5xl font-black tracking-tighter text-[#0A0A0A]">SALDO ATIVADO!</h2>
                            <p className="text-zinc-500 font-medium text-lg">
                                R$ {data.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} foram
                                adicionados à sua carteira KREO com sucesso.
                            </p>
                        </div>

                        <div className="flex flex-col gap-4 pt-4">
                            <button
                                onClick={() => router.visit(dashboard.url())}
                                className="w-full bg-[#0A0A0A] text-white py-6 rounded-3xl font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-primary transition-all shadow-xl"
                            >
                                Criar Campanha Agora <Zap size={18} />
                            </button>
                            <button
                                onClick={() => router.visit(wallet.index.url())}
                                className="w-full bg-white border-2 border-zinc-100 text-zinc-600 py-6 rounded-3xl font-black uppercase text-xs tracking-[0.3em] hover:border-[#0A0A0A] hover:text-[#0A0A0A] transition-all"
                            >
                                Voltar à Carteira
                            </button>
                        </div>
                    </div>

                    <style>{`
                        @keyframes progress {
                            0% {
                                width: 0%;
                            }
                            100% {
                                width: 100%;
                            }
                        }
                    `}</style>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <Head title="Adicionar Saldo" />

            <div className="min-h-screen flex flex-col animate-in slide-in-from-bottom-4 duration-700 -m-8">
                {/* Header */}
                <div className="max-w-7xl mx-auto w-full px-8 pt-8 flex items-center justify-between">
                    <Button
                        size={'none'}
                        variant={'none'}
                        onClick={() => router.visit(wallet.index.url())}
                        className="group flex items-center gap-3 text-zinc-500 hover:text-[#0A0A0A] transition-all font-black uppercase text-[10px] tracking-[0.3em]"
                    >
                        <div className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center group-hover:border-[#0A0A0A] transition-colors">
                            <ArrowLeft size={16} />
                        </div>
                        Voltar para Carteira
                    </Button>

                    <div className="flex items-center gap-4">
                        <Button
                            size={'none'}
                            variant={'none'}
                            onClick={() => setShowHelp(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl border border-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-primary transition-all shadow-sm"
                        >
                            <HelpCircle size={16} /> Autoajuda
                        </Button>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto w-full px-8 py-12 flex-1 grid grid-cols-12 gap-12">
                    {/* Left Side: Forms */}
                    <div className="col-span-12 lg:col-span-8 space-y-10">

                        <div className="bg-white p-12 rounded-[3.5rem] border border-zinc-100 shadow-sm space-y-12">
                            <section className="space-y-8">

                                <h3 className="font-black uppercase tracking-[0.2em] text-zinc-600 border-b border-zinc-50 pb-2">
                                    Dados de Faturamento
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <CustomField
                                            label="Nome Completo"
                                            placeholder="Nome Completo"
                                            disabled
                                            value={user.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                        />

                                        {errors.name && (
                                            <p className="text-red-500 text-xs font-medium">{errors.name}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <CustomField
                                            label="CPF"
                                            placeholder="000.000.000-00"
                                            value={data.cpf}
                                            onChange={(e) => setData('cpf', e.target.value)}
                                        />
                                        {errors.cpf && (
                                            <p className="text-red-500 text-xs font-medium">{errors.cpf}</p>
                                        )}
                                    </div>
                                    <div className="md:col-span-2 space-y-2">

                                        <CustomField
                                            label="Endereço de Cobrança"
                                            placeholder="Alameda / Rua / Endereço, Nº"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                        />
                                        {errors.address && (
                                            <p className="text-red-500 text-xs font-medium">{errors.address}</p>
                                        )}
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-8">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-600 border-b border-zinc-50 pb-4">
                                    Método de Pagamento
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {[200, 500, 1000].map((val) => (
                                        <Button
                                            variant={'none'}
                                            size={'none'}
                                            key={val}
                                            onClick={() => handleAmountChange(val)}
                                            className={`px-10 py-5 rounded-2xl font-black text-xl transition-all border-2  ${selectedAmount === val
                                                ? 'bg-[#0A0A0A] border-[#0A0A0A] text-white shadow-xl hover:text-primary '
                                                : 'bg-white border-zinc-100 text-zinc-600 hover:border-zinc-300 hover:text-secondary'
                                                }`}
                                        >
                                            R$ {val}
                                        </Button>
                                    ))}
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-zinc-300">
                                            R$
                                        </span>
                                        <Input
                                            type="number"
                                            placeholder="Outro valor"
                                            value={selectedAmount}
                                            onChange={(e) => handleAmountChange(Number(e.target.value))}
                                            className="bg-white border-2 border-zinc-100 rounded-2xl px-14 py-5 font-black text-xl outline-none focus:border-primary transition-all w-48"
                                        />
                                    </div>
                                </div>
                                {errors.amount && (
                                    <p className="text-red-500 text-sm font-medium">{errors.amount}</p>
                                )}

                                <div className="grid grid-cols-2 gap-6">
                                    <Button
                                        variant={'none'}
                                        size={'none'}
                                        onClick={() => setData('payment_method', 'pix')}
                                        className={`rounded-[2rem] border-2 flex flex-col items-center gap-4 transition-all ${data.payment_method === 'pix'
                                            ? 'border-primary bg-white text-primary shadow-lg shadow-orange-500/5'
                                            : 'bg-zinc-50 border-zinc-100 text-zinc-600'
                                            }`}
                                    >
                                        <QrCode size={32} />
                                        <span className="font-black uppercase tracking-widest text-[11px]">
                                            Pagamento via Pix
                                        </span>
                                    </Button>
                                    <Button
                                        variant={'none'}
                                        size={'none'}
                                        onClick={() => setData('payment_method', 'card')}
                                        className={`p-4 rounded-[2rem] border-2 flex flex-col items-center gap-4 transition-all ${data.payment_method === 'card'
                                            ? 'border-primary bg-white text-primary shadow-lg shadow-orange-500/5'
                                            : 'bg-zinc-50 border-zinc-100 text-zinc-600'
                                            }`}
                                    >
                                        <CreditCard size={32} />
                                        <span className="font-black uppercase tracking-widest text-[11px]">
                                            Cartão de Crédito
                                        </span>
                                    </Button>
                                </div>

                                {data.payment_method === 'card' && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-500">
                                        <div className="md:col-span-3 space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
                                                Número do Cartão
                                            </label>
                                            <Input
                                                type="text"
                                                placeholder="0000 0000 0000 0000"
                                                value={data.card_number}
                                                onChange={(e) => setData('card_number', e.target.value)}
                                                className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-6 py-4 font-medium outline-none focus:border-primary transition-all"
                                            />
                                            {errors.card_number && (
                                                <p className="text-red-500 text-xs font-medium">
                                                    {errors.card_number}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
                                                Validade
                                            </label>
                                            <Input
                                                type="text"
                                                placeholder="MM/AA"
                                                value={data.card_expiry}
                                                onChange={(e) => setData('card_expiry', e.target.value)}
                                                className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-6 py-4 font-medium outline-none focus:border-primary transition-all"
                                            />
                                            {errors.card_expiry && (
                                                <p className="text-red-500 text-xs font-medium">
                                                    {errors.card_expiry}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
                                                CVV
                                            </label>
                                            <Input
                                                type="text"
                                                placeholder="000"
                                                value={data.card_cvv}
                                                onChange={(e) => setData('card_cvv', e.target.value)}
                                                className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-6 py-4 font-medium outline-none focus:border-primary transition-all"
                                            />
                                            {errors.card_cvv && (
                                                <p className="text-red-500 text-xs font-medium">{errors.card_cvv}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {data.payment_method === 'pix' && (
                                    <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 flex items-start gap-6 animate-in slide-in-from-top-4 duration-500">
                                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                                            <Zap size={28} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-bold text-emerald-900">Aprovação Instantânea</p>
                                            <p className="text-sm text-emerald-700/70 font-medium">
                                                Após o pagamento do QR Code, seu saldo é liberado em menos de 10
                                                segundos para uso imediato.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </section>
                        </div>
                    </div>

                    {/* Right Side: Summary */}
                    <div className="col-span-12 lg:col-span-4">
                        <div className="sticky top-12 space-y-6">
                            <div className="bg-[#0A0A0A] rounded-[3rem] p-10 text-white space-y-8 relative overflow-hidden shadow-2xl">

                                <div className="absolute top-[-2%] right-[1%] text-[24rem] font-bold text-white/[0.1] pointer-events-none select-none z-0 rotate-[-5deg]">
                                    <Wallet size={100} fill='white' />
                                </div>
                                <div className="relative z-10 flex items-center gap-3">

                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">
                                        Resumo do Depósito
                                    </h4>
                                </div>
                                <div className="relative z-10 space-y-4">
                                    <div className="flex justify-between items-center text-zinc-400 font-medium">
                                        <span>Subtotal</span>
                                        <span className="text-white">
                                            R$ {data.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-zinc-400 font-medium">
                                        <span>Taxa de Processamento</span>
                                        <span className="text-emerald-400 font-bold uppercase tracking-widest text-[10px]">
                                            R$ 0,00
                                        </span>
                                    </div>
                                    <div className="pt-6 border-t border-white/10 grid justify-between items-end">
                                        <span className="text-[11px] font-black uppercase tracking-widest">
                                            Total a pagar
                                        </span>
                                        <span className="text-5xl font-black tracking-tighter text-primary">
                                            R$ {data.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>

                                <div className="relative z-10 p-6 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4">
                                    <ShieldCheck className="text-emerald-500" size={24} />
                                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                                        Ambiente 100% criptografado e seguro por KREO Finance.
                                    </p>
                                </div>

                                <Button
                                    size={'none'}
                                    variant={'none'}
                                    disabled={!isFormValid() || processing}
                                    onClick={handlePayment}
                                    className="w-full bg-white text-[#0A0A0A] py-6 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-primary hover:text-white transition-all duration-500 shadow-xl disabled:opacity-30 disabled:cursor-not-allowed group"
                                >
                                    {processing ? (
                                        <div className="w-6 h-6 border-4 border-[#0A0A0A]/20 border-t-[#0A0A0A] rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            Confirmar Pagamento{' '}
                                            <ArrowRight
                                                size={18}
                                                className="group-hover:translate-x-1 transition-transform"
                                            />
                                        </>
                                    )}
                                </Button>

                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
                            </div>

                            {/* Support Buttons */}
                            <div className="flex flex-col gap-3">
                                <a
                                    href="https://wa.me/550000000000"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full bg-[#25D366]/10 text-[#25D366] py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-[#25D366] hover:text-white transition-all border border-[#25D366]/20"
                                >
                                    <MessageCircle size={18} /> Suporte via WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Help Modal */}
                {showHelp && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-8 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-white rounded-[4rem] w-full max-w-2xl overflow-hidden shadow-2xl relative">
                            <div className="p-10 border-b border-zinc-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                        <HelpCircle size={20} />
                                    </div>
                                    <h3 className="text-2xl font-black tracking-tighter">Central de Pagamentos</h3>
                                </div>
                                <button
                                    onClick={() => setShowHelp(false)}
                                    className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-600 hover:text-black transition-all"
                                >
                                    X
                                </button>
                            </div>

                            <div className="p-10 space-y-8">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-primary">
                                            <QrCode size={20} />
                                            <span className="font-black uppercase text-[10px] tracking-widest">
                                                PIX
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-zinc-500 leading-relaxed">
                                            Liberação <strong>Imediata</strong>. O método mais recomendado para quem
                                            precisa lançar campanhas agora.
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-zinc-600">
                                            <CreditCard size={20} />
                                            <span className="font-black uppercase text-[10px] tracking-widest">
                                                Cartão
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-zinc-500 leading-relaxed">
                                            Liberação em até <strong>15 minutos</strong>. Sujeito à análise da
                                            operadora de cartão.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100 flex items-start gap-4">
                                    <AlertCircle className="text-primary shrink-0" size={24} />
                                    <p className="text-xs font-medium text-orange-900 leading-relaxed">
                                        <strong>Importante:</strong> Depósitos via boleto não estão disponíveis para
                                        garantir a agilidade do ecossistema. Use Pix para rapidez total.
                                    </p>
                                </div>
                            </div>

                            <div className="p-10 bg-zinc-50 flex justify-end">
                                <button
                                    onClick={() => setShowHelp(false)}
                                    className="bg-[#0A0A0A] text-white px-10 py-4 rounded-2xl font-bold hover:bg-primary transition-colors"
                                >
                                    Entendido
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}
