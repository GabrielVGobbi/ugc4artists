import { Search, Bell, Command, ArrowLeft } from 'lucide-react'
import { router, usePage } from '@inertiajs/react'
import { getPageTitle } from '@/lib/app-constants'
import { useState, useEffect } from 'react'
import { Button } from '../ui/button'

export const AppHeader = () => {
    const { url, props } = usePage()
    const { title, subtitle } = getPageTitle(url)
    const [searchQuery, setSearchQuery] = useState('')

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
        <header className="px-10 py-6 grid items-center  bg-transparent relative z-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-5xl font-bold tracking-tight text-[#0A0A0A] capitalize">
                        {title}
                    </h2>
                    <p className="text-zinc-400 text-sm font-medium tracking-wide">
                        {subtitle}
                    </p>
                </div>

                {/* todo: adicionar dinamicamente nas telas */}
                <div className=" items-center justify-between hidden">
                    <Button
                        size={'none'} variant={'none'}
                        className="group flex items-center gap-3 text-zinc-500 hover:text-[#0A0A0A] transition-all font-black uppercase text-[10px] tracking-[0.3em]"
                    >
                        <div className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center group-hover:border-[#0A0A0A] transition-colors">
                            <ArrowLeft size={16} />
                        </div>
                        Voltar para Carteira
                    </Button>
                </div>

                <div className="flex items-center gap-6">

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
                    <Button size={'none'} variant={'none'} className="relative p-3 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-zinc-600 hover:text-primary group">
                        <Bell size={20} />
                        <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full border-2 border-white animate-pulse"></span>
                        <span className="sr-only">Notificações</span>
                    </Button>

                    {/* User Profile */}
                    <div className="flex items-center gap-3 pl-4 border-l border-zinc-200">
                        <div className="text-right">
                            <p className="text-sm font-bold text-[#0A0A0A]">
                                {user?.name || 'App User'}
                            </p>
                            <p className="text-xs text-zinc-400 font-medium italic">
                                {user?.account_type || 'App'}
                            </p>
                        </div>
                        <div className="relative group cursor-pointer">
                            <img
                                src={
                                    user?.avatar ||
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'App')}&background=FF4D00&color=fff&bold=true&size=100`
                                }
                                alt={user?.name || 'App'}
                                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white shadow-lg group-hover:ring-primary transition-all"
                            />
                            <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}




