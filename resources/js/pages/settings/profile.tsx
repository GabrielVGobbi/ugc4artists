import DeleteUser from '@/components/delete-user'
import HeadingSmall from '@/components/heading-small'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CustomField } from '@/components/ui/custom-field'
import AppLayout from '@/layouts/app-layout'
import SettingsLayout from '@/layouts/settings/layout'
import { type BreadcrumbItem, type SharedData } from '@/types'
import { Transition } from '@headlessui/react'
import { Head, Link, router, useForm, usePage } from '@inertiajs/react'
import { Camera, Save, User } from 'lucide-react'
import { useRef, useState } from 'react'

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Perfil',
        href: '/app/settings/profile',
    },
]

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean
    status?: string
}) {
    const { auth } = usePage<SharedData>().props
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [uploadingAvatar, setUploadingAvatar] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const { data, setData, patch, processing, errors, recentlySuccessful } =
        useForm({
            name: auth.user.data.name ?? '',
            email: auth.user.data.email ?? '',
            bio: auth.user.data.bio ?? '',
        })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        patch('/app/settings/profile', {
            preserveScroll: true,
        })
    }

    const handleAvatarClick = () => {
        fileInputRef.current?.click()
    }

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Preview
        const reader = new FileReader()
        reader.onload = (e) => {
            setAvatarPreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)

        // Upload
        setUploadingAvatar(true)
        const formData = new FormData()
        formData.append('avatar', file)

        router.post('/app/settings/profile/avatar', formData, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => setUploadingAvatar(false),
        })
    }

    const avatarUrl = avatarPreview || auth.user.data.avatar

    const memberSince = auth.user.data.created_at

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Perfil" />

            <SettingsLayout
                title="Perfil"
                description="Dados e Bio • Gerencie suas informações públicas"
            >
                <div className="space-y-12">
                    {/* Avatar Section */}
                    <div className="flex items-center gap-6 lg:gap-8">
                        <div className="relative group">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt="Avatar"
                                    className="w-24 h-24 lg:w-28 lg:h-28 rounded-[1.5rem] object-cover ring-4 ring-background shadow-xl"
                                />
                            ) : (
                                <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-[1.5rem] bg-muted flex items-center justify-center ring-4 ring-background shadow-xl">
                                    <User
                                        size={40}
                                        className="text-muted-foreground"
                                    />
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={handleAvatarClick}
                                disabled={uploadingAvatar}
                                className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
                            >
                                {uploadingAvatar ? (
                                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                ) : (
                                    <Camera size={18} />
                                )}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-2xl lg:text-3xl font-bold tracking-tight">
                                {auth.user.data.name}
                            </h3>
                            <p className="text-muted-foreground font-medium">
                                {auth.user.data.email}
                            </p>
                            <div className="flex gap-2 pt-2 flex-wrap">
                                {auth.user.data.email_verified_at && (
                                    <Badge
                                        variant="default"
                                        className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-[0.5em] font-bold uppercase tracking-widest"
                                    >
                                        Verificado
                                    </Badge>
                                )}
                                <Badge
                                    variant="outline"
                                    className="text-[0.5em] font-bold uppercase tracking-widest"
                                >
                                    Membro desde {memberSince}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Profile Form */}
                    <div className="space-y-6">

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <CustomField
                                    label="Nome Público"
                                    placeholder="Seu nome"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    error={errors.name}
                                    name="name"
                                />
                                <CustomField
                                    label="E-mail Principal"
                                    placeholder="seu@email.com"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    error={errors.email}
                                    type="email"
                                    name="email"
                                />
                            </div>

                            <CustomField
                                as="textarea"
                                label="Bio"
                                placeholder="Conte um pouco sobre você e sua trajetória..."
                                value={data.bio}
                                onChange={(e) => setData('bio', e.target.value)}
                            />

                            {mustVerifyEmail &&
                                auth.user.data.email_verified_at === null && (
                                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                                        <p className="text-sm text-amber-800">
                                            Seu e-mail não está verificado.{' '}
                                            <Link
                                                href="/email/verification-notification"
                                                method="post"
                                                as="button"
                                                className="font-semibold underline underline-offset-4 hover:text-amber-900"
                                            >
                                                Clique aqui para reenviar o
                                                e-mail de verificação.
                                            </Link>
                                        </p>

                                        {status === 'verification-link-sent' && (
                                            <div className="mt-2 text-sm font-medium text-emerald-600">
                                                Um novo link de verificação foi
                                                enviado para seu e-mail.
                                            </div>
                                        )}
                                    </div>
                                )}

                            <div className="flex items-center gap-4 pt-2">
                                <Button
                                    variant={"button"}
                                    disabled={processing}
                                    className="rounded-xl font-bold"
                                    data-test="update-profile-button"
                                >
                                    Salvar Alterações
                                    <Save size={18} />
                                </Button>

                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm text-emerald-600 font-medium">
                                        Perfil atualizado
                                    </p>
                                </Transition>
                            </div>
                        </form>
                    </div>

                    {/* Delete Account */}
                    <DeleteUser />
                </div>
            </SettingsLayout>
        </AppLayout>
    )
}
