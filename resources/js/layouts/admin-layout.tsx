import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'
import { type ReactNode } from 'react'

interface AdminLayoutProps {
	children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
	return (
		<div className="flex h-screen w-full bg-[#FAF9F6] text-[#0A0A0A] overflow-hidden">
			{/* Sidebar - Fixed width */}
			<AdminSidebar />

			{/* Main Content Area */}
			<main className="flex-1 flex flex-col overflow-hidden relative ml-72">
				{/* Editorial Background Text - Intentional Asymmetry */}
				<div className="absolute top-[-10%] right-[-5%] text-[24rem] font-bold text-black/[0.02] pointer-events-none select-none z-0 rotate-[-5deg]">
					UGC
				</div>

				{/* Subtle gradient overlay */}
				<div className="absolute inset-0 bg-gradient-to-br from-[#FF4D00]/[0.01] via-transparent to-transparent pointer-events-none z-0"></div>

				<AdminHeader />

				<div className="flex-1 overflow-y-auto px-10 pb-12 custom-scrollbar relative z-10">
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


