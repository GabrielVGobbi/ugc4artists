import AdminLayout from '@/layouts/app-layout'
import { Head, router, useForm, usePage } from '@inertiajs/react'
import { useState, useMemo } from 'react'
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
    ChevronRight,
    ChevronLeft,
    User,
    DollarSign,
    Info,
} from 'lucide-react'
import wallet from '@/routes/app/wallet'
import { dashboard } from '@/routes/app'
import { Input } from '@/components/ui/input'
import { CustomField } from '@/components/ui/custom-field'
import { Button } from '@/components/ui/button'
import { SharedData, UserAuth } from '@/types'
import { AddressSelector } from '@/components/app/address-selector'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { formatCPF } from '@/lib/utils'
import { useHeaderActions } from '@/hooks/use-header-actions'

interface FormData {
    amount: number
    payment_method: 'pix' | 'card'
    name: string
    cpf: string
    address_id: string
    address: string
    save_cpf: boolean
    card_number?: string
    card_expiry?: string
    card_cvv?: string
}

type Step = 1 | 2 | 3

export default function AddBalance() {
    const [showHelp, setShowHelp] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [currentStep, setCurrentStep] = useState<Step>(1)
    const [showPrivacyDialog, setShowPrivacyDialog] = useState(false)

    const { url, props } = usePage<SharedData>()
    const user = props.auth?.user.data as UserAuth

    // Header actions - botão voltar e ajuda
    const headerContent = useMemo(() => (
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
    ), [])

    useHeaderActions(headerContent)

    const { data, setData, post, processing, errors } = useForm<FormData>({
        amount: 0,
        payment_method: 'pix',
        name: user.name,
        cpf: '',
        address_id: '',
        address: '',
        save_cpf: false,
        card_number: '',
        card_expiry: '',
        card_cvv: '',
    })

    const isStep1Valid = () => {
        return data.name.trim() !== '' && data.cpf.trim() !== '' && data.address_id.trim() !== ''
    }

    const isStep2Valid = () => {
        return data.amount > 0
    }

    const isStep3Valid = () => {
        if (data.payment_method === 'card') {
            return data.card_number && data.card_expiry && data.card_cvv
        }
        return true
    }

    const handlePayment = () => {
        post(wallet.deposit.url(), {
            onSuccess: () => {
                setIsSuccess(true)
            },
        })
    }

    const handleNextStep = () => {
        if (currentStep === 1 && isStep1Valid()) {
            setCurrentStep(2)
        } else if (currentStep === 2 && isStep2Valid()) {
            setCurrentStep(3)
        }
    }

    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep((currentStep - 1) as Step)
        }
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

            <div className=" flex flex-col animate-in slide-in-from-bottom-4 duration-700 py-12">

                <div className="max-w-7xl mx-auto w-full  flex-1 grid grid-cols-12 gap-12">
                    <div className="col-span-12 lg:col-span-8 space-y-10">
                        <div className="flex items-center justify-between mb-12 hidden">
                            {[1, 2, 3].map((step) => (
                                <div key={step} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center gap-3 relative">
                                        <div
                                            className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-xl transition-all duration-500 ${currentStep >= step
                                                ? 'bg-primary text-white shadow-xl shadow-primary/30'
                                                : 'bg-zinc-100 text-zinc-400'
                                                }`}
                                        >
                                            {currentStep > step ? (
                                                <CheckCircle2 size={28} />
                                            ) : step === 1 ? (
                                                <User size={28} />
                                            ) : step === 2 ? (
                                                <DollarSign size={28} />
                                            ) : (
                                                <CreditCard size={28} />
                                            )}
                                        </div>
                                        <span
                                            className={`text-[10px] font-black uppercase tracking-widest absolute -bottom-8 whitespace-nowrap ${currentStep >= step ? 'text-primary' : 'text-zinc-400'
                                                }`}
                                        >
                                            {step === 1 ? 'Dados' : step === 2 ? 'Valor' : 'Pagamento'}
                                        </span>
                                    </div>
                                    {step < 3 && (
                                        <div
                                            className={`flex-1 h-1 mx-4 rounded-full transition-all duration-500 ${currentStep > step ? 'bg-primary' : 'bg-zinc-100'
                                                }`}
                                        ></div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="bg-white p-12 rounded-[3.5rem] border border-zinc-100 shadow-sm space-y-12 min-h-[500px]">
                            {currentStep === 1 && (
                                <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-black tracking-tighter text-[#0A0A0A]">
                                            Dados de Faturamento
                                        </h3>
                                        <p className="text-zinc-500 font-medium">
                                            Precisamos dessas informações para processar seu pagamento com segurança.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <CustomField
                                                label="Nome Completo"
                                                placeholder="Nome Completo"
                                                disabled
                                                value={user.name}
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
                                                onChange={(e) => {
                                                    const formatted = formatCPF(e.target.value);
                                                    setData('cpf', formatted)
                                                }}
                                            />
                                            {errors.cpf && (
                                                <p className="text-red-500 text-xs font-medium">{errors.cpf}</p>
                                            )}
                                        </div>
                                        <div className="md:col-span-2">
                                            <AddressSelector
                                                value={data.address_id}
                                                onChange={(addressId, fullAddress) => {
                                                    setData('address_id', addressId)
                                                    setData('address', fullAddress)
                                                }}
                                                error={errors.address_id || errors.address}
                                            />
                                        </div>
                                    </div>


                                    <div className="relative z-10 flex items-center justify-between gap-6">
                                        <div className="flex items-start gap-4 flex-1">

                                            <div className="space-y-2 flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h4 className="font-black text-zinc-900 text-lg tracking-tight">
                                                        Salvar meu CPF para compras futuras
                                                    </h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPrivacyDialog(true)}
                                                        className="cursor-pointer w-7 h-7 rounded-full bg-white shadow-md hover:shadow-lg flex items-center justify-center text-primary hover:scale-110 transition-all duration-300 shrink-0"
                                                    >
                                                        <Info size={16} strokeWidth={2.5} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setData('save_cpf', !data.save_cpf)}
                                            className={`cursor-pointer  relative w-13 h-8 rounded-full transition-all duration-500 shadow-lg hover:shadow-xl shrink-0 ${data.save_cpf
                                                ? 'bg-gradient-to-r from-primary to-orange-500'
                                                : 'bg-zinc-300'
                                                }`}
                                        >
                                            <div
                                                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-500 flex items-center justify-center ${data.save_cpf ? 'translate-x-5' : 'translate-x-0'
                                                    }`}
                                            >
                                                {data.save_cpf ? (
                                                    <CheckCircle2 size={18} className="text-primary" strokeWidth={3} />
                                                ) : (
                                                    <div className="w-3 h-3 rounded-full bg-zinc-400"></div>
                                                )}
                                            </div>
                                            {data.save_cpf && (
                                                <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
                                            )}
                                        </button>
                                    </div>

                                    <div className="flex justify-end pt-8">
                                        <Button
                                            size={'none'}
                                            variant={'none'}
                                            disabled={!isStep1Valid()}
                                            onClick={handleNextStep}
                                            className="bg-[#0A0A0A] text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] flex items-center gap-3 hover:bg-primary transition-all shadow-xl disabled:opacity-30 disabled:cursor-not-allowed group"
                                        >
                                            Próximo
                                            <ChevronRight
                                                size={20}
                                                className="group-hover:translate-x-1 transition-transform"
                                            />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-black tracking-tighter text-[#0A0A0A]">
                                            Quanto deseja adicionar?
                                        </h3>
                                        <p className="text-zinc-500 font-medium">
                                            Escolha o
                                            valor que deseja adicionar à sua carteira.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex flex-wrap gap-4">
                                            {[200, 500, 1000, 2000].map((val) => (
                                                <Button
                                                    variant={'none'}
                                                    size={'none'}
                                                    key={val}
                                                    onClick={() => setData('amount', val)}
                                                    className={`px-10 py-6 rounded-2xl font-black text-xl transition-all border-2 ${data.amount === val
                                                        ? 'bg-[#0A0A0A] border-[#0A0A0A] text-white shadow-xl'
                                                        : 'bg-white border-zinc-100 text-zinc-600 hover:border-zinc-300'
                                                        }`}
                                                >
                                                    R$ {val}
                                                </Button>
                                            ))}
                                        </div>

                                        <div className="space-y-3">
                                            <label className="ml-1 text-[0.8em] font-black tracking-[0.1em]  text-zinc-600">
                                                Ou digite um valor personalizado
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-2xl text-zinc-400">
                                                    R$
                                                </span>
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    value={data.amount || ''}
                                                    onChange={(e) => setData('amount', Number(e.target.value))}
                                                    className="bg-white border-2 border-zinc-100 rounded-2xl pl-16  pr-6 py-2 font-black text-2xl outline-none focus:border-primary transition-all w-full"
                                                />
                                            </div>
                                            {errors.amount && (
                                                <p className="text-red-500 text-sm font-medium">{errors.amount}</p>
                                            )}
                                        </div>


                                    </div>

                                    <div className="flex justify-between pt-8">
                                        <Button
                                            size={'none'}
                                            variant={'none'}
                                            onClick={handlePrevStep}
                                            className="bg-zinc-100 text-zinc-600 px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] flex items-center gap-3 hover:bg-zinc-200 transition-all group"
                                        >
                                            <ChevronLeft
                                                size={20}
                                                className="group-hover:-translate-x-1 transition-transform"
                                            />
                                            Voltar
                                        </Button>
                                        <Button
                                            size={'none'}
                                            variant={'none'}
                                            disabled={!isStep2Valid()}
                                            onClick={handleNextStep}
                                            className="bg-[#0A0A0A] text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] flex items-center gap-3 hover:bg-primary transition-all shadow-xl disabled:opacity-30 disabled:cursor-not-allowed group"
                                        >
                                            Próximo
                                            <ChevronRight
                                                size={20}
                                                className="group-hover:translate-x-1 transition-transform"
                                            />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-black tracking-tighter text-[#0A0A0A]">
                                            Método de Pagamento
                                        </h3>
                                        <p className="text-zinc-500 font-medium">
                                            Escolha como deseja realizar o pagamento de R${' '}
                                            {data.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <Button
                                            variant={'none'}
                                            size={'none'}
                                            onClick={() => setData('payment_method', 'pix')}
                                            className={`p-8 rounded-[2rem] border-2 flex flex-col items-center gap-4 transition-all ${data.payment_method === 'pix'
                                                ? 'border-primary bg-white text-primary shadow-lg shadow-orange-500/5'
                                                : 'bg-zinc-50 border-zinc-100 text-zinc-600'
                                                }`}
                                        >
                                            <QrCode size={40} />
                                            <span className="font-black uppercase tracking-widest text-[11px]">
                                                Pagamento via Pix
                                            </span>
                                        </Button>
                                        <Button
                                            variant={'none'}
                                            size={'none'}
                                            onClick={() => setData('payment_method', 'card')}
                                            className={`p-8 rounded-[2rem] border-2 flex flex-col items-center gap-4 transition-all ${data.payment_method === 'card'
                                                ? 'border-primary bg-white text-primary shadow-lg shadow-orange-500/5'
                                                : 'bg-zinc-50 border-zinc-100 text-zinc-600'
                                                }`}
                                        >
                                            <CreditCard size={40} />
                                            <span className="font-black uppercase tracking-widest text-[11px]">
                                                Cartão de Crédito
                                            </span>
                                        </Button>
                                    </div>

                                    {data.payment_method === 'pix' && (
                                        <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                                            <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 space-y-4">
                                                <div className="flex items-start gap-6">

                                                    <div className="space-y-2">
                                                        <p className="font-bold text-emerald-900 text-lg">
                                                            Como funciona o pagamento via Pix?
                                                        </p>
                                                        <ol className="text-sm text-emerald-700/70 font-medium space-y-2 list-decimal list-inside">
                                                            <li>Clique em "Confirmar Pagamento" abaixo</li>
                                                            <li>Um QR Code será gerado na próxima tela</li>
                                                            <li>Abra o app do seu banco e escaneie o código</li>
                                                            <li>
                                                                Confirme o pagamento de R${' '}
                                                                {data.amount.toLocaleString('pt-BR', {
                                                                    minimumFractionDigits: 2,
                                                                })}
                                                            </li>
                                                            <li>
                                                                Seu saldo será liberado <strong>instantaneamente</strong>{' '}
                                                                (menos de 10 segundos)
                                                            </li>
                                                        </ol>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {data.payment_method === 'card' && (
                                        <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                                            <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-start gap-4 mb-6 hidden">
                                                <AlertCircle className="text-blue-500 shrink-0" size={24} />
                                                <div className="space-y-1">
                                                    <p className="font-bold text-blue-900">Pagamento com Cartão</p>
                                                    <p className="text-sm text-blue-700/70 font-medium">
                                                        Liberação em até 15 minutos após aprovação da operadora.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="md:col-span-3 space-y-2">
                                                    <CustomField
                                                        label="Nome Completo (Como está no cartão)"
                                                        placeholder=""
                                                        value={data.card_number}
                                                        onChange={(e) => setData('card_number', e.target.value)}
                                                        error={errors.card_number}
                                                    />
                                                </div>
                                                <div className="md:col-span-3 space-y-2">
                                                    <CustomField
                                                        label="Número do Cartão"
                                                        placeholder="0000 0000 0000 0000"
                                                        value={data.card_number}
                                                        onChange={(e) => setData('card_number', e.target.value)}
                                                        error={errors.card_number}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <CustomField
                                                        label="Validade"
                                                        placeholder="MM/AAAA"
                                                        value={data.card_expiry}
                                                        onChange={(e) => setData('card_expiry', e.target.value)}
                                                        error={errors.card_expiry}
                                                    />
                                                </div>
                                                <div className="md:col-span-2 space-y-2">
                                                    <CustomField
                                                        label="CVV"
                                                        placeholder="000"
                                                        value={data.card_cvv}
                                                        onChange={(e) => setData('card_cvv', e.target.value)}
                                                        error={errors.card_cvv}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-between pt-8">
                                        <Button
                                            size={'none'}
                                            variant={'none'}
                                            onClick={handlePrevStep}
                                            className="bg-zinc-100 text-zinc-600 px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] flex items-center gap-3 hover:bg-zinc-200 transition-all group"
                                        >
                                            <ChevronLeft
                                                size={20}
                                                className="group-hover:-translate-x-1 transition-transform"
                                            />
                                            Voltar
                                        </Button>
                                        <Button
                                            size={'none'}
                                            variant={'none'}
                                            disabled={!isStep3Valid() || processing}
                                            onClick={handlePayment}
                                            className="bg-[#0A0A0A] text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] flex items-center gap-3 hover:bg-primary transition-all shadow-xl disabled:opacity-30 disabled:cursor-not-allowed group"
                                        >
                                            {processing ? (
                                                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                                            ) : (
                                                <>
                                                    Confirmar Pagamento
                                                    <ArrowRight
                                                        size={20}
                                                        className="group-hover:translate-x-1 transition-transform"
                                                    />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-4">
                        <div className="sticky top-12 space-y-6">
                            <div className="bg-[#0A0A0A] rounded-[3rem] p-10 text-white space-y-8 relative overflow-hidden shadow-2xl">
                                <div className="absolute top-[-2%] right-[1%] text-[24rem] font-bold text-white/[0.1] pointer-events-none select-none z-0 rotate-[-5deg]">
                                    <Wallet size={100} fill="white" />
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

                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
                            </div>

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



                <Dialog open={showPrivacyDialog} onOpenChange={setShowPrivacyDialog}>
                    <DialogContent
                        className="
      w-[calc(100%-2rem)]
      sm:max-w-md
      max-h-[90dvh]
      p-0
      overflow-hidden
      flex flex-col
    "
                    >
                        {/* Header fixo */}
                        <div className="p-6  border-b shrink-0">
                            <DialogHeader>
                                <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tighter">
                                    Privacidade e Segurança
                                </DialogTitle>
                                <DialogDescription className="text-base text-zinc-600 font-medium">
                                    Entenda como protegemos seus dados pessoais
                                </DialogDescription>
                            </DialogHeader>
                        </div>

                        {/* Corpo com scroll (ESSENCIAL: flex-1 + min-h-0) */}
                        <div className="flex-1 min-h-0 overflow-y-auto py-1 px-5">
                            <div className="space-y-4">

                                <div className="space-y-1">
                                    <h4 className="font-bold text-zinc-900">Não salvamos sem permissão</h4>
                                    <p className="text-sm text-zinc-600 leading-relaxed">
                                        Seus dados pessoais, incluindo CPF, só são armazenados se você marcar a
                                        opção de consentimento. Sem sua autorização explícita, nenhuma informação é
                                        salva.
                                    </p>
                                </div>


                                <div className="space-y-1">
                                    <h4 className="font-bold text-zinc-900">Criptografia de ponta a ponta</h4>
                                    <p className="text-sm text-zinc-600 leading-relaxed">
                                        Todos os dados são criptografados usando padrões bancários (AES-256) e
                                        transmitidos via conexão segura SSL/TLS.
                                    </p>
                                </div>


                                <div className="space-y-1">
                                    <h4 className="font-bold text-zinc-900">Conformidade com LGPD</h4>
                                    <p className="text-sm text-zinc-600 leading-relaxed">
                                        Seguimos rigorosamente a Lei Geral de Proteção de Dados. Você pode
                                        solicitar exclusão dos seus dados a qualquer momento.
                                    </p>
                                </div>


                                <div className="space-y-1">
                                    <h4 className="font-bold text-zinc-900">Finalidade específica</h4>
                                    <p className="text-sm text-zinc-600 leading-relaxed">
                                        Seus dados são usados exclusivamente para processar pagamentos e facilitar
                                        compras futuras. Nunca compartilhamos com terceiros sem autorização.
                                    </p>
                                </div>

                                <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100">
                                    <p className="text-xs text-zinc-600 leading-relaxed">
                                        Ao marcar a opção "Salvar meu CPF", você concorda com o armazenamento seguro desta
                                        informação conforme nossa{' '}
                                        <a href="/termos" className="text-primary font-bold hover:underline">
                                            Política de Privacidade
                                        </a>{' '}
                                        e{' '}
                                        <a href="/termos" className="text-primary font-bold hover:underline">
                                            Termos de Uso
                                        </a>
                                        .
                                    </p>
                                </div>
                            </div>


                        </div>

                        {/* Footer fixo */}
                        <div className="p-3 bg-zinc-50 flex justify-end border-t shrink-0">
                            <Button
                                size={"default"}
                                variant={"default"}
                                onClick={() => setShowPrivacyDialog(false)}
                                className="bg-[#0A0A0A] text-white rounded-2xl font-bold hover:bg-primary transition-colors"
                            >
                                Entendi
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

            </div>
        </AdminLayout>
    )
}
