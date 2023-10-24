import { lazy } from 'react'
import authRoute from './authRoute'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [...authRoute]

export const protectedRoutes = [
    {
        key: 'home',
        path: '/home',
        component: lazy(() => import('@/views/Home')),
        authority: [],
    },
    {
        key: 'expenses',
        path: '/expenses',
        component: lazy(() => import('@/views/expenses')),
        authority: [],
        meta: {
            header: 'pages.expenses.header',
        },
    },
    {
        key: 'savings',
        path: '/savings',
        component: lazy(() => import('@/views/savings')),
        authority: [],
        meta: {
            header: 'pages.savings.header',
        },
    },
    {
        key: 'incomes',
        path: '/incomes',
        component: lazy(() => import('@/views/incomes')),
        authority: [],
        meta: {
            header: 'pages.incomes.header',
        },
    },
    {
        key: 'bankAccounts',
        path: '/conf/bank-accounts',
        component: lazy(() => import('@/views/configuration/bankAccounts')),
        authority: [],
        meta: {
            header: 'pages.bankAccounts.header',
        },
    },
    {
        key: 'creditCards',
        path: '/conf/credit-cards',
        component: lazy(() => import('@/views/configuration/creditCards')),
        authority: [],
        meta: {
            header: 'pages.creditCards.header',
        },
    },
    {
        key: 'categories',
        path: '/conf/categories',
        component: lazy(() => import('@/views/configuration/categories')),
        authority: [],
    },
    {
        key: 'jobs',
        path: '/conf/jobs',
        component: lazy(() => import('@/views/configuration/jobs')),
        authority: [],
        meta: {
            header: 'pages.jobs.header',
        },
    },
    {
        key: 'account.settings',
        path: '/account/settings/:tab',
        component: lazy(() => import('@/views/account/Settings')),
        authority: [],
        meta: {
            header: 'pages.settings.header',
        },
    },
]
