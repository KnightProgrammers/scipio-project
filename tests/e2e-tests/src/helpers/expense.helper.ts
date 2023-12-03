import { expect, Page } from '@playwright/test';
import { waitForRequest } from './generic.helper';
import { DateTime } from 'luxon';
import { DEFAULT_USER_CURRENCIES } from './auth.helper';

type ExpenseFilterType = {
	fromDate?: DateTime
	toDate?: DateTime
	expenseType?: string[]
	currency?: string[],
	paymentMethod?: string[]
}

export const createExpense = async (page: Page, data: {
	type: 'CASH' | 'CREDIT_CARD'
	billableDate?: Date
	description?: string
	amount: number,
	currencyCode: string
	categoryName: string
	creditCardId?: string
})=>  {
	const {
		type = 'CASH',
		billableDate= new Date(),
		description = '',
		amount,
		currencyCode,
		categoryName,
		creditCardId
	} = data;
	await page.locator('button[data-tn="add-expense-btn"]').click();
	const expenseFormContainer = page.locator('div[role="dialog"]');
	await expect(expenseFormContainer).toBeVisible();
	await page.locator(`div[data-tn="payment-method-selector-${type.toLowerCase()}-opt"]`).click();
	await page.locator('input[data-tn="billable-date-input"]').fill(DateTime.fromJSDate(billableDate).toFormat('dd/MM/yyyy'));
	await page.locator('input[name="description"]').fill(description);
	await page.locator('input[name="amount"]').fill(amount.toString());
	await page.locator('#currency-select input.select__input').fill(currencyCode);
	await page.keyboard.press('Enter');
	await page.locator('#category-select input.select__input').fill(categoryName);
	await page.keyboard.press('Enter');
	if (creditCardId) {
		await page.locator('#credit-card-select input.select__input').fill(creditCardId);
		await page.keyboard.press('Enter');
	}
	const saveExpenseWaitForRequest = waitForRequest(page, 'createExpense');
	const getExpenseListWaitForRequest = waitForRequest(page, 'userExpensesByCategory');
	await page.locator('button[data-tn="modal-form-save-btn"]').click();
	const saveExpenseRequest = await saveExpenseWaitForRequest;
	const getExpenseListRequest = await getExpenseListWaitForRequest;
	const saveExpenseResponse = await saveExpenseRequest.response();
	const { data: { createExpense: newExpense } } = await saveExpenseResponse.json();
	const getExpenseListResponse = await getExpenseListRequest.response();
	const { data: { me: { categories } } } = await getExpenseListResponse.json();
	expect(newExpense.id).toBeDefined();
	expect(Array.isArray(categories)).toBeTruthy();
	const foundCategory = categories.find(c => c.name === categoryName);
	expect(foundCategory).toBeTruthy();
	const foundExpense = foundCategory.expenses.find(e => e.id === newExpense.id);
	expect(foundExpense).toBeTruthy();
	expect(foundExpense.billableDate).toEqual(DateTime.fromJSDate(billableDate).set({hour: 0, minute: 0, second: 0, millisecond: 0}).toISO());
	expect(foundExpense.description).toEqual(description);
	expect(foundExpense.amount).toEqual(amount);
	expect(foundExpense.currency.code).toEqual(currencyCode);
	await expect(expenseFormContainer).not.toBeVisible();
	return newExpense;
};
export const deleteExpense = async (page: Page, expenseId: string, categoryName: string) => {
	await openDeleteExpenseDialog(page, expenseId);
	await confirmDeleteExpense(page, expenseId, categoryName);
};

export const openDeleteExpenseDialog = async (page: Page, expenseId: string) => {
	await page.locator(`li[data-tn="expense-container-${expenseId}"] button[data-tn="dropdown-expense-btn"]`).click();
	await page.locator(`li[data-tn="expense-container-${expenseId}"] li[data-tn="delete-expense-btn"]`).click();
	await expect(page.locator('div[data-tn="confirm-delete-dialog"]')).toBeVisible();
};

export const confirmDeleteExpense = async (page: Page, expenseId: string, categoryName: string) => {
	const deleteExpenseWaitForRequest = waitForRequest(page, 'deleteExpense');
	const getExpenseListWaitForRequest = waitForRequest(page, 'userExpensesByCategory');
	await page.locator('button[data-tn="confirm-dialog-confirm-btn"]').click();
	await deleteExpenseWaitForRequest;
	const getExpenseListRequest = await getExpenseListWaitForRequest;
	const getExpenseListResponse = await getExpenseListRequest.response();
	const { data: { me: { categories } } } = await getExpenseListResponse.json();
	expect(Array.isArray(categories)).toBeTruthy();
	const foundCategory = categories.find(c => c.name === categoryName);
	expect(foundCategory).toBeTruthy();
	const foundExpense = foundCategory.expenses.find(e => e.id === expenseId);
	expect(foundExpense).toBeFalsy();

	await expect(page.locator('div[data-tn="confirm-delete-dialog"]')).not.toBeVisible();
};


export const applyExpenseFilter = async (page: Page, filters: ExpenseFilterType) => {
	await page.locator('button[data-tn="open-expense-filter-btn"]').click();
	if (filters.fromDate) {
		await page.locator('input[data-tn="filter-from-date-input"]').clear();
		await page.locator('input[data-tn="filter-from-date-input"]').fill(filters.fromDate.toFormat('MM/dd/yyyy'));
		await page.keyboard.press('Enter');
		await page.waitForTimeout(3000);
	}
	if (filters.toDate) {
		await page.locator('input[data-tn="filter-to-date-input"]').clear();
		await page.locator('input[data-tn="filter-to-date-input"]').fill(filters.toDate.toFormat('MM/dd/yyyy'));
		await page.keyboard.press('Enter');
		await page.waitForTimeout(3000);
	}
	if (filters.expenseType) {
		for (const expTp of ['FIXED_EXPENSE', 'VARIABLE_EXPENSE']) {
			const isSelected: boolean = await page.locator(`div[data-tn="expense-type-filter-${expTp.toLowerCase()}-opt"] input`).isChecked();
			if (
				(isSelected && !filters.expenseType.includes(expTp)) ||
				(!isSelected && filters.expenseType.includes(expTp))
			) {
				await page.locator(`div[data-tn="expense-type-filter-${expTp.toLowerCase()}-opt"]`).click();
			}
		}
	}
	if (filters.currency) {
		for (const currency of DEFAULT_USER_CURRENCIES) {
			const isSelected: boolean = await page.locator(`div[data-tn="expense-currency-filter-${currency.toLowerCase()}-opt"] input`).isChecked();
			if (
				(isSelected && !filters.currency.includes(currency)) ||
				(!isSelected && filters.currency.includes(currency))
			) {
				await page.locator(`div[data-tn="expense-currency-filter-${currency.toLowerCase()}-opt"]`).click();
			}
		}
	}
	if (filters.paymentMethod) {
		for (const pmTp of ['CASH', 'CREDIT_CARD']) {
			const isSelected: boolean = await page.locator(`div[data-tn="payment-method-filter-${pmTp.toLowerCase()}-opt"] input`).isChecked();
			if (
				(isSelected && !filters.paymentMethod.includes(pmTp)) ||
				(!isSelected && filters.paymentMethod.includes(pmTp))
			) {
				await page.locator(`div[data-tn="payment-method-filter-${pmTp.toLowerCase()}-opt"]`).click();
			}
		}
	}
	await page.locator('button[data-tn="apply-expense-filter-btn"]').click();
};
