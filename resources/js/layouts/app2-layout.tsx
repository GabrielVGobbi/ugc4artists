import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { Toaster } from '@/components/ui/sonner';
import { type BreadcrumbItem } from '@/types';
import { useEffect, type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({ children, breadcrumbs, ...props }: AppLayoutProps) {
    useEffect(() => {
        document.documentElement.classList.remove('dark');
        return () => {
            document.documentElement.classList.remove('dark');
        };
    }, []);

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
            <Toaster />
        </AppLayoutTemplate>
    );
}
