import Menu from '@/components/ui/Menu'
import Dropdown from '@/components/ui/Dropdown'
import { Link } from 'react-router-dom'
import VerticalMenuIcon from './VerticalMenuIcon'
import { Trans } from 'react-i18next'
import type { CommonProps } from '@/@types/common'
import type { Direction } from '@/@types/theme'
import type { NavigationTree } from '@/@types/navigation'

interface DefaultItemProps extends CommonProps {
    nav: NavigationTree
    onLinkClick?: (link: { key: string; title: string; path: string }) => void
}

interface CollapsedItemProps extends DefaultItemProps {
    direction: Direction
}

interface VerticalCollapsedMenuItemProps extends CollapsedItemProps {
    sideCollapsed?: boolean
    'data-tn': string
}

const { MenuItem, MenuCollapse } = Menu

const DefaultItem = ({ nav, onLinkClick }: DefaultItemProps) => {
    return (
        <MenuCollapse
            key={nav.key}
            data-tn={`nav-menu-collapse-${nav.key}`}
            label={
                <>
                    <VerticalMenuIcon icon={nav.icon} withMargin={true} />
                    <span>
                        <Trans
                            i18nKey={nav.translateKey}
                            defaults={nav.title}
                        />
                    </span>
                </>
            }
            eventKey={nav.key}
            expanded={false}
            className="mb-2"
        >
            {nav.subMenu.map((subNav) => (
                <MenuItem key={subNav.key} eventKey={subNav.key}>
                    {subNav.path ? (
                        <Link
                            key={subNav.key}
                            className="h-full w-full flex items-center"
                            data-tn={`nav-menu-item-${subNav.key}`}
                            to={subNav.path}
                            target={subNav.isExternalLink ? '_blank' : ''}
                            onClick={() =>
                                onLinkClick?.({
                                    key: subNav.key,
                                    title: subNav.title,
                                    path: subNav.path,
                                })
                            }
                        >
                            <VerticalMenuIcon
                                key={subNav.key}
                                icon={subNav.icon}
                                withMargin={true}
                            />
                            <span>
                                <Trans
                                    i18nKey={subNav.translateKey}
                                    defaults={subNav.title}
                                />
                            </span>
                        </Link>
                    ) : (
                        <span>
                            key={subNav.key}
                            data-tn={`nav-menu-item-${subNav.key}`}
                            <Trans
                                i18nKey={subNav.translateKey}
                                defaults={subNav.title}
                            />
                        </span>
                    )}
                </MenuItem>
            ))}
        </MenuCollapse>
    )
}

const CollapsedItem = (props: CollapsedItemProps) => {
    const { nav, onLinkClick, direction } = props;
    const menuItem = (
        <MenuItem key={nav.key} eventKey={nav.key} className="mb-2">
            <VerticalMenuIcon icon={nav.icon} withMargin={false} />
        </MenuItem>
    )

    return (
        <Dropdown
            trigger="hover"
            renderTitle={menuItem}
            placement={
                direction === 'rtl' ? 'middle-end-top' : 'middle-start-top'
            }
            data-tn={props["data-tn"]}
        >
            {nav.subMenu.map((subNav) => (
                <Dropdown.Item key={subNav.key} eventKey={subNav.key}>
                    {subNav.path ? (
                        <Link
                            className="h-full w-full flex items-center"
                            data-tn={`collapsed-${nav.key}-item-${subNav.key}`}
                            to={subNav.path}
                            target={subNav.isExternalLink ? '_blank' : ''}
                            onClick={() =>
                                onLinkClick?.({
                                    key: subNav.key,
                                    title: subNav.title,
                                    path: subNav.path,
                                })
                            }
                        >
                            <VerticalMenuIcon
                                icon={subNav.icon}
                                withMargin={true}
                            />
                            <span>
                                <Trans
                                    i18nKey={subNav.translateKey}
                                    defaults={subNav.title}
                                />
                            </span>
                        </Link>
                    ) : (
                        <span>
                            <Trans
                                i18nKey={subNav.translateKey}
                                defaults={subNav.title}
                            />
                        </span>
                    )}
                </Dropdown.Item>
            ))}
        </Dropdown>
    )
}

const VerticalCollapsedMenuItem = ({
    sideCollapsed,
    ...rest
}: VerticalCollapsedMenuItemProps) => {
    return sideCollapsed ? (
        <CollapsedItem {...rest} />
    ) : (
        <DefaultItem {...rest} />
    )
}

export default VerticalCollapsedMenuItem
