import type { SeoProps, SharedData } from '@/types'
import { ContainerSection } from "@/components/landing-page/container";
import { Layout } from "./layout";
import { usePage } from "@inertiajs/react";
import { dashboard, login, register } from "@/routes";
import { Hero } from './components/hero';
import { AppsLogo } from './components/apps-logo';
import { FadeIn } from '@/components/fade-in';
import { CaseShowcaseSection } from '@/components/landing-page/case-showcase-section';
import { GradientBackground } from '@/components/landing-page/gradient';
import { SolutionSection } from './components/solution-section';
import FeatureCards from './components/feature-cards';
import { Benefits } from './components/benefits';
import { CreatorsCTA } from './components/creators-cta';
import { FinalCTA } from './components/final-cta';
import { Footer } from './components/footer';
import { useEffect } from 'react';
import { AmbassadorTour } from './components/ambassador-tour';

type IndexPageProps = {
    seo: SeoProps;
    canRegister?: boolean
}

export default function LandingPage({ seo, canRegister = true }: IndexPageProps) {

    const { auth } = usePage<SharedData>().props
    const isAuthenticated = Boolean(auth?.user)

    const heroPrimaryHref = isAuthenticated
        ? dashboard().url
        : canRegister
            ? register().url
            : login().url

    const heroPrimaryLabel = isAuthenticated
        ? 'Ir para dashboard'
        : canRegister
            ? 'Comece agora'
            : 'Entrar'

    const headerCtaHref = heroPrimaryHref
    const headerCtaLabel = isAuthenticated
        ? 'Dashboard'
        : canRegister
            ? 'Lista de Espera'
            : 'Entrar'

    const artistCtaHref = heroPrimaryHref
    const brandCtaHref = login().url

    useEffect(() => {
        document.documentElement.classList.add('dark')
        return () => {
            document.documentElement.classList.add('dark')
        }
    }, [])

    return (
        <Layout
            isAuthenticated={isAuthenticated}
            headerCtaHref={headerCtaHref}
            headerCtaLabel={headerCtaLabel}
            seo={seo}
        >

            <FadeIn>
                <GradientBackground></GradientBackground>
                <Hero />
            </FadeIn>

            <AppsLogo />

            <CaseShowcaseSection />

            <SolutionSection />

            <AmbassadorTour
                artistCtaHref={artistCtaHref}
                brandCtaHref={brandCtaHref}
                artistName="Mavi"
            />

            <Benefits />

            <FeatureCards />

            <ContainerSection id="cta" className="pb-24 px-4 sm:px-6 lg:px-8 bg-[#fff7ed]" >
                <CreatorsCTA />
                <FinalCTA />
            </ContainerSection>

            <div className="min-h-screen bg-gradient-to-br from-purple-200 via-purple-300 to-purple-400 overflow-hidden">
                <div className="container mx-auto px-4 py-8 lg:py-12">
                    <div className="grid grid-cols-12 gap-4 lg:gap-6 max-w-7xl mx-auto">

                        <div className="col-span-12 lg:col-span-6 flex flex-col justify-center items-center px-4 lg:px-8 space-y-6">
                            <div className="text-center space-y-6">
                                <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                                    E aí, gosta de fazer vídeos testando produtos?
                                </h1>

                                <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 shadow-xl">
                                    <p className="text-lg lg:text-xl text-white font-medium">
                                        Já pensou em ganhar mimos e receber um pagamento por isso?
                                    </p>
                                    <p className="text-lg lg:text-xl text-white font-medium mt-2">
                                        Então é você mesmo que a bloomer está procurando!
                                    </p>
                                </div>

                                <button className="bg-gray-900 hover:bg-gray-800 text-white font-semibold text-lg px-12 py-4 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300">
                                    Quero ser Creator
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 w-full mt-8">
                                <div className="relative rounded-3xl overflow-hidden shadow-xl transform hover:scale-105 transition-transform duration-300">
                                    <img
                                        src="https://images.pexels.com/photos/6860658/pexels-photo-6860658.jpeg?auto=compress&cs=tinysrgb&w=600"
                                        alt="Filming"
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                                        <p className="text-white text-xs">foto por sam lion</p>
                                    </div>
                                </div>

                                <div className="relative rounded-3xl overflow-hidden shadow-xl transform hover:scale-105 transition-transform duration-300">
                                    <img
                                        src="https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=600"
                                        alt="Cooking"
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                                        <p className="text-white text-xs">foto por polina tankilevitch</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-12 sm:col-span-6 lg:col-span-3 space-y-4">
                            <div className="relative rounded-3xl overflow-hidden shadow-xl transform hover:scale-105 transition-transform duration-300">
                                <img
                                    src="https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=600"
                                    alt="Produtos"
                                    className="w-full h-64 object-cover"
                                />
                                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                                    <p className="text-white text-xs">foto por acda longazeen</p>
                                </div>
                            </div>

                            <div className="relative rounded-3xl overflow-hidden shadow-xl transform hover:scale-105 transition-transform duration-300">
                                <img
                                    src="https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=600"
                                    alt="Influencer"
                                    className="w-full h-80 object-cover"
                                />
                                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                                    <p className="text-white text-xs">foto por sam lion</p>
                                </div>
                            </div>
                        </div>


                        <div className="col-span-12 sm:col-span-6 lg:col-span-3 space-y-4">
                            <div className="relative rounded-3xl overflow-hidden shadow-xl transform hover:scale-105 transition-transform duration-300">
                                <img
                                    src="https://images.pexels.com/photos/4004374/pexels-photo-4004374.jpeg?auto=compress&cs=tinysrgb&w=600"
                                    alt="Creator"
                                    className="w-full h-96 object-cover"
                                />
                                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                                    <p className="text-white text-xs">foto por sam lion</p>
                                </div>
                            </div>

                            <div className="relative rounded-3xl overflow-hidden shadow-xl transform hover:scale-105 transition-transform duration-300">
                                <img
                                    src="https://images.pexels.com/photos/1616403/pexels-photo-1616403.jpeg?auto=compress&cs=tinysrgb&w=600"
                                    alt="Maquiagem"
                                    className="w-full h-48 object-cover"
                                />
                                <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                                    <p className="text-white text-xs">foto por daisy anderson</p>
                                </div>
                            </div>
                        </div>



                        <div className="col-span-12 sm:col-span-6 lg:col-span-3 lg:col-start-1 space-y-4">
                            <div className="relative rounded-3xl overflow-hidden shadow-xl transform hover:scale-105 transition-transform duration-300">
                                <img
                                    src="https://images.pexels.com/photos/7543533/pexels-photo-7543533.jpeg?auto=compress&cs=tinysrgb&w=600"
                                    alt="Filming content"
                                    className="w-full h-64 object-cover"
                                />
                                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                                    <p className="text-white text-xs">foto por sam lion</p>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </Layout >
    )
}
