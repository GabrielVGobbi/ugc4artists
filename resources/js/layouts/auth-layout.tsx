import AuthLayoutTemplate from '@/layouts/auth/auth-split-layout';
import { useEffect } from 'react';

export default function AuthLayout({
    children,
    title,
    description,
    subtitle,
    type,
    ...props
}: {
    children: React.ReactNode;
    title: string;
    description: string;
    subtitle?: string;
    type: 'login' | 'register';

}) {

    useEffect(() => {
        document.documentElement.classList.remove('dark')
        return () => {
            document.documentElement.classList.add('dark')
        }
    }, [])

    return (
        <AuthLayoutTemplate title={title} description={description} subtitle={subtitle} type={type} {...props}>
            {children}
        </AuthLayoutTemplate>
    );
}
