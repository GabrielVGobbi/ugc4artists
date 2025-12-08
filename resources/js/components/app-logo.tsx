import { OptimizedImage } from './utils/optimized-image';

type AppLogoProps = {
    variant?: "dark" | "white"; // só aceita esses dois valores
    className?: string;
};

export default function AppLogo({ variant = "dark", className }: AppLogoProps) {

    const logoSrc =
        variant === "white"
            ? "/assets/images/logo-white.png"
            : "/assets/images/logo.png";

    return (
        <>
            <figure className="">
                <OptimizedImage
                    src={logoSrc}
                    alt="logo ugc-for-artists"
                    priority={true}
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
                    src="/assets/images/logo-icon.png"
                    alt="logo ugc-for-artists"
                    priority={true}
                    aspectRatio='auto'
                    className="relative h-20"
                />
            </figure>

        </>
    );
}
