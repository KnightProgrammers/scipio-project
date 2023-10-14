import { test, Page, expect } from '@playwright/test';
import { signInUser } from '../../helpers/auth.helper';
import { getDefaultUserData } from '../../config';

test.describe.configure({ mode: 'serial' });

let page: Page;

test.beforeAll(async ({ browser }) => {
	page = await browser.newPage();
	await page.goto('/');
	await page.waitForLoadState('load');
});

test.afterAll(async () => {
	await page.close();
});

test('Successful sign-in', async () => {
	const {email, password, name } = getDefaultUserData();
	const userData = await signInUser(page, {email, password}, false);
	expect(userData.id).toBeTruthy();
	expect(userData.name).toBe(name);
	expect(userData.email).toBe(email);
	expect(userData.avatar).toBeTruthy();
	expect(userData.lang).toBeTruthy();
	expect(userData.country).toBeTruthy();
	await page.locator('div[data-tn="user-profile"]').click();
	await page.locator('div[data-tn="user-profile"]').click();
	await expect(page.locator('div[data-tn="profile-user-name"]'))
		.toHaveText(name);
	await expect(page.locator('div[data-tn="profile-user-email"]'))
		.toHaveText(email);
});
