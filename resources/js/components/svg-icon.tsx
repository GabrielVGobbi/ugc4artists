import React from 'react';
import { cn } from '@/lib/utils';
import { useSvg } from '@/hooks/use-svg';
import { SvgIconProps } from '@/types/svg';

export const SvgIcon: React.FC<SvgIconProps> = ({
    name,
    size = 24,
    className,
    color,
    fill,
    stroke,
    style,
    showLoading = true,
    ...props
}) => {
    const { svgContent, isLoading, error } = useSvg(name);

    if (error) {
        console.warn(`SvgIcon: Erro ao carregar ${name}.svg - ${error}`);
        return (
            <div
                className={cn("bg-red-100 border border-red-300 rounded p-1", className)}
                style={{
                    width: typeof size === 'number' ? `${size}px` : size,
                    height: typeof size === 'number' ? `${size}px` : size,
                    ...style
                }}
                title={`Erro ao carregar ícone: ${error}`}
                {...props}
            >
                <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-red-500"
                >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
            </div>
        );
    }

    if (isLoading && showLoading) {
        return (
            <div
                className={cn("animate-pulse bg-gray-200 rounded", className)}
                style={{
                    width: typeof size === 'number' ? `${size}px` : size,
                    height: typeof size === 'number' ? `${size}px` : size,
                    ...style
                }}
                {...props}
            />
        );
    }

    if (!svgContent) {
        return null;
    }

    // Customiza o SVG content
    let customizedSvg = svgContent;

    // Aplica cores customizadas
    if (color || fill || stroke) {
        // Substitui atributos fill existentes
        if (fill) {
            customizedSvg = customizedSvg.replace(
                /fill="[^"]*"/g,
                `fill="${fill}"`
            );
            // Para paths sem fill, adiciona
            customizedSvg = customizedSvg.replace(
                /<path(?![^>]*fill)/g,
                `<path fill="${fill}"`
            );
        }

        // Substitui atributos stroke existentes
        if (stroke) {
            customizedSvg = customizedSvg.replace(
                /stroke="[^"]*"/g,
                `stroke="${stroke}"`
            );
            // Para paths sem stroke, adiciona
            customizedSvg = customizedSvg.replace(
                /<path(?![^>]*stroke)/g,
                `<path stroke="${stroke}"`
            );
        }

        // Se só tem color, aplica como fill para elementos sem fill definido
        if (color && !fill && !stroke) {
            customizedSvg = customizedSvg.replace(
                /<path(?![^>]*fill)/g,
                `<path fill="${color}"`
            );
        }
    }

    return (
        <div
            className={cn("inline-flex items-center justify-center", className)}
            style={{
                width: typeof size === 'number' ? `${size}px` : size,
                height: typeof size === 'number' ? `${size}px` : size,
                ...style
            }}
            dangerouslySetInnerHTML={{ __html: customizedSvg }}
            {...props}
        />
    );
};

export default SvgIcon;