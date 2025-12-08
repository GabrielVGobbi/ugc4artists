import { ContainerSection } from "@/components/landing-page/container"
import { TrendingUp, Shield, Zap, DollarSign } from "lucide-react"

const benefits = [
    {
        icon: TrendingUp,
        title: "ROI Comprovado",
        description: "Marcas que usam UGC têm até 4x mais conversão que anúncios tradicionais.",
    },
    {
        icon: Shield,
        title: "Direitos Inclusos",
        description: "Todos os vídeos vêm com licença vitalícia para uso comercial.",
    },
    {
        icon: Zap,
        title: "Velocidade",
        description: "Receba conteúdo em 48h. Escale sua produção sem aumentar seu time.",
    },
    {
        icon: DollarSign,
        title: "Preço Justo",
        description: "A partir de R$297 por vídeo. Sem taxas ocultas, sem surpresas.",
    },
]

export function Benefits() {
    return (
        <ContainerSection id="beneficios" className="bg-white py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-[#040404] tracking-tight text-balance">
                            Por que escolher <span className="text-primary">ForArtists</span>?
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic quisquam dolores, totam dignissimos maiores, dolorum doloribus ab, reprehenderit debitis natus assumenda consectetur quos aliquid expedita. Commodi omnis quis ea rerum.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="p-6 rounded-xl border border-gray-300 hover:shadow-lg transition-shadow">
                                <div className="w-10 h-10 rounded-lg bg-[#fff7ed] flex items-center justify-center mb-4">
                                    <benefit.icon className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="font-semibold text-[#040404] mb-2">{benefit.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </ContainerSection>
    )
}
