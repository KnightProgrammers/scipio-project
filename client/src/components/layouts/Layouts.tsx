import { useMemo, lazy, Suspense, useState, useEffect } from 'react'
import Loading from '@/components/shared/Loading'
import {
    setUser,
    signOutSuccess,
    useAppDispatch,
    useAppSelector,
} from '@/store'
import {
    LAYOUT_TYPE_CLASSIC,
    LAYOUT_TYPE_MODERN,
    LAYOUT_TYPE_SIMPLE,
    LAYOUT_TYPE_STACKED_SIDE,
    LAYOUT_TYPE_DECKED,
    LAYOUT_TYPE_BLANK,
} from '@/constants/theme.constant'
import useAuth from '@/utils/hooks/useAuth'
import useDirection from '@/utils/hooks/useDirection'
import useLocale from '@/utils/hooks/useLocale'
import { apiGetUserProfile } from '@/services/AccountServices'

const WelcomeWizard = lazy(() => import('../shared/WelcomeWizard'))

const layouts = {
    [LAYOUT_TYPE_CLASSIC]: lazy(() => import('./ClassicLayout')),
    [LAYOUT_TYPE_MODERN]: lazy(() => import('./ModernLayout')),
    [LAYOUT_TYPE_STACKED_SIDE]: lazy(() => import('./StackedSideLayout')),
    [LAYOUT_TYPE_SIMPLE]: lazy(() => import('./SimpleLayout')),
    [LAYOUT_TYPE_DECKED]: lazy(() => import('./DeckedLayout')),
    [LAYOUT_TYPE_BLANK]: lazy(() => import('./BlankLayout')),
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
                .then(({ data: user }) => {
                    dispatch(setUser(user))
                    setIsLoading(false)
                })
                .catch(() => {
                    dispatch(signOutSuccess())
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
