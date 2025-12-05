import type { SharedData } from '@/types'
import { Container } from "@/components/landing-page/container";
import { Layout } from "./layout";
import { usePage } from "@inertiajs/react";
import { dashboard, login, register } from "@/routes";
import { Hero } from './components/hero';
import { AppsLogo } from './components/apps-logo';
import { FadeIn } from '@/components/fade-in';
import { CaseShowcaseSection } from '@/components/landing-page/case-showcase-section';
import { GradientBackground } from '@/components/landing-page/gradient';
import { PainPointsSection } from '@/components/landing-page/pain-points-section';

type IndexPageProps = {
    canRegister?: boolean
}

export default function LandingPage({ canRegister = true }: IndexPageProps) {

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

    return (
        <Layout
            isAuthenticated={isAuthenticated}
            headerCtaHref={headerCtaHref}
            headerCtaLabel={headerCtaLabel}
        >
            <FadeIn>
                <GradientBackground></GradientBackground>
                <Hero />
            </FadeIn>

            <AppsLogo />

            <CaseShowcaseSection />

            <PainPointsSection />

        </Layout>
    )
}
