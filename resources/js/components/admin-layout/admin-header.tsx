import { type BreadcrumbItem, type SharedData } from '@/types'
import { router, usePage } from '@inertiajs/react'
import { Bell, Menu, Search } from 'lucide-react'
import { useState } from 'react'
import { logout } from '@/routes'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const getPageMeta = (breadcrumbs: BreadcrumbItem[]) => {
    if (breadcrumbs.length === 0) {
        return { title: 'Dashboard', subtitle: 'Visão geral da plataforma UGC4Artists.' }
    }

    const last = breadcrumbs[breadcrumbs.length - 1]
    const subtitleMap: Record<string, string> = {
        Dashboard: 'Visão geral da plataforma UGC4Artists.',
        Campanhas: 'Gerencie e modere as campanhas da plataforma.',
        Usuários: 'Gerencie os usuários da plataforma.',
        Pagamentos: 'Acompanhe as transações e pagamentos.',
        Disputas: 'Resolva conflitos e disputas abertas.',
        'Logs & Auditoria': 'Registros de atividade e auditoria do sistema.',
    }

    return {
        title: last.title,
        subtitle: subtitleMap[last.title] ?? `Gerenciamento de ${last.title.toLowerCase()}.`,
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// AdminHeader
// ─────────────────────────────────────────────────────────────────────────────

interface AdminHeaderProps {
    breadcrumbs?: BreadcrumbItem[]
    title?: string
    onMobileMenuOpen: () => void
}

export const AdminHeader = ({ breadcrumbs = [], title: pageTitle, onMobileMenuOpen }: AdminHeaderProps) => {
    const { props } = usePage<SharedData>()
    const user = props.auth?.user?.data ?? null
    const { title, subtitle } = getPageMeta(breadcrumbs)
    const [hasNotification] = useState(true)

    // Use pageTitle if provided, otherwise use the title from breadcrumbs, fallback to 'Dashboard'
    const displayTitle = pageTitle || title || 'Dashboard'

    const handleLogout = () => router.post(logout().url)

    return (
        <header className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 md:px-8 bg-[var(--bg-main)] border-b border-[var(--border-subtle)] z-10 transition-colors duration-200">
            <div className="flex items-center gap-4">
                {/* Hamburger — mobile only */}
                <button
                    type="button"
                    onClick={onMobileMenuOpen}
                    className="md:hidden p-2 -ml-1 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] transition-colors"
                    aria-label="Abrir menu de navegação"
                    tabIndex={0}
                >
                    <Menu size={22} />
                </button>

                {/* Page title + subtitle */}

                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                        Painel administrativo
                    </p>
                    <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900">
                        {displayTitle}
                    </h1>
                </div>

                <div className='hidden'>
                    <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
                        {title}
                    </h1>
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5 font-light hidden sm:block">
                        {subtitle}
                    </p>
                </div>
            </div>

            {/* Right actions */}
            <div className="flex gap-4 items-end">
                {/* Bell notification */}
                <div className="relative">
                    <button
                        type="button"
                        className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
                        aria-label="Notificações"
                        tabIndex={0}
                    >
                        <Bell size={20} />
                    </button>
                    {hasNotification && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#ef4444] rounded-full border-2 border-[var(--bg-main)]" />
                    )}
                </div>

                {/* Search input — hidden on small mobile
                <div className="relative hidden sm:block ">
                    <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none"
                    />
                    <input
                        type="text"
                        placeholder="Buscar campanhas, usuários..."
                        className="pl-9 pr-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-full text-sm text-[var(--text-primary)] w-56 lg:w-72 focus:outline-none focus:border-[#ff7900] transition-colors placeholder:text-[var(--text-secondary)]"
                        aria-label="Buscar na plataforma"
                    />
                </div>
                */}

                {/* User avatar with dropdown (desktop) */}
                {user && (
                    <div className="relative group">
                        <button
                            type="button"
                            className="flex items-center gap-2 cursor-pointer"
                            aria-label="Menu do usuário"
                            tabIndex={0}
                        >
                            <img
                                src={user.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=ff7900&color=fff&size=64`}
                                alt={user.name}
                                className="w-8 h-8 rounded-full object-cover"
                                referrerPolicy="no-referrer"
                            />
                        </button>

                        {/* Dropdown */}
                        <div className="absolute right-0 top-10 w-48 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-lg opacity-0 invisible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-150 z-50 p-1">
                            <div className="px-3 py-2 border-b border-[var(--border-subtle)] mb-1">
                                <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                                    {user.name}
                                </p>
                                <p className="text-[11px] text-[var(--text-secondary)] truncate">
                                    {user.email}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#ef4444] hover:bg-[#ef4444]/10 rounded-xl transition-colors"
                            >
                                Sair
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    )
}
