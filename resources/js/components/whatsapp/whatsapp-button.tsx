import { useWhatsApp, type WhatsAppMessage } from '@/contexts/whatsapp-context'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageCircle, HelpCircle, CreditCard, AlertCircle, Headphones } from 'lucide-react'

// Ícone do WhatsApp SVG
const WhatsAppIcon = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
    >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
)

// Mensagens padrão disponíveis
export const defaultWhatsAppMessages: WhatsAppMessage[] = [
    {
        id: 'support',
        label: 'Suporte Geral',
        message: 'Olá! Preciso de suporte com a plataforma.',
        icon: <Headphones size={16} />
    },
    {
        id: 'payment',
        label: 'Dúvidas sobre Pagamento',
        message: 'Olá! Tenho uma dúvida sobre pagamentos.',
        icon: <CreditCard size={16} />
    },
    {
        id: 'help',
        label: 'Como Funciona?',
        message: 'Olá! Gostaria de saber mais sobre como funciona a plataforma.',
        icon: <HelpCircle size={16} />
    },
    {
        id: 'problem',
        label: 'Reportar Problema',
        message: 'Olá! Estou enfrentando um problema e preciso de ajuda.',
        icon: <AlertCircle size={16} />
    }
]

interface WhatsAppButtonProps {
    /** Mensagens customizadas para esta página */
    customMessages?: WhatsAppMessage[]
    /** Se true, substitui as mensagens padrão. Se false, adiciona às padrão */
    replaceDefaults?: boolean
    /** Mensagem padrão ao clicar direto no botão */
    defaultMessage?: string
}

export function WhatsAppButton({
    customMessages,
    replaceDefaults = false,
    defaultMessage
}: WhatsAppButtonProps = {}) {
    const {
        phoneNumber,
        isOpen,
        setIsOpen,
        messages,
        setMessages,
        setDefaultMessage
    } = useWhatsApp()

    // Configura mensagens quando o componente monta
    useEffect(() => {
        if (customMessages) {
            if (replaceDefaults) {
                setMessages(customMessages)
            } else {
                setMessages([...customMessages, ...defaultWhatsAppMessages])
            }
        } else {
            setMessages(defaultWhatsAppMessages)
        }

        if (defaultMessage) {
            setDefaultMessage(defaultMessage)
        }

        // Cleanup ao desmontar
        return () => {
            setMessages(defaultWhatsAppMessages)
        }
    }, [customMessages, replaceDefaults, defaultMessage, setMessages, setDefaultMessage])

    const openWhatsApp = (message: string) => {
        const encodedMessage = encodeURIComponent(message)
        window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank')
        setIsOpen(false)
    }

    return (
        <>
            {/* Overlay quando aberto */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[9990]"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Container do botão e menu */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
                {/* Menu de opções */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="bg-white rounded-2xl shadow-2xl border border-zinc-100 overflow-hidden min-w-[280px]"
                        >
                            {/* Header */}
                            <div className="bg-[#25D366] px-5 py-4 flex items-center gap-3">
                                <WhatsAppIcon className="w-6 h-6 text-white" />
                                <div>
                                    <p className="text-white font-bold text-sm">Fale Conosco</p>
                                    <p className="text-white/80 text-xs">Escolha uma opção</p>
                                </div>
                            </div>

                            {/* Opções */}
                            <div className="p-2">
                                {messages.map((msg, index) => (
                                    <motion.button
                                        key={msg.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => openWhatsApp(msg.message)}
                                        className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#25D366]/10 transition-all group text-left"
                                    >
                                        <span className="text-[#25D366] group-hover:scale-110 transition-transform">
                                            {msg.icon || <MessageCircle size={16} />}
                                        </span>
                                        <span className="text-zinc-700 text-sm font-medium group-hover:text-[#25D366] transition-colors">
                                            {msg.label}
                                        </span>
                                    </motion.button>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="px-4 pb-3">
                                <p className="text-[10px] text-zinc-400 text-center">
                                    Resposta em até 24h
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Botão principal */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className="cursor-pointer relative w-14 h-14 bg-[#25D366] rounded-full shadow-lg shadow-[#25D366]/30 flex items-center justify-center hover:shadow-xl hover:shadow-[#25D366]/40 transition-shadow"
                >
                    <AnimatePresence mode="wait">
                        {isOpen ? (
                            <motion.div
                                key="close"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                <X className="w-6 h-6 text-white" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="whatsapp"
                                initial={{ rotate: 90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: -90, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                <WhatsAppIcon className="w-7 h-7 text-white" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Pulse animation */}
                    {!isOpen && (
                        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
                    )}
                </motion.button>
            </div>
        </>
    )
}
