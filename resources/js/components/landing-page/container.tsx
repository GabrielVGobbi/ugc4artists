import { clsx } from 'clsx'

export function Container({
    className,
    children,
}: {
    className?: string
    children: React.ReactNode
}) {
    return (
        <div className={clsx(className, 'px-6 lg:px-8')}>
            <div className="mx-auto max-w-2xl lg:max-w-7xl">{children}</div>
        </div>
    )
}

export function ContainerSection({
    id,
    className,
    children,
}: {
    className?: string
    children: React.ReactNode
    id?: string
}) {
    return (
        <section className={clsx(className, 'px-6 lg:px-8')} id={id}>
            <div className="mx-auto max-w-2xl lg:max-w-7xl">{children}</div>
        </section>
    )
}
