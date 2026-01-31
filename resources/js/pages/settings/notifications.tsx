import HeadingSmall from '@/components/heading-small'
import { Switch } from '@/components/ui/switch'
import AppLayout from '@/layouts/app-layout'
import SettingsLayout from '@/layouts/settings/layout'
import { type BreadcrumbItem } from '@/types'
import { Transition } from '@headlessui/react'
import { Head, router } from '@inertiajs/react'
import { Bell, CreditCard, Lightbulb, Megaphone } from 'lucide-react'
import { useState } from 'react'

interface NotificationSettings {
    id: number
    new_campaigns: boolean
    payments_received: boolean
    system_updates: boolean
    performance_tips: boolean
    new_campaigns_channel: 'push' | 'email' | 'both'
    payments_channel: 'push' | 'email' | 'both'
    system_updates_channel: 'push' | 'email' | 'both'
    performance_tips_channel: 'push' | 'email' | 'both'
}

interface NotificationsProps {
    settings: NotificationSettings
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Notificações',
        href: '/app/settings/notifications',
    },
]

interface NotificationItemProps {
    title: string
    description: string
    icon: React.ComponentType<{ size?: number; className?: string }>
    channel: string
    checked: boolean
    onCheckedChange: (checked: boolean) => void
    processing?: boolean
}

const NotificationItem = ({
    title,
    description,
    icon: Icon,
    channel,
    checked,
    onCheckedChange,
    processing,
}: NotificationItemProps) => {
    const channelLabels: Record<string, string> = {
        push: 'Push',
        email: 'Email',
        both: 'Push & Email',
    }

    return (
        <div className="flex items-center justify-between p-6 lg:p-8 bg-muted/30 rounded-[1.5rem] border border-border group hover:border-primary/20 transition-all duration-300">
            <div className="flex items-center gap-4 lg:gap-6">
                <div className="w-11 h-11 lg:w-12 lg:h-12 rounded-xl bg-background flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors shadow-sm">
                    <Icon size={22} />
                </div>
                <div className="space-y-0.5">
                    <h4 className="font-bold text-foreground">{title}</h4>
                    <p className="text-xs text-muted-foreground font-medium">
                        {description}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-4 lg:gap-6">
                <span className="hidden sm:block text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground/60 transition-colors">
                    {channelLabels[channel]}
                </span>
                <Switch
                    checked={checked}
                    onCheckedChange={onCheckedChange}
                    disabled={processing}
                />
            </div>
        </div>
    )
}

export default function Notifications({ settings }: NotificationsProps) {
    const [processing, setProcessing] = useState(false)
    const [recentlySuccessful, setRecentlySuccessful] = useState(false)

    const handleToggle = (field: keyof NotificationSettings, value: boolean) => {
        setProcessing(true)

        router.patch(
            '/app/settings/notifications',
            { [field]: value },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setRecentlySuccessful(true)
                    setTimeout(() => setRecentlySuccessful(false), 2000)
                },
                onFinish: () => setProcessing(false),
            }
        )
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notificações" />

            <SettingsLayout
                title="Notificações"
                description="Alertas e Push • Configure como você deseja ser notificado"
            >
                <div className="space-y-1">
                    <div className="flex items-center justify-between">

                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm text-emerald-600 font-medium">
                                Salvo
                            </p>
                        </Transition>
                    </div>

                    <div className="space-y-3">
                        <NotificationItem
                            title="Novas Campanhas"
                            description="Avisar quando surgirem briefs do seu nicho."
                            icon={Megaphone}
                            channel={settings.new_campaigns_channel}
                            checked={settings.new_campaigns}
                            onCheckedChange={(checked) =>
                                handleToggle('new_campaigns', checked)
                            }
                            processing={processing}
                        />

                        <NotificationItem
                            title="Pagamentos Recebidos"
                            description="Confirmação de depósitos e saques concluídos."
                            icon={CreditCard}
                            channel={settings.payments_channel}
                            checked={settings.payments_received}
                            onCheckedChange={(checked) =>
                                handleToggle('payments_received', checked)
                            }
                            processing={processing}
                        />

                        <NotificationItem
                            title="Atualizações de Sistema"
                            description="Novas ferramentas e recursos da plataforma."
                            icon={Bell}
                            channel={settings.system_updates_channel}
                            checked={settings.system_updates}
                            onCheckedChange={(checked) =>
                                handleToggle('system_updates', checked)
                            }
                            processing={processing}
                        />

                        <NotificationItem
                            title="Dicas de Performance"
                            description="Conteúdos para melhorar seu engajamento."
                            icon={Lightbulb}
                            channel={settings.performance_tips_channel}
                            checked={settings.performance_tips}
                            onCheckedChange={(checked) =>
                                handleToggle('performance_tips', checked)
                            }
                            processing={processing}
                        />
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    )
}
