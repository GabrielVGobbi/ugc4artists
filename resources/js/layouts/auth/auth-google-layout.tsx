import AppLogo from '@/components/app-logo';
import { home } from '@/routes';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, useEffect } from 'react';

export default function AuthGoogleLayout({
    children,
}: PropsWithChildren) {
    const { name, quote } = usePage<SharedData>().props;

    useEffect(() => {
        document.documentElement.classList.remove('dark')
        return () => {
            document.documentElement.classList.add('dark')
        }
    }, [])

    return (
        <div className="relative grid min-h-dvh lg:grid-cols-2">
            {/* Left Panel - Visual/Branding Side */}
            <div className="relative hidden lg:flex flex-col bg-foreground overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground/80 to-primary/20" />
                </div>

                {/* Editorial Background Text - Like Admin Layout */}
                <div className="absolute top-[-5%] left-[-5%] text-[18rem] font-black text-white/[0.03] pointer-events-none select-none z-0 rotate-[-8deg] leading-none">
                    THE UGC4ARTISTS
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-32 right-32 w-16 h-16 bg-primary/10 rounded-full blur-xl" />
                <div className="absolute bottom-40 left-20 w-24 h-24 border border-white/10 rotate-45" />

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full pt-8 px-20">
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
                        <div className="space-y-3">
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
                        <div className="hidden relative mt-auto">
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
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
            </div>

            <div className="flex flex-col bg-[#FAF9F6] relative overflow-hidden">

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

                <div className="flex-1 flex items-center justify-center relative z-10">
                    <div className="w-full max-w-[55%] space-y-8">
                        <div className="space-y-8 max-w-lg">
                            <h2 className="text-7xl md:text-5xl font-bold text-foreground tracking-tighter leading-[1.05]">
                                A nova era do <span className="italic font-light text-zinc-500">Marketing Musical.</span>
                            </h2>
                            <p className="text-zinc-400 text-xl font-medium leading-relaxed">
                                Simplificamos a conexão entre marcas, artistas e criadores UGC para que o foco esteja no que realmente importa:
                                criar conteúdo que performa.
                            </p>
                        </div>

                        {children}

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
