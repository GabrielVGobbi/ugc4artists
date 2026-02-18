import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface DataTableSkeletonProps {
    columns: number
    rows?: number
    className?: string
}

/**
 * Skeleton loading para DataTable
 */
export function DataTableSkeleton({
    columns,
    rows = 5,
    className,
}: DataTableSkeletonProps) {
    return (
        <div className={cn('rounded-lg border bg-card', className)}>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b bg-muted/50">
                            {Array.from({ length: columns }).map((_, i) => (
                                <th key={i} className="px-4 py-3">
                                    <Skeleton className="h-4 w-24" />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: rows }).map((_, rowIndex) => (
                            <tr key={rowIndex} className="border-b last:border-0">
                                {Array.from({ length: columns }).map((_, colIndex) => (
                                    <td key={colIndex} className="px-4 py-3">
                                        <Skeleton
                                            className={cn(
                                                'h-4',
                                                colIndex === 0 ? 'w-32' : 'w-24'
                                            )}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
