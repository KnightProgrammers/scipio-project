import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import store, { persistor } from './store'
import Theme from '@/components/template/Theme'
import Layout from '@/components/layouts'
import {
    QueryClient,
    QueryClientProvider,
    useQueryErrorResetBoundary,
} from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import './locales'
import { Button } from '@/components/ui'
import { Container } from '@/components/shared'
import { useTranslation } from 'react-i18next'
import useDarkMode from '@/utils/hooks/useDarkMode'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

// Create a client
const queryClient = new QueryClient()

const Wrapper = () => {
    const { t } = useTranslation()
    const [darkModeOn] = useDarkMode()
    const { reset } = useQueryErrorResetBoundary()

    queryClient.setDefaultOptions({
        queries: {
            refetchOnWindowFocus: false,
        },
        mutations: {
            onError: (e: unknown) => {
                toast.push(
                    <Notification
                        title={t('error.generic') || ''}
                        type="danger"
                    />,
                    {
                        placement: 'top-center',
                    },
                )
                console.error(e)
            },
        },
    })

    const onError = (error: Error) => {
        console.error(error)
        if (
            error.message.includes(
                'Failed to fetch dynamically imported module',
            )
        ) {
            window.location.reload()
        }
    }

    return (
        <ErrorBoundary
            fallbackRender={({ resetErrorBoundary }) => (
                <Container className="flex flex-col h-full h-screen w-screen justify-center items-center">
                    <img
                        src={
                            darkModeOn
                                ? `/img/others/img-2-dark.png`
                                : `/img/others/img-2.png`
                        }
                        alt="sorry"
                    />
                    <p className="font-light text-xl m-4">
                        {t('error.generic')}
                    </p>
                    <Button
                        variant="twoTone"
                        onClick={() => resetErrorBoundary()}
                    >
                        {t('actions.tryAgain')}
                    </Button>
                </Container>
            )}
            onError={onError}
            onReset={reset}
        >
            <Layout />
        </ErrorBoundary>
    )
}

function App() {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <BrowserRouter>
                    <Theme>
                        <QueryClientProvider client={queryClient}>
                            <Wrapper />
                        </QueryClientProvider>
                    </Theme>
                </BrowserRouter>
            </PersistGate>
        </Provider>
    )
}

export default App
