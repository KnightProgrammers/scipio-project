/* eslint-disable import/default */
import React from 'react'
import * as Sentry from '@sentry/react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

if (import.meta.env.VITE_FIREBASE_API_KEY) {
    Sentry.init({
        dsn: import.meta.env.VITE_FIREBASE_API_KEY,
        integrations: [
            new Sentry.BrowserTracing({
                // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
                tracePropagationTargets: [
                    'localhost',
                    /^https:\/\/staging-api.scipiofinances.com/,
                ],
            }),
            new Sentry.Replay(),
        ],
        // Performance Monitoring
        tracesSampleRate: 1.0, // Capture 100% of the transactions
        // Session Replay
        replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
        replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
    })
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <App />,
)
