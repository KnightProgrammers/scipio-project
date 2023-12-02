import Tooltip from '@/components/ui/Tooltip'
import Menu from '@/components/ui/Menu'
import VerticalMenuIcon from './VerticalMenuIcon'
import { Link } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import type { CommonProps } from '@/@types/common'
import type { Direction } from '@/@types/theme'
import type { NavigationTree } from '@/@types/navigation'

const { MenuItem } = Menu

interface CollapsedItemProps extends CommonProps {
    title: string
    translateKey: string
    direction?: Direction
}

interface DefaultItemProps {
    nav: NavigationTree
    onLinkClick?: (link: { key: string; title: string; path: string }) => void
    sideCollapsed?: boolean
    'data-tn'?: string
}

interface VerticalMenuItemProps extends CollapsedItemProps, DefaultItemProps {}

const CollapsedItem = ({
    title,
    translateKey,
    children,
    direction,
}: CollapsedItemProps) => {
    const { t } = useTranslation()

    return (
        <Tooltip
            title={t(translateKey) || title}
            placement={direction === 'rtl' ? 'left' : 'right'}
        >
            {children}
        </Tooltip>
    )
}

const DefaultItem = (props: DefaultItemProps) => {
    const { nav, onLinkClick, sideCollapsed } = props

    return (
        <MenuItem key={nav.key} eventKey={nav.key} className="mb-2">
            <Link
                to={nav.path}
                data-tn={props['data-tn']}
                className="flex items-center h-full w-full"
                target={nav.isExternalLink ? '_blank' : ''}
                onClick={() =>
                    onLinkClick?.({
                        key: nav.key,
                        title: nav.title,
                        path: nav.path,
                    })
                }
            >
                <VerticalMenuIcon icon={nav.icon} withMargin={!sideCollapsed} />
                {!sideCollapsed && (
                    <span>
                        <Trans
                            i18nKey={nav.translateKey}
                            defaults={nav.title}
                        />
                    </span>
                )}
            </Link>
        </MenuItem>
    )
}

const VerticalSingleMenuItem = (
    props: Omit<VerticalMenuItemProps, 'title' | 'translateKey'>,
) => {
    const { nav, onLinkClick, sideCollapsed, direction } = props
    return sideCollapsed ? (
        <CollapsedItem
            title={nav.title}
            translateKey={nav.translateKey}
            direction={direction}
            data-tn={props['data-tn']}
        >
            <DefaultItem
                nav={nav}
                sideCollapsed={sideCollapsed}
                onLinkClick={onLinkClick}
            />
        </CollapsedItem>
    ) : (
        <DefaultItem
            nav={nav}
            sideCollapsed={sideCollapsed}
            data-tn={props['data-tn']}
            onLinkClick={onLinkClick}
        />
    )
}

export default VerticalSingleMenuItem
