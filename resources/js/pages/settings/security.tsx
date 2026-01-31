import HeadingSmall from '@/components/heading-small'
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes'
import TwoFactorSetupModal from '@/components/two-factor-setup-modal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CustomField } from '@/components/ui/custom-field'
import { Separator } from '@/components/ui/separator'
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth'
import AppLayout from '@/layouts/app-layout'
import SettingsLayout from '@/layouts/settings/layout'
import { type BreadcrumbItem } from '@/types'
import { Transition } from '@headlessui/react'
import { Head, router, useForm } from '@inertiajs/react'
import { Save, ShieldBan, ShieldCheck, Smartphone } from 'lucide-react'
import { useState } from 'react'

interface SecurityProps {
    requiresConfirmation?: boolean
    twoFactorEnabled?: boolean
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Segurança',
        href: '/app/settings/security',
    },
]

export default function Security({
    requiresConfirmation = false,
    twoFactorEnabled = false,
}: SecurityProps) {
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false)
    const [enabling2FA, setEnabling2FA] = useState(false)
    const [disabling2FA, setDisabling2FA] = useState(false)

    const {
        data,
        setData,
        put,
        processing,
        errors,
        recentlySuccessful,
        reset,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    })

    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors: twoFactorErrors,
    } = useTwoFactorAuth()

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        put('/app/settings/password', {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: () => reset('password', 'password_confirmation'),
        })
    }

    const handleEnable2FA = () => {
        setEnabling2FA(true)
        router.post(
            '/user/two-factor-authentication',
            {},
            {
                preserveScroll: true,
                onSuccess: () => setShowSetupModal(true),
                onFinish: () => setEnabling2FA(false),
            }
        )
    }

    const handleDisable2FA = () => {
        setDisabling2FA(true)
        router.delete('/user/two-factor-authentication', {
            preserveScroll: true,
            onFinish: () => setDisabling2FA(false),
        })
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Segurança" />

            <SettingsLayout
                title="Segurança"
                description="Senha e Acesso • Proteja sua conta com senha forte e 2FA"
            >
                <div className="space-y-10">
                    {/* Password Section */}
                    <div className="space-y-6">

                        <form
                            onSubmit={handlePasswordSubmit}
                            className="space-y-5"
                        >
                            <CustomField
                                label="Senha Atual"
                                type="password"
                                placeholder="Digite sua senha atual"
                                value={data.current_password}
                                onChange={(e) =>
                                    setData('current_password', e.target.value)
                                }
                                error={errors.current_password}
                                name="current_password"
                                autoComplete="current-password"
                            />

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                <CustomField
                                    label="Nova Senha"
                                    type="password"
                                    placeholder="Digite a nova senha"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    error={errors.password}
                                    name="password"
                                    autoComplete="new-password"
                                />

                                <CustomField
                                    label="Confirmar Senha"
                                    type="password"
                                    placeholder="Confirme a nova senha"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            'password_confirmation',
                                            e.target.value
                                        )
                                    }
                                    error={errors.password_confirmation}
                                    name="password_confirmation"
                                    autoComplete="new-password"
                                />
                            </div>

                            <div className="flex items-center gap-4 pt-2">
                                <Button
                                    disabled={processing}
                                    className="px-8 py-6 rounded-xl font-bold"
                                >
                                    <Save size={18} />
                                    Salvar Senha
                                </Button>

                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm text-emerald-600 font-medium">
                                        Senha atualizada
                                    </p>
                                </Transition>
                            </div>
                        </form>
                    </div>

                    <Separator />

                    {/* 2FA Section */}
                    <div className="space-y-6">
                        <HeadingSmall
                            title="Autenticação em Duas Etapas"
                            description="Adicione uma camada extra de segurança à sua conta"
                        />

                        <div className="p-6 lg:p-8 bg-foreground rounded-[1.5rem] text-background">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4 lg:gap-6">
                                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                                        <Smartphone
                                            size={26}
                                            className="text-primary"
                                        />
                                    </div>
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-bold text-lg">
                                                Autenticação 2FA
                                            </p>
                                            {twoFactorEnabled ? (
                                                <Badge
                                                    variant="default"
                                                    className="bg-emerald-500 text-white"
                                                >
                                                    Ativado
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">
                                                    Desativado
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm opacity-70">
                                            {twoFactorEnabled
                                                ? 'Sua conta está protegida com autenticação em duas etapas.'
                                                : 'Mais segurança para seus saques e dados.'}
                                        </p>
                                    </div>
                                </div>

                                {twoFactorEnabled ? (
                                    <Button
                                        variant="destructive"
                                        type="button"
                                        disabled={disabling2FA}
                                        onClick={handleDisable2FA}
                                        className="px-6 py-5 rounded-xl font-bold"
                                    >
                                        <ShieldBan size={18} />
                                        Desativar
                                    </Button>
                                ) : hasSetupData ? (
                                    <Button
                                        variant="secondary"
                                        onClick={() => setShowSetupModal(true)}
                                        className="px-6 py-5 rounded-xl font-bold"
                                    >
                                        <ShieldCheck size={18} />
                                        Continuar Configuração
                                    </Button>
                                ) : (
                                    <Button
                                        variant="secondary"
                                        type="button"
                                        disabled={enabling2FA}
                                        onClick={handleEnable2FA}
                                        className="px-6 py-5 rounded-xl font-bold"
                                    >
                                        <ShieldCheck size={18} />
                                        Ativar 2FA
                                    </Button>
                                )}
                            </div>
                        </div>

                        {twoFactorEnabled && (
                            <TwoFactorRecoveryCodes
                                recoveryCodesList={recoveryCodesList}
                                fetchRecoveryCodes={fetchRecoveryCodes}
                                errors={twoFactorErrors}
                            />
                        )}
                    </div>

                    <TwoFactorSetupModal
                        isOpen={showSetupModal}
                        onClose={() => setShowSetupModal(false)}
                        requiresConfirmation={requiresConfirmation}
                        twoFactorEnabled={twoFactorEnabled}
                        qrCodeSvg={qrCodeSvg}
                        manualSetupKey={manualSetupKey}
                        clearSetupData={clearSetupData}
                        fetchSetupData={fetchSetupData}
                        errors={twoFactorErrors}
                    />
                </div>
            </SettingsLayout>
        </AppLayout>
    )
}
