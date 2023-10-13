import { test, Page, expect } from '@playwright/test';
import { signInUser } from '../../../helpers/auth.helper';
import { DEFAULT_CURRENCIES, goToUserProfile } from '../../../helpers/profile.helper';
import { getDefaultUserData } from '../../../config';
import { waitForRequest } from '../../../helpers/generic.helper';


let email: string;
let password: string;

test.describe.configure({ mode: 'serial' });

let page: Page;

const USER_SELECTED_CURRENCIES: string[] = [ 'USD', 'UYU' ];

test.beforeAll(async ({ browser }) => {
	const defaultUserData = getDefaultUserData();
	email = defaultUserData.email;
	password = defaultUserData.password;
	page = await browser.newPage();
	await page.goto('/');
	await page.waitForLoadState('load');
	await signInUser(page, {email, password}, false);
	await goToUserProfile(page);
});

test.afterAll(async () => {
	await page.close();
});

test('Default list of currencies', async () => {
	const waitForCurrenciesRequest = waitForRequest(page, 'currencies');
	await page.locator('div[data-tn="account-settings-page"] div.tab-nav[data-tn="profile-tab-currency"]').click();
	const currenciesRequest = await waitForCurrenciesRequest;
	const currenciesResponse = await currenciesRequest.response();
	const {data: { currencies }} = await currenciesResponse.json();

	expect(currencies.map(c => c.code)).toStrictEqual(DEFAULT_CURRENCIES);

	const currencyInputs = await page.locator('input[name="currencies"]').all();
	expect(currencyInputs).toHaveLength(DEFAULT_CURRENCIES.length);
	for (const i in currencyInputs) {
		const currencyInput = currencyInputs[i];
		const currencyCode:string =  await currencyInput.getAttribute('data-tn');
		expect(currencyCode).toBeDefined();
		if(USER_SELECTED_CURRENCIES.includes(currencyCode)) {
			await expect(currencyInput).toBeChecked();
		} else {
			await expect(currencyInput).not.toBeChecked();
		}
	}
	const submitButton = page.locator('button[type="submit"]');
	await expect(submitButton).not.toHaveClass(/cursor-not-allowed/);
});
