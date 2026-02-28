import { AdminLayoutWrapper } from '@/components/admin-layout'
import { Toaster } from '@/components/ui/sonner'
import { type BreadcrumbItem } from '@/types'
import { type ReactNode } from 'react'

interface AppLayoutProps {
    children: ReactNode
    breadcrumbs?: BreadcrumbItem[]
}

export default function AppLayout({ children, breadcrumbs, ...props }: AppLayoutProps) {
    return (
        <AdminLayoutWrapper breadcrumbs={breadcrumbs} {...props}>
            {children}
            <Toaster />
        </AdminLayoutWrapper>
    )
}
