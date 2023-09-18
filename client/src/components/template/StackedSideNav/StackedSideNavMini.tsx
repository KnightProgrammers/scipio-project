import { useEffect } from 'react'
import Logo from '@/components/template/Logo'
import Menu from '@/components/ui/Menu'
import ScrollBar from '@/components/ui/ScrollBar'
import { SIDE_NAV_CONTENT_GUTTER } from '@/constants/theme.constant'
import { NAV_ITEM_TYPE_ITEM } from '@/constants/navigation.constant'
import navigationConfig from '@/configs/navigation.config'
import navigationIcon from '@/configs/navigation-icon.config'
import useMenuActive from '@/utils/hooks/useMenuActive'
import isEmpty from 'lodash/isEmpty'
import { Link } from 'react-router-dom'
import type { NavigationTree } from '@/@types/navigation'
import type { Direction, NavMode, Mode } from '@/@types/theme'
import type { CommonProps } from '@/@types/common'

export type SelectedMenuItem = {
    key?: string
    title?: string
    menu?: NavigationTree[]
    translateKey?: string
}

interface StackedSideNavMiniProps extends CommonProps {
    className?: string
    navMode: NavMode
    onChange: (item: SelectedMenuItem) => void
    routeKey: string
    activeKeys: string[]
    onSetActiveKey: (activeKey: string[]) => void
    mode: Mode
    direction: Direction
}

const StackedSideNavMini = (props: StackedSideNavMiniProps) => {
    const {
        onChange,
        routeKey,
        activeKeys,
        onSetActiveKey,
        mode,
        direction,
        ...rest
    } = props

    const { includedRouteTree } = useMenuActive(navigationConfig, routeKey)

    const handleMenuItemSelect = ({
        key,
        title,
        menu,
        translateKey,
    }: SelectedMenuItem) => {
        onChange({ title, menu, translateKey })
        onSetActiveKey([key as string])
    }

    const handleLinkMenuItemSelect = ({ key }: SelectedMenuItem) => {
        onChange({})
        onSetActiveKey([key as string])
    }

    useEffect(() => {
        if (
            includedRouteTree.type !== NAV_ITEM_TYPE_ITEM &&
            !isEmpty(includedRouteTree)
        ) {
            onChange({
                key: includedRouteTree.key,
                title: includedRouteTree.title,
                menu: includedRouteTree.subMenu,
                translateKey: includedRouteTree.translateKey,
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [includedRouteTree.key])

    return (
        <div {...rest}>
            <Logo
                mode={mode}
                type="streamline"
                className={SIDE_NAV_CONTENT_GUTTER}
                style={{ height: '64px' }}
            />
            <ScrollBar autoHide direction={direction}>
                <Menu
                    className="px-4 pb-4"
                    variant={mode}
                    defaultActiveKeys={activeKeys || [includedRouteTree.key]}
                >
                    {navigationConfig.map((nav) =>
                        nav.subMenu && nav.subMenu.length > 0 ? (
                            <Menu.MenuItem
                                key={nav.key}
                                eventKey={nav.key}
                                className="mb-2"
                                onSelect={() =>
                                    handleMenuItemSelect({
                                        key: nav.key,
                                        title: nav.title,
                                        menu: nav.subMenu,
                                        translateKey: nav.translateKey,
                                    })
                                }
                            >
                                <div className="text-2xl">
                                    {navigationIcon[nav.icon]}
                                </div>
                            </Menu.MenuItem>
                        ) : (
                            <Link
                                key={nav.key}
                                to={nav.path}
                                className="flex items-center h-full w-full"
                                onClick={() =>
                                    handleLinkMenuItemSelect({
                                        key: nav.key,
                                    })
                                }
                            >
                                <Menu.MenuItem
                                    eventKey={nav.key}
                                    className="mb-2"
                                >
                                    <div className="text-2xl">
                                        {navigationIcon[nav.icon]}
                                    </div>
                                </Menu.MenuItem>
                            </Link>
                        ),
                    )}
                </Menu>
            </ScrollBar>
        </div>
    )
}

export default StackedSideNavMini
