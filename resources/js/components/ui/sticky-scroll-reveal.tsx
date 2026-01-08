"use client";
import React, { useRef } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export const StickyScroll = ({
    content,
    contentClassName,
}: {
    content: {
        title: string;
        description: string;
        content?: React.ReactNode;
    }[];
    contentClassName?: string;
}) => {
    const [activeCard, setActiveCard] = React.useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });
    const cardLength = content.length;

    useMotionValueEvent(scrollYProgress, "change", (latest) => {

        const cardsBreakpoints = content.map((_, index) => (index / cardLength) - 0.10);
        const closestBreakpointIndex = cardsBreakpoints.reduce(
            (acc, breakpoint, index) => {
                const distance = Math.abs(latest - breakpoint);
                if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
                    return index;
                }
                return acc;
            },
            0,
        );
        setActiveCard(closestBreakpointIndex);
    });

    return (
        <div ref={ref} className="relative w-full">
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

                {/* Left - Steps */}
                <div className="flex-1 space-y-24">
                    {content.map((item, index) => {
                        const isActive = activeCard === index;

                        return (
                            <motion.div
                                key={item.title + index}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="relative"
                            >
                                {/* Step container */}
                                <div className="flex gap-6">
                                    {/* Number circle */}
                                    <div className="flex-shrink-0">
                                        <div className={`
                                            w-14 h-14 rounded-full flex items-center justify-center
                                            transition-all duration-300
                                            ${isActive
                                                ? 'bg-[#fc7c04] shadow-lg shadow-[#fc7c04]/30 scale-110'
                                                : 'bg-white/10 border border-white/20'
                                            }
                                        `}>
                                            <span className={`
                                                font-bold text-xl
                                                ${isActive ? 'text-white' : 'text-white/60'}
                                            `}>
                                                {index + 1}
                                            </span>
                                        </div>

                                        {/* Connecting line */}
                                        {index < content.length - 1 && (
                                            <div className="w-0.5 h-20 mx-auto mt-4 bg-gradient-to-b from-white/20 to-transparent" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 pb-4">
                                        <h3 className={`
                                            text-2xl sm:text-3xl font-bold mb-3
                                            transition-colors duration-300
                                            ${isActive ? 'text-white' : 'text-white/70'}
                                        `}>
                                            {item.title}
                                        </h3>
                                        <p className={`
                                            text-base sm:text-lg leading-relaxed
                                            transition-colors duration-300
                                            ${isActive ? 'text-gray-300' : 'text-gray-400'}
                                        `}>
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Right - Sticky visual */}
                <div className="hidden lg:block lg:w-[420px] xl:w-[500px]">
                    <div className="sticky top-32">
                        <motion.div
                            key={activeCard}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className={cn(
                                "rounded-3xl overflow-hidden",
                                contentClassName,
                            )}
                        >
                            {content[activeCard].content ?? null}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};
