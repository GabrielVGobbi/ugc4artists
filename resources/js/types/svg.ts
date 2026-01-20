export type SvgName = 'banda' | 'dj' | 'guitar' | 'guitar_v2' | 'microphone' | 'microphone_v2' | string;

export interface SvgIconProps {
    name: SvgName;
    size?: number | string;
    className?: string;
    color?: string;
    fill?: string;
    stroke?: string;
    style?: React.CSSProperties;
    showLoading?: boolean;
}
