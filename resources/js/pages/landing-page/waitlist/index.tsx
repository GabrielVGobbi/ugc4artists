import type { SharedData } from '@/types'
import { Link, usePage } from "@inertiajs/react";
import { dashboard, home, login, register } from "@/routes";
import { FadeIn } from '@/components/fade-in';
import { LayoutWaitList } from './layout';
import { useEffect } from 'react';
import { WaitListForm } from './waitlist-form';
import HeroShowcase from './components/hero';
import AppLogo from '@/components/app-logo';
import { X } from 'lucide-react';

type IndexPageProps = {
    canRegister?: boolean
}

export default function WaitListIndex({ canRegister = true }: IndexPageProps) {

    const { auth } = usePage<SharedData>().props
    const isAuthenticated = Boolean(auth?.user)

    const heroPrimaryHref = isAuthenticated
        ? dashboard().url
        : canRegister
            ? register().url
            : login().url

    const heroPrimaryLabel = isAuthenticated
        ? 'Ir para dashboard'
        : canRegister
            ? 'Comece agora'
            : 'Entrar'

    const headerCtaHref = heroPrimaryHref
    const headerCtaLabel = isAuthenticated
        ? 'Dashboard'
        : canRegister
            ? 'Lista de Espera'
            : 'Entrar'

    useEffect(() => {
        document.documentElement.classList.remove('dark')
        document.body.classList.add('body_waitlist')
        return () => {
            document.documentElement.classList.add('dark')
            document.body.classList.remove('body_waitlist')
        }
    }, [])

    return (
        <>

            <div className="min-h-screen  bg-[#0a0a0a] text-white p-5 ">
                {/* Background Elements */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#fc7c04]/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#fc7c04]/3 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
                </div>

                <div className="max-w-7xl mx-auto">
                    <header className="pt-5 relative z-10 flex items-center justify-between ">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-[#fc7c04]/20 blur-xl rounded-full" />
                                <AppLogo variant="white" />
                            </div>
                        </div>
                        <Link
                            href={home()}
                            className="group flex items-center justify-center w-12 h-12 rounded-full border border-white/10 hover:border-[#fc7c04]/50 hover:bg-[#fc7c04]/5 transition-all duration-300"
                        >
                            <X className="w-5 h-5 text-white/60 group-hover:text-[#fc7c04] transition-colors" />
                        </Link>
                    </header>

                    <main className="max-w-7xl mx-auto mt-20">
                        <HeroShowcase />

                        <div className="mt-[10%] relative z-10 flex flex-col lg:flex-row min-h-[calc(100vh-120px)]">
                            <WaitListForm></WaitListForm>
                        </div>
                    </main>
                </div>
            </div>
        </>

    )
}
