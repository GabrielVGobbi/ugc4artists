import { ContainerSection } from "@/components/landing-page/container"
import { Button } from "@/components/ui/button"
import { Link } from "@inertiajs/react"
import { ArrowRight } from "lucide-react"

export function FinalCTA() {
    return (
        <div className="max-w-7xl mx-auto mt-20">
            <div className="relative overflow-hidden rounded-3xl bg-black px-8 py-16 sm:px-16 sm:py-24 ">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 blur-3xl " />

                <div className="relative max-w-2xl ">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight text-balance">
                        Pronto para escalar seu conteúdo?
                    </h2>
                    <p className="mt-4 text-lg text-white/70 leading-relaxed">
                        Agende uma call de 15 minutos e descubra como a UGC4Artists pode transformar seus resultados.
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row gap-4">
                        <Link
                            prefetch
                            href={'/waitlist'}
                            target='_blank'
                        >
                            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8">
                                Começe Gratuitamente
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-white/30 text-white hover:bg-white/10 px-8 bg-transparent"
                        >
                            Fale com um especialista
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
