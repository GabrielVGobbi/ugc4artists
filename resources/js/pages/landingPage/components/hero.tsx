'use client'
import '@/../css/animate.css';

import AppLogo from "@/components/app-logo"
import { BackgroundIllustration } from "@/components/background-illustration"
import { Container, ContainerSection } from "@/components/landing-page/container"
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

const brandLogos = [
    { name: "TechCorp", logo: "TechCorp" },
    { name: "MediaFlow", logo: "MediaFlow" },
    { name: "BrandSync", logo: "BrandSync" },
    { name: "ContentHub", logo: "ContentHub" },
    { name: "CreatorLab", logo: "CreatorLab" },
]

export function Hero() {

    return (
        <>
            <ContainerSection>
                <div className="pt-36 pb-32 sm:pt-60 lg:pt-32 grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <div>
                            {/*
                                <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
                                    A plataforma #1 para marcas e creators
                                </span>
                                */}
                            <h1 className="font-roboto text-3xl sm:text-5xl lg:text-6xl font-medium text-primary-foreground leading-tight tracking-tight text-balance">
                                Campanhas <span className="text-primary">profissionais</span>, conteúdo autêntico. Tudo em um só <span className="text-primary">lugar</span>
                            </h1>
                        </div>
                        <p className="text-lg text-gray-600 max-w-lg leading-relaxed grid gap-2">
                            {/*
                                           <span className=""> Para <span className="text-primary">Artistas</span> : Encontre campanhas, envie propostas e receba após a aprovação</span>
                                <span className=""> Para <span className="text-primary">Marcas</span> : Lance campanhas, contrate artistas qualificados e gerencie tudo sem fricção.</span>
                                */}
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">

                            <Button size="lg" className="bg-primary hover:bg-secondary/90 text-white px-8">
                                Sou uma Marca
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-primary-foreground text-primary-foreground hover:bg-secondary/90 hover:text-white px-8 bg-transparent"
                            >
                                Sou Criador(a)
                            </Button>

                            {/*
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-primary-foreground text-primary-foreground hover:bg-gray-50 font-semibold px-8 h-12 bg-transparent"
                                >
                                    Veja exemplos
                                </Button>
                                */}
                        </div>
                        <p className="text-sm text-gray-500">Mais de 3.000 criadores e artistas se cadastraram</p>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-orange-100 rounded-3xl" />

                        <OptimizedImage
                            src="/assets/landing_page/images/music.webp"
                            alt="Creator fazendo conteúdo UGC"
                            priority={true}
                            aspectRatio='auto'
                            className="relative z-10 w-full h-full object-cover rounded-3xl object-right"
                        />

                        {/* Floating social icons */}
                        {/* TikTok */}
                        <div className="absolute -top-6 left-1/4 z-20 bg-primary-foreground rounded-full p-4 shadow-xl animate-float1">
                            <svg className="h-10 w-10" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                            </svg>
                        </div>
                        {/* Instagram */}
                        <div className="absolute top-1/4 -right-4 z-20 bg-white rounded-full p-4 shadow-xl animate-float2">
                            <svg className="h-10 w-10 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 011.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772 4.915 4.915 0 01-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm6.5-.25a1.25 1.25 0 10-2.5 0 1.25 1.25 0 002.5 0zM12 9a3 3 0 110 6 3 3 0 010-6z" />
                            </svg>
                        </div>
                        {/* YouTube */}
                        <div className="absolute bottom-1/3 -left-6 z-20 bg-white rounded-full p-4 shadow-xl animate-float3">
                            <svg className="h-10 w-10 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                        </div>
                        {/* X/Twitter */}
                        <div className="absolute -bottom-4 right-1/4 z-20 bg-primary-foreground rounded-full p-4 shadow-xl animate-float4">
                            <svg className="h-10 w-10" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </ContainerSection>
        </>
    )
}
