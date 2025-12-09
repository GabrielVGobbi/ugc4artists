import { OptimizedImage } from './utils/optimized-image';

type AppLogoProps = {
    variant?: "dark" | "white"; // só aceita esses dois valores
    className?: string;
};

export default function AppLogo({ variant = "dark", className }: AppLogoProps) {

    const logoSrc =
        variant === "white"
            ? "/assets/images/logo-white.png"
            : "/assets/images/logo-380x380.png";

    return (
        <>
            <figure className="">
                <OptimizedImage
                    src={logoSrc}
                    alt="logo ugc-for-artists"
                    priority={false}
                    width={130}
                    height={80}
                    aspectRatio='auto'
                    className="relative h-20"
                />
            </figure>

        </>
    );
}

export function AppLogoIcon() {
    return (
        <>
            <figure className="">
                <OptimizedImage
                    src="/assets/images/logo-icon-260.png"
                    alt="logo ugc-for-artists"
                    priority={false}
                    aspectRatio='auto'
                    className="relative h-20"
                    width={80}
                    height={80}
                />
            </figure>

        </>
    );
}
