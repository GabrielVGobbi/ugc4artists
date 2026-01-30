import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { HelpCircle, QrCode, CreditCard, AlertCircle } from 'lucide-react'
import { ReactNode, useState } from 'react'

interface PaymentHelpModalProps {
    trigger?: ReactNode
}

export function PaymentHelpModal({ trigger }: PaymentHelpModalProps) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-primary">
                        <HelpCircle size={20} />
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="sm:max-w-2xl rounded-3xl p-0 overflow-hidden">
                <DialogHeader className="p-8 pb-6 border-b border-zinc-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                            <HelpCircle size={20} />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-black tracking-tight">
                                Central de Pagamentos
                            </DialogTitle>
                            <DialogDescription className="text-sm text-zinc-500">
                                Entenda os métodos de pagamento disponíveis
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* PIX */}
                        <div className="space-y-3 p-5 bg-zinc-50 rounded-2xl">
                            <div className="flex items-center gap-2 text-primary">
                                <QrCode size={20} />
                                <span className="font-black uppercase text-[10px] tracking-widest">
                                    PIX
                                </span>
                            </div>
                            <p className="text-sm font-medium text-zinc-600 leading-relaxed">
                                Liberação <strong className="text-zinc-900">Imediata</strong>. O método
                                mais recomendado para quem precisa lançar campanhas agora.
                            </p>
                        </div>

                        {/* Cartão */}
                        <div className="space-y-3 p-5 bg-zinc-50 rounded-2xl">
                            <div className="flex items-center gap-2 text-zinc-400">
                                <CreditCard size={20} />
                                <span className="font-black uppercase text-[10px] tracking-widest">
                                    Cartão
                                </span>
                            </div>
                            <p className="text-sm font-medium text-zinc-600 leading-relaxed">
                                Liberação em até <strong className="text-zinc-900">15 minutos</strong>.
                                Sujeito à análise da operadora de cartão.
                            </p>
                        </div>
                    </div>

                    {/* Aviso */}
                    <div className="p-5 bg-orange-50 rounded-2xl border border-orange-100 flex items-start gap-4">
                        <AlertCircle className="text-primary shrink-0 mt-0.5" size={20} />
                        <p className="text-xs font-medium text-orange-900 leading-relaxed">
                            <strong>Importante:</strong> Depósitos via boleto não estão disponíveis para
                            garantir a agilidade do ecossistema. Use Pix para rapidez total.
                        </p>
                    </div>
                </div>

                <DialogFooter className="p-6 bg-zinc-50 border-t border-zinc-100">
                    <Button
                        onClick={() => setOpen(false)}
                        className="bg-[#0A0A0A] text-white px-8 py-3 rounded-xl font-bold hover:bg-primary transition-colors"
                    >
                        Entendido
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
