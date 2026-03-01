import { ReactNode } from 'react';

type ExpandableTruncateControlledProps = {
    text?: string;
    children?: ReactNode;
    expandedContent?: ReactNode;
    maxWidth?: number | string;
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    className?: string;
    expandedClassName?: string;
};

export function ExpandableTruncateControlled({
    text,
    children,
    expandedContent,
    maxWidth = 240,
    isOpen,
    onOpen,
    onClose,
    className = '',
    expandedClassName = '',
}: ExpandableTruncateControlledProps) {
    // Se children foi fornecido, usa ele; senão usa text truncado
    const renderTrigger = () => {
        if (children) {
            return children;
        }

        return (
            <span
                className="block"
                style={{
                    maxWidth,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                }}
            >
                {text}
            </span>
        );
    };

    // Se expandedContent foi fornecido, usa ele; senão usa text
    const renderExpanded = () => {
        if (expandedContent) {
            return expandedContent;
        }

        return (
            <div className="text-sm whitespace-pre-wrap wrap-break-word select-text">
                {text}
            </div>
        );
    };

    return (
        <div className={`relative ${className}`}>
            <button
                type="button"
                onClick={onOpen}
                className="cursor-pointer block text-left w-full"
                aria-expanded={isOpen}
                title={typeof text === 'string' ? text : undefined}
            >
                {renderTrigger()}
            </button>

            {isOpen && (
                <div
                    className={`cursor-pointer absolute z-50 mt-2 w-[min(28rem,80vw)] rounded-xl border bg-white p-3 shadow-lg ${expandedClassName}`}
                    role="dialog"
                    tabIndex={-1}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") onClose();
                    }}
                >
                    {renderExpanded()}

                    <div className="mt-3 flex justify-end">
                        <button
                            type="button"
                            className="cursor-pointer text-sm rounded-lg border px-3 py-1"
                            onClick={onClose}
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
