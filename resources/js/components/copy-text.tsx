import { Copy, Check } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { toast } from '@/stores/toast-store';

interface CopyTextProps {
    text: string | null;
    children: ReactNode;
    className?: string;
}

export function CopyText({ text, children, className = '' }: CopyTextProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast.success('Copiado!');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            //toast.error('Erro ao copiar');
        }
    };

    return (
        <button
            onClick={handleCopy}
            className={`cursor-pointer group relative flex items-center justify-between rounded text-gray-600 transition-all hover:text-gray-900 ${className}`}
        >
            <span className="flex items-center gap-2">{children}</span>
            <span className="ml-2 opacity-0 transition-opacity group-hover:opacity-100">
                {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
            </span>
        </button>
    );
}
