import Heading from '@/components/heading'
import { cn, isSameUrl } from '@/lib/utils'
import { Link, router } from '@inertiajs/react'
import {
    ArrowRight,
    Bell,
    ChevronRight,
    Lock,
    LogOut,
    MapPin,
    User,
} from 'lucide-react'
import { type PropsWithChildren } from 'react'

interface SettingsNavItem {
    id: string
    title: string
    description: string
    href: string
    icon: React.ComponentType<{ size?: number; className?: string }>
}

const sidebarNavItems: SettingsNavItem[] = [
    {
        id: 'profile',
        title: 'Perfil',
        description: 'Dados e Bio',
        href: '/app/settings/profile',
        icon: User,
    },
    {
        id: 'notifications',
        title: 'Notificações',
        description: 'Alertas e Push',
        href: '/app/settings/notifications',
        icon: Bell,
    },
    {
        id: 'address',
        title: 'Endereço',
        description: 'Faturamento',
        href: '/app/settings/address',
        icon: MapPin,
    },
    {
        id: 'security',
        title: 'Segurança',
        description: 'Senha e Acesso',
        href: '/app/settings/security',
        icon: Lock,
    },
]

interface SettingsLayoutProps extends PropsWithChildren {
    title?: string
    description?: string
}

export default function SettingsLayout({
    children,
    title,
    description,
}: SettingsLayoutProps) {
    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null
    }

    const currentPath = window.location.pathname

    const handleLogout = () => {
        router.post('/logout')
    }

    // Find current tab for background watermark
    const currentTab = sidebarNavItems.find((item) =>
        isSameUrl(currentPath, item.href)
    )

    return (
        <div className="px-4 py-6 animate-in fade-in duration-500">


            <div className="grid grid-cols-12 gap-8 lg:gap-12">
                {/* Sidebar */}
                <aside className="col-span-12 lg:col-span-3 space-y-4">
                    <div className="bg-card rounded-[2rem] border border-border p-5 shadow-sm overflow-hidden">
                        <div className="space-y-1 mb-5 px-3 pt-3">
                            <h4 className="text-2xl font-bold tracking-tight">
                                Ajustes
                            </h4>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-none">
                                Configurações Gerais
                            </p>
                        </div>

                        <nav className="space-y-1">
                            {sidebarNavItems.map((item) => {
                                const isActive = isSameUrl(currentPath, item.href)
                                const IconComponent = item.icon

                                return (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        className={cn(
                                            'w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group',
                                            isActive
                                                ? 'bg-foreground text-background shadow-xl shadow-black/10'
                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
                                                isActive
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted text-muted-foreground group-hover:bg-background'
                                            )}
                                        >
                                            <IconComponent size={20} />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="text-sm font-bold">
                                                {item.title}
                                            </p>
                                            <p
                                                className={cn(
                                                    'text-[9px] font-bold uppercase tracking-widest',
                                                    isActive
                                                        ? 'text-muted-foreground'
                                                        : 'text-muted-foreground/60'
                                                )}
                                            >
                                                {item.description}
                                            </p>
                                        </div>
                                        {isActive && (
                                            <ChevronRight
                                                size={16}
                                                className="text-muted-foreground"
                                            />
                                        )}
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="cursor-pointer w-full p-6 bg-muted/50 border border-border rounded-[2rem] flex items-center justify-between group hover:bg-destructive/10 hover:border-destructive/20 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-background rounded-xl flex items-center justify-center text-muted-foreground group-hover:text-destructive transition-colors">
                                <LogOut size={20} />
                            </div>
                            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground group-hover:text-destructive">
                                Sair da Conta
                            </p>
                        </div>
                        <ArrowRight
                            size={18}
                            className="text-muted-foreground/30 group-hover:text-destructive transition-colors"
                        />
                    </button>
                </aside>

                {/* Content Area */}
                <main className="col-span-12 lg:col-span-9">
                    <div className="bg-card rounded-[2.5rem] p-10 lg:p-12 border border-border shadow-sm min-h-[650px] flex flex-col relative overflow-hidden">
                        {/* Background Watermark */}
                        <div className="absolute top-[-10%] right-[-10%] text-[18rem] font-bold text-black/[0.015] pointer-events-none select-none italic rotate-[-15deg] z-0">
                            {currentTab?.title.toUpperCase() || 'SETTINGS'}
                        </div>

                        {/* Header */}
                        {title && (
                            <div className="flex justify-between items-start mb-10 relative z-10">
                                <div className="space-y-1">
                                    <h3 className="text-3xl font-bold tracking-tight">
                                        {title}
                                    </h3>
                                    {description && (
                                        <p className="text-sm font-medium text-muted-foreground">
                                            {description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 relative z-10">
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                {children}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
