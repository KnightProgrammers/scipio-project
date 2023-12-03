import { expect, Page, test } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';
import {
	DEFAULT_USER_CURRENCIES,
	signInUser,
	signUpUser,
} from '../../../helpers/auth.helper';
import firebaseService from '../../../services/firebase.service';
import GraphqlService from '../../../services/graphql.service';
import { waitForRequest } from '../../../helpers/generic.helper';
import { NAV_MENU, navigateMenu } from '../../../helpers/nav-menu.helper';
import { createExpense, deleteExpense } from '../../../helpers/expense.helper';

let email: string;
let password: string;
let name: string;

test.describe.configure({ mode: 'serial' });

let page: Page;

let graphqlService: GraphqlService;

let categoryId: string;
const categoryName: string = `Category ${uuidv4()}`;

let expenseId: string;

test.beforeAll(async ({ browser }) => {
	email = `test-${uuidv4()}@automation.com`;
	password = `password-${uuidv4()}`;
	name = 'Automation User';
	page = await browser.newPage();
	await page.goto('/');
	await page.waitForLoadState('load');
	console.log(`Creating account for user with email: "${email}"`);
	await signUpUser(page, { email, password, name });
	const { authToken } = await signInUser(page, { email, password });

	graphqlService = new GraphqlService(authToken);
	const data1 = await graphqlService.createCategories({
		name: categoryName,
		type: 'WANT',
		isFixedPayment: false,
	});
	categoryId = data1.id;
});

test.afterAll(async () => {
	try {
		const user = await firebaseService.auth().getUserByEmail(email);
		await firebaseService.auth().deleteUser(user.uid);
		console.log(`Deleted User "${email}"`);
	} catch {
		console.log('No user to be deleted');
	} finally {
		if(graphqlService) {
			await graphqlService.deleteCategory(categoryId);
		}
		await page.close();
	}
});

test('Empty State', async () => {
	const waitForExpenses = waitForRequest(page, 'userExpensesByCategory');
	await navigateMenu(page, NAV_MENU.EXPENSES);
	await waitForExpenses;
	const emptyStateContainer = page.locator(
		'div[data-tn="empty-state-no-expenses"]',
	);
	await expect(emptyStateContainer).toBeVisible();
});

test('Create Expense', async () => {
	const expense = await createExpense(page, {
		description: 'Expense 1',
		amount: 34.21,
		currencyCode: DEFAULT_USER_CURRENCIES[0],
		categoryName: categoryName,
		type: 'CASH'
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
