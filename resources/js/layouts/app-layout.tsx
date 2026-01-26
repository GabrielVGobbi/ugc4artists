import { AppSidebar } from '@/components/app/app-sidebar'
import { AppHeader } from '@/components/app/app-header'
import { type ReactNode } from 'react'

interface AppLayoutProps {
	children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
	return (
		<div className="flex h-screen w-full bg-[#FAF9F6] text-[#0A0A0A] overflow-hidden">
			{/* Sidebar - Fixed width */}
			<AppSidebar />

			{/* Main Content Area */}
			<main className="flex-1 flex flex-col overflow-hidden relative ml-72">
				{/* Editorial Background Text - Intentional Asymmetry */}
				<div className="absolute top-[-10%] right-[-5%] text-[24rem] font-bold text-black/[0.02] pointer-events-none select-none z-0 rotate-[-5deg]">
					UGC
				</div>

				{/* Subtle gradient overlay */}
				<div className="absolute inset-0 bg-gradient-to-br from-primary/[0.01] via-transparent to-transparent pointer-events-none z-0"></div>

				<AppHeader />

				<div className="flex-1 overflow-y-auto px-10 pb-12 pt-2 custom-scrollbar relative z-10">
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
					background: #e4e4e7;
					border-radius: 4px;
				}

				.custom-scrollbar::-webkit-scrollbar-thumb:hover {
					background: #FF4D00;
				}
			`}</style>
		</div>
	)
}




