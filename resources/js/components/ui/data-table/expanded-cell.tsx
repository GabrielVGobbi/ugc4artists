type ExpandableTruncateControlledProps = {
    text: string;
    maxWidth?: number | string;
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
};

export function ExpandableTruncateControlled({
    text,
    maxWidth = 240,
    isOpen,
    onOpen,
    onClose,
}: ExpandableTruncateControlledProps) {
    return (
        <div className="relative">
            <button
                type="button"
                onClick={onOpen}
                className="cursor-pointer block text-left w-full"
                aria-expanded={isOpen}
                title={text}
            >
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
            </button>

            {isOpen && (
                <div
                    className="cursor-pointer absolute z-50 mt-2 w-[min(28rem,80vw)] rounded-xl border bg-white p-3 shadow-lg"
                    role="dialog"
                    tabIndex={-1}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") onClose();
                    }}
                >
                    <div className="text-sm whitespace-pre-wrap wrap-break-word select-text">
                        {text}
                    </div>

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
