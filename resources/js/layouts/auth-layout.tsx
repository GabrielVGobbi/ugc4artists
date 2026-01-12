import AuthLayoutTemplate from '@/layouts/auth/auth-split-layout';
import { useEffect } from 'react';

export default function AuthLayout({
    children,
    title,
    description,
    ...props
}: {
    children: React.ReactNode;
    title: string;
    description: string;
}) {

    useEffect(() => {
        document.documentElement.classList.remove('dark')
        return () => {
            document.documentElement.classList.add('dark')
        }
    }, [])

    return (
        <AuthLayoutTemplate title={title} description={description} {...props}>
            {children}
        </AuthLayoutTemplate>
    );
}
