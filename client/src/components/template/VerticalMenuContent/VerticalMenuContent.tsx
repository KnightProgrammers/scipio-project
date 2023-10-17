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

    const [defaultExpandKey, setDefaultExpandKey] = useState<string[]>([])

    const { activedRoute } = useMenuActive(navigationTree, routeKey)

    useEffect(() => {
        if (defaultExpandKey.length === 0 && activedRoute?.parentKey) {
            setDefaultExpandKey([activedRoute?.parentKey])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activedRoute?.parentKey])

    const handleLinkClick = () => {
        onMenuItemClick?.()
    }

    const getNavItem = (nav: NavigationTree) => {
        if (
            nav.subMenu.filter((nav) => !nav.hidden).length === 0 &&
            nav.type === NAV_ITEM_TYPE_ITEM
        ) {
            return (
                <VerticalSingleMenuItem
                    key={nav.key}
                    data-tn={`nav-menu-item-${nav.key}`}
                    nav={nav}
                    sideCollapsed={collapsed}
                    direction={direction}
                    onLinkClick={handleLinkClick}
                />
            )
        }

        if (
            nav.subMenu.filter((nav) => !nav.hidden).length > 0 &&
            nav.type === NAV_ITEM_TYPE_COLLAPSE
        ) {
            return (
                <VerticalCollapsedMenuItem
                    key={nav.key}
                    data-tn={`nav-menu-collapsed-${nav.key}`}
                    nav={nav}
                    sideCollapsed={collapsed}
                    direction={direction}
                    onLinkClick={onMenuItemClick}
                />
            )
        }

        if (nav.type === NAV_ITEM_TYPE_TITLE) {
            if (nav.subMenu.filter((nav) => !nav.hidden).length > 0) {
                return (
                    <MenuGroup label={t(nav.translateKey) || nav.title}>
                        {nav.subMenu
                            .filter((nav) => !nav.hidden)
                            .map((subNav) =>
                                subNav.subMenu.filter((nav) => !nav.hidden)
                                    .length > 0 ? (
                                    <VerticalCollapsedMenuItem
                                        key={subNav.key}
                                        data-tn={`nav-menu-collapsed-${nav.key}`}
                                        nav={subNav}
                                        sideCollapsed={collapsed}
                                        direction={direction}
                                        onLinkClick={onMenuItemClick}
                                    />
                                ) : (
                                    <VerticalSingleMenuItem
                                        key={subNav.key}
                                        data-tn={`nav-menu-item-${nav.key}`}
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
            data-tn="mobile-nav-menu"
            sideCollapsed={collapsed}
            defaultActiveKeys={activedRoute?.key ? [activedRoute.key] : []}
            defaultExpandedKeys={defaultExpandKey}
        >
            {navigationTree
                .filter((nav) => !nav.hidden)
                .map((nav) => getNavItem(nav))}
        </Menu>
    )
}

export default VerticalMenuContent
