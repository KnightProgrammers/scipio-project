import { useState, useEffect } from 'react'
import Menu from '@/components/ui/Menu'
import VerticalSingleMenuItem from './VerticalSingleMenuItem'
import VerticalCollapsedMenuItem from './VerticalCollapsedMenuItem'
import { themeConfig } from '@/configs/theme.config'
import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_COLLAPSE,
    NAV_ITEM_TYPE_ITEM,
} from '@/constants/navigation.constant'
import useMenuActive from '@/utils/hooks/useMenuActive'
import { useTranslation } from 'react-i18next'
import { Direction, Mode } from '@/@types/theme'
import type { NavigationTree } from '@/@types/navigation'

export interface VerticalMenuContentProps {
    mode: Mode
    collapsed?: boolean
    routeKey: string
    navigationTree?: NavigationTree[]
    onMenuItemClick?: () => void
    direction?: Direction
}

const { MenuGroup } = Menu

const VerticalMenuContent = (props: VerticalMenuContentProps) => {
    const {
        mode = themeConfig.mode,
        collapsed,
        routeKey,
        navigationTree = [],
        onMenuItemClick,
        direction = themeConfig.direction,
    } = props

    const { t } = useTranslation()

    const [defaulExpandKey, setDefaulExpandKey] = useState<string[]>([])

    const { activedRoute } = useMenuActive(navigationTree, routeKey)

    useEffect(() => {
        if (defaulExpandKey.length === 0 && activedRoute?.parentKey) {
            setDefaulExpandKey([activedRoute?.parentKey])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activedRoute?.parentKey])

    const handleLinkClick = () => {
        onMenuItemClick?.()
    }

    const getNavItem = (nav: NavigationTree) => {
        if (nav.subMenu.length === 0 && nav.type === NAV_ITEM_TYPE_ITEM) {
            return (
                <VerticalSingleMenuItem
                    key={nav.key}
                    nav={nav}
                    sideCollapsed={collapsed}
                    direction={direction}
                    onLinkClick={handleLinkClick}
                />
            )
        }

        if (nav.subMenu.length > 0 && nav.type === NAV_ITEM_TYPE_COLLAPSE) {
            return (
                <VerticalCollapsedMenuItem
                    key={nav.key}
                    nav={nav}
                    sideCollapsed={collapsed}
                    direction={direction}
                    onLinkClick={onMenuItemClick}
                />
            )
        }

        if (nav.type === NAV_ITEM_TYPE_TITLE) {
            if (nav.subMenu.length > 0) {
                return (
                    <MenuGroup label={t(nav.translateKey) || nav.title}>
                        {nav.subMenu.map((subNav) =>
                            subNav.subMenu.length > 0 ? (
                                <VerticalCollapsedMenuItem
                                    key={subNav.key}
                                    nav={subNav}
                                    sideCollapsed={collapsed}
                                    direction={direction}
                                    onLinkClick={onMenuItemClick}
                                />
                            ) : (
                                <VerticalSingleMenuItem
                                    key={subNav.key}
                                    nav={subNav}
                                    sideCollapsed={collapsed}
                                    direction={direction}
                                    onLinkClick={onMenuItemClick}
                                />
                            ),
                        )}
                    </MenuGroup>
                )
            } else {
                return <MenuGroup key={nav.key} label={nav.title} />
            }
        }
    }

    return (
        <Menu
            className="px-4 pb-4"
            variant={mode}
            sideCollapsed={collapsed}
            defaultActiveKeys={activedRoute?.key ? [activedRoute.key] : []}
            defaultExpandedKeys={defaulExpandKey}
        >
            {navigationTree.map((nav) => getNavItem(nav))}
        </Menu>
    )
}

export default VerticalMenuContent
