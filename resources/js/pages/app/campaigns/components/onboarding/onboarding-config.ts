/**
 * Configuração dos slides do onboarding de criação de campanha
 *
 * TIPOS DE VISUAL (visual.type):
 * - 'icon': Ícone Lucide (usar visual.icon e visual.iconColor)
 * - 'image': Imagem estática ou GIF (usar visual.src e visual.alt)
 * - 'video': Vídeo MP4/WebM (usar visual.src)
 * - 'component': Componente React customizado (usar visual.componentId)
 *
 * Cada slide pode ter:
 * - id: identificador único
 * - title: título do slide
 * - description: descrição/explicação
 * - visual: configuração do conteúdo visual (ver tipos acima)
 * - highlight: texto destacado (opcional)
 * - tips: array de dicas (opcional)
 */

import type { ComponentType } from 'react'
import {
    SocialFeedWidget,
    CampaignFlowWidget,
    WelcomeWidget,
    StepPreviewWidget,
    FeatureCardWidget,
    FormMockupWidget,
    StatsWidget,
    BasicInfoWidget,
    ContentSpecsWidget,
    AudienceFiltersWidget,
    BudgetTimelineWidget,
    ReadyToLaunchWidget,
} from './visual-widgets'

// ─────────────────────────────────────────────────────────────────────────────
// Tipos de Visual
// ─────────────────────────────────────────────────────────────────────────────

export interface IconVisual {
    type: 'icon'
    icon: string
    iconColor?: string
}

export interface ImageVisual {
    type: 'image'
    src: string
    alt?: string
    /** Classes CSS para customizar o container da imagem */
    className?: string
    /** Se true, a imagem ocupa toda a área disponível */
    fullWidth?: boolean
}

export interface VideoVisual {
    type: 'video'
    src: string
    poster?: string
    loop?: boolean
    autoPlay?: boolean
    muted?: boolean
}

export interface ComponentVisual {
    type: 'component'
    /** ID do componente registrado em VISUAL_COMPONENTS */
    componentId: string
    /** Props para passar ao componente */
    props?: Record<string, unknown>
}

export type SlideVisual = IconVisual | ImageVisual | VideoVisual | ComponentVisual

export interface OnboardingSlide {
    id: string
    title: string
    description: string
    visual?: SlideVisual
    highlight?: string
    tips?: string[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Registro de Componentes Customizados
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Registre aqui componentes React customizados para usar nos slides.
 * Use o componentId no slide para referenciar.
 *
 * @example
 * // No slide:
 * visual: { type: 'component', componentId: 'welcome-animation', props: { color: 'blue' } }
 *
 * // Aqui:
 * 'welcome-animation': WelcomeAnimationWidget,
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VISUAL_COMPONENTS: Record<string, ComponentType<any>> = {
    'social-feed': SocialFeedWidget,
    'campaign-flow': CampaignFlowWidget,
    'welcome': WelcomeWidget,
    'step-preview': StepPreviewWidget,
    'feature-card': FeatureCardWidget,
    'form-mockup': FormMockupWidget,
    'stats': StatsWidget,
    'basic-info': BasicInfoWidget,
    'content-specs': ContentSpecsWidget,
    'audience-filters': AudienceFiltersWidget,
    'budget-timeline': BudgetTimelineWidget,
    'ready-to-launch': ReadyToLaunchWidget,
}

// ─────────────────────────────────────────────────────────────────────────────
// Slides do Onboarding
// ─────────────────────────────────────────────────────────────────────────────

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
    {
        id: 'welcome',
        title: 'Bem-vindo à criação de campanha!',
        description: 'Veja sua música viralizar com criadores de conteúdo autênticos.',
        visual: {
            type: 'component',
            componentId: 'social-feed',
        },
        tips: [
            'Criadores produzem conteúdo com sua música',
            'Alcance milhares de novos ouvintes',
            'Engajamento real e orgânico',
        ],
    },
    {
        id: 'basic-info',
        title: 'Informações Básicas',
        description: 'Comece definindo o nome da campanha, tipo de conteúdo e objetivo principal.',
        visual: {
            type: 'component',
            componentId: 'basic-info',
        },
        tips: [
            'Escolha um nome claro e descritivo',
            'Defina se é UGC ou campanha com influenciadores',
            'Descreva o objetivo para atrair os criadores certos',
        ],
    },
    {
        id: 'content-specs',
        title: 'Especificações do Conteúdo',
        description: 'Defina as plataformas, formato e duração do conteúdo que você precisa.',
        visual: {
            type: 'component',
            componentId: 'content-specs',
        },
        tips: [
            'Selecione as plataformas onde o conteúdo será publicado',
            'Defina a duração ideal dos vídeos',
            'Especifique se precisa de áudio original ou pode usar trilha',
        ],
    },
    {
        id: 'target-audience',
        title: 'Público e Filtros',
        description: 'Escolha o perfil ideal de criadores para sua campanha.',
        visual: {
            type: 'component',
            componentId: 'audience-filters',
        },
        tips: [
            'Filtre por idade, gênero e localização',
            'Selecione nichos relevantes para seu produto',
            'Defina o número mínimo de seguidores se necessário',
        ],
    },
    {
        id: 'budget-timeline',
        title: 'Orçamento e Cronograma',
        description: 'Defina quanto vai investir e as datas importantes da campanha.',
        visual: {
            type: 'component',
            componentId: 'budget-timeline',
        },
        tips: [
            'Defina o valor por criador aprovado',
            'Escolha quantos criadores deseja aprovar',
            'Configure as datas de inscrição e pagamento',
        ],
    },
    {
        id: 'ready',
        title: 'Tudo pronto!',
        description: 'Agora é só preencher as informações e publicar sua campanha.',
        visual: {
            type: 'component',
            componentId: 'ready-to-launch',
        },
        tips: [
            'Revise todas as informações antes de publicar',
            'Após publicar, os criadores poderão se inscrever',
            'Você receberá notificações de novas inscrições',
        ],
    },
]

// ─────────────────────────────────────────────────────────────────────────────
// Configurações Gerais
// ─────────────────────────────────────────────────────────────────────────────

export const ONBOARDING_STORAGE_KEY = 'campaign_onboarding_completed'

export const ONBOARDING_CONFIG = {
    autoShowOnFirstVisit: true,
    // Textos dos botões
    nextButtonText: 'Próximo',
    prevButtonText: 'Anterior',
    finishButtonText: 'Começar!',
}
