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
let bankId: string;
let bankAccountId: string;
const categoryName: string = `Category ${uuidv4()}`;

let expenseId: string;

test.beforeAll(async ({ browser }) => {
	email = `test-${uuidv4()}@automation.com`;
	password = `password-${uuidv4()}`;
	name = 'Automation User';
	page = await browser.newPage();
	await page.goto('/');
	await page.waitForLoadState('load');
	await signUpUser(page, { email, password, name });
	const { authToken } = await signInUser(page, { email, password });

	// Wait until the save of the profile is completed
	await page.waitForTimeout(5000);
	graphqlService = new GraphqlService(authToken);
	const userCurrencies = await graphqlService.getUserCurrencies();
	const data1 = await graphqlService.createCategories({
		name: categoryName,
		type: 'WANT',
		isFixedPayment: false,
	});
	categoryId = data1.id;
	const bank = await graphqlService.createBank({
		name: 'Bank #1'
	});
	bankId = bank.id;
	const bankAccount: any = await graphqlService.createBankAccount({
		label: 'Bank Account #1',
		accountNumber: '012346789',
		balance: 2000,
		bankId: bankId,
		currencyId: userCurrencies[0].id,
	});
	bankAccountId = bankAccount.id;
});

test.afterAll(async () => {
	try {
		const user = await firebaseService.auth().getUserByEmail(email);
		await firebaseService.auth().deleteUser(user.uid);
	} catch {
		console.log('No user to be deleted');
	} finally {
		if(graphqlService) {
			await graphqlService.deleteCategory(categoryId);
			await graphqlService.deleteBankAccount(bankAccountId);
			await graphqlService.deleteBank(bankId);
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
		type: 'BANK_ACCOUNT',
		bankAccountId
	});
	expenseId = expense.id;
	const emptyStateContainer = page.locator(
		'div[data-tn="empty-state-no-expenses"]',
	);
	await expect(emptyStateContainer).not.toBeVisible();
	await page.locator(`tr[data-tn="category-row-${categoryId}"] button[data-tn="collapsible-toggle-btn"]`).click();
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
