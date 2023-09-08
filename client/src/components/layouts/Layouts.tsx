import { useMemo, lazy, Suspense, useState, useEffect } from "react";
import Loading from '@/components/shared/Loading'
import { setUser, signOutSuccess, useAppDispatch, useAppSelector } from "@/store";
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
import { apiUserProfile } from "@/services/AuthService";

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
    const [isLoading, setIsLoading] = useState(true);

    const { authenticated } = useAuth()
    const dispatch = useAppDispatch()

    useDirection()

    useLocale()

    const getUserData = async () => {
        try {
            const {data: user} = await apiUserProfile();
            dispatch(setUser(user))
        } catch {
            signOutSuccess();
        }
        setIsLoading(false);
    }

    useMemo(() => {
        authenticated && getUserData();
    }, [authenticated])

    const AppLayout = useMemo(() => {
        if (authenticated) {
            return layouts[layoutType]
        }
        return lazy(() => import('./AuthLayout'))
    }, [layoutType, authenticated, isLoading])

    if(authenticated && isLoading) {
        return <div className="flex flex-auto flex-col h-[100vh]">
            <Loading loading={true} />
        </div>;
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
