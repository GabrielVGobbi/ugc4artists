export interface Address {
    id: string
    name: string
    full_address: string
    zipcode: string
    street: string
    number: string
    district?: string
    city: string
    state: string
    complement?: string
    neighborhood: string
    country?: string
    is_primary?: boolean
}

export interface AddressFormData {
    name: string
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipcode: string
    is_default?: boolean
}
