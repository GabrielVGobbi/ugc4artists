import AuthLayout from '@/layouts/auth-layout';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Spinner } from '@/components/ui/spinner';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { ArrowRight, KeyRound, User } from 'lucide-react';
import { store } from '@/routes/login';
import { register } from '@/routes';

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
    return (
        <AuthLayout
            title="Login para entrar no Studio"
            subtitle="Bem vindo de volta"
            description=""
            type={'login'}
        >
            <Head title="Log in" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">

                            <div className="space-y-1">
                                <label className="text-xs sm:text-sm md:text-base font-bold uppercase tracking-[0.15em] text-zinc-800 mb-2 block ml-1">Email</label>
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
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-3 pl-14 text-zinc-900 font-medium outline-none ring-offset-2 focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/30 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center">
                                    <label className="text-xs sm:text-sm md:text-base font-bold uppercase tracking-[0.15em] text-zinc-800 mb-2 block ml-1">Senha</label>
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
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-3 pl-14 text-zinc-900 font-medium outline-none ring-offset-2 focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/30 transition-all"
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
                                className="cursor-pointer w-full bg-secondary text-white py-6 rounded-2xl font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-primary transition-all duration-500 shadow-2xl shadow-black/5 disabled:opacity-50 disabled:cursor-wait mt-4 group"
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
