import AdminLayout from '@/layouts/app-layout'
import { Head, router } from '@inertiajs/react'
import { useState, useEffect, useCallback, useMemo } from 'react'
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    Copy,
    QrCode,
    RefreshCw,
    Smartphone,
    Sparkles,
    Timer,
    Wallet,
    AlertCircle,
    ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useHeaderActions } from '@/hooks/use-header-actions'
import { cn } from '@/lib/utils'
import payments from '@/routes/app/payments'
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
    status_color: string
    payment_method: string
    payment_method_label: string
    due_date: string
    due_date_iso: string
    created_at: string
    description: string | null
    is_pending: boolean
    is_paid: boolean
    is_final: boolean
}

interface PixData {
    payload: string
    encoded_image: string | null
    expires_at: string | null
}

interface Props {
    payment: Payment
    pix: PixData | null
}

export default function ShowPixPayment({ payment, pix }: Props) {
    const [copied, setCopied] = useState(false)
    const [checking, setChecking] = useState(false)
    const [timeLeft, setTimeLeft] = useState<string>('')
    const [isPaid, setIsPaid] = useState(payment.is_paid)

    console.log(pix);

    // Header actions
    const headerContent = useMemo(
        () => (
            <div className="flex items-center gap-4">
                <Button
                    size={'none'}
                    variant={'none'}
                    onClick={() => router.visit(wallet.index.url())}
                    className="group flex items-center gap-3 text-zinc-500 hover:text-secondary transition-all font-black uppercase text-[10px] tracking-[0.3em]"
                >
                    <div className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center group-hover:border-secondary transition-colors">
                        <ArrowLeft size={16} />
                    </div>
                    Voltar
                </Button>
            </div>
        ),
        [],
    )

    useHeaderActions(headerContent)

    // Copy PIX code to clipboard
    const handleCopy = useCallback(async () => {
        if (!pix?.payload) return

        try {
            await navigator.clipboard.writeText(pix.payload)
            setCopied(true)
            setTimeout(() => setCopied(false), 3000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }, [pix?.payload])

    // Check payment status
    const checkStatus = useCallback(async () => {
        setChecking(true)
        try {
            const response = await fetch(payments.status.url(payment.uuid))
            const data = await response.json()

            if (data.is_paid) {
                setIsPaid(true)
            }
        } catch (err) {
            console.error('Failed to check status:', err)
        } finally {
            setChecking(false)
        }
    }, [payment.uuid])

    // Poll for payment status
    useEffect(() => {
        if (isPaid || payment.is_final) return

        const interval = setInterval(checkStatus, 5000) // Check every 5 seconds

        return () => clearInterval(interval)
    }, [checkStatus, isPaid, payment.is_final])

    // Calculate time left
    useEffect(() => {
        if (!pix?.expires_at) return

        const calculateTimeLeft = () => {
            const now = new Date()
            const expiry = new Date(pix.expires_at!)
            const diff = expiry.getTime() - now.getTime()

            if (diff <= 0) {
                setTimeLeft('Expirado')
                return
            }

            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

            if (hours > 24) {
                const days = Math.floor(hours / 24)
                setTimeLeft(`${days}d ${hours % 24}h`)
            } else if (hours > 0) {
                setTimeLeft(`${hours}h ${minutes}min`)
            } else {
                setTimeLeft(`${minutes}min`)
            }
        }

        calculateTimeLeft()
        const interval = setInterval(calculateTimeLeft, 60000) // Update every minute

        return () => clearInterval(interval)
    }, [pix?.expires_at])

    // Show success screen if paid
    if (isPaid) {
        return (
            <AdminLayout>
                <Head title="Pagamento Confirmado" />
                <div className="max-w-sm mx-auto w-full text-center space-y-8 pt-20">

                    <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500 animate-[progress_2s_ease-in-out]"></div>

                    <div className="relative inline-block">
                        <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto shadow-2xl shadow-emerald-500/40 animate-bounce">
                            <CheckCircle2 size={48} strokeWidth={3} />
                        </div>
                        <div className="absolute -top-4 -right-4 bg-white p-2 rounded-xl shadow-lg border border-zinc-100">
                            <Sparkles className="text-emerald-500" size={20} />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-5xl font-black tracking-tighter text-secondary">PAGAMENTO CONFIRMADO!</h2>
                        <p className="text-zinc-500 font-medium text-lg">
                            {payment.gateway_amount_formatted} foram creditados com sucesso.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 pt-4">
                        <button
                            onClick={() => router.visit(dashboard.url())}
                            className="cursor-pointer w-full bg-secondary text-white py-6 rounded-3xl font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-primary transition-all shadow-xl"
                        >
                            Ir para Dashboard
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

    return (
        <AdminLayout>
            <Head title="Pagamento PIX" />

            <div className="flex flex-col animate-in slide-in-from-bottom-4 duration-700 ">
                <div className="max-w-2xl mx-auto w-full flex-1 grid grid-cols-12 gap-12">
                    {/* Main Content */}
                    <div className="col-span-6 lg:col-span-12 space-y-8">
                        {/* Status Banner */}
                        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex items-center gap-4 hidden">
                            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                                <Clock className="text-amber-600" size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-amber-900">Aguardando Pagamento</h3>
                                <p className="text-amber-700 text-sm">
                                    Escaneie o QR Code ou copie o código PIX para pagar
                                </p>
                            </div>
                            {timeLeft && (
                                <div className="flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-xl">
                                    <Timer size={16} className="text-amber-600" />
                                    <span className="font-bold text-amber-800 text-sm">{timeLeft}</span>
                                </div>
                            )}
                        </div>

                        {/* QR Code Card */}
                        <div className="bg-white p-12 rounded-[3.5rem] border border-zinc-100 shadow-sm space-y-10">
                            <div className="text-center space-y-2">
                                <h2 className="text-3xl font-black tracking-tighter text-secondary">
                                    Pague com PIX
                                </h2>
                                <p className="text-zinc-500 font-medium">
                                    Escaneie o código QR com o app do seu banco
                                </p>
                            </div>

                            {/* QR Code */}
                            <div className="flex justify-center">
                                <div className="relative">
                                    {pix?.encoded_image ? (
                                        <div className="p-6 bg-white rounded-3xl border-2 border-zinc-100 shadow-xl">
                                            <img
                                                src={`data:image/png;base64,${pix.encoded_image}`}
                                                alt="QR Code PIX"
                                                className="w-64 h-64"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-64 h-64 bg-zinc-100 rounded-3xl flex items-center justify-center">
                                            <QrCode size={80} className="text-zinc-300" />
                                        </div>
                                    )}

                                    {/* Decorative corners */}
                                    <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-2xl"></div>
                                    <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-2xl"></div>
                                    <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-2xl"></div>
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-2xl"></div>
                                </div>
                            </div>

                            {/* Copy Code Section */}
                            <div className="space-y-4">
                                <p className="text-center text-zinc-500 text-sm font-medium">
                                    Ou copie o código PIX abaixo
                                </p>

                                <div className="relative">
                                    <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 pr-24 font-mono text-xs text-zinc-600 break-all max-h-30 overflow-y-auto">
                                        {pix?.payload || 'Código PIX não disponível'}
                                    </div>
                                    <Button
                                        onClick={handleCopy}
                                        disabled={!pix?.payload}
                                        className={cn(
                                            'absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl font-bold text-xs transition-all',
                                            copied
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-secondary text-white hover:bg-primary',
                                        )}
                                    >
                                        {copied ? (
                                            <>
                                                <CheckCircle2 size={14} className="mr-1" />
                                                Copiado!
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={14} className="mr-1" />
                                                Copiar
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="bg-zinc-50 rounded-3xl p-8 space-y-6">
                                <h4 className="font-bold text-zinc-900 flex items-center gap-2">
                                    <Smartphone size={20} className="text-primary" />
                                    Como pagar
                                </h4>
                                <ol className="space-y-4">
                                    {[
                                        'Abra o app do seu banco',
                                        'Escolha pagar com PIX',
                                        'Escaneie o QR Code ou cole o código copiado',
                                        'Confirme o pagamento',
                                    ].map((step, index) => (
                                        <li key={index} className="flex items-start gap-4">
                                            <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                                                {index + 1}
                                            </div>
                                            <span className="text-zinc-600 font-medium pt-1">{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            {/* Check Status Button */}
                            <div className="flex justify-center">
                                <Button
                                    onClick={checkStatus}
                                    disabled={checking}
                                    variant="outline"
                                    className="px-8 py-4 rounded-2xl font-bold uppercase text-xs tracking-widest"
                                >
                                    {checking ? (
                                        <>
                                            <RefreshCw size={16} className="mr-2 animate-spin" />
                                            Verificando...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw size={16} className="mr-2" />
                                            Já fiz o pagamento
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        </AdminLayout>
    )
}
