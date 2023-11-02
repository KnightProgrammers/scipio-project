import { test, Page, expect } from '@playwright/test';
import { signInUser } from '../../../helpers/auth.helper';
import { getDefaultUserData } from '../../../config';

import GraphqlService from '../../../services/graphql.service';
import { NAV_MENU, navigateMenu } from '../../../helpers/nav-menu.helper';
import { v4 as uuidv4 } from 'uuid';

let email: string;
let password: string;

test.describe.configure({ mode: 'serial' });

let page: Page;

let graphqlService: GraphqlService;

let categoryId_1 : string;
let categoryId_2 : string;
let categoryId_3 : string;

test.beforeAll(async ({ browser }) => {
	const defaultUserData = getDefaultUserData();
	email = defaultUserData.email;
	password = defaultUserData.password;
	page = await browser.newPage();
	await page.goto('/');
	await page.waitForLoadState('load');
	const {authToken} = await signInUser(page, { email, password }, false);
	graphqlService = new GraphqlService(authToken);

	const data1 = await graphqlService.createCategories({
		name: `Category ${uuidv4()}`,
		type: 'WANT',
		isFixedPayment: true
	});
	categoryId_1 = data1.id;
	console.log(data1);
	console.log(categoryId_1);
	const data2 = await graphqlService.createCategories({
		name: `Category ${uuidv4()}`,
		type: 'WANT',
		isFixedPayment: true
	});
	categoryId_2 = data2.id;
	const data3 = await graphqlService.createCategories({
		name: `Category ${uuidv4()}`,
		type: 'WANT',
		isFixedPayment: true
	});
	categoryId_3 = data3.id;
});

test.afterAll(async () => {
	await graphqlService.deleteCategory(categoryId_1);
	await graphqlService.deleteCategory(categoryId_2);
	await graphqlService.deleteCategory(categoryId_3);
	await page.close();
});

test('example', async () => {

	await navigateMenu(page, NAV_MENU.CATEGORIES);

	const emptyStateContainer = page.locator('div[data-tn="empty-state-no-categories"]');
	await expect(emptyStateContainer).not.toBeVisible();
});
