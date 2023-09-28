import { useState, useEffect, Suspense, lazy, useCallback } from 'react'
import Tabs from '@/components/ui/Tabs'
import AdaptableCard from '@/components/shared/AdaptableCard'
import Container from '@/components/shared/Container'
import { useNavigate, useLocation } from 'react-router-dom'
import { apiGetUserProfile } from '@/services/AccountServices'
import { Loading } from '@/components/shared'
import { useTranslation } from 'react-i18next'

type AccountSetting = {
    id: string
    name: string
    email: string
    avatar: string
    lang: string
    country: {
        name: string
        code: string
    }
}

const Profile = lazy(() => import('./components/Profile'))
const Password = lazy(() => import('./components/Password'))
const Currency = lazy(() => import('./components/Currency'))
const Banks = lazy(() => import('./components/Banks'))

const { TabNav, TabList } = Tabs

const settingsMenu: Record<
    string,
    {
        label: string
        path: string
    }
> = {
    profile: { label: 'pages.settings.tabs.profile', path: 'profile' },
    password: { label: 'pages.settings.tabs.password', path: 'password' },
    currency: { label: 'pages.settings.tabs.currency', path: 'currency' },
    banks: { label: 'pages.settings.tabs.banks', path: 'banks' },
}

const Settings = () => {
    const [currentTab, setCurrentTab] = useState('profile')
    const [data, setData] = useState<AccountSetting>()

    const navigate = useNavigate()

    const location = useLocation()

    const { t } = useTranslation()

    const path = location.pathname.substring(
        location.pathname.lastIndexOf('/') + 1,
    )

    const onTabChange = (val: string) => {
        setCurrentTab(val)
        navigate(`/account/settings/${val}`)
    }

    const fetchData = useCallback(async () => {
        const response = await apiGetUserProfile()
        setData(response.data)
    }, [setData])

    useEffect(() => {
        setCurrentTab(path)
        if (!data) {
            fetchData().catch(console.error)
        }
    }, [setCurrentTab, data, fetchData, path])

    return (
        <Container data-tn="account-settings-page">
            <AdaptableCard>
                <Tabs value={currentTab} onChange={(val) => onTabChange(val)}>
                    <TabList>
                        {Object.keys(settingsMenu).map((key) => (
                            <TabNav key={key} value={key} data-tn={`profile-tab-${key}`}>
                                {t(settingsMenu[key].label)}
                            </TabNav>
                        ))}
                    </TabList>
                </Tabs>
                <div className="px-4 py-6">
                    <Suspense fallback={<></>}>
                        {currentTab === 'profile' &&
                            (data !== undefined ? (
                                <Profile
                                    data={{
                                        ...data,
                                        country: data.country.name,
                                    }}
                                />
                            ) : (
                                <Loading loading />
                            ))}
                        {currentTab === 'password' && <Password />}
                        {currentTab === 'currency' && <Currency />}
                        {currentTab === 'banks' && <Banks />}
                    </Suspense>
                </div>
            </AdaptableCard>
        </Container>
    )
}

export default Settings
