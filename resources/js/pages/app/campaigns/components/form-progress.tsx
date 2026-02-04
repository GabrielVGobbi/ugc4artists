import { ArrowLeft } from 'lucide-react'
import { Link } from '@inertiajs/react'
import { cn } from '@/lib/utils'
import type { StepConfig } from '../lib/form-config'

interface FormProgressProps {
    steps: StepConfig[]
    currentStep: number
    progress: number
    onStepClick?: (step: number) => void
}

export function FormProgress({
    steps,
    currentStep,
    progress,
    onStepClick,
}: FormProgressProps) {
    return (
        <div className="flex items-center justify-between mb-8">
            {/* Cancel Button */}
            <Link
                href="/app/campaigns"
                className="group flex items-center gap-3 text-muted-foreground hover:text-foreground transition-all font-black uppercase text-[10px] tracking-[0.2em]"
            >
                <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-foreground transition-colors">
                    <ArrowLeft size={14} />
                </div>
                Cancelar
            </Link>

            {/* Step Indicators */}
            <div className="flex items-center gap-2">
                {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                        <button
                            type="button"
                            onClick={() => index <= currentStep && onStepClick?.(index)}
                            disabled={index > currentStep}
                            className={cn(
                                "w-2.5 h-2.5 rounded-full transition-all duration-500",
                                currentStep === index && "bg-primary w-8",
                                currentStep > index && "bg-emerald-500 cursor-pointer",
                                currentStep < index && "bg-muted cursor-not-allowed"
                            )}
                            title={step.title}
                        />
                        {index !== steps.length - 1 && <div className="w-4" />}
                    </div>
                ))}
            </div>

            {/* Progress */}
            <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Progresso
                </p>
                <p className="font-bold text-sm text-primary">
                    {progress}% concluído
                </p>
            </div>
        </div>
    )
}

interface FormNavigationProps {
    currentStep: number
    totalSteps: number
    canGoPrev: boolean
    canGoNext: boolean
    isSkippable?: boolean
    skipLabel?: string
    isLastStep: boolean
    isSubmitting: boolean
    onPrev: () => void
    onNext: () => void
    onSkip?: () => void
    onSubmit: () => void
}

export function FormNavigation({
    currentStep,
    totalSteps,
    canGoPrev,
    canGoNext,
    isSkippable,
    skipLabel,
    isLastStep,
    isSubmitting,
    onPrev,
    onNext,
    onSkip,
    onSubmit,
}: FormNavigationProps) {
    return (
        <div className="sticky bottom-0 left-0 right-0 pt-8 bg-gradient-to-t from-white via-white/95 to-transparent flex justify-between items-center z-30 mt-10 pb-2">
            {/* Back Button */}
            <button
                type="button"
                onClick={onPrev}
                className={cn(
                    "cursor-pointer px-8 py-4 rounded-2xl font-bold transition-all",
                    canGoPrev
                        ? "text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80"
                        : "opacity-0 pointer-events-none"
                )}
            >
                Voltar
            </button>

            <div className="flex items-center gap-4">
                {/* Skip Button */}
                {isSkippable && onSkip && (
                    <button
                        type="button"
                        onClick={onSkip}
                        className="cursor-pointer px-6 py-4 rounded-2xl font-bold text-muted-foreground hover:text-foreground transition-all"
                    >
                        {skipLabel || 'Pular'}
                    </button>
                )}

                {/* Next/Submit Button */}
                {isLastStep ? (
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={isSubmitting}
                        className="cursor-pointer bg-primary text-primary-foreground px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] flex items-center gap-3 hover:bg-primary/90 transition-all duration-500 shadow-2xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            'Finalizar e Publicar'
                        )}
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={onNext}
                        className="cursor-pointer bg-secondary text-secondary-foreground px-10 py-5 rounded-2xl font-bold flex items-center gap-3 hover:bg-primary hover:text-primary-foreground transition-all duration-500 shadow-xl"
                    >
                        Continuar
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    )
}
