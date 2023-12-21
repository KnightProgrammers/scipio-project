import {
    NAV_ITEM_TYPE_ITEM,
    NAV_ITEM_TYPE_COLLAPSE,
} from '@/constants/navigation.constant'
import type { NavigationTree } from '@/@types/navigation'

const navigationConfig: NavigationTree[] = [
    {
        key: 'home',
        path: '/home',
        title: 'Home',
        translateKey: 'nav.home',
        icon: 'home',
        type: NAV_ITEM_TYPE_ITEM,
        subMenu: [],
    },
    {
        key: 'expenses',
        path: '/expenses',
        title: 'Expenses',
        translateKey: 'nav.expenses',
        icon: 'expenses',
        type: NAV_ITEM_TYPE_ITEM,
        subMenu: [],
    },
    {
        key: 'incomes',
        path: '/incomes',
        title: 'Incomes',
        translateKey: 'nav.incomes',
        icon: 'incomes',
        type: NAV_ITEM_TYPE_ITEM,
        subMenu: [],
    },
    {
        key: 'savings',
        path: '/savings',
        title: 'Savings',
        translateKey: 'nav.savings',
        icon: 'savings',
        type: NAV_ITEM_TYPE_ITEM,
        subMenu: [],
    },
    {
        key: 'bank-accounts',
        path: '/bank-accounts',
        title: 'Bank Accounts',
        translateKey: 'nav.configurationItems.bankAccounts',
        icon: 'bankAccounts',
        type: NAV_ITEM_TYPE_ITEM,
        subMenu: [],
    },
    {
        key: 'configuration',
        path: '/conf',
        title: 'Configuration',
        translateKey: 'nav.configuration',
        icon: 'configuration',
        type: NAV_ITEM_TYPE_COLLAPSE,
        subMenu: [
            {
                key: 'budgets',
                path: '/conf/budgets',
                title: 'Budgets',
                translateKey: 'nav.budgets',
                icon: 'budgets',
                type: NAV_ITEM_TYPE_ITEM,
                subMenu: [],
            },
            {
                key: 'credit-cards',
                path: '/conf/credit-cards',
                title: 'Credit Cards',
                translateKey: 'nav.configurationItems.creditCards',
                icon: 'creditCards',
                type: NAV_ITEM_TYPE_ITEM,
                subMenu: [],
            },
            {
                key: 'categories',
                path: '/conf/categories',
                title: 'Categories',
                translateKey: 'nav.configurationItems.categories',
                icon: 'categories',
                type: NAV_ITEM_TYPE_ITEM,
                subMenu: [],
            },
        ],
    },
]

export default navigationConfig
