import { Link, router, usePage } from '@inertiajs/react'
import { LogOut, ArrowRight, WalletIcon, Menu, X } from 'lucide-react'
import { APP_NAV_ITEMS, APP_BOTTOM_NAV } from '@/lib/app-constants'
import { cn } from '@/lib/utils'
import wallet from '@/routes/app/wallet'
import { useState, useEffect } from 'react'
import { logout } from '@/routes'

interface AppSidebarProps {
    className?: string
}

export const AppSidebar = ({ className }: AppSidebarProps) => {
    const { url, props } = usePage()
    const user = (props.auth as { user: { data: { balance: string } } }).user.data
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    // Previne scroll do body quando sidebar mobile está aberta
    useEffect(() => {
        document.body.style.overflow = isMobileOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [isMobileOpen])

    const isActive = (href: string) => {
        if (href === '/app/dashboard') return url === href || url === '/app'
        return url.startsWith(href)
    }

    const handleLogout = () => router.post(logout().url)

    const sidebarContent = (
        <>
            {/* Header - Logo fixo */}
            <div className="flex-shrink-0 px-6 pt-6 pb-4 mb-4">
                <Link href="/app/dashboard" className="flex items-center">
                    <img
                        src="/assets/images/logo-white.png"
                        alt="logo ugc-for-artists"
                        className="h-17 object-contain"
                        decoding="async"
                    />
                </Link>
            </div>

            {/* Navegação com scroll */}
            <div className="flex-1 overflow-y-auto px-4 scrollbar-thin">
                <nav className="space-y-1 py-2">
                    {APP_NAV_ITEMS.map((item) => {
                        const Icon = item.icon
                        const active = isActive(item.href)
                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                className={cn(
                                    'w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all duration-200 group',
                                    active ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon size={20} className={cn('transition-colors flex-shrink-0', active && 'text-primary')} />
                                    <span className="font-medium text-sm">{item.label}</span>
                                </div>
                                {item.badge && (
                                    <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[20px] text-center">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* Seção fixa inferior */}
            <div className="flex-shrink-0 px-4 pb-6 pt-4 border-t border-white/5">
                {/* Card Carteira */}
                <Link
                    href={wallet.index()}
                    className="group relative p-5 rounded-2xl border bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-all duration-300 cursor-pointer overflow-hidden block mb-4"
                >
                    <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full blur-2xl bg-primary/10" />
                    <div className="relative z-10 flex flex-col gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary w-fit md:hidden">
                            <WalletIcon size={16} />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Saldo Disponível</p>
                            <h4 className="text-xl font-bold tracking-tight text-white">{user.balance}</h4>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-primary group-hover:gap-3 transition-all duration-300">
                            <span>Ver Extrato</span>
                            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                    </div>
                </Link>

                {/* Bottom Nav */}
                <nav className="space-y-1">
                    {APP_BOTTOM_NAV.map((item) => {
                        const Icon = item.icon
                        const active = isActive(item.href)
                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                className={cn(
                                    'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200',
                                    active ? 'text-white bg-white/10' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                                )}
                            >
                                <Icon size={18} className={cn('flex-shrink-0', active && 'text-primary')} />
                                <span className="font-medium text-sm">{item.label}</span>
                            </Link>
                        )
                    })}
                    <button
                        onClick={handleLogout}
                        className="cursor-pointer w-full flex items-center gap-3 px-4 py-2.5 text-zinc-500 hover:text-red-400 rounded-xl transition-all duration-200 hover:bg-white/5"
                    >
                        <LogOut size={18} className="flex-shrink-0" />
                        <span className="font-medium text-sm">Sair</span>
                    </button>
                </nav>
            </div>
        </>
    )

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-zinc-900 text-white shadow-lg"
                aria-label="Abrir menu"
            >
                <Menu size={24} />
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={cn(
                    'lg:hidden fixed left-0 top-0 h-screen w-72 bg-sidebar flex flex-col z-50 transform transition-transform duration-300 ease-out',
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <button
                    onClick={() => setIsMobileOpen(false)}
                    className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white transition-colors z-10"
                    aria-label="Fechar menu"
                >
                    <X size={20} />
                </button>
                {sidebarContent}
            </aside>

            {/* Desktop Sidebar */}
            <aside className={cn('hidden lg:flex w-72 bg-sidebar h-screen flex-col fixed left-0 top-0 z-40', className)}>
                {sidebarContent}
            </aside>

            {/* Scrollbar minimalista */}
            <style>{`
                .scrollbar-thin::-webkit-scrollbar { width: 4px; }
                .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
                .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
                .scrollbar-thin { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent; }
            `}</style>
        </>
    )
}
