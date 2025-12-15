"use client";
import { AnimatedGroup } from "@/components/smoothui/shared/animated-group";
import { AnimatedText } from "@/components/smoothui/shared/animated-text";
import { Button } from "@/components/smoothui/shared/smoothbutton";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getAllPeople, getAvatarUrl, getImageKitUrl } from "@/lib/examples/data";
import { ArrowDownRight, Star } from "lucide-react";
import { motion } from "motion/react";
type HeroShowcaseProps = {
    heading?: string;
    description?: string;
    buttons?: {
        primary?: {
            text: string;
            url: string;
        };
        secondary?: {
            text: string;
            url: string;
        };
    };
    reviews?: {
        count: number;
        avatars: {
            src: string;
            alt: string;
        }[];
        rating?: number;
    };
};
export function HeroShowcase({
    heading = "Seja o primeiro a receber as campanhas que mais pagam.",
    description = "Smoothui gives you the building blocks to create stunning, animated interfaces in minutes.",
    buttons = {
        primary: {
            text: "Get Started",
            url: "#link",
        },
        secondary: {
            text: "Watch demo",
            url: "#link",
        },
    },
    reviews = {
        count: 200,
        rating: 5.0,
        avatars: getAllPeople()
            .slice(0, 5)
            .map((person) => ({
                src: getAvatarUrl(person.avatar, 90),
                alt: `${person.name} avatar`,
            })),
    },
}: HeroShowcaseProps) {
    return (
        <>
            <main>
                <motion.section
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    className="relative overflow-hidden  to-muted"
                    initial={{ opacity: 0, scale: 1.04, filter: "blur(12px)" }}
                    transition={{ type: "spring", bounce: 0.32, duration: 0.9 }}
                >
                    <div className="grid items-center text-center justify-center">
                        <div className="mx-auto text-center justify-center flex max-w-5xl items-center gap-10">
                            <AnimatedGroup
                                className="mx-auto flex flex-col items-center text-center "
                                preset="blur-slide"
                            >
                                <AnimatedText
                                    as="h1"
                                    className="my-10 text-pretty font-bold text-3xl lg:text-7xl xl:text-7xl"
                                >
                                    O atalho para quem quer ganhar dinheiro <span className="text-primary">criando</span> conteúdo .
                                </AnimatedText>
                                <AnimatedText
                                    as="p"
                                    className="mb-8 max-w-xl text-white lg:text-xl"
                                    delay={0.12}
                                >
                                    Inscreva-se agora na lista de espera e receba, antes de todo mundo, convites para campanhas, briefings e oportunidades exclusivas.
                                </AnimatedText>
                                <AnimatedGroup
                                    className="mb-12 flex w-fit flex-col items-center gap-4 sm:flex-row"
                                    preset="slide"
                                >
                                    <span className="-space-x-4 inline-flex items-center">
                                        {reviews.avatars.map((avatar, index) => (
                                            <motion.div
                                                key={`${avatar.src}-${index}`}
                                                style={{ display: "inline-block" }}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 300,
                                                    damping: 20,
                                                }}
                                                whileHover={{ y: -8 }}
                                            >
                                                <Avatar className="size-12 border">
                                                    <AvatarImage alt={avatar.alt} src={avatar.src} />
                                                </Avatar>
                                            </motion.div>
                                        ))}
                                    </span>
                                    <div>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((starNumber) => (
                                                <Star
                                                    className="size-5 fill-yellow-400 text-yellow-400"
                                                    key={`star-${starNumber}`}
                                                />
                                            ))}
                                            <span className="mr-1 font-semibold">
                                                {reviews.rating?.toFixed(1)}
                                            </span>
                                        </div>
                                        <p className="text-left font-medium text-foreground/70">
                                            from {reviews.count}+ reviews
                                        </p>
                                    </div>
                                </AnimatedGroup>
                            </AnimatedGroup>
                        </div>
                        <AnimatedGroup
                            className=""
                            preset="slide"
                        >
                            {buttons.secondary && (
                                <Button asChild >
                                    <a href='#form'>
                                        Preencher formulário
                                        <ArrowDownRight className="size-4" />
                                    </a>
                                </Button>
                            )}
                        </AnimatedGroup>
                    </div>


                </motion.section>
            </main>
        </>
    );
}
export default HeroShowcase;
