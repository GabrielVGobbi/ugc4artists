
import { useRef, useState } from "react";
import { ContainerSection } from "@/components/landing-page/container";
import { Play } from "lucide-react";
import { motion } from "framer-motion";

interface VideoData {
    id: number;
    thumbnail?: string;
    src: string;
    title?: string;
    artist?: string;
    duration?: string;
}

const videos: VideoData[] = [
    {
        id: 1,
        thumbnail: "/assets/landing_page/images/videos/image_video_1.png",
        src: "https://videos.pexels.com/video-files/5752729/5752729-uhd_2732_1440_30fps.mp4",
        title: "Essa Moça Tá Diferente",
        artist: "Chico Buarque",
        duration: "02:35"
    },
    {
        id: 2,
        thumbnail: "/assets/landing_page/images/videos/image_video_2.png",
        src: "https://videos.pexels.com/video-files/5913245/5913245-uhd_2732_1440_25fps.mp4",
        title: "Isso é MPB do agora",
        artist: "Unknown",
        duration: "00:45"
    },
    {
        id: 3,
        thumbnail: "/assets/landing_page/images/videos/image_video_3.png",
        src: "https://videos.pexels.com/video-files/5752729/5752729-uhd_2732_1440_30fps.mp4",
        title: "Eu Te Devoro (Ao Vivo)",
        artist: "Djavan",
        duration: "04:43"
    }
];

const VideoCard = ({ video }: { video: VideoData }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                setIsPlaying(false);
            } else {
                videoRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    return (
        <div
            className="flex-shrink-0 w-[280px] sm:w-[320px] aspect-[9/16] relative rounded-2xl overflow-hidden cursor-pointer group shadow-2xl bg-black"
            onClick={togglePlay}
        >
            {/* Thumbnail image shown when not playing */}
            {!isPlaying && video.thumbnail && (
                <img
                    src={video.thumbnail}
                    alt={video.title ?? "Video thumbnail"}
                    className="absolute inset-0 w-full h-full object-cover z-[1]"
                />
            )}

            <video
                ref={videoRef}
                src={video.src}
                className="w-full h-full object-cover"
                loop
                playsInline
                preload="none"
            />

            {/* Overlay / Play Button */}
            {!isPlaying && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-all group-hover:bg-black/40 z-[2]">
                    <div className="w-16 h-16 rounded-full border-2 border-white/80 flex items-center justify-center backdrop-blur-sm">
                        <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </div>

                    {/* Song Info Overlay - simulating the look in screenshot */}
                    <div className="absolute bottom-10 left-4 right-4 bg-[#FFC107] text-black p-4 rounded-lg transform rotate-[-2deg] shadow-lg">
                        <div className="flex justify-between text-[10px] mb-1 opacity-70">
                            <span>00:12</span>
                            <span>-{video.duration}</span>
                        </div>
                        <div className="h-1 bg-black/10 rounded-full mb-2 overflow-hidden">
                            <div className="h-full bg-black/80 w-1/3"></div>
                        </div>
                        <div className="text-center">
                            <h4 className="font-bold text-sm leading-tight">{video.title}</h4>
                            <p className="text-xs opacity-80">{video.artist}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const VideoCarouselSection = () => {
    return (
        <section className="py-24 bg-white dark:bg-zinc-950 overflow-hidden">
            <ContainerSection>
                <div className="text-center mb-16 px-4">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-medium tracking-tight text-zinc-900 dark:text-white mb-4"
                    >
                        Transforme sua música em <br />
                        <span className="text-primary font-bold">conteúdo que performa</span>
                    </motion.h2>
                </div>

                {/* Carousel Container */}
                <div className="relative w-full">
                    {/* Gradient Masks */}
                    <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-32 bg-gradient-to-r from-white dark:from-zinc-950 to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-32 bg-gradient-to-l from-white dark:from-zinc-950 to-transparent z-10 pointer-events-none" />

                    <div className="flex justify-center gap-6 sm:gap-8 overflow-x-auto pb-8 pt-4 px-4 sm:px-0 scrollbar-hide snap-x snap-mandatory">
                        {videos.map((video) => (
                            <div key={video.id} className="snap-center">
                                <VideoCard video={video} />
                            </div>
                        ))}
                    </div>
                </div>
            </ContainerSection>
        </section>
    );
};

