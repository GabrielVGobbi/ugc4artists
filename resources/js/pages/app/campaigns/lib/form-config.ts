import { z } from 'zod'
import type { LucideIcon } from 'lucide-react'
import {
    Target,
    FileText,
    UserCheck,
    Calendar,
    DollarSign,
    Image,
    Zap,
    CheckCircle,
    Music,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Field Types
// ─────────────────────────────────────────────────────────────────────────────

export type FieldType =
    | 'text'
    | 'textarea'
    | 'number'
    | 'money'
    | 'url'
    | 'email'
    | 'phone'
    | 'cpf'
    | 'date'
    | 'select'
    | 'radio'
    | 'radio_cards'
    | 'checkbox'
    | 'multiselect'
    | 'multiselect_cards'
    | 'segmented'
    | 'file'
    | 'counter'
    | 'info'
    | 'computed'

export interface FieldOption {
    value: string | number | boolean
    label: string
    helpText?: string
    price?: number
    icon?: LucideIcon
}

export interface FieldValidation {
    rule: string
    value?: unknown
    field?: string
    message: string
}

export interface VisibilityCondition {
    field: string
    operator: 'equals' | 'notEquals' | 'in' | 'notIn' | 'greaterThan' | 'lessThan'
    value: unknown
}

export interface FieldConfig {
    id: string
    type: FieldType
    label: string
    placeholder?: string
    helpText?: string
    required?: boolean
    disabled?: boolean
    options?: FieldOption[]
    defaultValue?: unknown
    validations?: FieldValidation[]
    visibleIf?: { all?: VisibilityCondition[]; any?: VisibilityCondition[] }
    accept?: string[]
    content?: string[]
    min?: number
    max?: number
    step?: number
    rows?: number
    colSpan?: 1 | 2 | 3
    order?: number
}

export interface SectionConfig {
    id: string
    title: string
    description?: string
    gridcols?: number
    fields: FieldConfig[]
    collapsible?: boolean
    defaultCollapsed?: boolean
}

export interface StepConfig {
    id: string
    title: string
    description: string
    icon: LucideIcon
    sections: SectionConfig[]
    isSkippable?: boolean
    skipLabel?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Form Data Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CampaignFormData {
    // Step 1 - Básico
    name: string
    kind: 'ugc' | 'influencers'
    influencer_post_mode: 'profile' | 'collab' | null
    music_platform: 'spotify' | 'youtube' | 'deezer' | 'other' | null
    music_link: string
    product_or_service: string
    objective: string
    objective_tags: string[]

    // Step 2 - Briefing
    briefing_mode: 'has_briefing' | 'create_for_me'
    description: string
    terms_accepted: boolean

    // Step 3 - Perfil do Influencer
    creator_profile_type: 'influencer' | 'page' | 'both'
    content_platforms: string[]
    audio_format: 'music' | 'narration' | null
    video_duration_min: number | null
    video_duration_max: number | null

    // Step 4 - Filtros
    filter_age_min: number | null
    filter_age_max: number | null
    filter_gender: 'female' | 'male' | 'both'
    filter_niches: string[]
    filter_states: string[]
    filter_min_followers: number | null

    // Step 5 - Cronograma
    requires_product_shipping: boolean
    applications_open_date: string
    applications_close_date: string
    payment_date: string

    // Step 6 - Orçamento
    slots_to_approve: number
    price_per_influencer: number
    requires_invoice: boolean

    // Step 7 - Marca
    cover_image: File | null
    cover_image_preview: string | null
    brand_instagram: string

    // Step 8 - Plano de Publicação
    publication_plan: 'basic' | 'highlight' | 'premium'

    // Step 9 - Responsável
    use_my_data: boolean
    responsible_name: string
    responsible_cpf: string
    responsible_phone: string
    responsible_email: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Initial Form Data
// ─────────────────────────────────────────────────────────────────────────────

export const initialFormData: CampaignFormData = {
    name: '',
    kind: 'influencers',
    influencer_post_mode: 'profile',
    music_platform: null,
    music_link: '',
    product_or_service: '',
    objective: '',
    objective_tags: [],
    briefing_mode: 'has_briefing',
    description: '',
    terms_accepted: false,
    creator_profile_type: 'both',
    content_platforms: [],
    audio_format: null,
    video_duration_min: null,
    video_duration_max: null,
    filter_age_min: null,
    filter_age_max: null,
    filter_gender: 'both',
    filter_niches: [],
    filter_states: [],
    filter_min_followers: null,
    requires_product_shipping: false,
    applications_open_date: '',
    applications_close_date: '',
    payment_date: '',
    slots_to_approve: 1,
    price_per_influencer: 500,
    requires_invoice: false,
    cover_image: null,
    cover_image_preview: null,
    brand_instagram: '',
    publication_plan: 'basic',
    use_my_data: false,
    responsible_name: '',
    responsible_cpf: '',
    responsible_phone: '',
    responsible_email: '',
}

// ─────────────────────────────────────────────────────────────────────────────
// Zod Schemas por Step
// ─────────────────────────────────────────────────────────────────────────────

export const stepSchemas = {
    step_01_basics: z.object({
        name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
        kind: z.enum(['ugc', 'influencers']),
        influencer_post_mode: z.enum(['profile', 'collab']).nullable(),
    }),

    step_02_content: z.object({
        music_platform: z.enum(['spotify', 'youtube', 'deezer', 'other'], { message: 'Selecione a plataforma' }),
        music_link: z.string().min(1, 'Link é obrigatório').url('Insira um link válido'),
        product_or_service: z.string().min(10, 'Descreva o produto/serviço (mínimo 10 caracteres)'),
        objective: z.string().min(10, 'Descreva o objetivo da campanha (mínimo 10 caracteres)'),
        objective_tags: z.array(z.string()).min(1, 'Selecione pelo menos um objetivo'),
    }),

    step_03_briefing: z.object({
        briefing_mode: z.enum(['has_briefing', 'create_for_me']),
        description: z.string().min(50, 'A descrição deve ter pelo menos 50 caracteres'),
        terms_accepted: z.literal(true, {
            message: 'Você precisa aceitar os termos',
        }),
    }),

    step_04_profile: z.object({
        creator_profile_type: z.enum(['influencer', 'page', 'both']),
        content_platforms: z.array(z.string()).min(1, 'Selecione pelo menos uma plataforma'),
        audio_format: z.enum(['music', 'narration'], { message: 'Selecione o formato do áudio' }),
        video_duration_min: z.number({ message: 'Duração mínima é obrigatória' }).min(1, 'Mínimo 1 segundo'),
        video_duration_max: z.number({ message: 'Duração máxima é obrigatória' }).min(1, 'Mínimo 1 segundo'),
    }),

    step_05_filters: z.object({
        filter_age_min: z.number({ message: 'Idade mínima é obrigatória' }).min(18, 'Mínimo 18 anos').max(100),
        filter_age_max: z.number({ message: 'Idade máxima é obrigatória' }).min(18, 'Mínimo 18 anos').max(100),
        filter_gender: z.enum(['female', 'male', 'both'], { message: 'Selecione o gênero' }),
        filter_niches: z.array(z.string()).optional(),
        filter_states: z.array(z.string()).optional(),
        filter_min_followers: z.number().min(0).nullable().optional(),
    }),

    step_06_schedule: z.object({
        requires_product_shipping: z.boolean().default(false),
        applications_open_date: z.string().min(1, 'Data de abertura é obrigatória'),
        applications_close_date: z.string().min(1, 'Data de encerramento é obrigatória'),
        payment_date: z.string().min(1, 'Data de pagamento é obrigatória'),
    }),

    step_07_budget: z.object({
        slots_to_approve: z.number().min(1, 'Mínimo 1 vaga'),
        price_per_influencer: z.number().min(1, 'Valor deve ser maior que zero'),
        requires_invoice: z.boolean(),
    }),

    step_08_brand: z.object({
        cover_image: z.any().refine((file) => file !== null, 'Foto de capa é obrigatória'),
        brand_instagram: z.string().min(2, 'Informe o @ do Instagram'),
    }),

    step_09_plan: z.object({
        publication_plan: z.enum(['basic', 'highlight', 'premium']),
    }),

    step_10_responsible: z.object({
        responsible_name: z.string().min(3, 'Nome é obrigatório'),
        responsible_cpf: z.string().min(11, 'CPF inválido'),
        responsible_phone: z.string().min(10, 'Telefone inválido'),
        responsible_email: z.string().email('E-mail inválido'),
    }),
}

// ─────────────────────────────────────────────────────────────────────────────
// Steps Configuration
// ─────────────────────────────────────────────────────────────────────────────

export const CAMPAIGN_STEPS: StepConfig[] = [
    {
        id: 'step_01_basics',
        title: 'Informações Básicas',
        description: 'Defina o nome e tipo de campanha.',
        icon: Target,
        sections: [
            {
                id: 'sec_campaign_type',
                title: '',
                fields: [
                    {
                        id: 'name',
                        type: 'text',
                        label: 'Nome da Campanha',
                        placeholder: 'Ex: Lançamento Verão 2026',
                        required: true,
                        colSpan: 2,
                    },
                    {
                        id: 'kind',
                        type: 'radio_cards',
                        label: 'Como o conteúdo será usado?',
                        required: true,
                        options: [
                            {
                                value: 'ugc',
                                label: 'UGC',
                                helpText: 'O criador te fornece o vídeo para você postar nas suas redes.',
                            },
                            {
                                value: 'influencers',
                                label: 'Influencers',
                                helpText: 'O criador posta o vídeo nas redes sociais dele.',
                            },
                        ],
                        defaultValue: 'influencers',
                        colSpan: 2,
                    },
                    {
                        id: 'influencer_post_mode',
                        type: 'radio',
                        label: 'A influencer irá postar no perfil dela?',
                        required: true,
                        visibleIf: { all: [{ field: 'kind', operator: 'equals', value: 'influencers' }] },
                        options: [
                            { value: 'profile', label: 'Postar no Perfil da Influencer' },
                            { value: 'collab', label: 'Postar em Collab' },
                        ],
                        defaultValue: 'profile',
                        colSpan: 2,
                    },
                ],
            },
        ],
    },
    {
        id: 'step_02_content',
        title: 'Conteúdo e Objetivo',
        description: 'Defina o que será divulgado e o objetivo da campanha.',
        icon: Music,
        sections: [
            {
                id: 'sec_music',
                title: 'Música / Conteúdo',
                fields: [
                    {
                        id: 'music_platform',
                        type: 'select',
                        label: 'Onde está o conteúdo/música?',
                        placeholder: 'Selecione a plataforma',
                        options: [
                            { value: 'spotify', label: 'Spotify' },
                            { value: 'youtube', label: 'YouTube' },
                            { value: 'deezer', label: 'Deezer' },
                            { value: 'other', label: 'Outro' },
                        ],
                        required: true,

                    },
                    {
                        id: 'music_link',
                        type: 'url',
                        label: 'Link da música (ou conteúdo)',
                        placeholder: 'https://...',
                        required: true,

                    },
                ],
            },
            {
                id: 'sec_offer',
                title: 'Objetivo',
                fields: [
                    {
                        id: 'product_or_service',
                        type: 'textarea',
                        label: 'Descreva a música / campanha a ser divulgado',
                        placeholder: 'Explique o que é, para quem é e qual o diferencial.',
                        required: true,
                        rows: 3,
                        colSpan: 2,
                    },
                    {
                        id: 'objective',
                        type: 'textarea',
                        label: 'Qual o objetivo desta campanha?',
                        placeholder: 'Ex.: divulgar música, clipe, perfil, trend...',
                        required: true,
                        rows: 3,
                        colSpan: 2,
                    },
                    {
                        id: 'objective_tags',
                        type: 'multiselect_cards',
                        label: 'Objetivo (tags)',
                        helpText: 'Selecione pelo menos um objetivo.',
                        required: true,
                        options: [
                            { value: 'divulgar_musica', label: 'Divulgar música' },
                            { value: 'divulgar_clipe', label: 'Divulgar clipe' },
                            { value: 'divulgar_perfil', label: 'Divulgar perfil' },
                            { value: 'divulgar_trend', label: 'Divulgar trend' },
                            { value: 'outros', label: 'Outros' },
                        ],
                        colSpan: 2,
                    },
                ],
            },
        ],
    },
    {
        id: 'step_03_briefing',
        title: 'Briefing',
        description: 'Defina se você já tem briefing e inclua a descrição completa.',
        icon: FileText,
        sections: [
            {
                id: 'sec_briefing_choice',
                title: '',
                fields: [
                    {
                        id: 'briefing_mode',
                        type: 'radio_cards',
                        label: 'Você já tem briefing? Ou podemos criar para você?',
                        required: true,
                        options: [
                            { value: 'has_briefing', label: 'Já tenho briefing' },
                            { value: 'create_for_me', label: 'Criem para mim' },
                        ],
                        defaultValue: 'has_briefing',
                        colSpan: 2,
                    },
                ],
            },
            {
                id: 'sec_description',
                title: 'Descrição da Campanha',
                fields: [
                    {
                        id: 'description',
                        type: 'textarea',
                        label: 'Descrição completa',
                        helpText: 'Inclua todos os detalhes: se a música já foi lançada, liberdade criativa, links de referência, etc.',
                        placeholder: 'Escreva aqui o briefing completo...',
                        required: true,
                        rows: 8,
                        colSpan: 2,
                    },
                    {
                        id: 'terms_accepted',
                        type: 'checkbox',
                        label: 'Eu revisei a descrição inteira e estou de acordo.',
                        required: true,
                        colSpan: 2,
                    },
                ],
            },
        ],
    },
    {
        id: 'step_04_profile',
        title: 'Perfil do Influencer',
        description: 'Defina o tipo de criador e onde o conteúdo será veiculado.',
        icon: UserCheck,
        sections: [
            {
                id: 'sec_profile_type',
                title: 'Tipo de perfil',
                fields: [
                    {
                        id: 'creator_profile_type',
                        type: 'segmented',
                        label: 'Qual perfil de influencer você deseja?',
                        required: true,
                        options: [
                            { value: 'influencer', label: 'Influenciador' },
                            { value: 'page', label: 'Página' },
                            { value: 'both', label: 'Ambos' },
                        ],
                        defaultValue: 'both',
                        colSpan: 2,
                    },
                ],
            },
            {
                id: 'sec_platforms',
                title: '',
                fields: [
                    {
                        id: 'content_platforms',
                        type: 'multiselect_cards',
                        label: 'Em qual plataforma o conteúdo será veiculado?',
                        required: true,
                        options: [
                            { value: 'instagram', label: 'Instagram' },
                            { value: 'tiktok', label: 'TikTok' },
                            { value: 'youtube', label: 'YouTube' },
                            { value: 'youtube_shorts', label: 'YouTube Shorts' },
                        ],
                        colSpan: 2,
                    },
                    {
                        id: 'audio_format',
                        type: 'segmented',
                        label: 'Formato do áudio',
                        required: true,
                        options: [
                            { value: 'music', label: 'Música' },
                            { value: 'narration', label: 'Narração' },
                        ],
                        colSpan: 2,
                    },
                    {
                        id: 'video_duration_min',
                        type: 'number',
                        label: 'Duração mínima (segundos)',
                        placeholder: '15',
                        required: true,
                        min: 1,
                        max: 600,
                    },
                    {
                        id: 'video_duration_max',
                        type: 'number',
                        label: 'Duração máxima (segundos)',
                        placeholder: '60',
                        required: true,
                        min: 1,
                        max: 600,
                    },
                ],
            },
        ],
    },
    {
        id: 'step_05_filters',
        title: 'Filtros Opcionais',
        description: 'Reduz a quantidade de inscritos, mas melhora o matching.',
        icon: UserCheck,
        isSkippable: false,
        skipLabel: 'Pular esta etapa',
        sections: [
            {
                id: 'sec_demographics',
                title: 'Demografia',
                fields: [
                    {
                        id: 'filter_gender',
                        type: 'segmented',
                        label: 'Gênero',
                        required: true,
                        options: [
                            { value: 'female', label: 'Feminino' },
                            { value: 'male', label: 'Masculino' },
                            { value: 'both', label: 'Ambos' },
                        ],
                        defaultValue: 'both',
                        colSpan: 2,
                    },
                    {
                        id: 'filter_age_min',
                        type: 'number',
                        label: 'Idade mínima',
                        placeholder: '18',
                        required: true,
                        min: 18,
                        max: 100,
                    },
                    {
                        id: 'filter_age_max',
                        type: 'number',
                        label: 'Idade máxima',
                        placeholder: '45',
                        required: true,
                        min: 18,
                        max: 100,
                    },
                ],
            },
            //{
            //    id: 'sec_targeting',
            //    title: '',
            //    fields: [
            //        {
            //            id: 'filter_min_followers',
            //            type: 'select',
            //            label: 'Mínimo de seguidores',
            //            placeholder: 'Selecione...',
            //            options: [
            //                { value: 1000, label: '1.000+' },
            //                { value: 5000, label: '5.000+' },
            //                { value: 10000, label: '10.000+' },
            //                { value: 50000, label: '50.000+' },
            //                { value: 100000, label: '100.000+' },
            //            ],
            //            colSpan: 2,
            //        },
            //    ],
            //},
        ],
    },
    {
        id: 'step_06_schedule',
        title: 'Cronograma',
        description: 'Defina as datas importantes da campanha.',
        icon: Calendar,
        sections: [
            //{
            //    id: 'sec_products',
            //    title: '',
            //    fields: [
            //        {
            //            id: 'requires_product_shipping',
            //            type: 'radio_cards',
            //            label: 'Precisa enviar produto para a influencer?',
            //            required: true,
            //            options: [
            //                { value: false, label: 'Não inclui produtos', helpText: 'Conteúdo criado após seleção' },
            //                { value: true, label: 'Sim, inclui produtos', helpText: 'Enviarei produtos' },
            //            ],
            //            defaultValue: false,
            //            colSpan: 2,
            //        },
            //    ],
            //},
            {
                id: 'sec_dates',
                title: 'Datas',
                gridcols: 3,
                fields: [
                    {
                        id: 'applications_open_date',
                        type: 'date',
                        label: 'Abertura das inscrições',
                        required: true,
                        colSpan: 1,
                    },
                    {
                        id: 'applications_close_date',
                        type: 'date',
                        label: 'Encerramento',
                        required: true,
                        colSpan: 1,

                    },
                    {
                        id: 'payment_date',
                        type: 'date',
                        label: 'Data de Pagamento',
                        required: true,
                        colSpan: 1,
                    },
                ],
            },
            {
                id: 'sec_notes',
                title: 'Regras automáticas',
                fields: [
                    {
                        id: 'auto_rules',
                        type: 'info',
                        label: '',
                        content: [
                            'A campanha é encerrada automaticamente 30 dias após aprovação.',
                            'Veiculação máxima em ADS: 4 meses.',
                            'Produto enviado fica com o criador.',
                        ],
                        colSpan: 2,
                    },
                ],
            },
        ],
    },
    {
        id: 'step_07_budget',
        title: 'Vagas e Valores',
        description: 'Defina quantos influencers e o valor por cada um.',
        icon: DollarSign,
        sections: [
            {
                id: 'sec_budget',
                title: 'Orçamento',
                fields: [
                    {
                        id: 'slots_to_approve',
                        type: 'counter',
                        label: 'Quantidade de vagas',
                        required: true,
                        min: 1,
                        max: 100,
                        defaultValue: 2,
                    },
                    {
                        id: 'price_per_influencer',
                        type: 'money',
                        label: 'Valor por influencer (R$)',
                        placeholder: '000,00',
                        required: true,
                    },
                    {
                        id: 'requires_invoice',
                        type: 'checkbox',
                        label: 'Exigir Nota Fiscal',
                        helpText: 'Isto pode diminuir o número de aplicações.',
                        colSpan: 2,
                    },
                ],
            },
        ],
    },
    {
        id: 'step_08_brand',
        title: 'Apresentação da Marca',
        description: 'Mostre o branding da sua marca para as influencers.',
        icon: Image,
        sections: [
            {
                id: 'sec_brand',
                title: 'Branding',
                fields: [
                    {
                        id: 'cover_image',
                        type: 'file',
                        label: 'Foto de capa da campanha',
                        helpText: 'Arraste ou clique. JPG, JPEG ou PNG.',
                        required: true,
                        accept: ['image/jpeg', 'image/jpg', 'image/png'],
                        colSpan: 2,
                    },
                    {
                        id: 'brand_instagram',
                        type: 'text',
                        label: 'Qual o @ do Instagram da marca?',
                        placeholder: '@suamarca',
                        required: true,
                        colSpan: 2,
                    },
                ],
            },
        ],
    },
    {
        id: 'step_09_plan',
        title: 'Tipo de Publicação',
        description: 'Como sua campanha será exibida para as influencers.',
        icon: Zap,
        sections: [
            {
                id: 'sec_plan',
                title: 'Plano de exibição',
                fields: [
                    {
                        id: 'publication_plan',
                        type: 'radio_cards',
                        label: 'Escolha o tipo de publicação',
                        required: true,
                        // Options will be injected dynamically from backend
                        options: [],
                        defaultValue: 'basic',
                        colSpan: 2,
                    },
                ],
            },
        ],
    },
    {
        id: 'step_10_responsible',
        title: 'Revisar e Finalizar',
        description: 'Confira os detalhes e informe o responsável.',
        icon: CheckCircle,
        sections: [
            {
                id: 'sec_responsible',
                title: 'Responsável pela campanha',
                description: 'Apenas para controle interno.',
                fields: [
                    {
                        id: 'use_my_data',
                        type: 'checkbox',
                        label: 'Usar meus dados',
                        helpText: 'Preencher automaticamente com os dados da sua conta.',
                        colSpan: 2,
                    },
                    {
                        id: 'responsible_name',
                        type: 'text',
                        label: 'Nome',
                        placeholder: 'Nome do responsável',
                        required: true,
                    },
                    {
                        id: 'responsible_cpf',
                        type: 'cpf',
                        label: 'CPF',
                        placeholder: '000.000.000-00',
                        required: true,
                    },
                    {
                        id: 'responsible_phone',
                        type: 'phone',
                        label: 'Telefone',
                        placeholder: '(00) 00000-0000',
                        required: true,
                    },
                    {
                        id: 'responsible_email',
                        type: 'email',
                        label: 'E-mail',
                        placeholder: 'email@exemplo.com',
                        required: true,
                    },
                ],
            },
        ],
    },
]

// ─────────────────────────────────────────────────────────────────────────────
// Publication Plans
// ─────────────────────────────────────────────────────────────────────────────

export const PUBLICATION_PLANS = [
    {
        id: 'basic',
        label: 'Básico',
        price: 0,
        description: 'Acesso total ao pool de criadores.',
        icon: Target,
    },
    {
        id: 'highlight',
        label: 'Destaque',
        price: 29.90,
        description: 'Selo de verificação e prioridade nas listas.',
        icon: Zap,
    },
    {
        id: 'premium',
        label: 'Premium',
        price: 49.90,
        description: 'Curadoria estratégica e acompanhamento.',
        icon: CheckCircle,
    },
]

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic Steps with Backend Options
// ─────────────────────────────────────────────────────────────────────────────

export interface PublicationPlanOption {
    id: string
    label: string
    price: number
    description: string
    features?: string[]
}

/**
 * Returns campaign steps with publication plans injected from backend
 */
export function getCampaignStepsWithPlans(publicationPlans: PublicationPlanOption[]): StepConfig[] {
    return CAMPAIGN_STEPS.map(step => {
        if (step.id !== 'step_09_plan') return step

        return {
            ...step,
            sections: step.sections.map(section => {
                if (section.id !== 'sec_plan') return section

                return {
                    ...section,
                    fields: section.fields.map(field => {
                        if (field.id !== 'publication_plan') return field

                        return {
                            ...field,
                            options: publicationPlans.map(plan => ({
                                value: plan.id,
                                label: plan.label,
                                price: plan.price,
                                helpText: plan.description,
                            })),
                        }
                    }),
                }
            }),
        }
    })
}
