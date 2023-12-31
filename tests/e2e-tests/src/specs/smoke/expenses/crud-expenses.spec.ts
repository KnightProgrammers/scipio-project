import { test, Page, expect } from '@playwright/test';
import { DEFAULT_USER_CURRENCIES, signInUser } from '../../../helpers/auth.helper';
import { getDefaultUserData } from '../../../config';

import GraphqlService from '../../../services/graphql.service';
import { NAV_MENU, navigateMenu } from '../../../helpers/nav-menu.helper';
import { v4 as uuidv4 } from 'uuid';
import { createExpense, deleteExpense } from '../../../helpers/expense.helper';
import { waitForRequest } from '../../../helpers/generic.helper';
import { DateTime } from 'luxon';

let email: string;
let password: string;

test.describe.configure({ mode: 'serial' });

let page: Page;

let graphqlService: GraphqlService;

let expenseId: string;
let categoryId: string;
let creditCardId: string;
let bankId: string;
let bankAccountId: string;
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

	const userCurrencies: any[] = await graphqlService.getUserCurrencies();

	const data1: any = await graphqlService.createCategories({
		name: categoryName,
		type: 'WANT',
		isFixedPayment: false,
	});
	categoryId = data1.id;
	const creditCard: any = await graphqlService.createCreditCard({
		label: 'Platinum',
		expiration: DateTime.now().plus({month: 8}).toFormat('MMyy'),
		issuer: 'visa',
		status: 'ACTIVE',
		creditLimitAmount: 5000,
		creditLimitCurrencyId: userCurrencies[0].id
	});
	creditCardId = creditCard.id;
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
	if(graphqlService) {
		await graphqlService.deleteCategory(categoryId);
		await graphqlService.deleteCreditCard(creditCardId);
		await graphqlService.deleteBankAccount(bankAccountId);
		await graphqlService.deleteBank(bankId);
	}
	await page.close();
});

test('Create Expense Cash', async () => {
	const waitForExpenses = waitForRequest(page, 'userExpensesByCategory');
	await navigateMenu(page, NAV_MENU.EXPENSES);
	await waitForExpenses;
	const expense = await createExpense(page, {
		description: 'Expense 1',
		amount: 34.21,
		currencyCode: DEFAULT_USER_CURRENCIES[0],
		categoryName: categoryName,
		type: 'CASH'
	});
	expenseId = expense.id;
	await page.locator(`tr[data-tn="category-row-${categoryId}"] button[data-tn="collapsible-toggle-btn"]`).click();
	await expect(
		page.locator(`li[data-tn="expense-container-${expenseId}"]`),
	).toBeVisible();
});

test('Delete Expense Cash', async () => {
	await deleteExpense(page, expenseId, categoryName);
	await expect(
		page.locator(`li[data-tn="expense-container-${expenseId}"]`),
	).not.toBeVisible();
});

test('Create Expense Credit Card', async () => {
	const expense = await createExpense(page, {
		description: 'Expense 1',
		amount: 34.21,
		currencyCode: DEFAULT_USER_CURRENCIES[0],
		categoryName: categoryName,
		type: 'CREDIT_CARD',
		creditCardId
	});
	expenseId = expense.id;
	await expect(
		page.locator(`li[data-tn="expense-container-${expenseId}"]`),
	).toBeVisible();
});

test('Delete Expense Credit Card', async () => {
	await deleteExpense(page, expenseId, categoryName);
	await expect(
		page.locator(`li[data-tn="expense-container-${expenseId}"]`),
	).not.toBeVisible();
});

test('Create Bank Account Expense', async () => {
	const expense = await createExpense(page, {
		description: 'Expense 1',
		amount: 34.21,
		categoryName: categoryName,
		currencyCode: DEFAULT_USER_CURRENCIES[0],
		type: 'BANK_ACCOUNT',
		bankAccountId
	});
	expenseId = expense.id;
	await expect(
		page.locator(`li[data-tn="expense-container-${expenseId}"]`),
	).toBeVisible();
});

test('Delete Bank Account Expense', async () => {
	await deleteExpense(page, expenseId, categoryName);
	await expect(
		page.locator(`li[data-tn="expense-container-${expenseId}"]`),
	).not.toBeVisible();
});
