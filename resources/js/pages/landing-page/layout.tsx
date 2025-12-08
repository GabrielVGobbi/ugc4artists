import { ReactNode } from "react"
import { Footer } from './components/footer'
import { Header } from './components/header'

export type LayoutProps = {
    children: ReactNode
    isAuthenticated: boolean
    headerCtaHref: string
    headerCtaLabel: string
}

export function Layout({ children, isAuthenticated, headerCtaHref, headerCtaLabel }: LayoutProps) {
    return (
        <>
            <Header
                isAuthenticated={isAuthenticated}
                headerCtaHref={headerCtaHref}
                headerCtaLabel={headerCtaLabel}
            />
            <main className="bg-gradient-to-b from-orange-50/50 to-white">{children}</main>
            {/*
                <Footer />
                */}
        </>
    )
}

