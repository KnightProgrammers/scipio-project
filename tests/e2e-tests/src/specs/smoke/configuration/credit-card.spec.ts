import { test, Page } from '@playwright/test';
import { signInUser } from '../../../helpers/auth.helper';
import { getDefaultUserData } from '../../../config';


let email: string;
let password: string;

test.describe.configure({ mode: 'serial' });

let page: Page;

test.beforeAll(async ({ browser }) => {
	const defaultUserData = getDefaultUserData();
	email = defaultUserData.email;
	password = defaultUserData.password;
	page = await browser.newPage();
	await page.goto('/');
	await page.waitForLoadState('load');
	await signInUser(page, {email, password}, false);
});

test.afterAll(async () => {
	await page.close();
});

test('Add a credit card', async () => {})
test('Edit a credit card', async () => {})
test('delete a credit card', async () => {})
