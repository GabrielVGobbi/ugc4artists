import AuthLayout from '@/layouts/auth-layout';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Spinner } from '@/components/ui/spinner';
import { request } from '@/routes/password';
import { Form, Head, Link } from '@inertiajs/react';
import { ArrowRight, KeyRound, User } from 'lucide-react';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { useState } from 'react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleGoogleLogin = () => {
        setIsLoading(true)
        // OAuth redirect precisa ser navegação completa, não AJAX
        window.location.href = '/auth/redirect'
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleGoogleLogin()
        }
    }

    return (
        <AuthLayout
            title="Login para entrar no Studio"
            subtitle="Bem vindo de volta"
            description=""
            type={'login'}
        >
            <Head title="Log in" />

            <Form
                action={store.url()}
                method="post"
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">

                            <div className="space-y-1">
                                <label className="text-xs sm:text-sm font-bold uppercase tracking-[0.15em] text-zinc-800 mb-2 block ml-1">Email</label>
                                <div className="relative">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="email@example.com"
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-2 pl-14 text-zinc-900 font-medium outline-none ring-offset-2 focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/30 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center">
                                    <label className="text-xs sm:text-sm font-bold uppercase tracking-[0.15em] text-zinc-800 mb-2 block ml-1">Senha</label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm"
                                            tabIndex={5}
                                        >
                                            Esqueceu sua senha?
                                        </TextLink>
                                    )}
                                </div>

                                <div className="relative">
                                    <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="password"
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-2 pl-14 text-zinc-900 font-medium outline-none ring-offset-2 focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/30 transition-all"
                                    />
                                    <InputError message={errors.password} />

                                </div>
                            </div>

                            {/*
                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember">Lembrar-me</Label>
                            </div>
                            */}

                            <button
                                type="submit"
                                disabled={processing}
                                tabIndex={4}
                                data-test="login-button"
                                className="cursor-pointer w-full bg-secondary text-white py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-primary transition-all duration-500 shadow-2xl shadow-black/5 disabled:opacity-50 disabled:cursor-wait mt-4 group"
                            >
                                {processing ? (
                                    <Spinner />
                                ) : (
                                    <>
                                        Logar
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>


                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                onKeyDown={handleKeyDown}
                                disabled={isLoading}
                                tabIndex={0}
                                aria-label="Entrar com Google"
                                className="cursor-pointer w-full bg-white border-2 border-zinc-100 py-4 rounded-[1.5rem] flex items-center justify-center gap-4 hover:border-primary hover:bg-zinc-50 transition-all duration-300 group shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        <span className="font-black uppercase text-[11px] tracking-[0.2em] text-secondary">
                                            Conectando...
                                        </span>
                                    </div>
                                ) : (
                                    <>
                                        <svg className="w-6 h-6" viewBox="0 0 24 24" aria-hidden="true">
                                            <path
                                                fill="#4285F4"
                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            />
                                            <path
                                                fill="#34A853"
                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            />
                                            <path
                                                fill="#FBBC05"
                                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                            />
                                            <path
                                                fill="#EA4335"
                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            />
                                        </svg>
                                        <span className="font-black uppercase text-[11px] tracking-[0.2em] text-secondary">
                                            Entrar com Google
                                        </span>
                                    </>
                                )}
                            </button>

                        </div>

                        {canRegister && (
                            <div className="text-center text-sm text-muted-foreground">
                                Não tem uma conta?{' '}
                                <TextLink href={register()} tabIndex={5}>
                                    Criar conta
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
