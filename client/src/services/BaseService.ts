import axios from 'axios'
import appConfig from '@/configs/app.config'
import { TOKEN_TYPE, REQUEST_HEADER_AUTH_KEY } from '@/constants/api.constant'
import { PERSIST_STORE_NAME } from '@/constants/app.constant'
import deepParseJson from '@/utils/deepParseJson'
import store, { signInSuccess, signOutSuccess } from '../store'
import { auth } from '@/services/FirebaseService'

const unauthorizedCode = [401, 403]

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
    (error) => {
        return Promise.reject(error)
    },
)

BaseService.interceptors.response.use(
    (response) => response,
    async (error) => {
        const { response } = error

        const originalRequest = error.config
        if (
            error.response.status === 401 &&
            !originalRequest._retry &&
            auth.currentUser
        ) {
            originalRequest._retry = true
            try {
                const authToken = await auth.currentUser.getIdToken(true)
                store.dispatch(signInSuccess(authToken))
                axios.defaults.headers.common['Authorization'] =
                    'Bearer ' + authToken
                return BaseService(originalRequest)
            } catch {
                store.dispatch(signOutSuccess())
            }
        } else if (response && unauthorizedCode.includes(response.status)) {
            store.dispatch(signOutSuccess())
        }

        return Promise.reject(error)
    },
)

export default BaseService
