import { expect, Page } from '@playwright/test';
import { waitForRequest } from './generic.helper';
import { DateTime } from 'luxon';

type CreditCardFilterType = {
	statuses: string[]
}

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
	await page.locator(`div[data-tn="credit-card-${creditCardId}"] li[data-tn="edit-credit-card-btn-${creditCardId}"]`).click();
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
	await page.locator(`div[data-tn="credit-card-${creditCardId}"] li[data-tn="delete-credit-card-btn-${creditCardId}"]`).click();
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

export const openCreditCardDetailView = async (page: Page, creditCardId: string) => {
	const waitForCreditCardRequest = waitForRequest(page, 'userCreditCard');
	await page.locator(`div[data-tn="credit-card-${creditCardId}"] button[data-tn="view-detail-btn"]`).click();
	const creditCardRequest = await waitForCreditCardRequest;
	// Wait for the drawer animation
	await page.waitForTimeout(2000);
	const requestData: any = await creditCardRequest.postDataJSON();
	expect(requestData.variables.id).toBe(creditCardId);
	const response = await creditCardRequest.response();
	const { data: { me: { creditCard } } } = await response.json();
	expect(creditCard.id).toBe(creditCardId);
};

export const createMonthlyStatement = async (page:Page, closeDate: Date): Promise<string> => {
	await page.locator('div[data-tn="credit-card-detail-drawer"] button[data-tn="new-statement-button"]').click();
	await page.locator('div[data-tn="credit-card-detail-drawer"] input[data-tn="close-date-input"]').fill(DateTime.fromJSDate(closeDate).toFormat('dd/MM/yyyy'));
	const waitForCreateCreditCardMonthlyStatement = waitForRequest(page, 'createCreditCardMonthlyStatement');
	const waitForCreditCardRequest = waitForRequest(page, 'userCreditCard');
	await page.locator('div[data-tn="credit-card-detail-drawer"] button[data-tn="save-btn"]').click();
	const newStatementRequest = await waitForCreateCreditCardMonthlyStatement;
	await waitForCreditCardRequest;
	const newStatementResponse = await newStatementRequest.response();
	const {
		data: {
			createCreditCardMonthlyStatement: { id },
		},
	} = await newStatementResponse.json();
	return id;
};

export const payMonthlyStatement = async (page:Page, statementId: string, data: {
	paymentDate: Date
	currencies: {
		currencyCode: string
		type: 'TOTAL'|'PARTIAL'|'MINIMUM'
		amount: number
	}[]
}): Promise<string> => {
	const {
		paymentDate,
		currencies
	} = data;
	await page.locator(`div[data-tn="statement-card-${statementId}"] button[data-tn="pay-statement-button"]`).click();
	await page.locator('div[data-tn="credit-card-detail-drawer"] input[data-tn="payment-date-input"]').fill(DateTime.fromJSDate(paymentDate).toFormat('dd/MM/yyyy'));

	for (const currency of currencies) {
		await page.locator(`div[data-tn="credit-card-detail-drawer"] input[name="amount-${currency.currencyCode.toLowerCase()}"]`).fill(currency.amount.toString());
		await page.locator(`div[data-tn="credit-card-detail-drawer"] #payment-type-${currency.currencyCode.toLowerCase()}  input.select__input`).fill(currency.type);
		await page.keyboard.press('Enter');
	}

	const waitForPayCreditCardMonthlyStatement = waitForRequest(page, 'createCreditCardStatementPayment');
	const waitForCreditCardRequest = waitForRequest(page, 'userCreditCard');
	await page.locator('div[data-tn="credit-card-detail-drawer"] button[data-tn="save-btn"]').click();
	const payStatementRequest = await waitForPayCreditCardMonthlyStatement;
	await waitForCreditCardRequest;
	const payStatementResponse = await payStatementRequest.response();
	const {
		data: {
			createCreditCardStatementPayment: { id },
		},
	} = await payStatementResponse.json();
	return id;
};

export const setCreditCardFilters = async (page: Page, filters: CreditCardFilterType) => {
	await page.locator('button[data-tn="open-saving-filter-btn"]').click();
	if (filters.statuses) {
		for (const savingStatus of ['ACTIVE', 'BLOCKED', 'EXPIRED']) {
			const isSelected: boolean = await page.locator(`div[data-tn="credit-card-status-filter-${savingStatus.toLowerCase()}-opt"] input`).isChecked();
			if (
				(isSelected && !filters.statuses.includes(savingStatus)) ||
				(!isSelected && filters.statuses.includes(savingStatus))
			) {
				await page.locator(`div[data-tn="credit-card-status-filter-${savingStatus.toLowerCase()}-opt"]`).click();
			}
		}
	}
	await page.locator('button[data-tn="apply-credit-card-filter-btn"]').click();
};

export const createCreditCardExpense = async (page: Page, data: {
	billableDate: Date
	description: string
	amount: number
	currencyCode: string
	categoryId: string
}) => {
	const {
		billableDate= new Date(),
		description = '',
		amount,
		currencyCode,
		categoryId,
	} = data;
	await page.locator('button[data-tn="add-expense-btn"]').click();
	await page.locator('input[data-tn="billable-date-input"]').fill(DateTime.fromJSDate(billableDate).toFormat('dd/MM/yyyy'));
	await page.locator('input[name="description"]').fill(description);
	await page.locator('input[name="amount"]').fill(amount.toString());
	await page.locator('#currency-select input.select__input').fill(currencyCode);
	await page.keyboard.press('Enter');
	await page.locator('#category-select input.select__input').fill(categoryId);
	await page.keyboard.press('Enter');
	const saveExpenseWaitForRequest = waitForRequest(page, 'createExpense');
	await page.locator('button[data-tn="modal-form-save-btn"]').click();
	const saveExpenseRequest = await saveExpenseWaitForRequest;
	const saveExpenseResponse = await saveExpenseRequest.response();
	const { data: { createExpense: newExpense } } = await saveExpenseResponse.json();
	expect(newExpense.id).toBeDefined();
	return newExpense.id;
};
export const deleteCreditCardExpense = async (page: Page, expenseId: string) => {
	await page.locator(`div[data-tn="expense-item-${expenseId}"] button[data-tn="dropdown-expense-btn"]`).click();
	await page.locator(`div[data-tn="expense-item-${expenseId}"] li[data-tn="delete-expense-btn"]`).click();
	await expect(page.locator('div[data-tn="confirm-delete-dialog"]')).toBeVisible();
	const deleteExpenseWaitForRequest = waitForRequest(page, 'deleteExpense');
	await page.locator('button[data-tn="confirm-dialog-confirm-btn"]').click();
	await deleteExpenseWaitForRequest;
};
