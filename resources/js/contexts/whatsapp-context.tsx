import { createContext, useContext, useState, type ReactNode } from 'react'

export interface WhatsAppMessage {
    id: string
    label: string
    message: string
    icon?: ReactNode
}

interface WhatsAppContextType {
    phoneNumber: string
    isOpen: boolean
    setIsOpen: (open: boolean) => void
    messages: WhatsAppMessage[]
    setMessages: (messages: WhatsAppMessage[]) => void
    defaultMessage: string
    setDefaultMessage: (message: string) => void
}

const WhatsAppContext = createContext<WhatsAppContextType | null>(null)

interface WhatsAppProviderProps {
    children: ReactNode
    phoneNumber?: string
}

export function WhatsAppProvider({
    children,
    phoneNumber = '5500000000000' // Número padrão
}: WhatsAppProviderProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<WhatsAppMessage[]>([])
    const [defaultMessage, setDefaultMessage] = useState('Olá! Preciso de ajuda.')

    return (
        <WhatsAppContext.Provider
            value={{
                phoneNumber,
                isOpen,
                setIsOpen,
                messages,
                setMessages,
                defaultMessage,
                setDefaultMessage
            }}
        >
            {children}
        </WhatsAppContext.Provider>
    )
}

export function useWhatsApp() {
    const context = useContext(WhatsAppContext)
    if (!context) {
        throw new Error('useWhatsApp must be used within a WhatsAppProvider')
    }
    return context
}
