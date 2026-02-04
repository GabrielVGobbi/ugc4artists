import { Skeleton } from '@/components/ui/skeleton'

export function CampaignCardSkeleton() {
    return (
        <div className="bg-white rounded-[2.5rem] overflow-hidden border border-border">
            {/* Image skeleton */}
            <Skeleton className="aspect-[3/2] rounded-none" />

            {/* Footer skeleton */}
            <div className="p-5 flex justify-between items-end">
                <div className="space-y-2">
                    <Skeleton className="h-2 w-16" />
                    <Skeleton className="h-6 w-24" />
                </div>
                <div className="space-y-2 text-right">
                    <Skeleton className="h-2 w-16 ml-auto" />
                    <Skeleton className="h-4 w-20 ml-auto" />
                </div>
            </div>
        </div>
    )
}

export function CampaignTableRowSkeleton() {
    return (
        <tr className="border-b border-border/50">
            <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-2xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-2 w-16" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
            </td>
            <td className="px-8 py-6">
                <Skeleton className="h-3 w-20" />
            </td>
            <td className="px-8 py-6">
                <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-2 w-16" />
                </div>
            </td>
            <td className="px-8 py-6">
                <Skeleton className="h-3 w-16" />
            </td>
            <td className="px-8 py-6">
                <Skeleton className="h-3 w-24" />
            </td>
            <td className="px-8 py-6">
                <Skeleton className="h-8 w-8 rounded-lg ml-auto" />
            </td>
        </tr>
    )
}

export function CampaignGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(count)].map((_, i) => (
                <CampaignCardSkeleton key={i} />
            ))}
        </div>
    )
}

export function CampaignTableSkeleton({ count = 5 }: { count?: number }) {
    return (
        <div className="bg-white rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-border/50 bg-muted/30">
                            <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                                Informações
                            </th>
                            <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                                Status
                            </th>
                            <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                                Financeiro
                            </th>
                            <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                                Engajamento
                            </th>
                            <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                                Deadline
                            </th>
                            <th className="px-8 py-6" />
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(count)].map((_, i) => (
                            <CampaignTableRowSkeleton key={i} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
