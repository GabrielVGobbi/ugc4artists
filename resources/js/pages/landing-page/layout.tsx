import { ReactNode } from "react"
import { Footer } from './components/footer'
import { Header } from './components/header'
import { Head } from "@inertiajs/react"
import { SeoProps } from "@/types"

export type LayoutProps = {
    children: ReactNode
    isAuthenticated: boolean
    headerCtaHref: string
    headerCtaLabel: string
    seo: SeoProps
}

export function Layout({ children, isAuthenticated, headerCtaHref, headerCtaLabel, seo }: LayoutProps) {
    const { title, description, canonical, image } = seo;

    return (
        <>

            <Head>
                <title>{title}</title>
                <meta name="description" content={description} />

                <link rel="canonical" href={canonical} />

                <meta property="og:type" content="website" />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:url" content={canonical} />
                <meta property="og:image" content={image} />
                <meta property="og:site_name" content="UGC4Artists" />

                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={description} />
                <meta name="twitter:image" content={image} />

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'WebSite',
                            name: 'UGC4Artists',
                            url: canonical,
                            potentialAction: {
                                '@type': 'SearchAction',
                                target: `${canonical}?q={search_term_string}`,
                                'query-input': 'required name=search_term_string',
                            },
                        }),
                    }}
                />
            </Head>

            <Header
                isAuthenticated={isAuthenticated}
                headerCtaHref={headerCtaHref}
                headerCtaLabel={headerCtaLabel}
            />
            <main className="bg-gradient-to-b from-orange-50/50 to-white">{children}</main>
            {/*
                <Footer />
                */}
        </>
    )
}

