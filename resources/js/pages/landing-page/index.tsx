import type { SeoProps, SharedData } from '@/types'
import { ContainerSection } from "@/components/landing-page/container";
import { Layout } from "./layout";
import { usePage } from "@inertiajs/react";
import { dashboard } from "@/routes";
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
import { FAQ } from './components/faq';

type IndexPageProps = {
    seo: SeoProps;
    canRegister?: boolean
}

export default function LandingPage({ seo, canRegister = true }: IndexPageProps) {

    const { auth } = usePage<SharedData>().props
    const isAuthenticated = Boolean(auth?.user)

    //const heroPrimaryHref = isAuthenticated
    //    ? dashboard().url
    //    : canRegister
    //        ? register().url
    //        : login().url
    //
    //const heroPrimaryLabel = isAuthenticated
    //    ? 'Ir para dashboard'
    //    : canRegister
    //        ? 'Comece agora'
    //        : 'Entrar'
    //

    const headerCtaHref = null; //heroPrimaryHref
    const headerCtaLabel = isAuthenticated
        ? 'Dashboard'
        : canRegister
            ? 'Lista de Espera'
            : 'Entrar'

    //const artistCtaHref = heroPrimaryHref
    //const brandCtaHref = login().url

    useEffect(() => {
        document.documentElement.classList.remove('dark')
        document.documentElement.classList.add('light')
        return () => {
            document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('light')
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

            {/*
            <AmbassadorTour
                artistCtaHref={artistCtaHref}
                brandCtaHref={brandCtaHref}
                artistName="Mavi"
            />
*/}
            <Benefits />

            <FeatureCards />

            <FAQ />

            <ContainerSection id="cta" className="pb-24 px-4 sm:px-6 lg:px-8 " >
                {/*<CreatorsCTA />*/}
                <FinalCTA />
            </ContainerSection>

            <Footer />
        </Layout >
    )
}
