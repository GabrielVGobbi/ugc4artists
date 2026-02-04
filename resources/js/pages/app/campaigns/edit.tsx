import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { toast } from 'sonner'
import { Cloud, CloudOff, Loader2, AlertCircle, HelpCircle } from 'lucide-react'

import AppLayout from '@/layouts/app-layout'
import { useCampaignMutations } from '@/hooks/use-campaigns'
import { FormStep } from './components/form-step'
import { FormSidebar } from './components/form-sidebar'
import { FormProgress, FormNavigation } from './components/form-progress'
import { OnboardingModal, useCampaignOnboarding } from './components/onboarding'
import {
    getCampaignStepsWithPlans,
    stepSchemas,
    type CampaignFormData,
    type FieldConfig,
    type VisibilityCondition,
} from './lib/form-config'
import type { CampaignResource, PublicationPlanOption } from '@/types/campaign'
import type { SharedData } from '@/types'

// Debounce delay for autosave (in ms)
const AUTOSAVE_DELAY = 1500

export default function EditCampaign() {
    const { campaign, auth, publicationPlans } = usePage<{
        campaign: { data: CampaignResource }
        auth: SharedData['auth']
        publicationPlans: PublicationPlanOption[]
    }>().props
    const initialCampaign = campaign.data
    const user = auth.user.data

    const [currentStep, setCurrentStep] = useState(0)
    const [formData, setFormData] = useState<CampaignFormData>(() =>
        mapCampaignToFormData(initialCampaign)
    )
    const [errors, setErrors] = useState<Partial<Record<keyof CampaignFormData, string>>>({})
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
    const [pendingChanges, setPendingChanges] = useState<Partial<CampaignFormData>>({})
    const [saveError, setSaveError] = useState<string | null>(null)

    const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null)

    const { updateCampaignSilent, isSilentUpdating, isSubmitting } = useCampaignMutations()

    // Onboarding
    const { isOpen: isOnboardingOpen, setIsOpen: setOnboardingOpen, open: openOnboarding } = useCampaignOnboarding()

    // Generate steps with dynamic publication plans from backend
    const steps = useMemo(
        () => getCampaignStepsWithPlans(publicationPlans),
        [publicationPlans]
    )
    const currentStepConfig = steps[currentStep]
    const canGoPrev = currentStep > 0
    const canGoNext = currentStep < steps.length - 1
    const isLastStep = currentStep === steps.length - 1
    const progress = Math.round(((currentStep + 1) / steps.length) * 100)

    // ─────────────────────────────────────────────────────────────────────────
    // Autosave Logic
    // ─────────────────────────────────────────────────────────────────────────

    const saveChanges = useCallback(async (changes: Partial<CampaignFormData>) => {
        if (Object.keys(changes).length === 0) return

        try {
            // Clean data before sending
            const cleanData: Record<string, unknown> = {}

            Object.entries(changes).forEach(([key, value]) => {
                // Skip preview fields
                if (key === 'cover_image_preview') return

                // Convert empty strings to null for optional fields
                if (value === '' || value === undefined) {
                    cleanData[key] = null
                } else {
                    cleanData[key] = value
                }
            })

            await updateCampaignSilent({
                key: initialCampaign.uuid,
                data: cleanData,
            })

            setLastSavedAt(new Date())
            setPendingChanges({})
            setSaveError(null)
        } catch (error: unknown) {
            console.error('Autosave failed:', error)

            // Handle ApiError format from toApiError()
            // Error structure: { type: 'validation', status: 422, errors: { field: 'message' } }
            if (error && typeof error === 'object' && 'type' in error) {
                const apiError = error as { type: string; status: number; errors?: Record<string, string>; message?: string }

                if (apiError.type === 'validation' && apiError.errors) {
                    // Map API errors to form errors
                    const newErrors: Partial<Record<keyof CampaignFormData, string>> = {}
                    Object.entries(apiError.errors).forEach(([field, message]) => {
                        newErrors[field as keyof CampaignFormData] = message
                    })
                    setErrors(prev => ({ ...prev, ...newErrors }))

                    // Set save error message (first error)
                    const firstError = Object.values(apiError.errors)[0]
                    setSaveError(firstError || 'Erro de validação')
                } else if (apiError.message) {
                    setSaveError(apiError.message)
                } else {
                    setSaveError('Erro ao salvar alterações')
                }
            } else {
                setSaveError('Erro ao salvar alterações')
            }
            // Keep pending changes for retry
        }
    }, [initialCampaign.uuid, updateCampaignSilent])

    // Debounced autosave
    useEffect(() => {
        if (Object.keys(pendingChanges).length === 0) return

        // Clear existing timer
        if (autosaveTimerRef.current) {
            clearTimeout(autosaveTimerRef.current)
        }

        // Set new timer
        autosaveTimerRef.current = setTimeout(() => {
            saveChanges(pendingChanges)
        }, AUTOSAVE_DELAY)

        return () => {
            if (autosaveTimerRef.current) {
                clearTimeout(autosaveTimerRef.current)
            }
        }
    }, [pendingChanges, saveChanges])

    // Save on unmount
    useEffect(() => {
        return () => {
            if (Object.keys(pendingChanges).length > 0) {
                saveChanges(pendingChanges)
            }
        }
    }, [])

    // ─────────────────────────────────────────────────────────────────────────
    // Field Handlers
    // ─────────────────────────────────────────────────────────────────────────

    const setField = useCallback(<K extends keyof CampaignFormData>(
        key: K,
        value: CampaignFormData[K]
    ) => {
        // Handle "use_my_data" checkbox - fill responsible fields with user data
        if (key === 'use_my_data' && value === true) {
            const userData = {
                use_my_data: true,
                responsible_name: user.name || '',
                responsible_email: user.email || '',
                responsible_phone: user.phone || '',
                responsible_cpf: user.document || '',
            }
            setFormData(prev => ({ ...prev, ...userData }))
            setPendingChanges(prev => ({ ...prev, ...userData }))
            setSaveError(null)
            return
        }

        // If unchecking "use_my_data", just update the checkbox
        if (key === 'use_my_data' && value === false) {
            const userData = {
                use_my_data: false,
                responsible_name: '',
                responsible_email: '',
                responsible_phone: '',
                responsible_cpf: '',
            }
            setFormData(prev => ({ ...prev, ...userData }))
            setPendingChanges(prev => ({ ...prev, use_my_data: false }))
            setSaveError(null)
            return
        }

        // If editing responsible fields manually, uncheck "use_my_data"
        if (['responsible_name', 'responsible_email', 'responsible_phone', 'responsible_cpf'].includes(key as string)) {
            setFormData(prev => ({ ...prev, [key]: value, use_my_data: false }))
            setPendingChanges(prev => ({ ...prev, [key]: value, use_my_data: false }))
            setSaveError(null)
            setErrors(prev => {
                if (prev[key]) {
                    const newErrors = { ...prev }
                    delete newErrors[key]
                    return newErrors
                }
                return prev
            })
            return
        }

        setFormData(prev => ({ ...prev, [key]: value }))
        setPendingChanges(prev => ({ ...prev, [key]: value }))

        // Clear error for this field and save error
        setSaveError(null)
        setErrors(prev => {
            if (prev[key]) {
                const newErrors = { ...prev }
                delete newErrors[key]
                return newErrors
            }
            return prev
        })
    }, [user])

    // ─────────────────────────────────────────────────────────────────────────
    // Visibility Check
    // ─────────────────────────────────────────────────────────────────────────

    const checkCondition = useCallback((condition: VisibilityCondition): boolean => {
        const fieldValue = formData[condition.field as keyof CampaignFormData]

        switch (condition.operator) {
            case 'equals':
                return fieldValue === condition.value
            case 'notEquals':
                return fieldValue !== condition.value
            case 'in':
                return Array.isArray(condition.value) && condition.value.includes(fieldValue)
            case 'notIn':
                return Array.isArray(condition.value) && !condition.value.includes(fieldValue)
            case 'greaterThan':
                return typeof fieldValue === 'number' && fieldValue > (condition.value as number)
            case 'lessThan':
                return typeof fieldValue === 'number' && fieldValue < (condition.value as number)
            default:
                return true
        }
    }, [formData])

    const isFieldVisible = useCallback((field: FieldConfig): boolean => {
        if (!field.visibleIf) return true

        if (field.visibleIf.all) {
            return field.visibleIf.all.every(checkCondition)
        }

        if (field.visibleIf.any) {
            return field.visibleIf.any.some(checkCondition)
        }

        return true
    }, [checkCondition])

    // ─────────────────────────────────────────────────────────────────────────
    // Validation
    // ─────────────────────────────────────────────────────────────────────────

    const validateCurrentStep = useCallback((): boolean => {
        const stepId = currentStepConfig.id as keyof typeof stepSchemas
        const schema = stepSchemas[stepId]


        if (!schema) return true

        try {
            const fieldsToValidate: Record<string, unknown> = {}

            currentStepConfig.sections.forEach(section => {
                section.fields.forEach(field => {
                    if (isFieldVisible(field)) {
                        fieldsToValidate[field.id] = formData[field.id as keyof CampaignFormData]
                    }
                })
            })

            schema.parse(fieldsToValidate)
            setErrors({})
            return true
        } catch (error) {
            // Handle ZodError format
            if (error && typeof error === 'object' && 'issues' in error) {
                const zodError = error as { issues: Array<{ path: (string | number)[]; message: string }> }
                const newErrors: Partial<Record<keyof CampaignFormData, string>> = {}

                zodError.issues.forEach(issue => {
                    const field = issue.path[0] as keyof CampaignFormData
                    if (field && !newErrors[field]) {
                        newErrors[field] = issue.message
                    }
                })
                setErrors(newErrors)

                // Show first error as toast
                const firstError = zodError.issues[0]?.message
                if (firstError) {
                    toast.error(firstError)
                }
            }
            return false
        }
    }, [currentStepConfig, formData, isFieldVisible])

    // ─────────────────────────────────────────────────────────────────────────
    // Navigation
    // ─────────────────────────────────────────────────────────────────────────

    const handleNext = useCallback(() => {
        // Force save before advancing
        if (Object.keys(pendingChanges).length > 0) {
            saveChanges(pendingChanges)
        }

        if (!validateCurrentStep()) {
            return
        }

        if (canGoNext) {
            setCurrentStep(prev => prev + 1)
        }
    }, [validateCurrentStep, canGoNext, pendingChanges, saveChanges])

    const handlePrev = useCallback(() => {
        if (canGoPrev) {
            setCurrentStep(prev => prev - 1)
        }
    }, [canGoPrev])

    const handleGoToStep = useCallback((step: number) => {
        if (step >= 0 && step < steps.length && step <= currentStep) {
            setCurrentStep(step)
        }
    }, [steps.length, currentStep])

    const handleSkip = useCallback(() => {
        if (currentStepConfig.isSkippable && canGoNext) {
            setCurrentStep(prev => prev + 1)
        }
    }, [currentStepConfig.isSkippable, canGoNext])

    const handleGoToCheckout = useCallback(async () => {
        if (Object.keys(pendingChanges).length > 0) {
            await saveChanges(pendingChanges)
        }

        if (isLastStep) {
            if (!validateCurrentStep()) {
                return
            }
        }

        // Redirect to checkout page
        router.visit(`/app/campaigns/${initialCampaign.uuid}/pay`)
    }, [isLastStep, validateCurrentStep, pendingChanges, saveChanges, initialCampaign.uuid])

    // ─────────────────────────────────────────────────────────────────────────
    // Computed Values
    // ─────────────────────────────────────────────────────────────────────────

    const totalBudget = formData.slots_to_approve * formData.price_per_influencer

    const publicationFee = (() => {
        const plan = publicationPlans.find(p => p.id === formData.publication_plan)
        return plan?.price ?? 0
    })()

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <AppLayout>
            <Head title={`${formData.name || 'Nova Campanha'} - Editar`} />

            {/* Onboarding Modal */}
            <OnboardingModal
                open={isOnboardingOpen}
                onOpenChange={setOnboardingOpen}
            />

            <div className="max-w-7xl mx-auto ">
                {/* Progress Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-end mb-4">
                        {/* Botão de ajuda */}
                        <button
                            onClick={openOnboarding}
                            className="cursor-pointer mr-4 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            title="Ver tutorial"
                        >
                            <HelpCircle size={18} />
                        </button>

                        {/* Autosave Indicator */}
                        <div className="flex items-center gap-2 text-xs">
                            {isSilentUpdating ? (
                                <div className="flex items-center gap-2 text-primary">
                                    <Loader2 size={14} className="animate-spin" />
                                    <span className="font-medium">Salvando...</span>
                                </div>
                            ) : saveError ? (
                                <div className="flex items-center gap-2 text-red-600">
                                    <AlertCircle size={14} />
                                    <span className="font-medium">{saveError}</span>
                                </div>
                            ) : Object.keys(pendingChanges).length > 0 ? (
                                <div className="flex items-center gap-2 text-amber-600">
                                    <CloudOff size={14} />
                                    <span className="font-medium">Alterações pendentes</span>
                                </div>
                            ) : lastSavedAt ? (
                                <div className="flex items-center gap-2 text-emerald-600">
                                    <Cloud size={14} />
                                    <span className="font-medium">
                                        Salvo às {lastSavedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <FormProgress
                        steps={steps}
                        currentStep={currentStep}
                        progress={progress}
                        onStepClick={handleGoToStep}
                    />
                </div>

                {/* Main Content */}
                <div className="flex-1 grid grid-cols-12 gap-8 overflow-hidden">
                    {/* Form Area */}
                    <div className="col-span-12 lg:col-span-8 h-full flex flex-col">
                        <div className="flex-1 bg-white rounded-[3rem] p-12 border border-border shadow-sm overflow-y-auto custom-scrollbar relative">
                            <FormStep
                                step={currentStepConfig}
                                formData={formData}
                                errors={errors}
                                onFieldChange={setField}
                                isFieldVisible={isFieldVisible}
                            />

                            {/* Navigation */}
                            <FormNavigation
                                currentStep={currentStep}
                                totalSteps={steps.length}
                                canGoPrev={canGoPrev}
                                canGoNext={canGoNext}
                                isSkippable={currentStepConfig.isSkippable}
                                skipLabel={currentStepConfig.skipLabel}
                                isLastStep={isLastStep}
                                isSubmitting={isSubmitting}
                                onPrev={handlePrev}
                                onNext={isLastStep ? handleGoToCheckout : handleNext}
                                onSkip={handleSkip}
                                onSubmit={handleGoToCheckout}
                            />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="col-span-12 lg:col-span-4 h-full overflow-hidden">
                        <div className="h-full overflow-y-auto custom-scrollbar pr-2">
                            <FormSidebar
                                formData={formData}
                                totalBudget={totalBudget}
                                publicationFee={publicationFee}
                                currentStep={currentStep}
                                steps={steps}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Map CampaignResource to Form Data
// ─────────────────────────────────────────────────────────────────────────────

function mapCampaignToFormData(campaign: CampaignResource): CampaignFormData {
    console.log(campaign.requires_invoice);
    return {
        name: campaign.name || '',
        kind: (campaign.kind as 'ugc' | 'influencers') || 'influencers',
        influencer_post_mode: campaign.influencer_post_mode || 'profile',
        music_platform: campaign.music_platform || null,
        music_link: campaign.music_link || '',
        product_or_service: campaign.product_or_service || '',
        objective: campaign.objective || '',
        objective_tags: campaign.objective_tags || [],
        briefing_mode: campaign.briefing_mode || 'has_briefing',
        description: campaign.description || '',
        terms_accepted: !!campaign.description,
        creator_profile_type: campaign.creator_profile_type || 'both',
        content_platforms: campaign.content_platforms || [],
        audio_format: campaign.audio_format || null,
        video_duration_min: campaign.video_duration_min || null,
        video_duration_max: campaign.video_duration_max || null,
        filter_age_min: campaign.filters.age_min || null,
        filter_age_max: campaign.filters.age_max || null,
        filter_gender: campaign.filters.gender || 'both',
        filter_niches: campaign.filters.niches || [],
        filter_states: campaign.filters.states || [],
        filter_min_followers: campaign.filters.min_followers || null,
        requires_product_shipping: campaign.requires_product_shipping || false,
        applications_open_date: campaign.applications_open_date || '',
        applications_close_date: campaign.applications_close_date || '',
        payment_date: campaign.payment_date || '',
        slots_to_approve: campaign.slots_to_approve || 1,
        price_per_influencer: campaign.price_per_influencer || 500,
        requires_invoice: campaign.requires_invoice || false,
        cover_image: campaign.cover_image_url || null,
        cover_image_preview: campaign.cover_image_url || null,
        brand_instagram: campaign.brand_instagram || '',
        publication_plan: campaign.publication_plan || 'basic',
        use_my_data: campaign.use_my_data || false,
        responsible_name: campaign.responsible.name || '',
        responsible_cpf: campaign.responsible.cpf || '',
        responsible_phone: campaign.responsible.phone || '',
        responsible_email: campaign.responsible.email || '',
        duration_days: campaign.summary.duration_days || null,
    }
}
