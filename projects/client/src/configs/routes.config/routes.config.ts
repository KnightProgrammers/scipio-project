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
    },
    {
        key: 'savings',
        path: '/savings',
        component: lazy(() => import('@/views/savings')),
        authority: [],
    },
    {
        key: 'budgets',
        path: '/budgets',
        component: lazy(() => import('@/views/budgets')),
        authority: [],
    },
    {
        key: 'incomes',
        path: '/incomes',
        component: lazy(() => import('@/views/incomes')),
        authority: [],
    },
    {
        key: 'bankAccounts',
        path: '/conf/bank-accounts',
        component: lazy(() => import('@/views/configuration/bankAccounts')),
        authority: [],
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
        key: 'account.settings',
        path: '/account/settings/:tab',
        component: lazy(() => import('@/views/account/Settings')),
        authority: [],
        meta: {
            header: 'pages.settings.header',
        },
    },
]
