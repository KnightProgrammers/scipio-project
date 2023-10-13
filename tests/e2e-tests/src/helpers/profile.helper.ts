import { expect, Page } from '@playwright/test';
import { API_BASE_URL } from '../config';


export const DEFAULT_CURRENCIES: string[] = [ 'ARS', 'EUR', 'USD', 'UYI', 'UYU' ];
export const goToUserProfile = async (page: Page) => {
	await page.locator('div[data-tn="user-profile"]').click();
	await page.locator('li.menu-item[data-tn="profile-settings"]').click();
};

export type ProfileTab = 'profile' | 'password' | 'currency' | 'banks'

export const goToProfileTab = async (page: Page, tabName: ProfileTab) => {
	await page.locator(`div[data-tn="account-settings-page"] div.tab-nav[data-tn="profile-tab-${tabName}"]`).click();
};

export const selectRandomCurrencies = async (page: Page) => {
	const userSelectedCurrencies =[...DEFAULT_CURRENCIES]
		.sort(() => 0.5 - Math.random())
		.slice(0, 2)
		.sort();

	for(const userSelectedCurrency of userSelectedCurrencies) {
		await page.locator(`input[name="currencies"][data-tn="${userSelectedCurrency}"]`).click();
	}
	const submitButton = page.locator('button[type="submit"]');
	await expect(submitButton).not.toHaveClass(/cursor-not-allowed/);
	const userCurrenciesRequest = page.waitForRequest((request) =>
		request.url() === `${API_BASE_URL}/users/me/currencies` && request.method() === 'POST',
	);
	await submitButton.click();
	const userCurrencies = await userCurrenciesRequest;
	const userCurrenciesResponse = await userCurrencies.response();
	const savedCurrencies = (await userCurrenciesResponse.json()).map(c => c.code);
	expect(savedCurrencies.sort()).toStrictEqual(userSelectedCurrencies);
	return userSelectedCurrencies;
};
