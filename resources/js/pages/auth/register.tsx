import { login } from '@/routes';
//import { store } from '@/routes/register';
import { Form, Head } from '@inertiajs/react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/login';
import { ArrowRight, KeyRound, Mail, User } from 'lucide-react';

export default function Register() {
    return (
        <AuthLayout
            title="Preencha os dados"
            subtitle="The UGC for Artists"
            description=""
            type={'register'}
        >
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">

                            <div className="space-y-1">
                                <Label className="text-xs sm:text-sm md:text-base font-bold uppercase tracking-[0.15em] text-zinc-800 mb-2 block ml-1" htmlFor="name">
                                    Nome
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />

                                    <input
                                        id="name"
                                        type="text"
                                        name="name"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="name"
                                        placeholder="Nome Completo"
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-3 pl-14 text-zinc-900 font-medium outline-none ring-offset-2 focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/30 transition-all"
                                    />
                                </div>
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs sm:text-sm md:text-base font-bold uppercase tracking-[0.15em] text-zinc-800 mb-2 block ml-1" htmlFor="email">
                                    Email
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />

                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        tabIndex={2}
                                        autoComplete="email"
                                        placeholder="email@example.com"
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-3 pl-14 text-zinc-900 font-medium outline-none ring-offset-2 focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/30 transition-all"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs sm:text-sm md:text-base font-bold uppercase tracking-[0.15em] text-zinc-800 mb-2 block ml-1" htmlFor="password">
                                    Senha
                                </Label>
                                <div className="relative">
                                    <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        required
                                        tabIndex={3}
                                        autoComplete="new-password"
                                        placeholder="Senha"
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-3 pl-14 text-zinc-900 font-medium outline-none ring-offset-2 focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/30 transition-all"
                                    />
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs sm:text-sm md:text-base font-bold uppercase tracking-[0.15em] text-zinc-800 mb-2 block ml-1" htmlFor="password_confirmation">
                                    Confirmação da Senha
                                </Label>
                                <div className="relative">
                                    <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />

                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        name="password_confirmation"
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        placeholder="Confirmação da Senha"
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-3 pl-14 text-zinc-900 font-medium outline-none ring-offset-2 focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/30 transition-all"
                                    />
                                </div>
                                <InputError message={errors.password_confirmation} />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                tabIndex={5}
                                data-test="register-user-button"
                                className="cursor-pointer w-full bg-[#0A0A0A] text-white py-6 rounded-2xl font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-primary transition-all duration-500 shadow-2xl shadow-black/5 disabled:opacity-50 disabled:cursor-wait mt-4 group"
                            >
                                {processing ? (
                                    <Spinner />
                                ) : (
                                    <>
                                        Criar Conta
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
