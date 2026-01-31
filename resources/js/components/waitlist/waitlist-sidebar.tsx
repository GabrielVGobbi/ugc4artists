import { Check, Instagram, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ComponentType } from 'react'
import { motion } from 'motion/react'

interface Step {
	number: number
	id: string
	title: string
	subtitle: string
	icon: ComponentType<{ className?: string }>
}

interface WaitlistSidebarProps {
	steps: Step[]
	currentStep: number
	progressValue: number
	isSuccessStep: boolean
}

export const WaitlistSidebar = ({
	steps,
	currentStep,
	progressValue,
	isSuccessStep,
}: WaitlistSidebarProps) => {
	return (
		<aside className="w-72 bg-gradient-to-b from-secondary to-[#0f0f0f] h-screen flex flex-col p-6 justify-between fixed left-0 top-0 z-50 border-r border-white/[0.08]">
			{/* Subtle gradient overlay */}
			<div className="absolute inset-0 bg-gradient-to-br from-[#fc7c04]/[0.02] via-transparent to-transparent pointer-events-none" />

			<div className="relative z-10">
				{/* Progress Section - Mais elegante */}
				<div className="mb-8 space-y-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
					<div className="flex items-center justify-between">
						<span className="text-[10px] uppercase tracking-[0.15em] text-white/50 font-bold">
							Progresso
						</span>
						<motion.span
							key={progressValue}
							initial={{ scale: 1.2, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							className="text-2xl text-[#fc7c04] font-black tracking-tight"
						>
							{progressValue}%
						</motion.span>
					</div>
					<div className="relative h-2 bg-white/[0.05] rounded-full overflow-hidden">
						<motion.div
							initial={{ width: 0 }}
							animate={{ width: `${progressValue}%` }}
							transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
							className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#fc7c04] via-[#ff8c42] to-[#ff9a3c] rounded-full shadow-lg shadow-[#fc7c04]/30"
						>
							{/* Shine effect */}
							<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
						</motion.div>
					</div>
				</div>

				{/* Steps Navigation - Redesenhado */}
				<nav className="space-y-1">
					{steps.map((step, index) => {
						const Icon = step.icon
						const isActive = currentStep === step.number
						const isCompleted = currentStep > step.number

						return (
							<motion.div
								key={step.id}
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: index * 0.1 }}
								className={cn(
									'relative flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group',
									isActive && 'bg-gradient-to-r from-[#fc7c04]/15 to-transparent border border-[#fc7c04]/20',
									!isActive && 'hover:bg-white/[0.03]'
								)}
							>
								{/* Step Icon - Mais moderno */}
								<div
									className={cn(
										'relative flex items-center justify-center w-11 h-11 rounded-lg transition-all duration-300 shrink-0',
										isActive && 'bg-gradient-to-br from-[#fc7c04] to-[#ff9a3c] shadow-xl shadow-[#fc7c04]/40 scale-105',
										isCompleted && 'bg-gradient-to-br from-[#10b981] to-[#059669] shadow-lg shadow-emerald-500/30',
										!isActive && !isCompleted && 'bg-white/[0.05] border border-white/10 group-hover:border-white/20'
									)}
								>
									{isCompleted ? (
										<motion.div
											initial={{ scale: 0, rotate: -180 }}
											animate={{ scale: 1, rotate: 0 }}
											transition={{ type: 'spring', stiffness: 200, damping: 15 }}
										>
											<Check className="w-5 h-5 text-white font-bold" strokeWidth={3} />
										</motion.div>
									) : (
										<Icon
											className={cn(
												'w-5 h-5 transition-colors',
												isActive && 'text-black',
												!isActive && 'text-white/40 group-hover:text-white/60'
											)}
										/>
									)}

									{/* Glow effect para active */}
									{isActive && (
										<div className="absolute inset-0 rounded-lg bg-[#fc7c04] blur-xl opacity-50 -z-10" />
									)}
								</div>

								{/* Step Info - Typography melhorada */}
								<div className="flex-1 min-w-0">
									<p
										className={cn(
											'font-bold text-xs tracking-tight transition-colors truncate',
											isActive && 'text-white',
											isCompleted && 'text-emerald-400',
											!isActive && !isCompleted && 'text-white/40 group-hover:text-white/60'
										)}
									>
										{step.title}
									</p>
									<p
										className={cn(
											'text-[10px] font-medium transition-colors leading-tight mt-0.5',
											isActive && 'text-white/70',
											isCompleted && 'text-emerald-400/60',
											!isActive && !isCompleted && 'text-white/30'
										)}
									>
										{step.subtitle}
									</p>
								</div>

							</motion.div>
						)
					})}
				</nav>
			</div>

			{/* Bottom Section - Redesenhado */}
			<div className="relative z-10 space-y-4 mt-4">
				{/* Success Card - Mais sofisticado */}
				{isSuccessStep && (
					<motion.div
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						className="bg-gradient-to-br from-[#fc7c04] via-[#ff8c42] to-[#ff9a3c] p-5 rounded-2xl relative overflow-hidden group cursor-pointer hover:shadow-2xl hover:shadow-[#fc7c04]/40 transition-all duration-500"
					>
						{/* Animated background */}
						<div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
						<div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />

						<div className="relative z-10 flex items-center gap-3">

							<div>
								<p className="text-white/90 text-[10px] font-bold uppercase tracking-[0.15em]">
									Parabéns!
								</p>
								<h3 className="text-white font-black text-sm leading-tight tracking-tight">
									Você está na lista!
								</h3>
							</div>
						</div>
					</motion.div>
				)}

				{/* Social Links - Mais elegante */}
				<div className="pt-4 border-t border-white/[0.08]">
					<p className="text-[10px] text-white/40 uppercase tracking-[0.15em] mb-3 font-bold">
						Siga-nos
					</p>
					<div className="flex items-center gap-2">
						<a
							href="https://www.instagram.com/ugc4artists/"
							target="_blank"
							rel="noopener noreferrer"
							className="group flex items-center justify-center w-10 h-10 rounded-lg border border-white/10 hover:border-[#fc7c04]/50 hover:bg-[#fc7c04]/10 transition-all duration-300 relative overflow-hidden"
						>
							<div className="absolute inset-0 bg-gradient-to-br from-[#fc7c04]/0 to-[#fc7c04]/0 group-hover:from-[#fc7c04]/10 group-hover:to-transparent transition-all duration-300" />
							<Instagram className="w-4 h-4 text-white/40 group-hover:text-[#fc7c04] transition-colors relative z-10" />
						</a>
					</div>
				</div>

				{/* Brand watermark */}
				<div className="pt-4 border-t border-white/[0.05]">
					<p className="text-[9px] text-white/20 font-medium tracking-wide">
						UGC 4Artists © 2026
					</p>
				</div>
			</div>

			{/* Shimmer animation CSS */}
			<style>{`
				@keyframes shimmer {
					0% { transform: translateX(-100%); }
					100% { transform: translateX(100%); }
				}
				.animate-shimmer {
					animation: shimmer 2s infinite;
				}
			`}</style>
		</aside>
	)
}

