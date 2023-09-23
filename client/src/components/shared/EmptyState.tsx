import { Card } from '@/components/ui'
import { HiOutlineExclamationCircle } from 'react-icons/hi'

type EmptyStateProps = {
    className: string
    title: string
    description: string
}

const EmptyState = (props: EmptyStateProps) => {
    const { className = '', title = 'No items', description = '' } = props

    return (
        <Card
            bordered
            className={`text-center border-dashed ${className}`}
            bodyClass="flex flex-col items-center"
        >
            <HiOutlineExclamationCircle size={80} className=" text-2xl" />
            <h2 className="text-gray-400 dark:text-gray-400">{title}</h2>
            <p className="mt-4">{description}</p>
        </Card>
    )
}

export default EmptyState
