import { useState, useCallback, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { OnboardingSlide } from './onboarding-slide'
import {
    ONBOARDING_SLIDES,
    ONBOARDING_CONFIG,
    ONBOARDING_STORAGE_KEY,
    type OnboardingSlide as SlideType,
} from './onboarding-config'

interface OnboardingModalProps {
    /** Controla se o modal está aberto */
    open: boolean
    /** Callback quando o modal é fechado */
    onOpenChange: (open: boolean) => void
    /** Slides customizados (opcional, usa os padrões se não fornecido) */
    slides?: SlideType[]
    /** Callback quando o onboarding é completado */
    onComplete?: () => void
    /** Se true, não salva no localStorage que foi completado */
    disablePersistence?: boolean
}

export function OnboardingModal({
    open,
    onOpenChange,
    slides = ONBOARDING_SLIDES,
    onComplete,
    disablePersistence = false,
}: OnboardingModalProps) {
    const [currentSlide, setCurrentSlide] = useState(0)
    const contentRef = useRef<HTMLDivElement>(null)

    const totalSlides = slides.length
    const isFirstSlide = currentSlide === 0
    const isLastSlide = currentSlide === totalSlides - 1

    // Scroll para o final quando abrir ou mudar de slide
    useEffect(() => {
        if (!open) return

        const scrollToBottom = () => {
            if (contentRef.current) {
                contentRef.current.scrollTo({
                    top: contentRef.current.scrollHeight,
                    behavior: 'smooth'
                })
            }
        }

        // Múltiplas tentativas para garantir que o conteúdo renderizou
        const timeouts = [50, 150, 300, 500]
        const timers = timeouts.map(delay =>
            setTimeout(scrollToBottom, delay)
        )

        return () => timers.forEach(clearTimeout)
    }, [open, currentSlide])

    // Bloqueia fechamento - só permite fechar após completar
    const handleOpenChange = useCallback((newOpen: boolean) => {
        // Ignora tentativas de fechar - só fecha via handleComplete
        if (newOpen) {
            onOpenChange(newOpen)
        }
        // Se tentar fechar, não faz nada (bloqueado)
    }, [onOpenChange])

    const handleNext = useCallback(() => {
        if (!isLastSlide) {
            setCurrentSlide(prev => prev + 1)
        }
    }, [isLastSlide])

    const handlePrev = useCallback(() => {
        if (!isFirstSlide) {
            setCurrentSlide(prev => prev - 1)
        }
    }, [isFirstSlide])

    const handleComplete = useCallback(() => {
        if (!disablePersistence) {
            localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true')
        }
        onComplete?.()
        // Reset slide após fechar
        setTimeout(() => setCurrentSlide(0), 300)
        onOpenChange(false)
    }, [disablePersistence, onComplete, onOpenChange])

    // Só permite navegar pelos slides, não permite pular para frente dos já visitados
    const handleDotClick = useCallback((index: number) => {
        // Só permite voltar para slides já vistos
        if (index <= currentSlide) {
            setCurrentSlide(index)
        }
    }, [currentSlide])

    // Keyboard navigation - bloqueia Escape
    useEffect(() => {
        if (!open) return

        const handleKeyDown = (e: KeyboardEvent) => {
            // Bloqueia Escape
            if (e.key === 'Escape') {
                e.preventDefault()
                e.stopPropagation()
                return
            }

            if (e.key === 'ArrowRight' || e.key === 'Enter') {
                if (isLastSlide) {
                    handleComplete()
                } else {
                    handleNext()
                }
            } else if (e.key === 'ArrowLeft') {
                handlePrev()
            }
        }

        window.addEventListener('keydown', handleKeyDown, true)
        return () => window.removeEventListener('keydown', handleKeyDown, true)
    }, [open, isLastSlide, handleNext, handlePrev, handleComplete])

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                className="sm:max-w-md p-0 gap-0 overflow-hidden rounded-3xl [&>button]:hidden"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
            >
                {/* Título acessível (visualmente oculto) */}
                <DialogTitle className="sr-only">
                    Tutorial de criação de campanha
                </DialogTitle>

                {/* Área do slide */}
                <div
                    ref={contentRef}
                    className="relative h-[420px] overflow-y-auto overflow-x-hidden bg-gradient-to-b from-background to-muted/30 custom-scrollbar"
                >
                    {slides.map((slide, index) => (
                        <OnboardingSlide
                            key={slide.id}
                            slide={slide}
                            isActive={index === currentSlide}
                        />
                    ))}
                </div>

                {/* Footer com navegação */}
                <div className="p-4 border-t bg-background">
                    {/* Indicadores de progresso (dots) */}
                    <div className="flex items-center justify-center gap-1.5 mb-4">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => handleDotClick(index)}
                                disabled={index > currentSlide}
                                className={cn(
                                    'w-2 h-2 rounded-full transition-all duration-300',
                                    index === currentSlide
                                        ? 'w-6 bg-primary'
                                        : index < currentSlide
                                            ? 'bg-primary/50 hover:bg-primary/70 cursor-pointer'
                                            : 'bg-muted-foreground/20 cursor-not-allowed'
                                )}
                                aria-label={`Ir para slide ${index + 1}`}
                            />
                        ))}
                    </div>

                    {/* Botões de navegação */}
                    <div className="flex items-center justify-between gap-3">
                        {/* Botão Anterior */}
                        <div className="flex-1">
                            {!isFirstSlide && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handlePrev}
                                    className="text-muted-foreground"
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1" />
                                    {ONBOARDING_CONFIG.prevButtonText}
                                </Button>
                            )}
                        </div>

                        {/* Contador */}
                        <span className="text-xs text-muted-foreground">
                            {currentSlide + 1} / {totalSlides}
                        </span>

                        {/* Botão Próximo / Finalizar */}
                        <div className="flex-1 flex justify-end">
                            {isLastSlide ? (
                                <Button
                                    variant="button"
                                    size="sm"
                                    onClick={handleComplete}
                                    className="px-6"
                                >
                                    {ONBOARDING_CONFIG.finishButtonText}
                                </Button>
                            ) : (
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={handleNext}
                                >
                                    {ONBOARDING_CONFIG.nextButtonText}
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
