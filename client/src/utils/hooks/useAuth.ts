import { apiSignUp } from '@/services/AuthService'
import {
    setUser,
    signInSuccess,
    signOutSuccess,
    useAppSelector,
    useAppDispatch,
} from '@/store'
import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useNavigate } from 'react-router-dom'
import useQuery from './useQuery'
import type { SignUpCredential } from '@/@types/auth'
import { UserCredential } from '@firebase/auth'
import { auth } from '@/services/FirebaseService'

type Status = 'success' | 'failed'

function useAuth() {
    const dispatch = useAppDispatch()

    const navigate = useNavigate()

    const query = useQuery()

    const { token, signedIn } = useAppSelector((state) => state.auth.session)

    const signIn = async (
        credential: UserCredential,
    ): Promise<
        | {
              status: Status
              message: string
          }
        | undefined
    > => {
        if (credential.user) {
            const token = await credential.user.getIdToken()
            dispatch(signInSuccess(token))
            const redirectUrl = query.get(REDIRECT_URL_KEY)
            navigate(
                redirectUrl ? redirectUrl : appConfig.authenticatedEntryPath,
            )
            return {
                status: 'success',
                message: '',
            }
        } else {
            return {
                status: 'failed',
                message: '',
            }
        }
    }

    const signUp = async (values: SignUpCredential) => {
        try {
            const resp = await apiSignUp(values)
            if (resp.data) {
                const { token } = resp.data
                dispatch(signInSuccess(token))
                if (resp.data.user) {
                    dispatch(
                        setUser(
                            resp.data.user || {
                                id: '',
                                avatar: '',
                                name: 'Anonymous',
                                email: '',
                                lang: '',
                                country: null,
                            },
                        ),
                    )
                }
                const redirectUrl = query.get(REDIRECT_URL_KEY)
                navigate(
                    redirectUrl
                        ? redirectUrl
                        : appConfig.authenticatedEntryPath,
                )
                return {
                    status: 'success',
                    message: '',
                }
            }
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        } catch (errors: any) {
            return {
                status: 'failed',
                message: errors?.response?.data?.message || errors.toString(),
            }
        }
    }

    const handleSignOut = () => {
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
        navigate(appConfig.unAuthenticatedEntryPath)
    }

    const signOut = async () => {
        await auth.signOut()
        handleSignOut()
    }

    const isAuthenticated = async () => {
        if (!auth.currentUser) return false
        const token = await auth.currentUser.getIdToken(true)
        dispatch(signInSuccess(token))
        return true
    }

    return {
        authenticated: token && signedIn,
        isAuthenticated,
        signIn,
        signUp,
        signOut,
    }
}

export default useAuth
