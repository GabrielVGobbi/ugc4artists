import AppLogoIcon from './app-logo-icon';
import { OptimizedImage } from './utils/optimized-image';

export default function AppLogo() {
    return (
        <>
            <figure className="">
                <OptimizedImage
                    src="/assets/images/logo.png"
                    alt="logo ugc-for-artists"
                    priority={true}
                    aspectRatio='auto'
                    className="relative h-20"
                />
            </figure>

        </>
    );
}
