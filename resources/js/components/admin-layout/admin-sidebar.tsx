import { cn } from '@/lib/utils'
import { type SharedData } from '@/types'
import { Link, router, usePage } from '@inertiajs/react'
import {
    AlertTriangle,
    ChevronDown,
    FileText,
    LayoutDashboard,
    LogOut,
    Megaphone,
    Settings,
    Users,
    Wallet,
    X,
} from 'lucide-react'
import { useState } from 'react'
import { logout } from '@/routes'
import AppLogo from '../app-logo'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface NavChild {
    id: string
    label: string
    route: string
}

interface NavItemDef {
    id: string
    label: string
    icon: React.ElementType
    route: string
    section: 'main' | 'management' | 'finance' | 'system'
    children?: NavChild[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Navigation definition
// ─────────────────────────────────────────────────────────────────────────────

const NAVIGATION: NavItemDef[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        route: '/admin',
        section: 'main',
    },
    {
        id: 'users',
        label: 'Usuários',
        icon: Users,
        route: '/admin/users',
        section: 'management',

    },
    {
        id: 'campaigns',
        label: 'Campanhas',
        icon: Megaphone,
        route: '/admin/campaigns',
        section: 'management',
        children: [
            { id: 'campaigns_pending', label: 'Pendentes', route: '/admin/campaigns?status=pending_approval' },
            { id: 'campaigns_active', label: 'Ativas', route: '/admin/campaigns?status=active' },
            { id: 'campaigns_completed', label: 'Concluídas', route: '/admin/campaigns?status=completed' },
        ],
    },
    {
        id: 'payments',
        label: 'Pagamentos',
        icon: Wallet,
        route: '/admin/payments',
        section: 'finance',
    },
    {
        id: 'disputes',
        label: 'Disputas',
        icon: AlertTriangle,
        route: '/admin/disputes',
        section: 'finance',
    },
    {
        id: 'logs',
        label: 'Logs & Auditoria',
        icon: FileText,
        route: '/admin/logs',
        section: 'system',
    },
]

const SECTIONS = [
    { key: 'main', label: 'Principal' },
    { key: 'management', label: 'Gestão' },
    { key: 'finance', label: 'Financeiro' },
    { key: 'system', label: 'Sistema' },
] as const

// ─────────────────────────────────────────────────────────────────────────────
// NavItem component
// ─────────────────────────────────────────────────────────────────────────────

interface NavItemProps {
    item: NavItemDef
    currentUrl: string
    openMenus: Record<string, boolean>
    onToggle: (id: string) => void
}

const NavItem = ({ item, currentUrl, openMenus, onToggle }: NavItemProps) => {
    const Icon = item.icon
    const isOpen = openMenus[item.id] ?? false
    const isActive = item.route === '/admin'
        ? (currentUrl === '/admin' || currentUrl === '/admin/')
        : currentUrl.startsWith(item.route)

    if (item.children) {
        return (
            <div>
                <button
                    type="button"
                    onClick={() => onToggle(item.id)}
                    className={cn(
                        'cursor-pointer w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-colors duration-150',
                        isOpen || isActive
                            ? 'text-[var(--text-sidebar)] bg-[var(--bg-hover)]'
                            : 'text-[var(--text-sidebar)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]',
                    )}
                    aria-expanded={isOpen}
                >
                    <div className="flex items-center gap-3">
                        <Icon
                            size={18}
                            className={isOpen || isActive ? 'text-[#ff7900]' : ''}
                        />
                        {item.label}
                    </div>
                    <ChevronDown
                        size={16}
                        className={cn(
                            'transform transition-transform duration-200',
                            isOpen ? 'rotate-180' : '',
                        )}
                    />
                </button>
                {isOpen && (
                    <div className="pl-11 pr-3 py-1 space-y-0.5">
                        {item.children.map((child) => (
                            <Link
                                key={child.id}
                                href={child.route}
                                className="block px-3 py-2 text-sm text-[var(--text-sidebar)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors duration-150"
                            >
                                {child.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <Link
            href={item.route}
            className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors duration-150',
                isActive
                    ? 'bg-[#ff7900] text-white shadow-sm'
                    : 'text-[var(--text-sidebar)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]',
            )}
        >
            <Icon size={18} className={isActive ? 'text-white' : ''} />
            {item.label}
        </Link>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// AdminSidebar
// ─────────────────────────────────────────────────────────────────────────────

interface AdminSidebarProps {
    isMobileOpen?: boolean
    onMobileClose?: () => void
}

export const AdminSidebar = ({ isMobileOpen = false, onMobileClose }: AdminSidebarProps) => {
    const { url, props } = usePage<SharedData>()
    const user = props.auth?.user?.data ?? null

    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
        users: false,
        campaigns: false,
    })

    const handleToggle = (menuId: string) => {
        setOpenMenus((prev) => ({ ...prev, [menuId]: !prev[menuId] }))
    }

    const handleLogout = () => router.post(logout().url)

    const sidebarContent = (
        <>
            {/* Logo */}
            <div className="px-4 flex items-center justify-between shrink-0">
                <Link href="/admin" className="flex items-center gap-2">
                    <AppLogo></AppLogo>
                    CRM
                </Link>
                {onMobileClose && (
                    <button
                        type="button"
                        onClick={onMobileClose}
                        className="md:hidden text-[var(--text-sidebar)] hover:text-[var(--text-primary)] transition-colors"
                        aria-label="Fechar menu"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Navigation — scrollable */}
            <nav className="flex-1 px-4 space-y-0.5 overflow-y-auto pb-4 adm-scrollbar">
                {SECTIONS.map((section) => {
                    const items = NAVIGATION.filter((n) => n.section === section.key)
                    if (items.length === 0) return null
                    return (
                        <div key={section.key}>
                            <div className="px-3 pt-5 pb-2">
                                <span className="text-[10px] font-semibold text-[var(--text-sidebar)] uppercase tracking-widest">
                                    {section.label}
                                </span>
                            </div>
                            <div className="space-y-0.5">
                                {items.map((item) => (
                                    <NavItem
                                        key={item.id}
                                        item={item}
                                        currentUrl={url}
                                        openMenus={openMenus}
                                        onToggle={handleToggle}
                                    />
                                ))}
                            </div>
                        </div>
                    )
                })}
            </nav>

            {/* Bottom actions — fixed */}
            <div className="p-4 space-y-4 shrink-0 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] transition-colors duration-200">
                <div className="space-y-0.5">
                    <Link
                        href="/settings/profile"
                        className="flex items-center gap-3 px-3 py-2 text-[var(--text-sidebar)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] rounded-xl font-medium text-sm transition-colors"
                    >
                        <Settings size={16} />
                        Configurações
                    </Link>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="cursor-pointer w-full flex items-center gap-3 px-3 py-2 text-[#ef4444] hover:bg-[#ef4444]/10 rounded-xl font-medium text-sm transition-colors"
                    >
                        <LogOut size={16} />
                        Sair
                    </button>
                </div>

                {/* User profile */}
                {user && (
                    <div className="flex items-center gap-3 pt-4 border-t border-[var(--border-subtle)]">
                        <img
                            src={user.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=ff7900&color=fff&size=64`}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            referrerPolicy="no-referrer"
                        />
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-[var(--text-primary)] truncate">
                                {user.name}
                            </span>
                            <span className="text-[10px] text-[var(--text-sidebar)] truncate">
                                Admin
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </>
    )

    return (
        <>
            {/* Desktop sidebar */}
            <aside className="hidden md:flex w-64 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex-col h-full shrink-0 transition-colors duration-200">
                {sidebarContent}
            </aside>

            {/* Mobile overlay */}
            {isMobileOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    onClick={onMobileClose}
                    aria-hidden="true"
                />
            )}

            {/* Mobile drawer */}
            <aside
                className={cn(
                    'md:hidden fixed left-0 top-0 h-full w-72 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex flex-col z-50 transform transition-transform duration-300 ease-out',
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full',
                )}
                aria-label="Menu de navegação admin"
            >
                {sidebarContent}
            </aside>
        </>
    )
}
