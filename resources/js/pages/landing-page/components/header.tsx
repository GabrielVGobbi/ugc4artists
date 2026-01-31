'use client'

import AppLogo from "@/components/app-logo"
import { Container } from "@/components/landing-page/container"
import { Button } from "@/components/ui/button"
import { dashboard, login } from "@/routes"
import { Link } from "@inertiajs/react"
import { SquareArrowUpRight } from "lucide-react"

const navLinks = [
    { label: 'Como funciona', href: '#como-funciona' },
    { label: 'Benefícios', href: '#beneficios' },
    { label: 'Para Artistas', href: '#features' },
    { label: 'Para Criadores', href: '#features' },
    { label: 'Dúvidas', href: '#FAQ' },
    { label: 'Blog (em breve)', href: '#blog' },
]

export type HeaderProps = {
    isAuthenticated: boolean
    headerCtaHref: string
    headerCtaLabel: string
}

export function Header({ isAuthenticated, headerCtaHref, headerCtaLabel }: HeaderProps) {

    return (

        <header className="sticky top-0 z-30 border-b border-white/60 backdrop-blur-lg bg-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between  py-2 ">
                <Link href="/" className="text-lg font-semibold" aria-label="ugc4artists" tabIndex={0}>
                    <AppLogo />
                </Link>

                <nav className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="transition hover:text-primary"
                            aria-label={link.label}
                            tabIndex={0}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
                <div className="flex items-center gap-3">
                    <Button
                        asChild
                        size={'none'}
                        className="bg-primary px-5 py-3 font-semibold text-white hover:bg-secondary"
                    >
                        <Link prefetch href={'/waitlist'} tabIndex={0}>
                            Cadastre-se
                            <SquareArrowUpRight />
                        </Link>
                    </Button>
                    {/*
                    <Button
                        asChild
                        variant="ghost"
                        className="text-sm font-semibold text-[#040404] hover:bg-gray-100"
                    >
                        <Link
                            href={isAuthenticated ? dashboard().url : login().url}
                            aria-label={isAuthenticated ? 'Ir para dashboard' : 'Entrar'}
                            tabIndex={0}
                        >
                            {isAuthenticated ? 'Entrar no app' : 'Entrar'}
                        </Link>
                    </Button>
                    <Button
                        asChild
                        className="bg-primary px-5 font-semibold text-white hover:bg-[#e06f00]"
                    >
                        <Link href={headerCtaHref} aria-label={headerCtaLabel} tabIndex={0}>
                            {headerCtaLabel}
                        </Link>
                    </Button>
                    */}
                </div>
            </div>
        </header>
    )
}
