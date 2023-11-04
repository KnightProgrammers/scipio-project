import React, { useState } from 'react'
import { Card } from '@/components/ui'
import { FaAngleDown, FaAngleUp } from 'react-icons/fa6'

interface IProps {
    open?: boolean
    header: string | React.ReactNode
    headerClassName?: string
    titleClassName?: string
    iconButtonClassName?: string
    contentClassName?: string
    contentContainerClassName?: string
    collapsibleClassName?: string
    children: React.ReactNode
}

const Collapsible: React.FC<IProps> = ({
    open,
    collapsibleClassName = '',
    headerClassName = '',
    iconButtonClassName = '',
    children,
    header,
}) => {
    const [isOpen, setIsOpen] = useState(open)
    const handleFilterOpening = () => {
        setIsOpen((prev) => !prev)
    }
    return (
        <Card
            className={`transition duration-500 ease-in-out overflow-hidden ${collapsibleClassName}`}
            headerClass={`transition flex justify-between ${headerClassName}`}
            headerBorder={isOpen}
            header={
                <>
                    {header}
                    <button
                        type="button"
                        className={iconButtonClassName}
                        data-tn="collapsible-toggle-btn"
                        onClick={handleFilterOpening}
                    >
                        {isOpen ? <FaAngleDown /> : <FaAngleUp />}
                    </button>
                </>
            }
            bodyClass={`transition duration-500 ease-in-out ${
                isOpen ? 'h-100' : 'h-0 py-0'
            }`}
        >
            {isOpen && children}
        </Card>
    )
}

Collapsible.displayName = 'Collapsible'

export default Collapsible
