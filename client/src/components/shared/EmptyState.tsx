import { Card } from '@/components/ui'
import { HiOutlineExclamationCircle } from 'react-icons/hi'
import { ReactNode } from 'react'

type EmptyStateProps = {
    className?: string
    title?: string | null
    description?: string | null
    iconSize?: number
    children?: ReactNode
}

const EmptyState = (props: EmptyStateProps) => {
    const {
        className = '',
        title = '',
        description = '',
        children,
        iconSize = 80,
    } = props

    return (
        <Card
            bordered
            className={`text-center border-dashed ${className}`}
            bodyClass="flex flex-col items-center"
            data-tn="empty-state"
        >
            {iconSize > 0 && (
                <HiOutlineExclamationCircle
                    size={iconSize}
                    className=" text-2xl"
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
