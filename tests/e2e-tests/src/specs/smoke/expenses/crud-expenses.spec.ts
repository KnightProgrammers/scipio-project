import { test, Page, expect } from '@playwright/test';
import { DEFAULT_USER_CURRENCIES, signInUser } from '../../../helpers/auth.helper';
import { getDefaultUserData } from '../../../config';

import GraphqlService from '../../../services/graphql.service';
import { NAV_MENU, navigateMenu } from '../../../helpers/nav-menu.helper';
import { v4 as uuidv4 } from 'uuid';
import { createExpense, deleteExpense } from '../../../helpers/expense.helper';
import { waitForRequest } from '../../../helpers/generic.helper';

let email: string;
let password: string;

test.describe.configure({ mode: 'serial' });

let page: Page;

let graphqlService: GraphqlService;

let expenseId: string;
let categoryId: string;
const categoryName: string = `Category ${uuidv4()}`;

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
		name: categoryName,
		type: 'WANT',
		isFixedPayment: false,
	});
	categoryId = data1.id;
});

test.afterAll(async () => {
	await graphqlService.deleteCategory(categoryId);
	await page.close();
});

test('Create Expense', async () => {
	const waitForExpenses = waitForRequest(page, 'userExpensesByCategory');
	await navigateMenu(page, NAV_MENU.EXPENSES);
	await waitForExpenses;
	const expense = await createExpense(page, {
		description: 'Expense 1',
		amount: 34.21,
		currencyCode: DEFAULT_USER_CURRENCIES[0],
		categoryName: categoryName,
	});
	expenseId = expense.id;
	const emptyStateContainer = page.locator(
		'div[data-tn="empty-state-no-expenses"]',
	);
	await expect(emptyStateContainer).not.toBeVisible();
	await page.locator('button[data-tn="collapsible-toggle-btn"]').click();
	await expect(
		page.locator(`li[data-tn="expense-container-${expenseId}"]`),
	).toBeVisible();
});

test('Delete Expense', async () => {
	await deleteExpense(page, expenseId, categoryName);
	const emptyStateContainer = page.locator(
		'div[data-tn="empty-state-no-expenses"]',
	);
	await expect(emptyStateContainer).toBeVisible();
});
