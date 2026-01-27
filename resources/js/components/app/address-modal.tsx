import { FormEventHandler, useCallback, useEffect, useMemo, useState } from 'react'
import { X, MapPin, Save, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { CustomField } from '@/components/ui/custom-field'
import type { Address, AddressFormData } from '@/types/address'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'

import account from '@/routes/app/account'
import { useApiMutation } from '@/hooks/use-api-mutation'
import { apiPost, apiPut } from '@/lib/api'

interface AddressModalProps {
    isOpen: boolean
    onClose: () => void
    address?: Address | null
    onSuccess?: (address: Address) => void
}

const INITIAL_FORM: AddressFormData = {
    name: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipcode: '',
    is_default: false,
}

function formatZipcode(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 8)
    if (digits.length <= 5) return digits
    return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

export function AddressModal({ isOpen, onClose, address, onSuccess }: AddressModalProps) {
    const isEditing = !!address

    const initialData = useMemo<AddressFormData>(
        () =>
            address
                ? {
                    name: address.name,
                    street: address.street,
                    number: address.number,
                    complement: address.complement ?? '',
                    neighborhood: address.neighborhood,
                    city: address.city,
                    state: address.state,
                    zipcode: address.zipcode,
                    is_default: address.is_primary ?? false,
                }
                : INITIAL_FORM,
        [address],
    )

    const [data, setData] = useState<AddressFormData>(initialData)

    const { mutate, processing, errors, formError, reset, clearFieldError } = useApiMutation<
        AddressFormData,
        { data: Address }
    >(
        async (payload) => {
            const { url } = isEditing && address
                ? account.addresses.update(address.id)
                : account.addresses.store()

            return isEditing ? apiPut(url, payload) : apiPost(url, payload)
        },
        {
            onSuccess: (result) => {
                onClose()
                onSuccess?.(result.data)
            },
        },
    )

    const setField = useCallback(
        <K extends keyof AddressFormData>(key: K, value: AddressFormData[K]) => {
            setData((prev) => ({ ...prev, [key]: value }))
            clearFieldError(key)
        },
        [clearFieldError],
    )

    const handleZipcodeChange = useCallback(
        (value: string) => {
            setField('zipcode', formatZipcode(value))
        },
        [setField],
    )

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault()
        mutate(data)
    }

    const handleClose = useCallback(() => {
        if (processing) return
        setData(initialData)
        reset()
        onClose()
    }, [processing, onClose, initialData, reset])

    useEffect(() => {
        if (isOpen) {
            setData(initialData)
            reset()
        }
    }, [initialData, isOpen, reset])

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="p-0 border-0 bg-transparent shadow-none w-[calc(100vw-2rem)] max-w-3xl">
                <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                    <DialogHeader className="relative p-8  bg-gradient-to-br from-zinc-50 to-white border-b border-zinc-100">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="cursor-pointer absolute top-6 right-6 w-10 h-10 bg-white rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all disabled:opacity-50 shadow-sm border border-zinc-100"
                            aria-label="Fechar modal"
                            disabled={processing}
                        >
                            <X size={18} />
                        </button>

                        <div className="flex items-center gap-4 pr-12">
                            <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                                <MapPin size={26} />
                            </div>

                            <div>
                                <DialogTitle className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900">
                                    {isEditing ? 'Editar Endereço' : 'Novo Endereço'}
                                </DialogTitle>
                                <DialogDescription className="text-sm text-zinc-500 font-medium mt-1">
                                    {isEditing
                                        ? 'Atualize as informações do seu endereço'
                                        : 'Preencha os dados do seu endereço de cobrança'}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="px-8 pt-3 pb-8 space-y-4 bg-white">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <CustomField
                                    label="Nome do Endereço"
                                    placeholder="Ex: Casa, Trabalho, Escritório"
                                    value={data.name}
                                    onChange={(e) => setField('name', e.target.value)}
                                    error={errors.name}
                                    autoFocus
                                />
                            </div>

                            <CustomField
                                label="CEP"
                                placeholder="00000-000"
                                value={data.zipcode}
                                onChange={(e) => handleZipcodeChange(e.target.value)}
                                error={errors.zipcode}
                                inputMode="numeric"
                            />

                            <CustomField
                                label="Estado"
                                placeholder="Ex: SP"
                                value={data.state}
                                onChange={(e) => setField('state', e.target.value.toUpperCase().slice(0, 2))}
                                error={errors.state}
                                maxLength={2}
                            />

                            <div className="md:col-span-2">
                                <CustomField
                                    label="Cidade"
                                    placeholder="Ex: São Paulo"
                                    value={data.city}
                                    onChange={(e) => setField('city', e.target.value)}
                                    error={errors.city}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <CustomField
                                    label="Bairro"
                                    placeholder="Ex: Centro"
                                    value={data.neighborhood}
                                    onChange={(e) => setField('neighborhood', e.target.value)}
                                    error={errors.neighborhood}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <CustomField
                                    label="Rua / Avenida"
                                    placeholder="Ex: Rua das Flores"
                                    value={data.street}
                                    onChange={(e) => setField('street', e.target.value)}
                                    error={errors.street}
                                />
                            </div>

                            <CustomField
                                label="Número"
                                placeholder="Ex: 123"
                                value={data.number}
                                onChange={(e) => setField('number', e.target.value)}
                                error={errors.number}
                            />

                            <CustomField
                                label="Complemento"
                                placeholder="Ex: Apto 45, Bloco B"
                                value={data.complement}
                                onChange={(e) => setField('complement', e.target.value)}
                                error={errors.complement}
                            />
                        </div>

                        {formError && (
                            <div
                                role="alert"
                                className="rounded-2xl border-2 border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700 flex items-center gap-3"
                            >
                                <div className="w-5 h-5 bg-red-200 rounded-full flex items-center justify-center text-red-700 flex-shrink-0">
                                    !
                                </div>
                                {formError}
                            </div>
                        )}

                        <div className="flex flex-col-reverse md:flex-row gap-3 pt-6 ">
                            <Button
                                type="button"
                                variant="none"
                                size="none"
                                onClick={handleClose}
                                disabled={processing}
                                className="w-full md:w-auto px-8 h-12 bg-zinc-100 text-zinc-700 rounded-2xl font-bold hover:bg-zinc-200 hover:text-zinc-900 transition-all disabled:opacity-50"
                            >
                                Cancelar
                            </Button>

                            <Button
                                type="submit"
                                variant="none"
                                size="none"
                                disabled={processing}
                                className="w-full md:flex-1 h-12 bg-gradient-to-r from-primary to-primary/90 text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        <span>Salvando...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        {isEditing ? 'Atualizar' : 'Salvar'} Endereço
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    )
}
