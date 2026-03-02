import * as React from "react";

type TruncatedCellProps = {
    text?: string | null;
    maxWidth?: number | string; // ex: 220 | "14rem"
    lines?: 1 | 2;
    fallback?: React.ReactNode;
};

export const TruncatedCell: React.FC<TruncatedCellProps> = React.memo(
    ({ text, maxWidth = 220, lines = 1, fallback = <span>-</span> }) => {
        if (!text) return <>{fallback}</>;

        const style: React.CSSProperties =
            lines === 1
                ? {
                    maxWidth,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                }
                : {
                    maxWidth,
                    display: "-webkit-box",
                    WebkitLineClamp: lines,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                };

        return (
            <span
                title={text} // simples e eficiente
                style={style}
                className="block"
            >
                {text}
            </span>
        );
    }
);
TruncatedCell.displayName = "TruncatedCell";
