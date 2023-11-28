import { expect, Page, test } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';
import { signInUser, signUpUser, DEFAULT_USER_CURRENCIES } from '../../../helpers/auth.helper';
import firebaseService from '../../../services/firebase.service';
import GraphqlService from '../../../services/graphql.service';
import { DateTime } from 'luxon';
import { waitForRequest } from '../../../helpers/generic.helper';
import { NAV_MENU, navigateMenu } from '../../../helpers/nav-menu.helper';
import { applyExpenseFilter } from '../../../helpers/expense.helper';
import { convertToNumber } from '../../../utils/convertToNumber';

let email: string;
let password: string;
let name: string;

test.describe.configure({ mode: 'serial' });

let page: Page;

let graphqlService: GraphqlService;

let categoryId_1: string;
let categoryId_2: string;
let categoryId_3: string;

test.beforeAll(async ({ browser }) => {
	email = `test-${uuidv4()}@automation.com`;
	password = `password-${uuidv4()}`;
	name = 'Automation User';
	page = await browser.newPage();
	await page.goto('/');
	await page.waitForLoadState('load');
	console.log(`Creating account for user with email: "${email}"`);
	await signUpUser(page, { email, password, name });
	const {authToken} = await signInUser(page, { email, password });
	graphqlService = new GraphqlService(authToken);
	const data1 = await graphqlService.createCategories({
		name: `Category ${uuidv4()}`,
		type: 'WANT',
		isFixedPayment: false
	});
	categoryId_1 = data1.id;
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
	const userCurrencies = await graphqlService.getUserCurrencies();
	await graphqlService.createExpense({
		amount: 456,
		categoryId: categoryId_1,
		billableDate: DateTime.fromJSDate(new Date()).toFormat('dd/MM/yyyy'),
		currencyId: userCurrencies.find(c => c.code === DEFAULT_USER_CURRENCIES[1]).id,
		description: 'Expense #1'
	});
	await graphqlService.createExpense({
		amount: 1203,
		categoryId: categoryId_2,
		billableDate: DateTime.fromJSDate(new Date()).toFormat('dd/MM/yyyy'),
		currencyId: userCurrencies.find(c => c.code === DEFAULT_USER_CURRENCIES[0]).id,
		description: 'Expense #2'
	});
	await graphqlService.createExpense({
		amount: 86,
		categoryId: categoryId_3,
		billableDate: DateTime.fromJSDate(new Date()).minus({month: 1}).toFormat('dd/MM/yyyy'),
		currencyId: userCurrencies.find(c => c.code === DEFAULT_USER_CURRENCIES[1]).id,
		description: 'Expense #3'
	});

	const waitForExpenses = waitForRequest(page, 'userExpensesByCategory');
	await navigateMenu(page, NAV_MENU.EXPENSES);
	await waitForExpenses;
});

test.afterAll(async () => {
	try {
		const user = await  firebaseService.auth().getUserByEmail(email);
		await firebaseService.auth().deleteUser(user.uid);
		console.log(`Deleted User "${email}"`);
	} catch {
		console.log('No user to be deleted');
	} finally {
		await page.close();
	}
});


