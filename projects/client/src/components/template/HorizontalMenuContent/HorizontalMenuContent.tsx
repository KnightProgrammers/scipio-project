import navigationConfig from '@/configs/navigation.config'
import Dropdown from '@/components/ui/Dropdown'
import HorizontalMenuItem from './HorizontalMenuItem'
import HorizontalMenuDropdownItem from './HorizontalMenuDropdownItem'
import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_COLLAPSE,
    NAV_ITEM_TYPE_ITEM,
} from '@/constants/navigation.constant'
import { useTranslation } from 'react-i18next'
import type { Mode } from '@/@types/theme'

type HorizontalMenuContentProps = {
    manuVariant: Mode
}

const HorizontalMenuContent = ({ manuVariant }: HorizontalMenuContentProps) => {
    const { t } = useTranslation()

    return (
        <span className="flex items-center">
            {navigationConfig
                .filter((nav) => !nav.hidden)
                .map((nav) => {
                    if (
                        nav.type === NAV_ITEM_TYPE_TITLE ||
                        nav.type === NAV_ITEM_TYPE_COLLAPSE
                    ) {
                        return (
                            <Dropdown
                                key={nav.key}
                                data-tn={`nav-menu-collapse-${nav.key}`}
                                trigger="click"
                                renderTitle={
                                    <HorizontalMenuItem
                                        manuVariant={manuVariant}
                                        nav={nav}
                                    />
                                }
                            >
                                {nav.subMenu
                                    .filter((nav) => !nav.hidden)
                                    .map((secondarySubNav) =>
                                        secondarySubNav.subMenu.filter(
                                            (nav) => !nav.hidden,
                                        ).length > 0 ? (
                                            <Dropdown.Menu
                                                key={secondarySubNav.key}
                                                title={t(
                                                    secondarySubNav.translateKey,
                                                    secondarySubNav.title,
                                                )}
                                            >
                                                {secondarySubNav.subMenu
                                                    .filter(
                                                        (nav) => !nav.hidden,
                                                    )
                                                    .map((tertiarySubNav) => (
                                                        <HorizontalMenuDropdownItem
                                                            key={
                                                                tertiarySubNav.key
                                                            }
                                                            nav={tertiarySubNav}
                                                        />
                                                    ))}
                                            </Dropdown.Menu>
                                        ) : (
                                            <HorizontalMenuDropdownItem
                                                key={secondarySubNav.key}
                                                nav={secondarySubNav}
                                                data-tn={`nav-menu-item-${secondarySubNav.key}`}
                                            />
                                        ),
                                    )}
                            </Dropdown>
                        )
                    }
                    if (nav.type === NAV_ITEM_TYPE_ITEM) {
                        return (
                            <HorizontalMenuItem
                                key={nav.key}
                                isLink
                                data-tn={`nav-menu-item-${nav.key}`}
                                nav={nav}
                                manuVariant={manuVariant}
                            />
                        )
                    }
                    return <></>
                })}
        </span>
    )
}

export default HorizontalMenuContent
