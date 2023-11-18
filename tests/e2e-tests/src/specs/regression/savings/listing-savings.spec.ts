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
import { createSaving, deleteSaving, setSavingFilters, updateSaving } from '../../../helpers/saving.helper';
import { DateTime } from 'luxon';

let email: string;
let password: string;
let name: string;

test.describe.configure({ mode: 'serial' });

let page: Page;

let graphqlService: GraphqlService;

let bankId: string;

let bankAccountId: string;

let userCurrencies: any[];

let savingActiveId: string;
let savingExpiredId: string;
let savingCompletedId: string;
let savingNotConcludedId: string;

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

	userCurrencies = await graphqlService.getUserCurrencies();

	const bank = await graphqlService.createBank({
		name: 'Bank #1'
	});
	bankId = bank.id;

	const bankAccount = await graphqlService.createBankAccount({
		label: 'Bank Account #1',
		accountNumber: '123456',
		balance: 2000,
		bankId: bankId,
		currencyId: userCurrencies.find(c => c.code === DEFAULT_USER_CURRENCIES[0]).id
	});
	bankAccountId = bankAccount.id;

	const saving1 = await graphqlService.createSaving({
		name: 'Saving Active',
		targetAmount: 5000,
		targetDate: DateTime.now().plus({day: 10}).toISO(),
		bankAccountId
	});
	savingActiveId = saving1.id;

	const saving2 = await graphqlService.createSaving({
		name: 'Saving Expired',
		targetAmount: 5000,
		targetDate: DateTime.now().minus({day: 2}).toISO(),
		bankAccountId
	});
	savingExpiredId = saving2.id;

	const saving3 = await graphqlService.createSaving({
		name: 'Saving Completed',
		targetAmount: 5000,
		targetDate: DateTime.now().plus({day: 10}).toISO(),
		bankAccountId
	});

	await graphqlService.updateSaving(saving3.id, {
		name: saving3.name,
		targetDate: saving3.targetDate,
		targetAmount: saving3.targetAmount,
		bankAccountId: saving3.bankAccountId,
		status: 'COMPLETED'
	});

	savingCompletedId = saving3.id;

	const saving4 = await graphqlService.createSaving({
		name: 'Saving No-Concluded',
		targetAmount: 5000,
		targetDate: DateTime.now().plus({day: 10}).toISO(),
		bankAccountId
	});

	await graphqlService.updateSaving(saving4.id, {
		name: saving4.name,
		targetDate: saving4.targetDate,
		targetAmount: saving4.targetAmount,
		bankAccountId: saving4.bankAccountId,
		status: 'NOT_CONCLUDED'
	});

	savingNotConcludedId = saving4.id;

	const waitForSavings = waitForRequest(page, 'userSavings');
	await navigateMenu(page, NAV_MENU.SAVINGS);
	await waitForSavings;
});

test.afterAll(async () => {
	try {
		const user = await firebaseService.auth().getUserByEmail(email);
		await firebaseService.auth().deleteUser(user.uid);
		console.log(`Deleted User "${email}"`);
	} catch {
		console.log('No user to be deleted');
	} finally {
		await graphqlService.deleteBankAccount(bankAccountId);
		await graphqlService.deleteBank(bankId);
		await page.close();
	}
});

