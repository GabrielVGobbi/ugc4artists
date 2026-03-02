import '@/layouts/app2.css'
import { type BreadcrumbItem } from '@/types'
import { type ReactNode, useEffect, useState } from 'react'
import { AdminHeader } from './admin-header'
import { AdminSidebar } from './admin-sidebar'

// ─────────────────────────────────────────────────────────────────────────────
// AdminLayoutWrapper
// ─────────────────────────────────────────────────────────────────────────────

interface AdminLayoutWrapperProps {
    children: ReactNode
    breadcrumbs?: BreadcrumbItem[]
    title?: string
}

export const AdminLayoutWrapper = ({
    children,
    breadcrumbs = [],
    title,
}: AdminLayoutWrapperProps) => {
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    const handleMobileOpen = () => setIsMobileOpen(true)
    const handleMobileClose = () => setIsMobileOpen(false)

    useEffect(() => {
        document.documentElement.classList.remove('dark')
        return () => {
            document.documentElement.classList.remove('dark')
        }
    }, [])

    return (
        /* Outer page — gray background with padding */
        <div className="h-screen w-full bg-[var(--bg-main)]    md:shadow-2xl md:border md:border-[var(--border-subtle)]  flex flex-col md:flex-row overflow-hidden transition-colors duration-200">

            {/* Sidebar */}
            <AdminSidebar
                isMobileOpen={isMobileOpen}
                onMobileClose={handleMobileClose}
            />

            {/* Main column */}
            <main className="flex-1 flex flex-col bg-[var(--bg-main)] overflow-hidden transition-colors duration-200 min-w-0">

                {/* Header */}
                <AdminHeader
                    breadcrumbs={breadcrumbs}
                    title={title}
                    onMobileMenuOpen={handleMobileOpen}
                />

                {/* Scrollable page content */}
                <div className="flex-1 overflow-y-auto adm-scrollbar">
                    {children}
                </div>
            </main>
        </div>
    )
}
