import classNames from 'classnames'
import type { CommonProps } from '@/@types/common'
import type { ReactNode, ElementType } from 'react'

export interface IconTextProps extends CommonProps {
    icon?: ReactNode | string
    asElement?: ElementType
}

const IconText = (props: IconTextProps) => {
    const { className, asElement: Component = 'span', icon, children } = props
    return (
        <Component
            className={classNames('flex items-center gap-2', className)}
            data-tn={props['data-tn']}
        >
            {icon}
            {children}
        </Component>
    )
}

export default IconText
