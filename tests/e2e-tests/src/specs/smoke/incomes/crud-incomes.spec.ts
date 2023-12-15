import { test, Page, expect } from '@playwright/test';
import { DEFAULT_USER_CURRENCIES, signInUser } from '../../../helpers/auth.helper';
import { getDefaultUserData } from '../../../config';

import GraphqlService from '../../../services/graphql.service';
import { NAV_MENU, navigateMenu } from '../../../helpers/nav-menu.helper';
import { v4 as uuidv4 } from 'uuid';
import { createExpense, deleteExpense } from '../../../helpers/expense.helper';
import { waitForRequest } from '../../../helpers/generic.helper';
import { DateTime } from 'luxon';
import { createIncome, deleteIncome } from '../../../helpers/income.helper';

let email: string;
let password: string;

test.describe.configure({ mode: 'serial' });

let page: Page;

let graphqlService: GraphqlService;

let bankId: string;
let bankAccountId: string;
let incomeId: string;

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
	const bank = await graphqlService.createBank({
		name: 'Bank #1'
	});
	bankId = bank.id;
	const bankAccount: any = await graphqlService.createBankAccount({
		label: 'Bank Account #1',
		accountNumber: '012346789',
		balance: 2000,
		bankId: bankId,
		currencyId: userCurrencies[1].id,
	});
	bankAccountId = bankAccount.id;
});

test.afterAll(async () => {
	if(graphqlService) {
		await graphqlService.deleteIncome(incomeId);
		await graphqlService.deleteBankAccount(bankAccountId);
		await graphqlService.deleteBank(bankId);
	}
	await page.close();
});

test('Empty State', async () => {
	const waitForIncomes = waitForRequest(page, 'userIncomes');
	await navigateMenu(page, NAV_MENU.INCOMES);
	await waitForIncomes;
	const income = await createIncome(page, {
		description: 'Income 1',
		amount: 1991.23,
		currencyCode: DEFAULT_USER_CURRENCIES[1],
		bankAccountId
	});
	incomeId = income.id;
	const emptyStateContainer = page.locator(
		'div[data-tn="empty-state-no-incomes"]',
	);
	await expect(emptyStateContainer).not.toBeVisible();
	await expect(page.locator(`tr[data-tn="income-row-${incomeId}"]`)).toBeVisible();
});

test('Delete Income', async () => {
	await deleteIncome(page, incomeId);
	await expect(page.locator(`tr[data-tn="income-row-${incomeId}"]`)).not.toBeVisible();
});
