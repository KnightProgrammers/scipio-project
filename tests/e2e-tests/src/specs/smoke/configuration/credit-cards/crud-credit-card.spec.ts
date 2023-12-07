import { test, Page, expect } from '@playwright/test';
import { DateTime } from 'luxon';
import { DEFAULT_USER_CURRENCIES, signInUser } from '../../../../helpers/auth.helper';
import { getDefaultUserData } from '../../../../config';
import {
	createCreditCard,
	deleteCreditCard,
	editCreditCard,
	openEditCreditCardForm
} from '../../../../helpers/credit-card.helper';
import { waitForRequest } from '../../../../helpers/generic.helper';
import { NAV_MENU, navigateMenu } from '../../../../helpers/nav-menu.helper';


let email: string;
let password: string;

let creditCardId: string;

test.describe.configure({ mode: 'serial' });

let page: Page;

test.beforeAll(async ({ browser }) => {
	const defaultUserData = getDefaultUserData();
	email = defaultUserData.email;
	password = defaultUserData.password;
	page = await browser.newPage();
	await page.goto('/');
	await page.waitForLoadState('load');
	await signInUser(page, {email, password}, false);
});

test.afterAll(async () => {
	await page.close();
});

test('Load credit card page', async () => {
	const waitForCreditCards = waitForRequest(page, 'userCreditCards');
	await navigateMenu(page, NAV_MENU.CREDIT_CARDS);
	await waitForCreditCards;
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
});
