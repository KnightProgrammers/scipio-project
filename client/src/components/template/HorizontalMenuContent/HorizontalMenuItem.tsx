import navigationIcon from '@/configs/navigation-icon.config'
import MenuItem from '@/components/ui/MenuItem'
import HorizontalMenuNavLink from './HorizontalMenuNavLink'
import { useTranslation } from 'react-i18next'
import type { NavMode } from '@/@types/theme'

export type HorizontalMenuItemProps = {
    nav: {
        key: string
        title: string
        translateKey: string
        icon: string
        path: string
        isExternalLink?: boolean
    }
    isLink?: boolean
    'data-tn'?: string
    manuVariant: NavMode
}

const HorizontalMenuItem = (props: HorizontalMenuItemProps) => {
    const {
        nav,
        isLink,
        manuVariant,
    } = props;
    const { key, title, translateKey, icon, path, isExternalLink } = nav

    const { t } = useTranslation()

    const itemTitle = t(translateKey, title)

    const renderIcon = icon && (
        <span className="text-2xl">{navigationIcon[icon]}</span>
    )

    return (
        <>
            {path && isLink ? (
                <HorizontalMenuNavLink
                    path={path}
                    isExternalLink={isExternalLink}
                    data-tn={props['data-tn']}
                >
                    <MenuItem key={key} variant={manuVariant}>
                        {renderIcon}
                        <span className="flex items-center gap-2">
                            {itemTitle}
                        </span>
                    </MenuItem>
                </HorizontalMenuNavLink>
            ) : (
                <MenuItem variant={manuVariant}>
                    {renderIcon}
                    <span>{itemTitle}</span>
                </MenuItem>
            )}
        </>
    )
}

export default HorizontalMenuItem
