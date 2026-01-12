import type { SharedData } from '@/types'
import { usePage, Head } from '@inertiajs/react'
import { useEffect, useState, useCallback } from 'react'
import { WaitListForm, steps } from './waitlist-form'
import WaitlistLayout from '@/layouts/waitlist-layout'
import { WaitlistSidebar } from '@/components/waitlist/waitlist-sidebar'
import HeroShowcase from './components/hero'
import { motion, AnimatePresence } from 'motion/react'

type IndexPageProps = {
	canRegister?: boolean
}

export default function WaitListIndex({ canRegister = true }: IndexPageProps) {
	const { auth } = usePage<SharedData>().props
	const isAuthenticated = Boolean(auth?.user)

	const [currentStep, setCurrentStep] = useState(0)
	const [isSuccessStep, setIsSuccessStep] = useState(false)
	const [hasInteracted, setHasInteracted] = useState(false)

	useEffect(() => {
		document.documentElement.classList.remove('dark')
		document.body.classList.add('body_waitlist')
		return () => {
			document.documentElement.classList.add('dark')
			document.body.classList.remove('body_waitlist')
		}
	}, [])

	const totalSteps = steps.length
	const progressValue = isSuccessStep
		? 100
		: Math.round(((currentStep + 1) / totalSteps) * 100)

	// Callback to sync form state with sidebar
	const handleStepChange = useCallback((step: number, success: boolean) => {
		setCurrentStep(step)
		setIsSuccessStep(success)
	}, [])

	// Detectar interação do usuário
	const handleFormInteraction = useCallback(() => {
		if (!hasInteracted) {
			setHasInteracted(true)
		}
	}, [hasInteracted])

	return (
		<>
			<Head title="Lista de Espera - UGC 4Artists" />

			<WaitlistLayout
				sidebar={
					<WaitlistSidebar
						steps={steps}
						currentStep={currentStep}
						progressValue={progressValue}
						isSuccessStep={isSuccessStep}
					/>
				}
				headerCompact={hasInteracted}
			>
				{/* Hero Section - Diminui e desaparece ao interagir */}
				<AnimatePresence mode="wait">
					{!hasInteracted && (
						<motion.div
							initial={{ opacity: 1, height: 'auto', marginBottom: '4rem' }}
							exit={{
								opacity: 0,
								height: 0,
								marginBottom: 0,
								transition: {
									duration: 0.5,
									ease: [0.32, 0.72, 0, 1],
								},
							}}
							className="overflow-hidden"
						>
							<HeroShowcase />
						</motion.div>
					)}
				</AnimatePresence>

				{/* Form Section - Centraliza e anima quando hero some */}
				<motion.div
					animate={{
						marginTop: hasInteracted ? '0' : '0',
						transition: {
							duration: 0.6,
							ease: [0.32, 0.72, 0, 1],
						},
					}}
					className="flex items-center justify-center"
					style={{
						minHeight: hasInteracted ? 'calc(100vh - 120px)' : 'auto',
					}}
				>
					<WaitListForm onStepChange={handleStepChange} onInteraction={handleFormInteraction} />
				</motion.div>
			</WaitlistLayout>
		</>
	)
}
