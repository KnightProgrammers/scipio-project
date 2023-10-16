import { expect, Page, test } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';
import { DateTime } from 'luxon';
import { DEFAULT_USER_CURRENCIES, signInUser, signUpUser } from '../../../helpers/auth.helper';
import firebaseService from '../../../services/firebase.service';
import { waitForRequest } from '../../../helpers/generic.helper';
import { NAV_MENU, navigateMenu } from '../../../helpers/nav-menu.helper';
import {
	createCreditCard,
	deleteCreditCard,
	editCreditCard,
	openEditCreditCardForm
} from '../../../helpers/credit-card.helper';

let email: string;
let password: string;
let name: string;

let creditCardId: string;

test.describe.configure({ mode: 'serial' });

let page: Page;

test.beforeAll(async ({ browser }) => {
	email = `test-${uuidv4()}@automation.com`;
	password = `password-${uuidv4()}`;
	name = 'Automation User';
	page = await browser.newPage();
	await page.goto('/');
	await page.waitForLoadState('load');
	console.log(`Creating account for user with email: "${email}"`);
	await signUpUser(page, { email, password, name });
	await signInUser(page, { email, password });
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

test('Empty state', async () => {
	const waitForCreditCards = waitForRequest(page, 'userCreditCards');
	const waitForUserCurrencies = waitForRequest(page, 'userCurrencies');
	await navigateMenu(page, NAV_MENU.CREDIT_CARDS);
	const creditCardsRequest = await waitForCreditCards;
	await waitForUserCurrencies;
	const creditCardsResponse = await creditCardsRequest.response();
	const {data} = await creditCardsResponse.json();
	expect(data.me.creditCards).toEqual([]);

	const emptyStateContainer = page.locator('div[data-tn="empty-state-no-credit-cards"]');
	await expect(emptyStateContainer).toBeVisible();
});
test('Add a credit card', async () => {
	const creditCard = await createCreditCard(page, {
		label: 'Visa Black',
		cardHolder: 'Random Guy',
		lastFourDigits: '1312',
		expirationMonth: DateTime.now().plus({year: 2}).toFormat('MMyy'),
		issuer: 'Visa',
		status: 'ACTIVE',
		creditLimit: 12400,
		currency: DEFAULT_USER_CURRENCIES[0]
	});
	creditCardId = creditCard.id;
	const emptyStateContainer = page.locator('div[data-tn="empty-state-no-credit-cards"]');
	await expect(emptyStateContainer).not.toBeVisible();
	await expect(page.locator(`div[data-tn="credit-card-${creditCardId}"]`)).toBeVisible();
});
test('Edit a credit card', async () => {
	await openEditCreditCardForm(page, creditCardId);
	await editCreditCard(page, creditCardId, {
		label: 'Master Infinity',
		cardHolder: 'Random Guy',
		lastFourDigits: '1213',
		expirationMonth: DateTime.now().plus({year: 2}).toFormat('MMyy'),
		issuer: 'Mastercard',
		status: 'ACTIVE',
		creditLimit: 42400,
		currency: DEFAULT_USER_CURRENCIES[1]
	});
	await expect(page.locator(`div[data-tn="credit-card-${creditCardId}"]`)).toBeVisible();
});
test('delete a credit card', async () => {
	await deleteCreditCard(page, creditCardId);
	await expect(page.locator(`div[data-tn="credit-card-${creditCardId}"]`)).not.toBeVisible();
	const emptyStateContainer = page.locator('div[data-tn="empty-state-no-credit-cards"]');
	await expect(emptyStateContainer).toBeVisible();
});
