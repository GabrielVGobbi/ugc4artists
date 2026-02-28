import { AppSidebar } from '@/components/app/app-sidebar'
import { AppHeader } from '@/components/app/app-header'
import { Toaster, ToastProvider } from '@/components/ui/sonner'
import { HeaderProvider } from '@/contexts/header-context'
import { WhatsAppProvider } from '@/contexts/whatsapp-context'
import { WhatsAppButton } from '@/components/whatsapp/whatsapp-button'
import { useEffect, type ReactNode } from 'react'
import { usePage } from '@inertiajs/react'
import { toast } from 'sonner'
import { FlashMessages, SharedData } from '@/types'

interface AppLayoutProps {
    children: ReactNode
}

/**
 * Converte flash messages do Laravel em toasts.
 * Reage a cada navegação Inertia que traga novas flash messages.
 */
function useFlashToasts(flash: FlashMessages) {
    useEffect(() => {
        if (!flash) return;

        const types = ['success', 'error', 'warning', 'info'] as const;
        for (const type of types) {
            const message = flash[type];
            if (message) {
                toast[type](message);
            }
        }
    }, [flash]);
}


export default function AppLayout({ children }: AppLayoutProps) {
    const { auth, flash, errors } = usePage<SharedData>().props;

    useEffect(() => {
        document.documentElement.classList.remove('dark')
        return () => {
            document.documentElement.classList.remove('dark')
        }
    }, [])

    useFlashToasts(flash);

    return (
        <HeaderProvider>
            <WhatsAppProvider phoneNumber="5500000000000">
                <ToastProvider>
                    <div className="flex h-screen w-full bg-background overflow-hidden">
                        <Toaster />

                        <WhatsAppButton />

                        {/* Sidebar - Fixed width */}
                        <AppSidebar />

                        {/* Main Content Area */}
                        <main className="flex-1 flex flex-col overflow-hidden relative ml-72 px-8 overflow-y-auto custom-scrollbar ">
                            {/* Editorial Background Text */}
                            <div className="absolute top-[-10%] right-[-5%] text-[24rem] font-bold text-black/[0.02] pointer-events-none select-none z-0 rotate-[-5deg]">
                                UGC
                            </div>

                            {/* Subtle gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.01] via-transparent to-transparent pointer-events-none z-0"></div>

                            <AppHeader />

                            <div className="flex-1 z-10 mb-[1em]">
                                {children}
                            </div>
                        </main>

                        <style>{`
				.custom-scrollbar::-webkit-scrollbar {
					width: 8px;
				}

				.custom-scrollbar::-webkit-scrollbar-track {
					background: transparent;
				}

				.custom-scrollbar::-webkit-scrollbar-thumb {
					background: #e4e4e7;
					border-radius: 4px;
				}

				.custom-scrollbar::-webkit-scrollbar-thumb:hover {
					background: #FF4D00;
				}
			`}</style>
                    </div>


                </ToastProvider>
            </WhatsAppProvider>
        </HeaderProvider>
    )
}




