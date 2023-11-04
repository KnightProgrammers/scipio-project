import { expect, Page } from '@playwright/test';
import { waitForRequest } from './generic.helper';
import { DateTime } from "luxon";

export const createExpense = async (page: Page, data: {
	billableDate?: Date
	description?: string
	amount: number,
	currencyCode: string
	categoryName: string
})=>  {
	const {
		billableDate= new Date(),
		description = '',
		amount,
		currencyCode,
		categoryName
	} = data;
	await page.locator('button[data-tn="add-expense-btn"]').click();
	const expenseFormContainer = page.locator('div[role="dialog"]');
	await expect(expenseFormContainer).toBeVisible();
	await page.locator('input[data-tn="billable-date-input"]').fill(DateTime.fromJSDate(billableDate).toFormat('dd/MM/yyyy'));
	await page.locator('input[name="description"]').fill(description);
	await page.locator('input[name="amount"]').fill(amount.toString());
	await page.locator('#currency-select input.select__input').fill(currencyCode);
	await page.keyboard.press('Enter');
	await page.locator('#category-select input.select__input').fill(categoryName);
	await page.keyboard.press('Enter');
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
	expect(foundExpense.billableDate).toEqual(DateTime.fromJSDate(billableDate).toFormat('dd/MM/yyyy'));
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
