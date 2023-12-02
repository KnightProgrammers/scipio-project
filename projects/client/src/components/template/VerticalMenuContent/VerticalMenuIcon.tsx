import navigationIcon from '@/configs/navigation-icon.config'
import type { ElementType, ComponentPropsWithRef } from 'react'

type VerticalMenuIconProps = {
    icon: string
    withMargin: boolean
}

export const Icon = <T extends ElementType>({
    component,
    ...props
}: {
    header: T
} & ComponentPropsWithRef<T>) => {
    const Component = component
    return <Component {...props} />
}

const VerticalMenuIcon = ({ icon, withMargin }: VerticalMenuIconProps) => {
    if (!icon) {
        return <></>
    }

    return (
        <span className={`text-2xl ${withMargin ? 'mr-2' : ''}`}>
            {navigationIcon[icon]}
        </span>
    )
}

VerticalMenuIcon.defaultProps = {
    withMargin: false,
}

export default VerticalMenuIcon
