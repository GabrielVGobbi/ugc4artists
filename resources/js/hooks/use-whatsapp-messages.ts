import { useEffect } from 'react'
import { useWhatsApp, type WhatsAppMessage } from '@/contexts/whatsapp-context'
import { defaultWhatsAppMessages } from '@/components/whatsapp/whatsapp-button'

interface UseWhatsAppMessagesOptions {
    /** Mensagens customizadas para esta página */
    messages?: WhatsAppMessage[]
    /** Se true, substitui as mensagens padrão. Se false, adiciona às padrão */
    replaceDefaults?: boolean
    /** Mensagem padrão ao clicar direto */
    defaultMessage?: string
}

/**
 * Hook para configurar mensagens do WhatsApp específicas por página
 *
 * @example
 * // Na página de Wallet
 * useWhatsAppMessages({
 *   messages: [
 *     { id: 'saldo', label: 'Dúvida sobre Saldo', message: 'Olá! Tenho uma dúvida sobre meu saldo.' },
 *     { id: 'saque', label: 'Problema com Saque', message: 'Olá! Estou com problema no saque.' }
 *   ]
 * })
 */
export function useWhatsAppMessages(options: UseWhatsAppMessagesOptions = {}) {
    const { setMessages, setDefaultMessage } = useWhatsApp()
    const { messages, replaceDefaults = false, defaultMessage } = options

    useEffect(() => {
        if (messages) {
            if (replaceDefaults) {
                setMessages(messages)
            } else {
                // Adiciona as customizadas no início
                setMessages([...messages, ...defaultWhatsAppMessages])
            }
        }

        if (defaultMessage) {
            setDefaultMessage(defaultMessage)
        }

        // Restaura ao desmontar
        return () => {
            setMessages(defaultWhatsAppMessages)
            setDefaultMessage('Olá! Preciso de ajuda.')
        }
    }, [messages, replaceDefaults, defaultMessage, setMessages, setDefaultMessage])
}

// Mensagens pré-definidas por contexto para facilitar o uso
export const whatsappPresets = {
    wallet: [
        {
            id: 'saldo',
            label: 'Dúvida sobre Saldo',
            message: 'Olá! Tenho uma dúvida sobre meu saldo na carteira.'
        },
        {
            id: 'deposito',
            label: 'Problema com Depósito',
            message: 'Olá! Fiz um depósito e preciso de ajuda.'
        },
        {
            id: 'saque',
            label: 'Problema com Saque',
            message: 'Olá! Estou com problema para realizar um saque.'
        }
    ],
    campaign: [
        {
            id: 'campanha',
            label: 'Dúvida sobre Campanha',
            message: 'Olá! Tenho uma dúvida sobre uma campanha.'
        },
        {
            id: 'briefing',
            label: 'Ajuda com Briefing',
            message: 'Olá! Preciso de ajuda para entender o briefing.'
        },
        {
            id: 'entrega',
            label: 'Problema na Entrega',
            message: 'Olá! Estou com problema para entregar o conteúdo.'
        }
    ],
    onboarding: [
        {
            id: 'cadastro',
            label: 'Ajuda no Cadastro',
            message: 'Olá! Preciso de ajuda para completar meu cadastro.'
        },
        {
            id: 'documentos',
            label: 'Dúvida sobre Documentos',
            message: 'Olá! Tenho dúvidas sobre os documentos necessários.'
        }
    ],
    payment: [
        {
            id: 'pix',
            label: 'Problema com PIX',
            message: 'Olá! Estou com problema no pagamento via PIX.'
        },
        {
            id: 'comprovante',
            label: 'Enviar Comprovante',
            message: 'Olá! Preciso enviar um comprovante de pagamento.'
        },
        {
            id: 'estorno',
            label: 'Solicitar Estorno',
            message: 'Olá! Preciso solicitar um estorno.'
        }
    ]
} as const
