import { Link, router, usePage } from '@inertiajs/react'
import { LogOut, ArrowRight } from 'lucide-react'
import { APP_NAV_ITEMS, APP_BOTTOM_NAV } from '@/lib/app-constants'
import { cn } from '@/lib/utils'
import { logout } from '@/routes'
import AppLogo from '../app-logo'

export const AppSidebar = () => {
    const { url } = usePage()

    const isActive = (href: string) => {
        if (href === '/app/dashboard') {
            return url === href || url === '/app'
        }
        return url.startsWith(href)
    }

    const handleLogout = () => {
        router.post(logout().url)
    }

    return (
        <aside className="w-72 bg-[#0A0A0A] h-screen flex flex-col p-8 justify-between fixed left-0 top-0 z-50">
            <div>
                {/* Logo Section */}
                <Link href="/app/dashboard" className="flex items-center mb-10" >
                    <div>

                        <img
                            src={'/assets/images/logo-white.png'}
                            alt={'logo ugc-for-artists'}
                            className={'h-full object-contain transition-opacity duration-300'}
                            decoding="async"
                            width={130}
                            height={30}
                        />

                    </div>
                </Link>

                {/* Navigation Section */}
                <nav className="space-y-2">
                    {APP_NAV_ITEMS.map((item) => {
                        const Icon = item.icon
                        const active = isActive(item.href)

                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                className={cn(
                                    'w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 group',
                                    active
                                        ? 'bg-white/10 text-white'
                                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon
                                        size={20}
                                        className={cn(
                                            'transition-colors',
                                            active && 'text-[#FF4D00]'
                                        )}
                                    />
                                    <span className="font-medium text-[15px]">{item.label}</span>
                                </div>
                                {item.badge && (
                                    <span className="bg-[#FF4D00] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[20px] text-center">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* Bottom Section */}
            <div className="space-y-6 mt-5">
                {/* Featured Card in Sidebar */}
                <div className="bg-[#FF4D00] p-6 rounded-3xl relative overflow-hidden group cursor-pointer hover:shadow-2xl hover:shadow-[#FF4D00]/20 transition-all duration-500">
                    <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                    <p className="text-white/80 text-xs font-medium mb-1 uppercase tracking-widest relative z-10">
                        Novo Recurso
                    </p>
                    <h3 className="text-white font-bold text-lg leading-tight mb-4 italic relative z-10">
                        AI Campaign Studio
                    </h3>
                    <div className="flex items-center gap-2 text-white font-semibold text-sm relative z-10">
                        <span>Explorar</span>
                        <ArrowRight
                            size={16}
                            className="group-hover:translate-x-1 transition-transform"
                        />
                    </div>
                </div>

                {/* Bottom Navigation */}
                <div className="space-y-1">
                    {APP_BOTTOM_NAV.map((item) => {
                        const Icon = item.icon
                        const active = isActive(item.href)

                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                className={cn(
                                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                                    active
                                        ? 'text-white bg-white/10'
                                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                                )}
                            >
                                <Icon
                                    size={20}
                                    className={cn(active && 'text-[#FF4D00]')}
                                />
                                <span className="font-medium text-[15px]">{item.label}</span>
                            </Link>
                        )
                    })}

                    <button
                        onClick={handleLogout}
                        className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-red-400 rounded-xl transition-all hover:bg-white/5"
                    >
                        <LogOut size={20} />
                        <span className="font-medium text-[15px]">Sair</span>
                    </button>
                </div>
            </div>
        </aside>
    )
}



