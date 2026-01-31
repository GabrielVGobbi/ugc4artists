import HeadingSmall from '@/components/heading-small'
import { Button } from '@/components/ui/button'
import { CustomField } from '@/components/ui/custom-field'
import AppLayout from '@/layouts/app-layout'
import SettingsLayout from '@/layouts/settings/layout'
import { type BreadcrumbItem } from '@/types'
import { Transition } from '@headlessui/react'
import { Head, useForm } from '@inertiajs/react'
import { AlertCircle, Save } from 'lucide-react'

interface Address {
    id?: number
    street: string
    number: string
    complement: string
    neighborhood: string
    city: string
    state: string
    zipcode: string
    country: string
}

interface AddressProps {
    address: Address | null
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Endereço',
        href: '/app/settings/address',
    },
]

const BRAZILIAN_STATES = [
    { value: 'AC', label: 'Acre' },
    { value: 'AL', label: 'Alagoas' },
    { value: 'AP', label: 'Amapá' },
    { value: 'AM', label: 'Amazonas' },
    { value: 'BA', label: 'Bahia' },
    { value: 'CE', label: 'Ceará' },
    { value: 'DF', label: 'Distrito Federal' },
    { value: 'ES', label: 'Espírito Santo' },
    { value: 'GO', label: 'Goiás' },
    { value: 'MA', label: 'Maranhão' },
    { value: 'MT', label: 'Mato Grosso' },
    { value: 'MS', label: 'Mato Grosso do Sul' },
    { value: 'MG', label: 'Minas Gerais' },
    { value: 'PA', label: 'Pará' },
    { value: 'PB', label: 'Paraíba' },
    { value: 'PR', label: 'Paraná' },
    { value: 'PE', label: 'Pernambuco' },
    { value: 'PI', label: 'Piauí' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    { value: 'RN', label: 'Rio Grande do Norte' },
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'RO', label: 'Rondônia' },
    { value: 'RR', label: 'Roraima' },
    { value: 'SC', label: 'Santa Catarina' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'SE', label: 'Sergipe' },
    { value: 'TO', label: 'Tocantins' },
]

export default function Address({ address }: AddressProps) {
    const { data, setData, patch, processing, errors, recentlySuccessful } =
        useForm({
            street: address?.street ?? '',
            number: address?.number ?? '',
            complement: address?.complement ?? '',
            neighborhood: address?.neighborhood ?? '',
            city: address?.city ?? '',
            state: address?.state ?? '',
            zipcode: address?.zipcode ?? '',
            country: address?.country ?? 'Brasil',
        })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        patch('/app/settings/address', {
            preserveScroll: true,
        })
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Endereço" />

            <SettingsLayout
                title="Endereço"
                description="Faturamento • Configure seu endereço de cobrança"
            >
                <div className="space-y-10">
                    {/* Address Section */}
                    <div className="space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-12 gap-4 lg:gap-6">
                                <div className="col-span-6 lg:col-span-4">
                                    <CustomField
                                        label="CEP"
                                        placeholder="00000-000"
                                        value={data.zipcode}
                                        onChange={(e) =>
                                            setData('zipcode', e.target.value)
                                        }
                                        error={errors.zipcode}
                                        maxLength={9}
                                    />
                                </div>

                                <div className="col-span-12 lg:col-span-8">
                                    <CustomField
                                        label="Logradouro"
                                        placeholder="Av. Paulista, 1000"
                                        value={data.street}
                                        onChange={(e) =>
                                            setData('street', e.target.value)
                                        }
                                        error={errors.street}
                                    />
                                </div>
                                <div className="col-span-12 lg:col-span-6">
                                    <CustomField
                                        label="Cidade"
                                        placeholder="São Paulo"
                                        value={data.city}
                                        onChange={(e) =>
                                            setData('city', e.target.value)
                                        }
                                        error={errors.city}
                                    />
                                </div>

                                <div className="col-span-12 lg:col-span-6">
                                    <CustomField
                                        label="Bairro"
                                        placeholder="Centro"
                                        value={data.neighborhood}
                                        onChange={(e) =>
                                            setData('neighborhood', e.target.value)
                                        }
                                        error={errors.neighborhood}
                                    />
                                </div>

                                <div className="col-span-12 lg:col-span-2">
                                    <CustomField
                                        label="Número"
                                        placeholder="123"
                                        value={data.number}
                                        onChange={(e) =>
                                            setData('number', e.target.value)
                                        }
                                        error={errors.number}
                                    />
                                </div>
                                <div className="col-span-12 lg:col-span-6">
                                    <CustomField
                                        label="Complemento"
                                        placeholder="Apto 12, Bloco A"
                                        value={data.complement}
                                        onChange={(e) =>
                                            setData('complement', e.target.value)
                                        }
                                        error={errors.complement}
                                    />
                                </div>


                                <div className="col-span-6 lg:col-span-4">
                                    <CustomField
                                        as="select"
                                        label="UF"
                                        placeholder="SP"
                                        value={data.state}
                                        options={BRAZILIAN_STATES}
                                        onChange={(value) => setData('state', value)}
                                        error={errors.state}
                                    />
                                </div>

                            </div>



                            {/* Info Alert */}
                            <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-4">
                                <AlertCircle
                                    size={20}
                                    className="text-primary shrink-0 mt-0.5"
                                />
                                <p className="text-sm text-foreground/80">
                                    Este endereço será usado para o faturamento de
                                    suas notas fiscais e recebimento de produtos
                                    para teste.
                                </p>
                            </div>

                            {/* Submit */}
                            <div className="flex items-center gap-4 pt-2">
                                <Button
                                    disabled={processing}
                                    className="px-8 py-6 rounded-xl font-bold"
                                >
                                    <Save size={18} />
                                    Salvar Endereço
                                </Button>

                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm text-emerald-600 font-medium">
                                        Endereço salvo com sucesso
                                    </p>
                                </Transition>
                            </div>
                        </form>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    )
}
