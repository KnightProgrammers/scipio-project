import { expect, Page } from '@playwright/test';
import { waitForRequest } from './generic.helper';

export const createCreditCard = async (page: Page, data: {
	label: string
	cardHolder: string
	lastFourDigits: string
	expirationMonth: string
	issuer: string
	status: string
	creditLimit: number
	currency: string
})=>  {
	const {
		label,
		cardHolder,
		lastFourDigits,
		expirationMonth,
		issuer,
		status,
		creditLimit,
		currency
	} = data;
	await page.locator('*[data-tn="add-credit-card-btn"]').click();
	const creditCardFormContainer = page.locator('div[role="dialog"]');
	await expect(creditCardFormContainer).toBeVisible();
	await page.locator('input[name="label"]').fill(label);
	await page.locator('input[name="cardHolder"]').fill(cardHolder);
	await page.locator('input[name="lastFourDigits"]').fill(lastFourDigits);
	await page.locator('input[name="expiration"]').fill(expirationMonth);
	await page.locator('#issuer-select input.select__input').fill(issuer);
	await page.keyboard.press('Enter');
	await page.locator('#status-select input.select__input').fill(status);
	await page.keyboard.press('Enter');
	await page.locator('input[name="creditLimitAmount"]').fill(creditLimit.toString());
	await page.locator('#currency-select input.select__input').fill(currency);
	await page.keyboard.press('Enter');

	const saveCreditCardWaitForRequest = waitForRequest(page, 'createCreditCard');
	const getCreditCardListWaitForRequest = waitForRequest(page, 'userCreditCards');

	await page.locator('button[data-tn="modal-form-save-btn"]').click();
	const saveCreditCardRequest = await saveCreditCardWaitForRequest;
	const getCreditCardListRequest = await getCreditCardListWaitForRequest;
	const saveCreditCardResponse = await saveCreditCardRequest.response();
	const { data: { createCreditCard: newCreditCard } } = await saveCreditCardResponse.json();
	const getBankListResponse = await getCreditCardListRequest.response();
	const { data: { me: { creditCards } } } = await getBankListResponse.json();
	expect(newCreditCard.id).toBeDefined();
	expect(Array.isArray(creditCards)).toBeTruthy();
	const foundNewCreditCard = creditCards.find(b => b.id === newCreditCard.id);
	expect(foundNewCreditCard).toBeTruthy();
	expect(foundNewCreditCard.label).toEqual(label);
	expect(foundNewCreditCard.lastFourDigits).toEqual(lastFourDigits);
	expect(foundNewCreditCard.expiration).toEqual(
		`${expirationMonth.substring(0, 2)}/${expirationMonth.substring(2,4)}`
	);
	expect(foundNewCreditCard.issuer).toEqual(issuer.toLowerCase());
	expect(foundNewCreditCard.status).toEqual(status.toUpperCase());
	expect(foundNewCreditCard.creditLimitAmount).toEqual(creditLimit);
	expect(foundNewCreditCard.creditLimitCurrency.code).toEqual(currency);
	await expect(creditCardFormContainer).not.toBeVisible();
	return newCreditCard;
};

export const openEditCreditCardForm = async (page: Page, creditCardId: string) => {
	await page.locator(`div[data-tn="credit-card-${creditCardId}"] button[data-tn="dropdown-credit-card-btn"]`).click();
	await page.locator(`button[data-tn="edit-credit-card-btn-${creditCardId}"]`).click();
	const bankFormContainer = page.locator('div[role="dialog"]');
	await expect(bankFormContainer).toBeVisible();
};