test.describe('filters', () => {
	test('Filter by status - Default', async () => {
		await expect(
			page.locator(`div.card[data-tn="saving-card-${savingActiveId}"]`),
		).toBeVisible();
		await expect(
			page.locator(`div.card[data-tn="saving-card-${savingExpiredId}"]`),
		).toBeVisible();
		await expect(
			page.locator(`div.card[data-tn="saving-card-${savingCompletedId}"]`),
		).not.toBeVisible();
		await expect(
			page.locator(`div.card[data-tn="saving-card-${savingNotConcludedId}"]`),
		).not.toBeVisible();
	});
	test('Filter by status - Only completed', async () => {
		await setSavingFilters(page, {
			statuses: ['COMPLETED']
		});
		await expect(
			page.locator(`div.card[data-tn="saving-card-${savingActiveId}"]`),
		).not.toBeVisible();
		await expect(
			page.locator(`div.card[data-tn="saving-card-${savingExpiredId}"]`),
		).not.toBeVisible();
		await expect(
			page.locator(`div.card[data-tn="saving-card-${savingCompletedId}"]`),
		).toBeVisible();
		await expect(
			page.locator(`div.card[data-tn="saving-card-${savingNotConcludedId}"]`),
		).not.toBeVisible();
	});
	test('Filter by status - Only no concluded', async () => {
		await setSavingFilters(page, {
			statuses: ['NOT_CONCLUDED']
		});
		await expect(
			page.locator(`div.card[data-tn="saving-card-${savingActiveId}"]`),
		).not.toBeVisible();
		await expect(
			page.locator(`div.card[data-tn="saving-card-${savingExpiredId}"]`),
		).not.toBeVisible();
		await expect(
			page.locator(`div.card[data-tn="saving-card-${savingCompletedId}"]`),
		).not.toBeVisible();
		await expect(
			page.locator(`div.card[data-tn="saving-card-${savingNotConcludedId}"]`),
		).toBeVisible();
	});
	test('Filter by status - All', async () => {
		await setSavingFilters(page, {
			statuses: ['IN_PROGRESS', 'NOT_CONCLUDED', 'COMPLETED']
		});
		await expect(
			page.locator(`div.card[data-tn="saving-card-${savingActiveId}"]`),
		).toBeVisible();
		await expect(
			page.locator(`div.card[data-tn="saving-card-${savingExpiredId}"]`),
		).toBeVisible();
		await expect(
			page.locator(`div.card[data-tn="saving-card-${savingCompletedId}"]`),
		).toBeVisible();
		await expect(
			page.locator(`div.card[data-tn="saving-card-${savingNotConcludedId}"]`),
		).toBeVisible();
	});
});

test.describe('search', () => {
	test.beforeAll(async () => {
		await setSavingFilters(page, {
			statuses: ['IN_PROGRESS', 'NOT_CONCLUDED', 'COMPLETED']
		});
	});
	test('Search - All status - One coincidence', async () => {
		await page.locator('input[data-tn="search-saving-by-name"]').fill('Saving Expired');
		await expect(
			page.locator(`div.card[data-tn="saving-card-${savingActiveId}"]`),
		).not.toBeVisible();
		await expect(
			page.locator(`div.card[data-tn="saving-card-${savingExpiredId}"]`),
		).toBeVisible();
		await expect(
			page.locator(`div.card[data-tn="saving-card-${savingCompletedId}"]`),
		).not.toBeVisible();
		await expect(
			page.locator(`div.card[data-tn="saving-card-${savingNotConcludedId}"]`),
		).not.toBeVisible();
	});
	test('Search - All status - No coincidences ', async () => {
		await page.locator('input[data-tn="search-saving-by-name"]').fill('Search without results');
		const emptyStateContainer = page.locator(
			'div[data-tn="empty-state-no-savings"]',
		);
		await expect(emptyStateContainer).toBeVisible();
	});
	test('Search - All status - Reset search', async () => {
		await page.locator('input[data-tn="search-saving-by-name"]').fill('');
		await expect(
			page.locator(`div.card[data-tn="saving-card-${savingActiveId}"]`),
		).toBeVisible();
		await expect(
			page.locator(`div.card[data-tn="saving-card-${savingExpiredId}"]`),
		).toBeVisible();
		await expect(
			page.locator(`div.card[data-tn="saving-card-${savingCompletedId}"]`),
		).toBeVisible();
		await expect(
			page.locator(`div.card[data-tn="saving-card-${savingNotConcludedId}"]`),
		).toBeVisible();
	});
});
