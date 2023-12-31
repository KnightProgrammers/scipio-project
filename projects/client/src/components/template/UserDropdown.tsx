import Avatar from '@/components/ui/Avatar'
import Dropdown from '@/components/ui/Dropdown'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import useAuth from '@/utils/hooks/useAuth'
import { Link } from 'react-router-dom'
import classNames from 'classnames'
import { HiOutlineLogout, HiOutlineUser } from 'react-icons/hi'
import type { CommonProps } from '@/@types/common'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '@/store'
import ModeSwitcher from '@/components/template/ThemeConfigurator/ModeSwitcher'

type DropdownList = {
    labelPath: string
    path: string
    dataTn: string
    icon: JSX.Element
}

const dropdownItemList: DropdownList[] = [
    {
        labelPath: 'nav.profile',
        path: '/account/settings/profile',
        dataTn: 'profile-settings',
        icon: <HiOutlineUser />,
    },
]

const _UserDropdown = ({ className }: CommonProps) => {
    const { signOut } = useAuth()

    const userState = useAppSelector((state) => state.auth.user)

    const { t } = useTranslation()

    const UserAvatar = (
        <div className={classNames(className, 'flex items-center gap-2')}>
            <Avatar
                size={32}
                shape="circle"
                data-tn="header-user-avatar"
                src={
                    userState.avatar ?? './img/thumbs/generic-user-profile.png'
                }
            />
        </div>
    )

    return (
        <div>
            <Dropdown
                menuStyle={{ minWidth: 240 }}
                renderTitle={UserAvatar}
                placement="bottom-end"
                data-tn="user-profile"
            >
                <Dropdown.Item variant="header">
                    <div className="py-2 px-3 flex items-center gap-2">
                        <Avatar
                            shape="circle"
                            src={userState.avatar}
                            data-tn="profile-user-avatar"
                        />
                        <div>
                            <div
                                className="font-bold text-gray-900 dark:text-gray-100"
                                data-tn="profile-user-name"
                            >
                                {userState.name}
                            </div>
                            <div
                                className="text-xs"
                                data-tn="profile-user-email"
                            >
                                {userState.email}
                            </div>
                        </div>
                    </div>
                </Dropdown.Item>
                <Dropdown.Item variant="divider" />

                <Dropdown.Item variant="header" className="mb-1 px-0">
                    <div className="flex items-center justify-between px-2">
                        <div>
                            <strong>{t('pages.profile.appearance')}</strong>
                        </div>
                        <ModeSwitcher />
                    </div>
                </Dropdown.Item>
                <Dropdown.Item variant="divider" />
                {dropdownItemList.map((item) => (
                    <Dropdown.Item
                        key={t(item.labelPath)}
                        eventKey={item.labelPath}
                        className="mb-1 px-0"
                        data-tn={item.dataTn}
                    >
                        <Link
                            className="flex h-full w-full px-2"
                            to={item.path}
                        >
                            <span className="flex gap-2 items-center w-full">
                                <span className="text-xl opacity-50">
                                    {item.icon}
                                </span>
                                <span>{t(item.labelPath)}</span>
                            </span>
                        </Link>
                    </Dropdown.Item>
                ))}
                <Dropdown.Item variant="divider" />
                <Dropdown.Item
                    eventKey="Sign Out"
                    className="gap-2"
                    data-tn="sign-out"
                    onClick={signOut}
                >
                    <span className="text-xl opacity-50">
                        <HiOutlineLogout />
                    </span>
                    <span>{t('actions.signOut')}</span>
                </Dropdown.Item>
            </Dropdown>
        </div>
    )
}

const UserDropdown = withHeaderItem(_UserDropdown)

export default UserDropdown
