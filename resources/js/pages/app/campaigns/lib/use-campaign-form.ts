import { useState, useCallback, useMemo } from 'react'
import { z } from 'zod'
import {
    CAMPAIGN_STEPS,
    getCampaignStepsWithPlans,
    stepSchemas,
    initialFormData,
    type CampaignFormData,
    type StepConfig,
    type FieldConfig,
    type VisibilityCondition,
    type PublicationPlanOption,
} from './form-config'

type FormErrors = Partial<Record<keyof CampaignFormData, string>>

interface UseCampaignFormOptions {
    publicationPlans?: PublicationPlanOption[]
}

interface UseCampaignFormReturn {
    // State
    currentStep: number
    formData: CampaignFormData
    errors: FormErrors
    isSubmitting: boolean
    isDirty: boolean

    // Step navigation
    steps: StepConfig[]
    currentStepConfig: StepConfig
    canGoNext: boolean
    canGoPrev: boolean
    progress: number

    // Actions
    setField: <K extends keyof CampaignFormData>(key: K, value: CampaignFormData[K]) => void
    setFields: (fields: Partial<CampaignFormData>) => void
    nextStep: () => boolean
    prevStep: () => void
    goToStep: (step: number) => void
    skipStep: () => void
    validateCurrentStep: () => boolean
    validateField: (fieldId: string) => string | null
    resetForm: () => void

    // Visibility
    isFieldVisible: (field: FieldConfig) => boolean

    // Computed values
    totalBudget: number
    publicationFee: number
    totalToPay: number
}

export function useCampaignForm(options: UseCampaignFormOptions = {}): UseCampaignFormReturn {
    const { publicationPlans = [] } = options

    const [currentStep, setCurrentStep] = useState(0)
    const [formData, setFormData] = useState<CampaignFormData>(initialFormData)
    const [errors, setErrors] = useState<FormErrors>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDirty, setIsDirty] = useState(false)

    // Generate steps with dynamic publication plans
    const steps = useMemo(() => {
        if (publicationPlans.length > 0) {
            return getCampaignStepsWithPlans(publicationPlans)
        }
        return CAMPAIGN_STEPS
    }, [publicationPlans])

    const currentStepConfig = steps[currentStep]

    // ─────────────────────────────────────────────────────────────────────────
    // Field actions
    // ─────────────────────────────────────────────────────────────────────────

    const setField = useCallback(<K extends keyof CampaignFormData>(
        key: K,
        value: CampaignFormData[K]
    ) => {
        setFormData(prev => ({ ...prev, [key]: value }))
        setIsDirty(true)

        // Clear error for this field
        setErrors(prev => {
            if (prev[key]) {
                const { [key]: _, ...rest } = prev
                return rest as FormErrors
            }
            return prev
        })
    }, [])

    const setFields = useCallback((fields: Partial<CampaignFormData>) => {
        setFormData(prev => ({ ...prev, ...fields }))
        setIsDirty(true)
    }, [])

    // ─────────────────────────────────────────────────────────────────────────
    // Visibility check
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

    const validateField = useCallback((fieldId: string): string | null => {
        const stepId = currentStepConfig.id as keyof typeof stepSchemas
        const schema = stepSchemas[stepId]

        if (!schema) return null

        try {
            // Get field schema
            const fieldSchema = (schema as z.ZodObject<Record<string, z.ZodTypeAny>>).shape[fieldId]
            if (!fieldSchema) return null

            fieldSchema.parse(formData[fieldId as keyof CampaignFormData])
            return null
        } catch (error) {
            if (error instanceof z.ZodError) {
                return error.errors[0]?.message || 'Campo inválido'
            }
            return null
        }
    }, [currentStepConfig.id, formData])

    const validateCurrentStep = useCallback((): boolean => {
        const stepId = currentStepConfig.id as keyof typeof stepSchemas
        const schema = stepSchemas[stepId]
 return true
        if (!schema) return true

        try {
            // Get only visible required fields from current step
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
            if (error instanceof z.ZodError) {
                const newErrors: FormErrors = {}

                console.log(error);

                error.forEach(err => {
                    const field = err.path[0] as keyof CampaignFormData
                    if (field && !newErrors[field]) {
                        newErrors[field] = err.message
                    }
                })
                setErrors(newErrors)
            }
            return false
        }
    }, [currentStepConfig, formData, isFieldVisible])

    // ─────────────────────────────────────────────────────────────────────────
    // Navigation
    // ─────────────────────────────────────────────────────────────────────────

    const canGoPrev = currentStep > 0
    const canGoNext = currentStep < steps.length - 1

    const nextStep = useCallback((): boolean => {
        if (!validateCurrentStep()) {
            return false
        }

        if (canGoNext) {
            setCurrentStep(prev => prev + 1)
            return true
        }

        return false
    }, [validateCurrentStep, canGoNext])

    const prevStep = useCallback(() => {
        if (canGoPrev) {
            setCurrentStep(prev => prev - 1)
        }
    }, [canGoPrev])

    const goToStep = useCallback((step: number) => {
        if (step >= 0 && step < steps.length && step <= currentStep) {
            setCurrentStep(step)
        }
    }, [steps.length, currentStep])

    const skipStep = useCallback(() => {
        if (currentStepConfig.isSkippable && canGoNext) {
            setCurrentStep(prev => prev + 1)
        }
    }, [currentStepConfig.isSkippable, canGoNext])

    const resetForm = useCallback(() => {
        setFormData(initialFormData)
        setCurrentStep(0)
        setErrors({})
        setIsDirty(false)
    }, [])

    // ─────────────────────────────────────────────────────────────────────────
    // Computed values
    // ─────────────────────────────────────────────────────────────────────────

    const progress = useMemo(() => {
        return Math.round(((currentStep + 1) / steps.length) * 100)
    }, [currentStep, steps.length])

    const totalBudget = useMemo(() => {
        return formData.slots_to_approve * formData.price_per_influencer
    }, [formData.slots_to_approve, formData.price_per_influencer])

    const publicationFee = useMemo(() => {
        // Use dynamic plans if available
        if (publicationPlans.length > 0) {
            const plan = publicationPlans.find(p => p.id === formData.publication_plan)
            return plan?.price ?? 0
        }
        // Fallback to hardcoded values
        const fees: Record<string, number> = {
            basic: 0,
            highlight: 29.90,
            premium: 49.90,
        }
        return fees[formData.publication_plan] || 0
    }, [formData.publication_plan, publicationPlans])

    const totalToPay = useMemo(() => {
        return publicationFee
    }, [publicationFee])

    return {
        // State
        currentStep,
        formData,
        errors,
        isSubmitting,
        isDirty,

        // Step navigation
        steps,
        currentStepConfig,
        canGoNext,
        canGoPrev,
        progress,

        // Actions
        setField,
        setFields,
        nextStep,
        prevStep,
        goToStep,
        skipStep,
        validateCurrentStep,
        validateField,
        resetForm,

        // Visibility
        isFieldVisible,

        // Computed
        totalBudget,
        publicationFee,
        totalToPay,
    }
}