test('Validate Summary', async () => {
	const summaryCard1 = await page.locator(`div[data-tn="summary-card-${DEFAULT_USER_CURRENCIES[0].toLowerCase()}"] h3`).textContent();
	const summaryCard2 = await page.locator(`div[data-tn="summary-card-${DEFAULT_USER_CURRENCIES[1].toLowerCase()}"] h3`).textContent();

	expect(convertToNumber(summaryCard1)).toEqual(1203);
	expect(convertToNumber(summaryCard2)).toEqual(456);
});
test('Validate Details', async () => {
	// Category 1 is present
	await expect(page.locator(`div[data-tn="category-detail-${categoryId_1}"]`)).toBeVisible();
	// Category 2 is present
	await expect(page.locator(`div[data-tn="category-detail-${categoryId_2}"]`)).toBeVisible();
	// Category 3 is not present
	await expect(page.locator(`div[data-tn="category-detail-${categoryId_3}"]`)).not.toBeVisible();
});
test.describe('filters', () => {
	test.afterEach(async () => {
		await page.reload();
	});
	test('Filter by Month', async () => {
		await applyExpenseFilter(page, {
			fromDate: DateTime.fromJSDate(new Date()).minus({month: 1}).startOf('month'),
			toDate: DateTime.fromJSDate(new Date()).minus({month: 1}).endOf('month')
		});
		// Category 1 is not present
		await expect(page.locator(`div[data-tn="category-detail-${categoryId_1}"]`)).not.toBeVisible();
		// Category 2 is not present
		await expect(page.locator(`div[data-tn="category-detail-${categoryId_2}"]`)).not.toBeVisible();
		// Category 3 is present
		await expect(page.locator(`div[data-tn="category-detail-${categoryId_3}"]`)).toBeVisible();
	});
	test('Filter by Expense Type', async () => {
		await applyExpenseFilter(page, {
			fromDate: DateTime.fromJSDate(new Date()).minus({month: 1}).startOf('month'),
			expenseType: ['FIXED_EXPENSE']
		});
		// Category 1 is not present
		await expect(page.locator(`div[data-tn="category-detail-${categoryId_1}"]`)).not.toBeVisible();
		// Category 2 is present
		await expect(page.locator(`div[data-tn="category-detail-${categoryId_2}"]`)).toBeVisible();
		// Category 3 is present
		await expect(page.locator(`div[data-tn="category-detail-${categoryId_3}"]`)).toBeVisible();

		await applyExpenseFilter(page, {
			expenseType: ['VARIABLE_EXPENSE']
		});
		// Category 1 is present
		await expect(page.locator(`div[data-tn="category-detail-${categoryId_1}"]`)).toBeVisible();
		// Category 2 is not present
		await expect(page.locator(`div[data-tn="category-detail-${categoryId_2}"]`)).not.toBeVisible();
		// Category 3 is not present
		await expect(page.locator(`div[data-tn="category-detail-${categoryId_3}"]`)).not.toBeVisible();
	});
	test('Filter by Currency', async () => {
		await applyExpenseFilter(page, {
			fromDate: DateTime.fromJSDate(new Date()).minus({month: 1}).startOf('month'),
			currency: [DEFAULT_USER_CURRENCIES[0]]
		});
		// Category 1 is not present
		await expect(page.locator(`div[data-tn="category-detail-${categoryId_1}"]`)).not.toBeVisible();
		// Category 2 is present
		await expect(page.locator(`div[data-tn="category-detail-${categoryId_2}"]`)).toBeVisible();
		// Category 3 is not present
		await expect(page.locator(`div[data-tn="category-detail-${categoryId_3}"]`)).not.toBeVisible();
		await applyExpenseFilter(page, {
			currency: [DEFAULT_USER_CURRENCIES[1]]
		});
		// Category 1 is present
		await expect(page.locator(`div[data-tn="category-detail-${categoryId_1}"]`)).toBeVisible();
		// Category 2 is not present
		await expect(page.locator(`div[data-tn="category-detail-${categoryId_2}"]`)).not.toBeVisible();
		// Category 3 is present
		await expect(page.locator(`div[data-tn="category-detail-${categoryId_3}"]`)).toBeVisible();
	});
	test('Filter by date with no results', async () => {
		await applyExpenseFilter(page, {
			fromDate: DateTime.fromJSDate(new Date()).minus({month: 2}).startOf('month'),
			toDate: DateTime.fromJSDate(new Date()).minus({month: 2}).endOf('month')
		});
		// Category 1 is not present
		await expect(page.locator(`div[data-tn="category-detail-${categoryId_1}"]`)).not.toBeVisible();
		// Category 2 is not present
		await expect(page.locator(`div[data-tn="category-detail-${categoryId_2}"]`)).not.toBeVisible();
		// Category 3 is not present
		await expect(page.locator(`div[data-tn="category-detail-${categoryId_3}"]`)).not.toBeVisible();
		const emptyStateContainer = page.locator(
			'div[data-tn="empty-state-no-expenses"]',
		);
		await expect(emptyStateContainer).toBeVisible();
	});
});
