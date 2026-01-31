import { Search, Command } from 'lucide-react'
import { Link, usePage } from '@inertiajs/react'
import { getPageTitle } from '@/lib/app-constants'
import { useState, useEffect } from 'react'
import { useHeader } from '@/contexts/header-context'
import { NotificationsDropdown } from '@/components/app/notifications-dropdown'
import profile from '@/routes/app/settings/profile'

export const AppHeader = () => {
    const { url, props } = usePage()
    const { title, subtitle } = getPageTitle(url)
    const [searchQuery, setSearchQuery] = useState('')
    const { headerActions } = useHeader()

    // Get user from props (Fortify/auth)
    const user = (props.auth as any)?.user.data

    useEffect(() => {
        // Keyboard shortcut for search (Cmd+K or Ctrl+K)
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                document.getElementById('app-search')?.focus()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    return (
        <header className="py-6 grid items-center bg-transparent relative z-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">

                    <div>
                        <h2 className="text-5xl font-bold tracking-tight text-foreground capitalize">
                            {title}
                        </h2>
                        <p className="text-zinc-400 text-sm font-medium tracking-wide">
                            {subtitle}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6">

                    {/* Header Actions (botão voltar, etc) */}
                    {headerActions && (
                        <div className="flex items-center">
                            {headerActions}
                        </div>
                    )}

                    <div className="relative group hidden">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-400">
                            <Search size={18} />
                        </div>
                        <input
                            id="app-search"
                            type="text"
                            placeholder=""
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white border-none rounded-full pl-12 pr-20 py-3 w-5 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none shadow-sm focus:w-80"
                        />
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity">
                            <div className="flex items-center gap-1 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200 text-[10px] text-zinc-500 font-bold">
                                <Command size={10} />
                                <span>K</span>
                            </div>
                        </div>
                    </div>

                    {/* Notifications */}
                    <NotificationsDropdown />

                    {/* User Profile */}
                    <div className="flex items-center gap-3 pl-4 border-l border-zinc-200">
                        <div className="text-right">
                            <p className="text-sm font-bold text-foreground">
                                {user?.name || 'App User'}
                            </p>
                            <p className="text-xs text-zinc-400 font-medium italic">
                                {user?.account_type || 'App'}
                            </p>
                        </div>
                        <div className="relative group cursor-pointer">
                            <Link href={profile.edit()}>
                                <img
                                    src={
                                        user?.avatar ||
                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'App')}&background=FF4D00&color=fff&bold=true&size=100`
                                    }
                                    alt={user?.name || 'App'}
                                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white shadow-lg group-hover:ring-primary transition-all"
                                />
                            </Link>

                            <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                        </div>
                    </div>
                </div>
            </div>
        </header >
    )
}




