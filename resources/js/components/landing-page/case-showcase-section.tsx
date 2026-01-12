import { ContainerSection } from "./container"

type CaseItem = {
    name: string
    duration: string
    status: 'aprovado' | 'pendente' | 'rejeitado'
    platform: string
}

const caseItems: CaseItem[] = [
    {
        name: 'Vídeo de Gabriela',
        duration: '15s • Modo passagens',
        status: 'pendente',
        platform: 'Instagram',
    },
    {
        name: 'Vídeo de Elena',
        duration: '15s • Modo retrato',
        status: 'rejeitado',
        platform: 'TikTok',
    },
    {
        name: 'Vídeo de Rafael',
        duration: '30s • Review sincero',
        status: 'aprovado',
        platform: 'YouTube',
    },
]

const statusStyles: Record<CaseItem['status'], string> = {
    aprovado: 'bg-green-50 text-green-700',
    pendente: 'bg-amber-50 text-amber-700',
    rejeitado: 'bg-rose-50 text-rose-700',
}

export function CaseShowcaseSection() {
    return (
        <ContainerSection
            id="show-cases"
            className="bg-white "
        >
            <div className="pt-36 pb-32 sm:pt-60 lg:pt-32  items-center mx-auto grid  gap-12  lg:grid-cols-2 ">
                <div className="space-y-6">
                    <span className="text-sm font-semibold uppercase tracking-widest text-primary">
                        CASES
                    </span>
                    <h2 className="text-5xl font-semibold text-[#040404]">
                        Onde marcas, artistas e criadores se encontram
                    </h2>
                    <p className="text-base text-gray-600">
                        Grandes campanhas não nascem do acaso. Elas surgem quando pessoas criativas, estratégias bem definidas e conteúdo autêntico se conectam. Aqui, criadores UGC, artistas e marcas constroem narrativas que geram engajamento real, ampliam alcance e fazem a música circular onde ela realmente importa: nas pessoas.
                    </p>
                    <ul className="flex flex-wrap gap-2  ">
                        {['spotify-icon', 'youtube-logo', 'deezer-logo', 'youtube-music-logo'].map((brand) => (
                            <li
                                key={brand}
                                className="rounded-full border border-gray-200 px-4 py-1 shadow-sm"
                            >
                                <img
                                    className="mx-auto h-15 w-full  "
                                    src={`/assets/landing_page/images/svg/${brand}.svg`}
                                    alt="Laravel Logo"
                                />
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="relative">
                    <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-primary/50 via-secondary/10 to-primary/10 blur-3xl" />
                    <div className="relative space-y-4 rounded-[32px] bg-white/90 p-6 shadow-[0_35px_65px_-40px_rgb(255, 121, 0)] backdrop-blur">
                        {caseItems.map((item) => (
                            <div
                                key={item.name}
                                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-[#040404]">{item.name}</p>
                                        <p className="text-xs text-gray-500">{item.duration}</p>
                                    </div>
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[item.status]}`}
                                    >
                                        {item.status === 'aprovado' && 'Aprovado'}
                                        {item.status === 'pendente' && 'Pendente'}
                                        {item.status === 'rejeitado' && 'Rejeitado'}
                                    </span>
                                </div>
                                <div className="mt-3 text-xs font-medium text-gray-500">
                                    Plataforma: {item.platform}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </ContainerSection>
    )
}


