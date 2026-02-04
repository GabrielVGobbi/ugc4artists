import { Target } from 'lucide-react'
import { Link } from '@inertiajs/react'
import { Button } from '@/components/ui/button'

interface CampaignEmptyStateProps {
    hasFilters?: boolean
    onClearFilters?: () => void
}

export function CampaignEmptyState({ hasFilters, onClearFilters }: CampaignEmptyStateProps) {
    if (hasFilters) {
        return (
            <div className="bg-white rounded-[3rem] border-2 border-dashed border-border p-20 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-700">
                <div className="relative">
                    <div className="w-20 h-20 bg-muted rounded-[1.5rem] flex items-center justify-center text-muted-foreground/40">
                        <Target size={32} strokeWidth={1} />
                    </div>
                </div>
                <div className="max-w-xs space-y-2">
                    <h3 className="text-2xl font-black tracking-tighter text-foreground">
                        Nenhum resultado
                    </h3>
                    <p className="text-muted-foreground font-medium text-xs">
                        Não encontramos campanhas com os filtros selecionados. Tente ajustar sua busca.
                    </p>
                </div>
                {onClearFilters && (
                    <Button
                        variant="outline"
                        onClick={onClearFilters}
                        className="rounded-2xl"
                    >
                        Limpar Filtros
                    </Button>
                )}
            </div>
        )
    }

    return (
        <div className="bg-white rounded-[3rem] border-2 border-dashed border-border p-20 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-700">
            <div className="relative">
                <div className="w-20 h-20 bg-muted rounded-[1.5rem] flex items-center justify-center text-muted-foreground/40">
                    <Target size={32} strokeWidth={1} />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-pulse" />
            </div>
            <div className="max-w-xs space-y-2">
                <h3 className="text-2xl font-black tracking-tighter text-foreground">
                    Nenhuma Campanha
                </h3>
                <p className="text-muted-foreground font-medium text-xs">
                    Você ainda não criou nenhuma campanha. Comece agora e conecte-se com os melhores criadores!
                </p>
            </div>
            <Button
                asChild
                className="bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground rounded-2xl font-black uppercase text-[9px] tracking-[0.3em] px-8 py-6"
            >
                <Link href="/app/campaigns/create">
                    Criar Primeira Campanha
                </Link>
            </Button>
        </div>
    )
}
