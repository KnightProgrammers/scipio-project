import { useMemo, lazy, Suspense, useState, useEffect } from 'react'
import Loading from '@/components/shared/Loading'
import {
    setUser,
    signOutSuccess,
    useAppDispatch,
    useAppSelector,
} from '@/store'
import {
    LAYOUT_TYPE_SIMPLE,
    LAYOUT_TYPE_DECKED,
} from '@/constants/theme.constant'
import useAuth from '@/utils/hooks/useAuth'
import useDirection from '@/utils/hooks/useDirection'
import useLocale from '@/utils/hooks/useLocale'
import { apiGetUserProfile } from '@/services/AccountService'

const WelcomeWizard = lazy(() => import('../shared/WelcomeWizard'))

const layouts = {
    [LAYOUT_TYPE_SIMPLE]: lazy(() => import('./SimpleLayout')),
    [LAYOUT_TYPE_DECKED]: lazy(() => import('./DeckedLayout')),
}

const Layout = () => {
    const layoutType = useAppSelector((state) => state.theme.layout.type)
    const user = useAppSelector((state) => state.auth.user)
    const [isLoading, setIsLoading] = useState(false)

    const { authenticated } = useAuth()
    const dispatch = useAppDispatch()

    useDirection()
    useLocale()

    useEffect(() => {
        if (authenticated && !user.id && !isLoading) {
            setIsLoading(true)
            apiGetUserProfile()
                .then((data) => {
                    dispatch(setUser(data))
                    setIsLoading(false)
                })
                .catch(() => {
                    dispatch(signOutSuccess())
                    dispatch(
                        setUser({
                            id: '',
                            avatar: '',
                            name: '',
                            email: '',
                            lang: '',
                            country: null,
                        }),
                    )
                })
        }
    }, [authenticated, dispatch, user, isLoading])

    const AppLayout = useMemo(() => {
        if (authenticated) {
            return layouts[layoutType]
        }
        return lazy(() => import('./AuthLayout'))
    }, [layoutType, authenticated])

    if (authenticated && isLoading) {
        return (
            <div className="flex flex-auto flex-col h-[100vh]">
                <Loading loading={true} />
            </div>
        )
    }

    if (authenticated && !user.country) {
        return (
            <Suspense
                fallback={
                    <div className="flex flex-auto flex-col h-[100vh]">
                        <Loading loading={true} />
                    </div>
                }
            >
                <WelcomeWizard />
            </Suspense>
        )
    }

    return (
        <Suspense
            fallback={
                <div className="flex flex-auto flex-col h-[100vh]">
                    <Loading loading={true} />
                </div>
            }
        >
            <AppLayout />
        </Suspense>
    )
}

export default Layout
