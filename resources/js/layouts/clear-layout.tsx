import { type ReactNode } from 'react'
import { motion } from 'motion/react'
import { Link } from '@inertiajs/react'
import AppLogo from '@/components/app-logo'
import { home } from '@/routes'
import { X } from 'lucide-react'

interface AppLayoutProps {
    children: ReactNode
}

export default function ClearLayout({ children, headerCompact = false }: AppLayoutProps) {
    return (
        <div className="flex h-screen w-full bg-[#FAF9F6] text-secondary overflow-hidden">

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden">

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
                                <AppLogo variant="dark" />
                            </Link>
                        </div>
                    </motion.div>
                </motion.header>

                {/* Main Content with Custom Scrollbar */}
                <div className="flex-1 overflow-y-auto px-10  custom-scrollbar relative z-10">
                    {children}
                </div>
            </main>

        </div>
    )
}




