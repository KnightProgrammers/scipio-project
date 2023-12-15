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
import { applyIncomeFilter } from '../../../helpers/income.helper';
import { DateTime } from 'luxon';

let email: string;
let password: string;
let name: string;

test.describe.configure({ mode: 'serial' });

let page: Page;

let graphqlService: GraphqlService;

let bankId: string;
let bankAccountId1: string;
let bankAccountId2: string;

let incomeId1: string;
let incomeId2: string;
let incomeId3: string;

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
	const bank = await graphqlService.createBank({
		name: 'Bank #1'
	});
	bankId = bank.id;
	const bankAccount1: any = await graphqlService.createBankAccount({
		label: 'Bank Account #1',
		accountNumber: '012346789',
		balance: 2000,
		bankId: bank.id,
		currencyId: userCurrencies[0].id,
	});
	bankAccountId1 = bankAccount1.id;
	const bankAccount2: any = await graphqlService.createBankAccount({
		label: 'Bank Account #2',
		accountNumber: '012346789',
		balance: 2000,
		bankId: bank.id,
		currencyId: userCurrencies[1].id,
	});
	bankAccountId2 = bankAccount2.id;

	// Create Incomes
	const income1 = await graphqlService.createIncome({
		amount: 4000,
		incomeDate: DateTime.now().toISO(),
		description: 'Salary',
		bankAccountId: bankAccount1.id
	});
	incomeId1 = income1.id;
	const income2 = await graphqlService.createIncome({
		amount: 10000,
		incomeDate: DateTime.now().startOf('year').toISO(),
		description: 'Bonus',
		bankAccountId: bankAccount2.id
	});
	incomeId2 = income2.id;
	const income3 = await graphqlService.createIncome({
		amount: 4000,
		incomeDate: DateTime.now().minus({year: 1}).toISO(),
		description: 'Salary',
		bankAccountId: bankAccount1.id
	});
	incomeId3 = income3.id;
});

test.afterAll(async () => {
	try {
		const user = await firebaseService.auth().getUserByEmail(email);
		await firebaseService.auth().deleteUser(user.uid);
	} catch {
		console.log('No user to be deleted');
	} finally {
		if(graphqlService) {
			await graphqlService.deleteIncome(incomeId1);
			await graphqlService.deleteIncome(incomeId2);
			await graphqlService.deleteIncome(incomeId3);
			await graphqlService.deleteBankAccount(bankAccountId1);
			await graphqlService.deleteBankAccount(bankAccountId2);
			await graphqlService.deleteBank(bankId);
		}
		await page.close();
	}
});

test('Filters by Default', async () => {
	const waitForIncomes = waitForRequest(page, 'userIncomes');
	await navigateMenu(page, NAV_MENU.INCOMES);
	await waitForIncomes;
	await expect(page.locator(`tr[data-tn="income-row-${incomeId1}"]`)).toBeVisible();
	await expect(page.locator(`tr[data-tn="income-row-${incomeId2}"]`)).toBeVisible();
	await expect(page.locator(`tr[data-tn="income-row-${incomeId3}"]`)).not.toBeVisible();
});

test('Filters by Year', async () => {
	await applyIncomeFilter(page, {
		fromDate: DateTime.now().minus({year: 1}).startOf('year'),
		toDate: DateTime.now().minus({year: 1}).endOf('year')
	});
	await expect(page.locator(`tr[data-tn="income-row-${incomeId1}"]`)).not.toBeVisible();
	await expect(page.locator(`tr[data-tn="income-row-${incomeId2}"]`)).not.toBeVisible();
	await expect(page.locator(`tr[data-tn="income-row-${incomeId3}"]`)).toBeVisible();
});

test('Filters by Currency', async () => {
	await applyIncomeFilter(page, {
		fromDate: DateTime.now().minus({year: 1}).startOf('year'),
		toDate: DateTime.now().endOf('year'),
		currency: [DEFAULT_USER_CURRENCIES[0]]
	});
	await expect(page.locator(`tr[data-tn="income-row-${incomeId1}"]`)).toBeVisible();
	await expect(page.locator(`tr[data-tn="income-row-${incomeId2}"]`)).not.toBeVisible();
	await expect(page.locator(`tr[data-tn="income-row-${incomeId3}"]`)).toBeVisible();
	await applyIncomeFilter(page, {
		currency: [DEFAULT_USER_CURRENCIES[1]]
	});
	await expect(page.locator(`tr[data-tn="income-row-${incomeId1}"]`)).not.toBeVisible();
	await expect(page.locator(`tr[data-tn="income-row-${incomeId2}"]`)).toBeVisible();
	await expect(page.locator(`tr[data-tn="income-row-${incomeId3}"]`)).not.toBeVisible();
});
