import { expect, Page, test } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';
import { signInUser, signUpUser } from '../../../helpers/auth.helper';
import firebaseService from '../../../services/firebase.service';
import { waitForRequest } from '../../../helpers/generic.helper';
import { NAV_MENU, navigateMenu } from '../../../helpers/nav-menu.helper';
import {
	createCategory,
	deleteCategory,
	editCategory,
	openEditCategoryForm
} from '../../../helpers/category.helper';

let email: string;
let password: string;
let name: string;

let categoryId: string;

test.describe.configure({ mode: 'serial' });

let page: Page;

test.beforeAll(async ({ browser }) => {
	email = `test-${uuidv4()}@automation.com`;
	password = `password-${uuidv4()}`;
	name = 'Automation User';
	page = await browser.newPage();
	await page.goto('/');
	await page.waitForLoadState('load');
	await signUpUser(page, { email, password, name });
	await signInUser(page, { email, password });
});

test.afterAll(async () => {
	try {
		const user = await  firebaseService.auth().getUserByEmail(email);
		await firebaseService.auth().deleteUser(user.uid);
	} catch {
		console.log('No user to be deleted');
	} finally {
		await page.close();
	}
});

test('Empty state', async () => {
	const waitForCategories = waitForRequest(page, 'userCategories');
	await navigateMenu(page, NAV_MENU.CATEGORIES);
	const categoriesRequest = await waitForCategories;
	const categoriesResponse = await categoriesRequest.response();
	const {data} = await categoriesResponse.json();
	expect(data.me.categories).toEqual([]);

	const emptyStateContainer = page.locator('div[data-tn="empty-state-no-categories"]');
	await expect(emptyStateContainer).toBeVisible();
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
	const emptyStateContainer = page.locator('div[data-tn="empty-state-no-categories"]');
	await expect(emptyStateContainer).toBeVisible();
});
