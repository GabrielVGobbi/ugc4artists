import { useEffect, useMemo, useState } from 'react'
import { MapPin, Plus, Edit2 } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Address } from '@/types/address'
import { AddressModal } from './address-modal'
import { http } from '@/lib/http'
import account from '@/routes/app/account'

interface AddressSelectorProps {
    value?: string
    onChange: (addressId: string, fullAddress: string) => void
    error?: string
}

type AddressesResponse = {
    data: Address[]
}

export function AddressSelector({ value, onChange, error }: AddressSelectorProps) {
    const queryClient = useQueryClient()

    const [address, setAddress] = useState<Address | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const {
        data: addresses = [],
        isLoading,
        isFetching,
    } = useQuery({
        queryKey: ['account', 'addresses'],
        queryFn: async () => {
            const { url } = account.addresses.index()
            const res = await http.get<AddressesResponse>(url)
            return res.data.data ?? []
        },
        staleTime: 1000 * 60 * 5, // 5min
    })

    // Pega o primeiro endereço (único permitido)
    const firstAddress = useMemo(() => addresses[0] ?? null, [addresses])

    // Sincroniza o endereço com o onChange
    useEffect(() => {
        if (!firstAddress) return
        setAddress(firstAddress)
        onChange(String(firstAddress.id), firstAddress.full_address)
    }, [firstAddress])

    const handleOpenModal = () => {
        setIsModalOpen(true)
    }

    const handleModalSuccess = async () => {
        await queryClient.invalidateQueries({ queryKey: ['account', 'addresses'] })
    }

    const isEmpty = !isLoading && !firstAddress
    const loadingLabel = isLoading || isFetching ? 'Carregando...' : null

    // Se não há endereço, mostra botão para criar
    if (isEmpty) {
        return (
            <>
                <div className="space-y-3">
                    <label className=" font-black uppercase tracking-widest text-zinc-600">
                        Endereço de Cobrança
                    </label>

                    <button
                        type="button"
                        onClick={handleOpenModal}
                        className="cursor-pointer w-full p-6 border-2 border-dashed border-zinc-200 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3 text-zinc-400 hover:text-primary group"
                    >
                        <div className="w-12 h-12 bg-zinc-100 group-hover:bg-primary/10 rounded-xl flex items-center justify-center transition-all">
                            <Plus size={24} />
                        </div>
                        <div className="text-center">
                            <p className="font-black uppercase text-xs tracking-widest">Adicionar Endereço</p>
                            <p className="text-xs font-medium mt-1">Você ainda não possui um endereço cadastrado</p>
                        </div>
                    </button>

                    {error && <p className="text-red-500 text-xs font-medium mt-2">{error}</p>}
                </div>

                <AddressModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    address={firstAddress}
                    onSuccess={handleModalSuccess}
                />
            </>
        )
    }

    return (
        <>
            <div className="space-y-3">

                <label className="ml-1 text-[0.7em] font-black tracking-[0.1em] uppercase text-zinc-700">
                    Endereço de Cobrança
                </label>

                <div className={`relative p-5 bg-zinc-50 border-2 rounded-2xl transition-all ${error ? 'border-red-500' : 'border-zinc-100'
                    }`}>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary border border-zinc-100 flex-shrink-0">
                                <MapPin size={20} />
                            </div>

                            <div className="flex-1 min-w-0">
                                {address ? (
                                    <>
                                        <p className="font-bold text-sm text-zinc-900">{address.name}</p>
                                        <p className="text-xs text-zinc-500 font-medium mt-1 break-words">
                                            {address.full_address}
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-sm text-zinc-400 font-medium">
                                        {loadingLabel ?? 'Nenhum endereço'}
                                    </p>
                                )}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleOpenModal}
                            className="cursor-pointer w-9 h-9 bg-white rounded-xl flex items-center justify-center text-zinc-400 hover:text-primary hover:bg-primary/5 border border-zinc-100 transition-all flex-shrink-0"
                            title="Editar endereço"
                        >
                            <Edit2 size={16} />
                        </button>
                    </div>
                </div>

                {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
            </div>

            <AddressModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                address={firstAddress}
                onSuccess={handleModalSuccess}
            />
        </>
    )
}
