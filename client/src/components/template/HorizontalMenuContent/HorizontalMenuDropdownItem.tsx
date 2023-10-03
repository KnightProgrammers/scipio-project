import Dropdown from '@/components/ui/Dropdown'
import HorizontalMenuNavLink from './HorizontalMenuNavLink'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import navigationIcon from '@/configs/navigation-icon.config'

export type HorizontalMenuItemProps = {
    nav: {
        key: string
        title: string
        translateKey: string
        icon: string
        path: string
        isExternalLink?: boolean
    },
    'data-tn'?: string
}

const HorizontalMenuDropdownItem = (props: HorizontalMenuItemProps) => {
    const { nav } = props;
    const { title, icon, translateKey, path, key, isExternalLink } = nav

    const { t } = useTranslation()

    const itemTitle = t(translateKey, title)

    const renderIcon = icon && (
        <span className="text-2xl mr-1">{navigationIcon[icon]}</span>
    )

    return (
        <Dropdown.Item eventKey={key} className={classNames(path && 'px-0')} data-tn={props["data-tn"]}>
            {path ? (
                <HorizontalMenuNavLink
                    path={path}
                    className={classNames(path && 'px-2')}
                    isExternalLink={isExternalLink}
                >
                    {renderIcon}
                    {itemTitle}
                </HorizontalMenuNavLink>
            ) : (
                <span>{itemTitle}</span>
            )}
        </Dropdown.Item>
    )
}

export default HorizontalMenuDropdownItem
