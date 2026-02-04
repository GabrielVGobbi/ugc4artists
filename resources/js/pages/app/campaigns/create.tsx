import { useState } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { toast } from 'sonner'

import AppLayout from '@/layouts/app-layout'
import { useCampaignForm } from './lib/use-campaign-form'
import { useCampaignMutations } from '@/hooks/use-campaigns'
import { FormStep } from './components/form-step'
import { FormSidebar } from './components/form-sidebar'
import { FormProgress, FormNavigation } from './components/form-progress'
import { CheckoutStep } from './components/checkout-step'
import type { CampaignFormData } from './lib/form-config'
import type { PublicationPlanOption } from '@/types/campaign'

export default function CreateCampaign() {
    const { publicationPlans } = usePage<{ publicationPlans: PublicationPlanOption[] }>().props

    const [isCheckout, setIsCheckout] = useState(false)

    const {
        currentStep,
        formData,
        errors,
        steps,
        currentStepConfig,
        canGoNext,
        canGoPrev,
        progress,
        setField,
        nextStep,
        prevStep,
        goToStep,
        skipStep,
        isFieldVisible,
        totalBudget,
        publicationFee,
        totalToPay,
    } = useCampaignForm({ publicationPlans })

    const { createCampaign, isCreating } = useCampaignMutations()

    const isLastStep = currentStep === steps.length - 1

    const handleNext = () => {
        const success = nextStep()
        if (!success) {
            toast.error('Por favor, preencha todos os campos obrigatórios.')
        }
    }

    const handlePrev = () => {
        if (isCheckout) {
            setIsCheckout(false)
        } else {
            prevStep()
        }
    }

    const handleGoToCheckout = () => {
        // Validate last step before going to checkout
        const success = nextStep()
        if (success || isLastStep) {
            setIsCheckout(true)
        } else {
            toast.error('Por favor, preencha todos os campos obrigatórios.')
        }
    }

    const handleSubmit = async () => {
        try {
            // Prepare form data for API
            const payload: Partial<CampaignFormData> = { ...formData }

            // Remove preview field
            delete (payload as Record<string, unknown>).cover_image_preview

            await createCampaign(payload as CampaignFormData)

            toast.success('Campanha criada com sucesso!')
            router.visit('/app/campaigns')
        } catch (error) {
            toast.error('Erro ao criar campanha. Tente novamente.')
            console.error(error)
        }
    }

    // Checkout screen
    if (isCheckout) {
        return (
            <AppLayout>
                <Head title="Checkout - Criar Campanha" />
                <CheckoutStep
                    formData={formData}
                    totalBudget={totalBudget}
                    publicationFee={publicationFee}
                    isSubmitting={isCreating}
                    onBack={() => setIsCheckout(false)}
                    onSubmit={handleSubmit}
                />
            </AppLayout>
        )
    }

    return (
        <AppLayout>
            <Head title={`${currentStepConfig.title} - Criar Campanha`} />

            <div className="max-w-[1400px] mx-auto h-[calc(100vh-180px)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Progress Header */}
                <FormProgress
                    steps={steps}
                    currentStep={currentStep}
                    progress={progress}
                    onStepClick={goToStep}
                />

                {/* Main Content */}
                <div className="flex-1 grid grid-cols-12 gap-8 ">
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
                                isSubmitting={isCreating}
                                onPrev={handlePrev}
                                onNext={isLastStep ? handleGoToCheckout : handleNext}
                                onSkip={skipStep}
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
