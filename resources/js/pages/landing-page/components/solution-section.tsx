"use client"

import { Check } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const solutions = [
    "Acesso a milhares de criadores verificados",
    "Contratos e pagamentos automatizados",
    "Briefings padronizados e revisões ilimitadas",
    "Conteúdo otimizado para cada plataforma",
]

export function SolutionSection() {
    const [isVisible, setIsVisible] = useState(false)
    const sectionRef = useRef<HTMLElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                }
            },
            { threshold: 0.2 },
        )
        if (sectionRef.current) observer.observe(sectionRef.current)
        return () => observer.disconnect()
    }, [])

    return (
        <section ref={sectionRef} id="como-funciona" className="py-20 bg-[#040404] overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div
                        className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-16"
                            }`}
                    >
                        <img
                            src="/assets/landing_page/images/modern-dashboard.jpg"
                            alt="Plataforma UGC Dashboard"
                            className="rounded-2xl shadow-2xl hover:scale-[1.02] transition-transform duration-500"
                        />
                    </div>

                    <div
                        className={`space-y-8 transition-all duration-1000 delay-200 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-16"
                            }`}
                    >
                        <div>
                            <span className="inline-block px-4 py-1.5 bg-[#fc7c04] text-white text-sm font-medium rounded-full mb-4 animate-pulse">
                                A solução
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 text-balance">
                                Tudo que você precisa em uma única plataforma
                            </h2>
                            <p className="text-lg text-gray-300 leading-relaxed">
                                Conectamos sua marca aos melhores criadores de conteúdo UGC, automatizando todo o processo de
                                contratação até a entrega final.
                            </p>
                        </div>

                        <ul className="space-y-4">
                            {solutions.map((solution, index) => (
                                <li
                                    key={index}
                                    className={`flex items-start gap-3 transition-all duration-500 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
                                        }`}
                                    style={{ transitionDelay: isVisible ? `${400 + index * 100}ms` : "0ms" }}
                                >
                                    <div className="flex-shrink-0 w-6 h-6 bg-[#fc7c04] rounded-full flex items-center justify-center mt-0.5">
                                        <Check className="h-4 w-4 text-white" />
                                    </div>
                                    <span className="text-white text-lg">{solution}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    )
}
