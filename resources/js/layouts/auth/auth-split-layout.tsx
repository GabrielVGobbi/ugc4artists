import AppLogo from '@/components/app-logo';
import { home } from '@/routes';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    const { name, quote } = usePage<SharedData>().props;

    return (
        <div className="relative grid min-h-dvh lg:grid-cols-2">
            {/* Left Panel - Visual/Branding Side */}
            <div className="relative hidden lg:flex flex-col bg-[#0A0A0A] overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0">
                    <img
                        src="/assets/landing_page/images/music.webp"
                        alt="UGC Background"
                        className="w-full h-full object-cover opacity-40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0A] via-[#0A0A0A]/80 to-[#FF4D00]/20" />
                </div>

                {/* Editorial Background Text - Like Admin Layout */}
                <div className="absolute top-[15%] left-[-5%] text-[18rem] font-black text-white/[0.03] pointer-events-none select-none z-0 rotate-[-8deg] leading-none">
                    UGC
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-20 right-20 w-32 h-32 border border-[#FF4D00]/20 rounded-full" />
                <div className="absolute top-32 right-32 w-16 h-16 bg-[#FF4D00]/10 rounded-full blur-xl" />
                <div className="absolute bottom-40 left-20 w-24 h-24 border border-white/10 rotate-45" />

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full p-10 px-15">
                    {/* Logo */}
                    <Link href={home()} className="flex items-center gap-3">
                        <AppLogo variant="white" />
                    </Link>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col justify-center max-w-lg">
                        <div className="space-y-6">
                            <h2 className="text-4xl xl:text-6xl font-bold text-white leading-tight">
                                Conecte-se com{' '}
                                <span className="text-[#FF4D00]">criadores</span>{' '}
                                e transforme sua marca
                            </h2>

                            <p className="text-white/60 text-lg leading-relaxed">
                                A plataforma que conecta marcas a criadores de conteúdo autêntico.
                                Gerencie campanhas, descubra talentos e escale sua produção de UGC.
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/10">
                            <div>
                                <div className="text-3xl font-bold text-white">500+</div>
                                <div className="text-white/50 text-sm mt-1">Criadores</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white">1.2k</div>
                                <div className="text-white/50 text-sm mt-1">Campanhas</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white">98%</div>
                                <div className="text-white/50 text-sm mt-1">Satisfação</div>
                            </div>
                        </div>
                    </div>

                    {/* Quote */}
                    {quote && (
                        <div className="relative mt-auto">
                            <div className="absolute -left-2 top-0 text-6xl text-[#FF4D00]/30 font-serif">"</div>
                            <blockquote className="pl-8 border-l-2 border-[#FF4D00]/30">
                                <p className="text-white/80 text-lg italic leading-relaxed">
                                    {quote.message}
                                </p>
                                <footer className="mt-3 text-white/50 text-sm">
                                    {quote.author}
                                </footer>
                            </blockquote>
                        </div>
                    )}
                </div>

                {/* Bottom Gradient Line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FF4D00] to-transparent" />
            </div>

            {/* Right Panel - Form Side */}
            <div className="flex flex-col bg-[#FAF9F6] relative overflow-hidden">
                {/* Subtle Background Elements */}
                <div className="absolute top-[-10%] right-[-10%] text-[16rem] font-bold text-black/[0.02] pointer-events-none select-none z-0 rotate-[-5deg]">
                    UGC
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF4D00]/[0.02] via-transparent to-transparent pointer-events-none z-0" />

                {/* Mobile Logo */}
                <div className="lg:hidden p-6 flex justify-center">
                    <Link href={home()}>
                        <AppLogo variant="dark" />
                    </Link>
                </div>

                {/* Form Container */}
                <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
                    <div className="w-full max-w-[400px] space-y-8">
                        {/* Header */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 lg:hidden">
                                <div className="w-8 h-[2px] bg-[#FF4D00]" />
                                <span className="text-[#FF4D00] text-xs font-medium tracking-wider uppercase">
                                    {name}
                                </span>
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-bold text-[#0A0A0A] tracking-tight">
                                {title}
                            </h1>

                            {description && (
                                <p className="text-[#0A0A0A]/60 text-base leading-relaxed">
                                    {description}
                                </p>
                            )}
                        </div>

                        {/* Form Content */}
                        <div className="space-y-6">
                            {children}
                        </div>

                        {/* Decorative Bottom */}
                        <div className="pt-8 flex items-center justify-center gap-4 text-sm text-[#0A0A0A]/40">
                            <span>Seguro</span>
                            <div className="w-1 h-1 rounded-full bg-[#0A0A0A]/20" />
                            <span>Rápido</span>
                            <div className="w-1 h-1 rounded-full bg-[#0A0A0A]/20" />
                            <span>Confiável</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 text-center text-sm text-[#0A0A0A]/40 relative z-10">
                    © {new Date().getFullYear()} {name}. Todos os direitos reservados.
                </div>
            </div>

            {/* Custom Scrollbar Styles */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e4e4e7;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #FF4D00;
                }
            `}</style>
        </div>
    );
}
