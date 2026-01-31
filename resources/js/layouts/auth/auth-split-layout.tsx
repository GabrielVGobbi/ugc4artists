import AppLogo from '@/components/app-logo';
import { home, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { type PropsWithChildren } from 'react';
import TextLink from '@/components/text-link';

interface AuthLayoutProps {
    title?: string;
    description?: string;
    subtitle?: string;
    type: 'login' | 'register';
}

export default function AuthSplitLayout({
    children,
    title,
    description,
    subtitle,
}: PropsWithChildren<AuthLayoutProps>) {
    const { name, quote, currentPath } = usePage<SharedData>().props;

    return (
        <div className="relative grid min-h-dvh lg:grid-cols-2">
            {/* Left Panel - Visual/Branding Side */}
            <div className="relative hidden lg:flex flex-col bg-foreground overflow-hidden">


                {/* Editorial Background Text - Like Admin Layout */}
                <div className="absolute top-[-5%] left-[-5%] text-[18rem] font-black text-white/[0.03] pointer-events-none select-none z-0 rotate-[-8deg] leading-none">
                    THE UGC4ARTISTS
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-32 right-32 w-16 h-16 bg-primary/10 rounded-full blur-xl" />
                <div className="absolute bottom-40 left-20 w-24 h-24 border border-white/10 rotate-45" />

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full p-10 px-20">
                    {/* Logo */}
                    <Link href={home()} className="flex items-center gap-3">
                        <img
                            src={'/assets/images/logo-white.png'}
                            alt={'logo ugc-for-artists'}
                            className={'h-full object-contain transition-opacity duration-300'}
                            decoding="async"
                            width={130}
                            height={30}
                        />

                    </Link>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col justify-center max-w-lg">
                        <div className="space-y-6">
                            <h2 className="text-4xl xl:text-6xl font-bold text-white leading-tight">
                                Conecte-se com{' '}
                                <span className="text-primary">criadores</span>{' '}
                                e transforme sua marca
                            </h2>

                            <p className="text-white/60 text-lg leading-relaxed">
                                Conectamos marcas e artistas aos criadores certos para transformar conteúdo em conexão real e conexão em performance.
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
                            <div className="absolute -left-2 top-0 text-6xl text-primary/30 font-serif">"</div>
                            <blockquote className="pl-8 border-l-2 border-primary/30">
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
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
            </div>

            {/* Right Panel - Form Side */}
            <div className="flex flex-col bg-[#FAF9F6] relative overflow-hidden">

                <div className="flex justify-between items-center static">
                     {/*
                    <button
                        className="cursor-pointer flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-black transition-colors"
                    >
                        <ArrowLeft size={14} /> Voltar para Landing Page
                    </button>

                    {/* Subtle Background Elements

                    {currentPath == 'register' && (
                        <TextLink className="cursor-pointer text-[10px] font-black uppercase tracking-[0.3em] text-primary hover:underline"
                            href={login()}>
                            Fazer Login
                        </TextLink>
                    )}

                    {currentPath == 'login' && (
                        <TextLink className="cursor-pointer text-[10px] font-black uppercase tracking-[0.3em] text-primary hover:underline"
                            href={register()}>
                            Criar conta
                        </TextLink>
                    )}
                        */}

                </div>

                {/* Subtle Background Elements */}
                <div className="absolute top-[-5%] right-[5%] text-[16rem] font-bold text-black/[0.02] pointer-events-none select-none z-0 rotate-[-5deg]">
                    UGC
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-transparent pointer-events-none z-0" />

                {/* Mobile Logo */}
                <div className="lg:hidden p-6 flex justify-center">
                    <Link href={home()}>
                        <AppLogo variant="dark" />
                    </Link>
                </div>

                {/* Form Container
                <div className="flex-1 flex items-center justify-center relative z-10">
                    <div className="w-full max-w-[400px] space-y-8">

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 bg-primary rounded-full"></span>
                                <span className="text-primary text-[10px] font-black uppercase tracking-[0.3em]">
                                    {subtitle}
                                </span>
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                                {title}
                            </h1>

                            {description && (
                                <p className="text-foreground/60 text-base leading-relaxed">
                                    {description}
                                </p>
                            )}
                        </div>

                        <div className="space-y-6">
                            {children}
                        </div>
                    </div>
                </div>
                */}
                <div className="flex-1 flex items-center justify-center relative z-10">
                    <div className="w-full max-w-[55%] space-y-8">
                        <div className="space-y-8 max-w-lg">
                            <h2 className="text-7xl font-bold text-foreground tracking-tighter leading-[1.05]">
                                A nova era do <span className="italic font-light text-zinc-500">Marketing Musical.</span>
                            </h2>
                            <p className="text-zinc-400 text-xl font-medium leading-relaxed">
                                Simplificamos a conexão entre marcas, artistas e criadores UGC para que o foco esteja no que realmente importa:
                                criar conteúdo que performa.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <button
                                className="cursor-pointer w-full bg-white border-2 border-zinc-100 py-5 rounded-[1.5rem] flex items-center justify-center gap-4 hover:border-primary hover:bg-zinc-50 transition-all duration-300 group shadow-sm disabled:opacity-50"
                            >
                                <svg className="w-6 h-6" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span className="font-black uppercase text-[11px] tracking-[0.2em] text-secondary">Entrar com Google</span>
                            </button>
                        </div>


                        <p className="text-foreground/60 text-base leading-relaxed">
                            Ao criar a conta, você concorda com todos os nossos {' '}
                            <TextLink>
                                Termos e Condições
                            </TextLink>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 text-center text-sm text-foreground/40 relative z-10">
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
        </div >
    );
}
