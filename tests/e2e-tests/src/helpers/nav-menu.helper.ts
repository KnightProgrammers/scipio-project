import { Page } from "@playwright/test";

export const NAV_MENU = {
    HOME: ['nav-menu-item-home'],
    EXPENSES: ['nav-menu-item-expenses'],
    SAVINGS: ['nav-menu-item-savings'],
    INCOMES: ['nav-menu-item-incomes'],
    BANK_ACCOUNTS: ['nav-menu-collapse-configuration', 'nav-menu-item-bank-accounts'],
    CREDIT_CARDS: ['nav-menu-collapse-configuration', 'nav-menu-item-bank-credit-cards'],
    CATEGORIES: ['nav-menu-collapse-configuration', 'nav-menu-item-bank-categories'],
    JOBS: ['nav-menu-collapse-configuration', 'nav-menu-item-bank-jobs']
}

export const navigateMenu = async (page:Page, menu: string[]): Promise<void> =>  {
    for (const m of menu) {
        const locator = `*[data-tn="${m}"]`;
        await page.locator(locator).waitFor({state: 'visible'});
        await page.locator(locator).click()
    }
}
