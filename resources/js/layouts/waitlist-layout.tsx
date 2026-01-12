import { type ReactNode } from 'react'
import { Link } from '@inertiajs/react'
import { X } from 'lucide-react'
import { home } from '@/routes'
import AppLogo from '@/components/app-logo'
import { motion } from 'motion/react'

interface WaitlistLayoutProps {
	children: ReactNode
	sidebar: ReactNode
	headerCompact?: boolean
}

export default function WaitlistLayout({ children, sidebar, headerCompact = false }: WaitlistLayoutProps) {
	return (
		<div className="flex h-screen w-full bg-[#0a0a0a] text-white overflow-hidden">
			{/* Background Elements - Fixed */}
			<div className="fixed inset-0 pointer-events-none z-0">
				<div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#fc7c04]/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
				<div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#fc7c04]/3 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
			</div>

			{/* Sidebar - Fixed width */}
			{sidebar}

			{/* Main Content Area */}
			<main className="flex-1 flex flex-col overflow-hidden relative ml-72">
				{/* Editorial Background Text - Intentional Asymmetry */}
				<div className="absolute top-[-8%] right-[-3%] text-[18rem] font-bold text-white/[0.01] pointer-events-none select-none z-0 rotate-[-3deg] tracking-tighter">
					UGC 4ARTISTS
				</div>

				{/* Subtle gradient overlay */}
				<div className="absolute inset-0 bg-gradient-to-br from-[#fc7c04]/[0.02] via-transparent to-transparent pointer-events-none z-0"></div>

				{/* Minimal Header - Diminui quando compact */}
				<motion.header
					animate={{
						paddingTop: headerCompact ? '0.5rem' : '1rem',
						paddingBottom: headerCompact ? '0.5rem' : '1rem',
						transition: {
							duration: 0.5,
							ease: [0.32, 0.72, 0, 1],
						},
					}}
					className="px-10 flex items-center justify-between bg-transparent relative z-20"
				>
					<motion.div
						animate={{
							scale: headerCompact ? 0.85 : 1,
							transition: {
								duration: 0.5,
								ease: [0.32, 0.72, 0, 1],
							},
						}}
						className="flex items-center gap-4"
					>
						<div className="relative">
							<div className="absolute inset-0 bg-[#fc7c04]/20 blur-xl rounded-full" />
							<Link href={home()}>
								<AppLogo variant="white" />
							</Link>
						</div>
					</motion.div>
					<Link
						href={home()}
						className="group flex items-center justify-center w-10 h-10 rounded-full border border-white/10 hover:border-[#fc7c04]/50 hover:bg-[#fc7c04]/5 transition-all duration-300"
					>
						<X className="w-4 h-4 text-white/60 group-hover:text-[#fc7c04] transition-colors" />
					</Link>
				</motion.header>

				{/* Main Content with Custom Scrollbar */}
				<div className="flex-1 overflow-y-auto px-10  custom-scrollbar relative z-10">
					{children}
				</div>
			</main>

			<style>{`
				.custom-scrollbar::-webkit-scrollbar {
					width: 8px;
				}

				.custom-scrollbar::-webkit-scrollbar-track {
					background: transparent;
				}

				.custom-scrollbar::-webkit-scrollbar-thumb {
					background: rgba(255, 255, 255, 0.1);
					border-radius: 4px;
				}

				.custom-scrollbar::-webkit-scrollbar-thumb:hover {
					background: #fc7c04;
				}
			`}</style>
		</div>
	)
}

