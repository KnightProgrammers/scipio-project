import { forwardRef } from 'react'
import classNames from 'classnames'
import { MenuContextProvider } from './context/menuContext'
import type { CommonProps } from '../@types/common'
import type { Mode } from '@/@types/theme'

export interface MenuProps extends CommonProps {
    defaultActiveKeys?: Array<string>
    defaultExpandedKeys?: Array<string>
    menuItemHeight?: number
    onSelect?: (eventKey: string, e: MouseEvent) => void
    sideCollapsed?: boolean
    variant?: Mode
}

const Menu = forwardRef<HTMLElement, MenuProps>((props, ref) => {
    const {
        children,
        className,
        defaultActiveKeys = [],
        defaultExpandedKeys = [],
        menuItemHeight = 40,
        onSelect,
        sideCollapsed = false,
        variant = 'light',
        ...rest
    } = props

    const menuDefaultClass = 'menu'

    const menuClass = classNames(
        menuDefaultClass,
        `${menuDefaultClass}-${variant}`,
        className,
    )

    return (
        <nav ref={ref} className={menuClass} {...rest}>
            <MenuContextProvider
                value={{
                    onSelect,
                    menuItemHeight,
                    variant,
                    sideCollapsed,
                    defaultExpandedKeys,
                    defaultActiveKeys,
                }}
            >
                {children}
            </MenuContextProvider>
        </nav>
    )
})

Menu.displayName = 'Menu'

export default Menu
