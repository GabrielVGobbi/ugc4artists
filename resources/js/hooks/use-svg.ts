import { useState, useEffect } from 'react';

type SvgName = 'banda' | 'dj' | 'guitar' | 'guitar_v2' | 'microphone' | 'microphone_v2';

interface UseSvgReturn {
    svgContent: string;
    isLoading: boolean;
    error: string | null;
}

export const useSvg = (name: SvgName): UseSvgReturn => {
    const [svgContent, setSvgContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadSvg = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch(`/assets/images/svg/${name}.svg`);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const content = await response.text();
                setSvgContent(content);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
                setError(errorMessage);
                console.error(`Erro ao carregar SVG ${name}:`, errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        if (name) {
            loadSvg();
        }
    }, [name]);

    return { svgContent, isLoading, error };
};