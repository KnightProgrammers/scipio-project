import { expect, Page } from "@playwright/test";
import { waitForRequest } from "./generic.helper";

export const addBudgetItem = async (page: Page, categoryName: string): Promise<string> => {
    await page.locator('button[data-tn="add-budget-item-btn"]').click();
    await expect(page.locator('tr[data-tn="budget-item-new-category-row"]')).toBeVisible();
    await expect(page.locator('div#category-select-new-budget-item')).toBeVisible();
    const waitForCreateBudgetItemRequest = waitForRequest(page, 'upsertBudgetItem');
    const waitForBudget = waitForRequest(page, 'userBudget');
    await page.locator('div#category-select-new-budget-item').click();
    await page.locator('div#category-select-new-budget-item  input.select__input').fill(categoryName);
    await page.keyboard.press('Enter');
    const createBudgetItemRequest = await waitForCreateBudgetItemRequest;
    await waitForBudget;
    const createBudgetResponse = await createBudgetItemRequest.response();
    const { data: { upsertBudgetItem: { id } } } = await createBudgetResponse.json();
    expect(id).toBeDefined();
	return id;
};


export const modifyBudgetItemLimit = async (page: Page, data: {
    limit: number;
    currencyCode: string;
    budgetItemId: string
}) => {
	const {
		budgetItemId,
		currencyCode,
		limit
	} = data;
    await expect(page.locator(`tr[data-tn="budget-item-${budgetItemId}-row"]`)).toBeVisible();
    await expect(page.locator(`td[data-tn="${budgetItemId}-currency-${currencyCode.toLowerCase()}-limit"]`)).toBeVisible();
    await page.locator(`td[data-tn="${budgetItemId}-currency-${currencyCode.toLowerCase()}-limit"]`).click();
    await page.locator(`td[data-tn="${budgetItemId}-currency-${currencyCode.toLowerCase()}-limit"] input`).fill(limit.toString());
    // Save button
    const waitForUpdateBudgetItemRequest = waitForRequest(page, 'upsertBudgetItem');
    await page.locator(`[data-tn="budget-item-${budgetItemId}-row"] button[data-tn="save-budget-item"]`).click();
    const updateBudgetItemRequest = await waitForUpdateBudgetItemRequest;
    const updateBudgetResponse = await updateBudgetItemRequest.response();
    const { data: { upsertBudgetItem: { id } } } = await updateBudgetResponse.json();
    expect(id).toEqual(budgetItemId);
};


export const deleteBudgetItem = async (page: Page, budgetItemId: string) => {
    const waitForDeleteBudgetItemRequest = waitForRequest(page, 'upsertBudgetItem');
    await page.locator(`div[data-tn="budgets-page"] table tr[data-tn="budget-item-${budgetItemId}-row"] button[data-tn="delete-budget-item"]`).click();
    await page.locator('button[data-tn="confirm-dialog-confirm-btn"]').click();
    await waitForDeleteBudgetItemRequest;
    await expect(page.locator(`div[data-tn="budgets-page"] table tr[data-tn="budget-item-${budgetItemId}-row"]`)).not.toBeAttached();
};
