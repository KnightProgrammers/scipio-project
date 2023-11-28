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
import { addBudgetItem, deleteBudgetItem, modifyBudgetItemLimit } from '../../../helpers/budget.helper';

let email: string;
let password: string;
let name: string;

test.describe.configure({ mode: 'serial' });

let page: Page;

let graphqlService: GraphqlService;

let categoryIds: string[];
const budgetItemIds: string[] = [];

let budgetId: string;

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
	categoryIds = await Promise.all(
		['Category #1', 'Category #2', 'Category #3']
			.map((categoryName: string) => graphqlService.createCategories({
				name: categoryName,
				type: 'WANT',
				isFixedPayment: false,
			})));
});

test.afterAll(async () => {
	try {
		const user = await firebaseService.auth().getUserByEmail(email);
		await firebaseService.auth().deleteUser(user.uid);
		console.log(`Deleted User "${email}"`);
	} catch {
		console.log('No user to be deleted');
	} finally {
		for (const categoryId of categoryIds) {
			await graphqlService.deleteCategory(categoryId);
		}
		await page.close();
	}
});

test('Empty State', async () => {
	const waitForBudget = waitForRequest(page, 'userBudget');
	await navigateMenu(page, NAV_MENU.BUDGET);
	await waitForBudget;
	const emptyStateContainer = page.locator(
		'div[data-tn="empty-state"]',
	);
	await expect(emptyStateContainer).toBeVisible();
});

test('Start', async () => {
	const waitForStartBudgetRequest = waitForRequest(page, 'createBudget');
	await page.locator('button[data-tn="budget-start"]').click();
	const startBudgetRequest = await waitForStartBudgetRequest;
	const responseStartBudget = await startBudgetRequest.response();
	const { data: { createBudget: { id: newId } } } = await responseStartBudget.json();
	budgetId = newId;
	expect(budgetId).toBeDefined();
	await expect(page.locator('div[data-tn="budgets-page"] table')).toBeVisible();
});
test('Start without items', async () => {
	await expect(page.locator('div[data-tn="budgets-page"] div.alert[data-tn="budget-without-items"]')).toBeVisible();
});
test('Add an item', async () => {
	const budgetItemId: string = await addBudgetItem(page, 'Category #1');
	budgetItemIds.push(budgetItemId);
	await expect(page.locator('div[data-tn="budgets-page"] div.alert[data-tn="budget-without-items"]')).not.toBeVisible();
});
test('Modify limit', async () => {
	await page.reload();
	await modifyBudgetItemLimit(page, {
		budgetItemId: budgetItemIds[0],
		currencyCode: DEFAULT_USER_CURRENCIES[0],
		limit: 200
	});
});
test('Another item', async () => {
	const budgetItemId: string = await addBudgetItem(page, 'Category #2');
	budgetItemIds.push(budgetItemId);
});
test('All items for all categories', async () => {
	const budgetItemId: string = await addBudgetItem(page, 'Category #3');
	budgetItemIds.push(budgetItemId);
	await expect(page.locator('button[data-tn="add-budget-item-btn"]')).not.toBeVisible();
});
test('Delete one item', async () => {
	await deleteBudgetItem(page, budgetItemIds[1]);
	await expect(page.locator('button[data-tn="add-budget-item-btn"]')).toBeVisible();
});
test('Delete all items', async () => {
	await deleteBudgetItem(page, budgetItemIds[0]);
	await deleteBudgetItem(page, budgetItemIds[2]);
	await expect(page.locator('div[data-tn="budgets-page"] div.alert[data-tn="budget-without-items"]')).toBeVisible();
});
