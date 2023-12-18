import { expect, Page, test } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';
import { DateTime } from 'luxon';
import { signInUser, signUpUser } from '../../../helpers/auth.helper';
import firebaseService from '../../../services/firebase.service';
import { waitForRequest } from '../../../helpers/generic.helper';
import { NAV_MENU, navigateMenu } from '../../../helpers/nav-menu.helper';
import {
	setCreditCardFilters
} from '../../../helpers/credit-card.helper';
import GraphqlService from '../../../services/graphql.service';

let email: string;
let password: string;
let name: string;

let graphqlService: GraphqlService;

let creditCardId1: string;
let creditCardId2: string;
let creditCardId3: string;

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
	const {authToken} = await signInUser(page, { email, password });
	graphqlService = new GraphqlService(authToken);
	// Wait until the save of the profile is completed
	await page.waitForTimeout(5000);

	const userCurrencies: any[] = await graphqlService.getUserCurrencies();

	const creditCard1 = await graphqlService.createCreditCard({
		label: 'Platinum',
		expiration: DateTime.now().plus({month: 8}).toFormat('MMyy'),
		issuer: 'visa',
		status: 'ACTIVE',
		creditLimitAmount: 5000,
		creditLimitCurrencyId: userCurrencies[0].id
	});
	creditCardId1 = creditCard1.id;

	const creditCard2 = await graphqlService.createCreditCard({
		label: 'Gold',
		expiration: DateTime.now().plus({month: 8}).toFormat('MMyy'),
		issuer: 'mastercard',
		status: 'BLOCKED',
		creditLimitAmount: 5000,
		creditLimitCurrencyId: userCurrencies[0].id
	});

	creditCardId2 = creditCard2.id;

	const creditCard3 = await graphqlService.createCreditCard({
		label: 'Black',
		expiration: DateTime.now().minus({month: 8}).toFormat('MMyy'),
		issuer: 'mastercard',
		status: 'EXPIRED',
		creditLimitAmount: 3000,
		creditLimitCurrencyId: userCurrencies[0].id
	});
	creditCardId3 = creditCard3.id;
	const waitForCreditCards = waitForRequest(page, 'userCreditCards');
	await navigateMenu(page, NAV_MENU.CREDIT_CARDS);
	await waitForCreditCards;
});

test.afterAll(async () => {
	if(graphqlService) {
		await graphqlService.deleteCreditCard(creditCardId1);
		await graphqlService.deleteCreditCard(creditCardId2);
		await graphqlService.deleteCreditCard(creditCardId3);
	}
	try {
		const user = await  firebaseService.auth().getUserByEmail(email);
		await firebaseService.auth().deleteUser(user.uid);
	} catch {
		console.log('No user to be deleted');
	} finally {
		await page.close();
	}
});

test('Default status - Only active', async () => {
	await expect(page.locator(`div[data-tn="credit-card-${creditCardId1}"]`)).toBeVisible();
	await expect(page.locator(`div[data-tn="credit-card-${creditCardId2}"]`)).not.toBeVisible();
	await expect(page.locator(`div[data-tn="credit-card-${creditCardId3}"]`)).not.toBeVisible();
});

test('Only blocked', async () => {
	await setCreditCardFilters(page, {
		statuses: ['BLOCKED']
	});
	await expect(page.locator(`div[data-tn="credit-card-${creditCardId1}"]`)).not.toBeVisible();
	await expect(page.locator(`div[data-tn="credit-card-${creditCardId2}"]`)).toBeVisible();
	await expect(page.locator(`div[data-tn="credit-card-${creditCardId3}"]`)).not.toBeVisible();
});

test('Only expired', async () => {
	await setCreditCardFilters(page, {
		statuses: ['EXPIRED']
	});
	await expect(page.locator(`div[data-tn="credit-card-${creditCardId1}"]`)).not.toBeVisible();
	await expect(page.locator(`div[data-tn="credit-card-${creditCardId2}"]`)).not.toBeVisible();
	await expect(page.locator(`div[data-tn="credit-card-${creditCardId3}"]`)).toBeVisible();
});

test('All statuses', async () => {
	await setCreditCardFilters(page, {
		statuses: ['ACTIVE', 'BLOCKED', 'EXPIRED']
	});
	await expect(page.locator(`div[data-tn="credit-card-${creditCardId1}"]`)).toBeVisible();
	await expect(page.locator(`div[data-tn="credit-card-${creditCardId2}"]`)).toBeVisible();
	await expect(page.locator(`div[data-tn="credit-card-${creditCardId3}"]`)).toBeVisible();
});
