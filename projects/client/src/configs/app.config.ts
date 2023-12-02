export type AppConfig = {
    apiBaseURL: string
    authenticatedEntryPath: string
    unAuthenticatedEntryPath: string
    tourPath: string
    locale: string
    enableMock: boolean
    darkMode: boolean
}

const appConfig: AppConfig = {
    apiBaseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    authenticatedEntryPath: '/home',
    unAuthenticatedEntryPath: '/sign-in',
    tourPath: '/',
    locale: 'en',
    enableMock: false,
    darkMode: false,
}

export default appConfig
