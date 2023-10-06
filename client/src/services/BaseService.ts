import axios from 'axios'
import appConfig from '@/configs/app.config'
import { TOKEN_TYPE, REQUEST_HEADER_AUTH_KEY } from '@/constants/api.constant'
import { PERSIST_STORE_NAME } from '@/constants/app.constant'
import deepParseJson from '@/utils/deepParseJson'
import store, { signInSuccess } from '../store'
import { auth } from '@/services/FirebaseService'
import createAuthRefreshInterceptor from 'axios-auth-refresh'

const BaseService = axios.create({
    timeout: 60000,
    baseURL: appConfig.apiBaseURL,
})

BaseService.interceptors.request.use(
    (config) => {
        const rawPersistData = localStorage.getItem(PERSIST_STORE_NAME)
        const persistData = deepParseJson(rawPersistData)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let accessToken = (persistData as any).auth.session.token

        if (!accessToken) {
            const { auth } = store.getState()
            accessToken = auth.session.token
        }

        if (accessToken) {
            config.headers[
                REQUEST_HEADER_AUTH_KEY
            ] = `${TOKEN_TYPE}${accessToken}`
        }

        return config
    },
    null,
    { synchronous: true },
)

// Set up an interceptor for responses to catch when the auth token expires
// and automatically refresh.
const refreshAuth = async (failedRequest: any) => {
    if (!auth.currentUser) {
        throw new Error('There is no current user')
    }
    const authToken = await auth.currentUser.getIdToken(true)
    store.dispatch(signInSuccess(authToken))
    // eslint-disable-next-line no-param-reassign
    failedRequest.response.config.headers[
        REQUEST_HEADER_AUTH_KEY
    ] = `${TOKEN_TYPE}${authToken}`
}
createAuthRefreshInterceptor(BaseService, refreshAuth, {
    pauseInstanceWhileRefreshing: true,
    interceptNetworkError: true,
})
export default BaseService