export const editCreditCard = async (page: Page, creditCardId: string, data: {
	label: string
	cardHolder: string
	lastFourDigits: string
	expirationMonth: string
	issuer: string
	status: string
	creditLimit: number
	currency: string
}) => {
	const {
		label,
		cardHolder,
		lastFourDigits,
		expirationMonth,
		issuer,
		status,
		creditLimit,
		currency
	} = data;
	await page.locator('input[name="label"]').clear();
	await page.locator('input[name="label"]').fill(label);
	await page.locator('input[name="cardHolder"]').clear();
	await page.locator('input[name="cardHolder"]').fill(cardHolder);
	await page.locator('input[name="lastFourDigits"]').clear();
	await page.locator('input[name="lastFourDigits"]').fill(lastFourDigits);
	await page.locator('input[name="expiration"]').clear();
	await page.locator('input[name="expiration"]').fill(expirationMonth);
	await page.locator('#issuer-select input.select__input').fill(issuer);
	await page.keyboard.press('Enter');
	await page.locator('#status-select input.select__input').fill(status);
	await page.keyboard.press('Enter');
	await page.locator('input[name="creditLimitAmount"]').clear();
	await page.locator('input[name="creditLimitAmount"]').fill(creditLimit.toString());
	await page.locator('#currency-select input.select__input').fill(currency);
	await page.keyboard.press('Enter');
	const saveCreditCardWaitForRequest = waitForRequest(page, 'updateCreditCard');
	const getCreditCardListWaitForRequest = waitForRequest(page, 'userCreditCards');
	await page.locator('button[data-tn="modal-form-save-btn"]').click();
	const saveCreditCardRequest = await saveCreditCardWaitForRequest;
	const getCreditCardListRequest = await getCreditCardListWaitForRequest;
	const saveCreditCardResponse = await saveCreditCardRequest.response();
	const { data: { updateCreditCard: updated } } = await saveCreditCardResponse.json();
	const getCreditCardListResponse = await getCreditCardListRequest.response();
	const { data: { me: { creditCards } } } = await getCreditCardListResponse.json();
	expect(updated.id).toEqual(creditCardId);
	expect(Array.isArray(creditCards)).toBeTruthy();
	const foundNewCreditCard = creditCards.find(c => c.id === creditCardId);
	expect(foundNewCreditCard).toBeTruthy();
	expect(foundNewCreditCard.label).toEqual(label);
	expect(foundNewCreditCard.lastFourDigits).toEqual(lastFourDigits);
	expect(foundNewCreditCard.expiration).toEqual(
		`${expirationMonth.substring(0, 2)}/${expirationMonth.substring(2,4)}`
	);
	expect(foundNewCreditCard.issuer).toEqual(issuer.toLowerCase());
	expect(foundNewCreditCard.status).toEqual(status.toUpperCase());
	expect(foundNewCreditCard.creditLimitAmount).toEqual(creditLimit);
	expect(foundNewCreditCard.creditLimitCurrency.code).toEqual(currency);
	const bankFormContainer = page.locator('div[role="dialog"]');
	await expect(bankFormContainer).not.toBeVisible();
	return updated;
};

export const deleteCreditCard = async (page: Page, creditCardId: string) => {
	await openDeleteCreditCardDialog(page, creditCardId);
	await confirmDeleteCreditCard(page, creditCardId);
};

export const openDeleteCreditCardDialog = async (page: Page, creditCardId: string) => {
	await page.locator(`div[data-tn="credit-card-${creditCardId}"] button[data-tn="dropdown-credit-card-btn"]`).click();
	await page.locator(`button[data-tn="delete-credit-card-btn-${creditCardId}"]`).click();
};

export const confirmDeleteCreditCard = async (page: Page, creditCardId: string) => {
	const deleteCreditCardWaitForRequest = waitForRequest(page, 'deleteCreditCard');
	const getCreditCardListWaitForRequest = waitForRequest(page, 'userCreditCards');
	await page.locator('button[data-tn="confirm-dialog-confirm-btn"]').click();
	await deleteCreditCardWaitForRequest;
	const getCreditCardListRequest = await getCreditCardListWaitForRequest;
	const getCreditCardListResponse = await getCreditCardListRequest.response();
	const { data: { me: { creditCards } } } = await getCreditCardListResponse.json();
	expect(Array.isArray(creditCards)).toBeTruthy();
	const foundNewCreditCard = creditCards.find(c => c.id === creditCardId);
	expect(foundNewCreditCard).toBeFalsy();

	await expect(page.locator('div[data-tn="confirm-delete-dialog"]')).not.toBeVisible();
};
