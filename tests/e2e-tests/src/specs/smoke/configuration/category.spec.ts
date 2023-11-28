import { test, Page, expect } from '@playwright/test';
import { signInUser } from '../../../helpers/auth.helper';
import { getDefaultUserData } from '../../../config';
import {
	createCategory,
	deleteCategory,
	editCategory,
	openEditCategoryForm
} from '../../../helpers/category.helper';
import { waitForRequest } from '../../../helpers/generic.helper';
import { NAV_MENU, navigateMenu } from '../../../helpers/nav-menu.helper';


let email: string;
let password: string;

let categoryId: string;

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

test('Load category page', async () => {
	const waitForCategories = waitForRequest(page, 'userCategories');
	await navigateMenu(page, NAV_MENU.CATEGORIES);
	await waitForCategories;
});

test('Add a category', async () => {
	const category = await createCategory(page, {
		name: 'Clothes',
		type: 'WANT',
		isFixedPayment: false
	});
	categoryId = category.id;
	const emptyStateContainer = page.locator('div[data-tn="empty-state-no-categories"]');
	await expect(emptyStateContainer).not.toBeVisible();
	await expect(page.locator(`span[data-tn="name-category-lbl-${categoryId}"]`)).toBeVisible();
	await expect(page.locator(`span[data-tn="name-category-lbl-${categoryId}"]`)).toHaveText('Clothes');
});
test('Edit a category', async () => {
	await openEditCategoryForm(page, categoryId);
	await editCategory(page, categoryId, {
		name: 'Rent',
		type: 'NEED',
		isFixedPayment: true
	});
	await expect(page.locator(`span[data-tn="name-category-lbl-${categoryId}"]`)).toBeVisible();
	await expect(page.locator(`span[data-tn="name-category-lbl-${categoryId}"]`)).toHaveText('Rent');
});
test('delete a category', async () => {
	await deleteCategory(page, categoryId);
	await expect(page.locator(`div[data-tn="category-${categoryId}"]`)).not.toBeVisible();
});
