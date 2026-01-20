'use client'

import AppLogo from "@/components/app-logo"
import { BackgroundIllustration } from "@/components/background-illustration"
import { Container } from "@/components/landing-page/container"
import { Button } from "@/components/ui/button"
import { dashboard, login } from "@/routes"
import { Link } from "@inertiajs/react"
import { ArrowRight, PlayIcon, SquareArrowUpRight } from "lucide-react"

import logoBbc from '@/images/logos/bbc.svg'
import logoCbs from '@/images/logos/cbs.svg'
import logoCnn from '@/images/logos/cnn.svg'
import logoFastCompany from '@/images/logos/fast-company.svg'
import logoForbes from '@/images/logos/forbes.svg'
import logoHuffpost from '@/images/logos/huffpost.svg'
import logoTechcrunch from '@/images/logos/techcrunch.svg'
import logoWired from '@/images/logos/wired.svg'
import { cn } from "@/lib/utils"
import { OptimizedImage } from "@/components/utils/optimized-image"
import { InfiniteSlider } from "@/components/ui/infinite-slider"
import { ProgressiveBlur } from "@/components/ui/progressive-blur"

const brandLogos = [
    { name: "TechCorp", logo: "TechCorp" },
    { name: "MediaFlow", logo: "MediaFlow" },
    { name: "BrandSync", logo: "BrandSync" },
    { name: "ContentHub", logo: "ContentHub" },
    { name: "CreatorLab", logo: "CreatorLab" },
]

export function AppsLogo() {

    return (
        <>
            <section className="bg-background overflow-hidden">
                <div className="group relative m-auto max-w-7xl px-6">
                    <div className="flex flex-col items-center md:flex-row">
                        <div className="md:max-w-44 md:border-r md:pr-6">
                            <p className="text-end text-sm">Integrado com as melhores plataformas</p>
                        </div>
                        <div className="relative py-6 md:w-[calc(100%-11rem)]">
                            <InfiniteSlider
                                speedOnHover={40}
                                speed={70}
                                gap={112}>
                                <div className="flex">
                                    <img
                                        className="mx-auto h-40 w-fit "
                                        src="/assets/landing_page/images/svg/youtube-logo.svg"
                                        alt="Laravel Logo"
                                        height="16"
                                        width="auto"
                                    />
                                </div>
                                <div className="flex">
                                    <img
                                        className="mx-auto h-40 w-fit dark:invert"
                                        src="/assets/landing_page/images/svg/deezer-logo.svg"
                                        alt="Nvidia Logo"
                                        height="20"
                                        width="auto"
                                    />
                                </div>
                                <div className="flex">
                                    <img
                                        className="mx-auto h-40 w-fit "
                                        src="/assets/landing_page/images/svg/youtube-music-logo.svg"
                                        alt="Lemon Squeezy Logo"
                                        height="20"
                                        width="auto"
                                    />
                                </div>
                                <div className="flex">
                                    <img
                                        className="mx-auto h-40 w-fit dark:invert"
                                        src="/assets/landing_page/images/svg/tiktok-logo.svg"
                                        alt="GitHub Logo"
                                        height="16"
                                        width="auto"
                                    />
                                </div>
                                <div className="flex">
                                    <img
                                        className="mx-auto h-40 w-fit "
                                        src="/assets/landing_page/images/svg/spotify-logo.svg"
                                        alt="Nike Logo"
                                        height="20"
                                        width="auto"
                                    />
                                </div>
                            </InfiniteSlider>

                            <div className="bg-linear-to-r from-background absolute inset-y-0 left-0 w-20"></div>
                            <div className="bg-linear-to-l from-background absolute inset-y-0 right-0 w-20"></div>
                            <ProgressiveBlur
                                className="pointer-events-none absolute left-0 top-0 h-full w-20"
                                direction="left"
                                blurIntensity={1}
                            />
                            <ProgressiveBlur
                                className="pointer-events-none absolute right-0 top-0 h-full w-20"
                                direction="right"
                                blurIntensity={1}
                            />
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
