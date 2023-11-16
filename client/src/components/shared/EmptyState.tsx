import { Card } from '@/components/ui'
import { ReactNode } from 'react'
import { DoubleSidedImage } from '@/components/shared/index'

type EmptyStateProps = {
    className?: string
    title?: string | null
    description?: string | null
    iconSize?: number
    children?: ReactNode
    bySearch?: boolean
    'data-tn'?: string
}

const EmptyState = (props: EmptyStateProps) => {
    const {
        className = '',
        title = '',
        description = '',
        children,
        iconSize = 360,
        // bySearch = false
    } = props

    return (
        <Card
            bordered
            className={`text-center ${className}`}
            bodyClass="flex flex-col items-center"
            data-tn={props['data-tn'] || 'empty-state'}
        >
            {iconSize > 0 && (
                <DoubleSidedImage
                    src="/img/others/empty-state.svg"
                    darkModeSrc="/img/others/empty-state-dark.svg"
                    alt="empty state icon"
                    width={iconSize}
                    height="auto"
                    className="mb-4"
                />
            )}
            {title && (
                <h2 className="text-gray-400 dark:text-gray-400">{title}</h2>
            )}
            {description && <p className="my-4">{description}</p>}
            {children}
        </Card>
    )
}

export default EmptyState
