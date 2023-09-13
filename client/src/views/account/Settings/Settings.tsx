import { useState, useEffect, Suspense, lazy } from 'react'
import Tabs from '@/components/ui/Tabs'
import AdaptableCard from '@/components/shared/AdaptableCard'
import Container from '@/components/shared/Container'
import { useNavigate, useLocation } from 'react-router-dom'
import isEmpty from 'lodash/isEmpty'
import { apiGetAccountSettingData } from '@/services/AccountServices'
import { Loading } from '@/components/shared'
import { useTranslation } from 'react-i18next'

type AccountSetting = {
    id: string
    name: string
    email: string
    avatar: string
    lang: string
}

type GetAccountSettingData = AccountSetting

const Profile = lazy(() => import('./components/Profile'))
const Password = lazy(() => import('./components/Password'))

const { TabNav, TabList } = Tabs

const settingsMenu: Record<
    string,
    {
        label: string
        path: string
    }
> = {
    profile: { label: 'settings.tabs.profile', path: 'profile' },
    password: { label: 'settings.tabs.password', path: 'password' },
}

const Settings = () => {
    const [currentTab, setCurrentTab] = useState('profile')
    const [data, setData] = useState<AccountSetting>()

    const navigate = useNavigate()

    const location = useLocation()

    const { t } = useTranslation()

    const path = location.pathname.substring(
        location.pathname.lastIndexOf('/') + 1
    )

    const onTabChange = (val: string) => {
        setCurrentTab(val)
        navigate(`/account/settings/${val}`)
    }

    const fetchData = async () => {
        const response = await apiGetAccountSettingData<GetAccountSettingData>()
        setData(response.data)
    }

    useEffect(() => {
        setCurrentTab(path)
        if (isEmpty(data)) {
            fetchData()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Container>
            <AdaptableCard>
                <Tabs value={currentTab} onChange={(val) => onTabChange(val)}>
                    <TabList>
                        {Object.keys(settingsMenu).map((key) => (
                            <TabNav key={key} value={key}>
                                {t(settingsMenu[key].label)}
                            </TabNav>
                        ))}
                    </TabList>
                </Tabs>
                <div className="px-4 py-6">
                    <Suspense fallback={<></>}>
                        {currentTab === 'profile' &&
                            (data !== undefined ? (
                                <Profile data={data} />
                            ) : (
                                <Loading loading />
                            ))}
                        {currentTab === 'password' && <Password />}
                    </Suspense>
                </div>
            </AdaptableCard>
        </Container>
    )
}

export default Settings
