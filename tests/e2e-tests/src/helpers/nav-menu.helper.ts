import { Page } from '@playwright/test';

export const NAV_MENU = {
	HOME: ['nav-menu-item-home'],
	EXPENSES: ['nav-menu-item-expenses'],
	INCOMES: ['nav-menu-item-incomes'],
	SAVINGS: ['nav-menu-item-savings'],
	BANK_ACCOUNTS: ['nav-menu-item-bank-accounts'],
	BUDGET: ['nav-menu-collapse-configuration', 'nav-menu-item-budgets'],
	CREDIT_CARDS: ['nav-menu-collapse-configuration', 'nav-menu-item-credit-cards'],
	CATEGORIES: ['nav-menu-collapse-configuration', 'nav-menu-item-categories'],
	JOBS: ['nav-menu-collapse-configuration', 'nav-menu-item-jobs']
};

export const navigateMenu = async (page:Page, menu: string[]): Promise<void> =>  {
	const context = page.context();
	const isMobile = !!context['_options'].isMobile;
	if(isMobile) {
		await page.locator('div[data-tn="mobile-nav-toggle"]').click();
	}
	for (const m of menu) {
		const locator = `*[data-tn="${m}"]`;
		await page.locator(locator).waitFor({state: 'visible'});
		await page.locator(locator).click();
	}
};
