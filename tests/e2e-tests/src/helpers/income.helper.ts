import { expect, Page } from '@playwright/test';
import { DateTime } from 'luxon';
import { waitForRequest } from './generic.helper';
import { DEFAULT_USER_CURRENCIES } from './auth.helper';

type IncomeFilterType = {
    fromDate?: DateTime
    toDate?: DateTime
    currency?: string[],
}

export const createIncome = async (page: Page, data: {
    incomeDate?: Date
    description?: string
    amount: number,
    currencyCode: string
    bankAccountId: string
})=>  {
	const {
		incomeDate= new Date(),
		description,
		amount,
		currencyCode,
		bankAccountId
	} = data;
	await page.locator('button[data-tn="add-income-btn"]').click();
	const incomeFormContainer = page.locator('div[role="dialog"]');
	await expect(incomeFormContainer).toBeVisible();
	await page.locator('input[data-tn="income-date-input"]').fill(DateTime.fromJSDate(incomeDate).toFormat('dd/MM/yyyy'));
	await page.locator('input[name="description"]').fill(description);
	await page.locator('input[name="amount"]').fill(amount.toString());
	await page.keyboard.press('Enter');
	await page.locator('#bank-account-select input.select__input').fill(bankAccountId);
	await page.keyboard.press('Enter');
	const saveIncomeWaitForRequest = waitForRequest(page, 'createIncome');
	const getIncomeListWaitForRequest = waitForRequest(page, 'userIncomes');
	await page.locator('button[data-tn="modal-form-save-btn"]').click();
	const saveIncomeRequest = await saveIncomeWaitForRequest;
	const getIncomeListRequest = await getIncomeListWaitForRequest;
	const saveIncomeResponse = await saveIncomeRequest.response();
	const { data: { createIncome: newIncome } } = await saveIncomeResponse.json();
	const getIncomeListResponse = await getIncomeListRequest.response();
	const { data: { me: { incomes } } } = await getIncomeListResponse.json();
	expect(newIncome.id).toBeDefined();
	expect(Array.isArray(incomes)).toBeTruthy();
	const foundIncome = incomes.find((i: any) => i.id === newIncome.id);
	expect(foundIncome).toBeTruthy();
	expect(foundIncome.incomeDate).toEqual(
		DateTime.fromJSDate(incomeDate).set({hour: 0, minute: 0, second: 0, millisecond: 0}).toISO({includeOffset: false})
	);
	expect(foundIncome.description).toEqual(description);
	expect(foundIncome.amount).toEqual(amount);
	expect(foundIncome.currency.code).toEqual(currencyCode);
	expect(foundIncome.bankAccount.id).toEqual(bankAccountId);
	await expect(incomeFormContainer).not.toBeVisible();
	return newIncome;
};

export const deleteIncome = async (page: Page, incomeId: string) => {
	await page.locator(`button[data-tn="delete-income-btn-${incomeId}"]`).click();
	const deleteIncomeWaitForRequest = waitForRequest(page, 'deleteIncome');
	const getIncomeListWaitForRequest = waitForRequest(page, 'userIncomes');
	await page.locator('button[data-tn="confirm-dialog-confirm-btn"]').click();
	await deleteIncomeWaitForRequest;
	const getIncomeListRequest = await getIncomeListWaitForRequest;
	const getIncomeListResponse = await getIncomeListRequest.response();
	const { data: { me: { incomes } } } = await getIncomeListResponse.json();
	expect(Array.isArray(incomes)).toBeTruthy();
	const foundDeleteIncome = incomes.find((i: any) => i.id === incomeId);
	expect(foundDeleteIncome).toBeFalsy();

	await expect(page.locator('div[data-tn="confirm-delete-dialog"]')).not.toBeVisible();
};

export const applyIncomeFilter = async (page: Page, filters: IncomeFilterType) => {
	await page.locator('button[data-tn="open-income-filter-btn"]').click();
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
	if (filters.currency) {
		for (const currency of DEFAULT_USER_CURRENCIES) {
			const isSelected: boolean = await page.locator(`div[data-tn="income-currency-filter-${currency.toLowerCase()}-opt"] input`).isChecked();
			if (
				(isSelected && !filters.currency.includes(currency)) ||
                (!isSelected && filters.currency.includes(currency))
			) {
				await page.locator(`div[data-tn="income-currency-filter-${currency.toLowerCase()}-opt"]`).click();
			}
		}
	}
	await page.locator('button[data-tn="apply-income-filter-btn"]').click();
};
