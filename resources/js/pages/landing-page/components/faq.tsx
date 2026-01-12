'use client'

import { ContainerSection } from '@/components/landing-page/container'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

type FAQItem = {
    question: string
    answer: string
}

const faqItems: FAQItem[] = [
    {
        question: 'A UGC4Artists já é uma plataforma ativa?',
        answer:
            'A UGC4Artists está em fase de construção do ecossistema e da comunidade. Neste momento, estamos formando conexões, educando o mercado e estruturando o movimento que une criadores e artistas.',
    },
    {
        question: 'Sou criador(a) UGC. Como posso participar?',
        answer:
            'Se você cria conteúdo e tem interesse em atuar no mercado musical, pode se cadastrar para fazer parte da nossa comunidade. Em breve, compartilharemos oportunidades, conteúdos educativos e conexões estratégicas.',
    },
    {
        question: 'Sou artista ou marca. Como os criadores podem me ajudar?',
        answer:
            'Criadores ampliam o alcance da sua música ou campanha, geram identificação com o público e estimulam compartilhamentos orgânicos. Conteúdo criado por terceiros aumenta a conexão e potencializa a performance nas plataformas.',
    },
    {
        question: 'Que tipo de conteúdo os criadores produzem?',
        answer:
            'Conteúdos pensados para redes sociais, como TikTok, Reels e Shorts: trends, danças, POVs, storytelling, vídeos criativos e formatos nativos que conversam com o algoritmo.',
    },
    {
        question: 'Preciso ter uma grande estrutura para participar?',
        answer:
            'Não. A UGC4Artists nasce justamente para facilitar o acesso a criadores e estruturar campanhas de forma simples, clara e estratégica independentemente do tamanho da marca ou do artista.',
    },
    {
        question: 'A UGC4Artists faz parte de algum grupo?',
        answer:
            'Sim. A UGC4Artists faz parte do ecossistema Best Play, referência no mercado musical e em estratégias de crescimento orgânico para artistas.',
    },
]

type FAQItemProps = {
    item: FAQItem
    isOpen: boolean
    onToggle: () => void
}

function FAQItemComponent({ item, isOpen, onToggle }: FAQItemProps) {
    return (
        <div className="border-b border-gray-200 last:border-0">
            <button
                onClick={onToggle}
                className="cursor-pointer flex w-full items-center justify-between py-6 text-left transition-colors hover:text-primary"
                aria-expanded={isOpen}
            >
                <h3 className="text-lg font-semibold text-[#040404] pr-8">{item.question}</h3>
                <ChevronDown
                    className={`h-5 w-5 flex-shrink-0 text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''
                        }`}
                />
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <p className="pb-6 text-base text-gray-600 leading-relaxed">{item.answer}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    return (
        <ContainerSection id="faq" className="bg-white py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-sm font-semibold uppercase tracking-widest text-primary">FAQ</span>
                    <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#040404] tracking-tight">
                        Perguntas Frequentes
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-5xl mx-auto">
                        Tire todas as suas dúvidas sobre a plataforma, entenda como ela funciona na prática,
                        descubra quais recursos estão disponíveis, como utilizá-los da melhor forma e aproveite
                        ao máximo cada funcionalidade. Aqui você encontra respostas para questões comuns,
                        orientações detalhadas e informações úteis que vão facilitar sua experiência e tornar
                        o uso da plataforma mais simples e eficiente.

                    </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                    {faqItems.map((item, index) => (
                        <FAQItemComponent
                            key={index}
                            item={item}
                            isOpen={openIndex === index}
                            onToggle={() => handleToggle(index)}
                        />
                    ))}
                </div>
            </div>
        </ContainerSection>
    )
}

