import { z } from 'zod'

/** Tipo de preço para faturamento */
export type TipoPrecoValue = 'preco_m3' | 'preco_caminhao'

/** Tipo de água */
export type TipoAguaValue =
    | 'agua_potavel'
    | 'agua_potavel_sem_cloro'
    | 'agua_desmineralizada_pura'
    | 'agua_desmineralizada_blend'

/**
 * Schema de validação para Client (formulário completo)
 */
export const clientSchema = z
    .object({
        name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(255),
        company_name: z.string().max(255).optional().nullable(),
        cod_client: z.string().max(50).optional().nullable(),
        email: z.string().email('Email inválido').max(255).optional().nullable(),
        phone: z.string().max(20).optional().nullable(),
        phone2: z.string().max(20).optional().nullable(),
        document: z.string().min(11).max(18),
        ie_rg: z.string().max(50).optional().nullable(),
        person_type: z.enum(['pf', 'pj']).optional().nullable(),
        observations: z.string().optional().nullable(),
        type_of_taxpayer: z.string().max(50).optional().nullable(),
        payment_condition: z.string().max(50).optional().nullable(),
        atividade_comercial: z.string().max(50).optional().nullable(),
        negotiation: z.string().max(50).optional().nullable(),
        forma_pagamento: z.string().max(50).optional().nullable(),
        state_registration: z.string().max(50).optional().nullable(),
        inscricao_estadual: z.string().max(50).optional().nullable(),

        tipo_preco: z.enum(['preco_m3', 'preco_caminhao']),
        preco_m3: z.number().min(0).optional().nullable(),
        preco_10m3: z.number().min(0).optional().nullable(),
        preco_20m3: z.number().min(0).optional().nullable(),
        hora_parada: z.number().min(0).optional().nullable(),

        tipo_agua: z
            .enum([
                'agua_potavel',
                'agua_potavel_sem_cloro',
                'agua_desmineralizada_pura',
                'agua_desmineralizada_blend',
            ])
            .optional()
            .nullable(),

        has_water_meter: z.boolean().optional(),
        initial_water_meter: z.number().min(0).optional().nullable(),
        water_meter_date: z.string().optional().nullable(),
        water_meter_observations: z.string().optional().nullable(),

        cobra_hparada: z.boolean().optional(),
        midia_captacao: z.string().max(50).optional().nullable(),
        metros_mangueira: z.string().max(50).optional().nullable(),
        observation: z.string().optional().nullable(),
    })
    .superRefine((data, ctx) => {
        if (data.tipo_preco === 'preco_m3' && (data.preco_m3 == null || data.preco_m3 < 0)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Preço por m³ é obrigatório quando tipo de preço é por m³',
                path: ['preco_m3'],
            })
        }
        if (data.tipo_preco === 'preco_caminhao') {
            if (data.preco_10m3 == null || data.preco_10m3 < 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Preço caminhão 10m³ é obrigatório',
                    path: ['preco_10m3'],
                })
            }
            if (data.preco_20m3 == null || data.preco_20m3 < 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Preço caminhão 20m³ é obrigatório',
                    path: ['preco_20m3'],
                })
            }
        }
        if (data.has_water_meter) {
            if (data.initial_water_meter == null || data.initial_water_meter < 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Leitura inicial do hidrômetro é obrigatória',
                    path: ['initial_water_meter'],
                })
            }
            if (!data.water_meter_date) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Data da leitura do hidrômetro é obrigatória',
                    path: ['water_meter_date'],
                })
            }
        }
    })

export type ClientFormData = z.infer<typeof clientSchema>

/**
 * Interface do Client retornado pela API (ClientResource)
 */
export interface Client {
    id: number
    company_id: number | null
    vendedor_id: number | null
    name: string
    company_name: string | null
    cod_client: string | null
    email: string | null
    phone: string | null
    phone2: string | null
    document: string | null
    formatted_document: string | null
    formatted_phone: string | null
    ie_rg: string | null
    person_type: PersonTypeValue | null
    observations: string | null
    type_of_taxpayer: string | null
    type_of_taxpayer_label?: string | null
    payment_condition: string | null
    atividade_comercial: string | null
    atividade_comercial_label?: string | null
    negotiation: string | null
    negotiation_label?: string | null
    forma_pagamento: string | null
    forma_pagamento_label?: string | null
    state_registration: string | null
    inscricao_estadual: string | null

    tipo_preco: TipoPrecoValue
    tipo_preco_label: string | null
    preco_m3: number | null
    preco_10m3: number | null
    preco_20m3: number | null
    hora_parada: number | null
    cobra_hparada: boolean | null

    has_water_meter: boolean | null
    initial_water_meter: number | null
    final_water_meter: number | null
    water_meter_date: string | null
    water_meter_observations: string | null

    tipo_agua: TipoAguaValue | null
    tipo_agua_label: string | null
    metros_mangueira: string | null
    midia_captacao: string | null
    midia_captacao_label?: string | null
    bloquear_vendas: boolean | null
    tem_contrato: boolean | null
    observation: string | null

    created_at: string
    updated_at: string
    deleted_at?: string | null
}

/**
 * Interface para criação/atualização de Client
 */
export interface ClientInput {
    name: string
    company_name?: string | null
    cod_client?: string | null
    email?: string | null
    phone?: string | null
    phone2?: string | null
    document?: string | null
    ie_rg?: string | null
    person_type?: PersonTypeValue | null
    observations?: string | null
    type_of_taxpayer?: string | null
    payment_condition?: string | null
    atividade_comercial?: string | null
    negotiation?: string | null
    forma_pagamento?: string | null
    state_registration?: string | null
    inscricao_estadual?: string | null
    tipo_preco: TipoPrecoValue
    preco_m3?: number | null
    preco_10m3?: number | null
    preco_20m3?: number | null
    hora_parada?: number | null
    tipo_agua?: TipoAguaValue | null
    has_water_meter?: boolean
    initial_water_meter?: number | null
    water_meter_date?: string | null
    water_meter_observations?: string | null
    cobra_hparada?: boolean
    midia_captacao?: string | null
    metros_mangueira?: string | null
    observation?: string | null
}
