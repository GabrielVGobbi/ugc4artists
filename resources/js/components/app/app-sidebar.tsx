import { Link, router, usePage } from '@inertiajs/react'
import { LogOut, ArrowRight, WalletIcon, TrendingUp } from 'lucide-react'
import { APP_NAV_ITEMS, APP_BOTTOM_NAV } from '@/lib/app-constants'
import { cn } from '@/lib/utils'
import { logout } from '@/routes'
import AppLogo from '../app-logo'
import wallet from '@/routes/app/wallet'

export const AppSidebar = () => {
    const { url, props } = usePage()
    const user = props.auth.user.data;

    const isActive = (href: string) => {
        if (href === '/app/dashboard') {
            return url === href || url === '/app'
        }
        return url.startsWith(href)
    }

    const handleLogout = () => {
        router.post(logout().url)
    }

    const activeTab = false;

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


                <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl transition-colors duration-500 bg-white/20`}></div>


                {/* Navigation Section */}
                <nav className="space-y-2 ">
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
                                            active && 'text-primary'
                                        )}
                                    />
                                    <span className="font-medium text-[15px]">{item.label}</span>
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

            {/* Bottom Section */}
            <div className="space-y-6  border-t  ">
                {/* Featured Card in Sidebar
                <div className="bg-primary p-6 rounded-3xl relative overflow-hidden group cursor-pointer hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500">
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
                */}

                <div
                    className={`mb-10 mt-5 group relative p-6 rounded-[2rem] border transition-all duration-500 cursor-pointer overflow-hidden ${activeTab === 'wallet'
                        ? 'bg-primary border-primary shadow-[0_20px_40px_rgba(255,77,0,0.2)]'
                        : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]'
                        }`}
                >
                    {/* Decorative background element */}
                    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl transition-colors duration-500 ${activeTab === 'wallet' ? 'bg-white/20' : 'bg-primary/10'
                        }`}></div>

                    <div className="relative z-10 flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                            <div className={`p-2.5 rounded-xl flex items-center justify-center transition-colors ${activeTab === 'wallet' ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                                }`}>
                                <WalletIcon size={18} />
                            </div>
                            <div className={`hidden flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${activeTab === 'wallet' ? 'bg-white/20 text-white' : 'bg-emerald-500/10 text-emerald-500'
                                }`}>
                                <TrendingUp size={10} /> +12%
                            </div>
                        </div>

                        <div className="space-y-0.5">
                            <p className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${activeTab === 'wallet' ? 'text-white/60' : 'text-zinc-500'
                                }`}>Saldo Disponível</p>
                            <h4 className={`text-2xl font-bold tracking-tighter transition-colors ${activeTab === 'wallet' ? 'text-white' : 'text-white'
                                }`}>{user.balance}</h4>
                        </div>

                        <div className={`flex items-center gap-2 text-[10px] font-bold transition-all duration-300 ${activeTab === 'wallet' ? 'text-white/90' : 'text-primary group-hover:gap-3'
                            }`}>
                            <Link className="flex gap-2" href={wallet.index()} >
                                <span>Ver Extrato</span>
                                <ArrowRight size={14} />
                            </Link>
                        </div>
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
                                    className={cn(active && 'text-primary')}
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
        </aside >
    )
}



