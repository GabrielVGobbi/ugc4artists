import { Button } from "@/components/ui/button"
import { ArrowRight, Camera, Wallet, Calendar } from "lucide-react"

const perks = [
    { icon: Wallet, text: "Ganhe até R$2.000/mês" },
    { icon: Calendar, text: "Horários flexíveis" },
    { icon: Camera, text: "Use seu celular" },
]

export function CreatorsCTA() {
    return (
        <section id="criadores" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#fff7ed]">
            <div className="max-w-7xl mx-auto">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-[#040404] tracking-tight">Quer ser um criador <span className="text-primary">ForArtists?</span> </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Monetize sua criatividade. Trabalhe com marcas que você ama, no seu tempo.
                    </p>

                    <div className="mt-10 flex flex-wrap justify-center gap-6">
                        {perks.map((perk, index) => (
                            <div key={index} className="flex items-center gap-2 text-[#040404]">
                                <perk.icon className="h-5 w-5 text-primary" />
                                <span className="text-sm font-medium">{perk.text}</span>
                            </div>
                        ))}
                    </div>

                    <Button size="lg" className="mt-10 bg-[#040404] hover:bg-primary/90 text-white px-8">
                        Cadastrar como Criador
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        </section>
    )
}
