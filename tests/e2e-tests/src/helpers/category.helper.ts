import { expect, Page } from '@playwright/test';
import { waitForRequest } from './generic.helper';

export const createCategory = async (page: Page, data: {
	name: string
	type: 'NEED' | 'WANT' | 'SAVE'
	isFixedPayment: boolean
})=>  {
	const { name , type, isFixedPayment} = data;
	await page.locator('button[data-tn="add-category-btn"]').click();
	const categoryFormContainer = page.locator('div[role="dialog"]');
	await expect(categoryFormContainer).toBeVisible();
	await page.locator('input[name="name"]').fill(name);
	const saveCategoryWaitForRequest = waitForRequest(page, 'createCategories');
	const getCategoryListWaitForRequest = waitForRequest(page, 'userCategories');
	await page.locator('button[data-tn="modal-form-save-btn"]').click();
	const saveCategoryRequest = await saveCategoryWaitForRequest;
	const getCategoryListRequest = await getCategoryListWaitForRequest;
	const saveCategoryResponse = await saveCategoryRequest.response();
	const { data: { createCategory: newCategory } } = await saveCategoryResponse.json();
	const getCategoryListResponse = await getCategoryListRequest.response();
	const { data: { me: { categories } } } = await getCategoryListResponse.json();
	expect(newCategory.id).toBeDefined();
	expect(Array.isArray(categories)).toBeTruthy();
	const foundNewCategory = categories.find(b => b.id === newCategory.id);
	expect(foundNewCategory).toBeTruthy();
	expect(foundNewCategory.name).toEqual(name);
	expect(foundNewCategory.type).toEqual(type);
	expect(foundNewCategory.isFixedPayment).toEqual(isFixedPayment);
	await expect(categoryFormContainer).not.toBeVisible();
	return newCategory;
};

export const openEditCategoryForm = async (page: Page, categoryId: string) => {
	await page.locator(`button[data-tn="edit-category-btn-${categoryId}"]`).click();
	const categoryFormContainer = page.locator('div[role="dialog"]');
	await expect(categoryFormContainer).toBeVisible();
};

export const editCategory = async (page: Page, categoryId: string, data: {
	name: string
	type: 'NEED' | 'WANT' | 'SAVE'
	isFixedPayment: boolean
}) => {
	const { name , type, isFixedPayment} = data;
	await page.locator('input[name="name"]').clear();
	await page.locator('input[name="name"]').fill(name);
	const saveCategoryWaitForRequest = waitForRequest(page, 'updateCategory');
	const getCategoryListWaitForRequest = waitForRequest(page, 'userCategories');
	await page.locator('button[data-tn="modal-form-save-btn"]').click();
	const saveCategoryRequest = await saveCategoryWaitForRequest;
	const getCategoryListRequest = await getCategoryListWaitForRequest;
	const saveCategoryResponse = await saveCategoryRequest.response();
	const { data: { updateCategory: updated } } = await saveCategoryResponse.json();
	const getCategoryListResponse = await getCategoryListRequest.response();
	const { data: { me: { categories } } } = await getCategoryListResponse.json();
	expect(updated.id).toEqual(categoryId);
	expect(Array.isArray(categories)).toBeTruthy();
	const foundNewCategory = categories.find(b => b.id === updated.id);
	expect(foundNewCategory).toBeTruthy();
	expect(foundNewCategory.name).toEqual(name);
	expect(foundNewCategory.type).toEqual(type);
	expect(foundNewCategory.isFixedPayment).toEqual(isFixedPayment);
	const categoryFormContainer = page.locator('div[role="dialog"]');
	await expect(categoryFormContainer).not.toBeVisible();
	return updated;
};

export const deleteCategory = async (page: Page, categoryId: string) => {
	await openDeleteCategoryDialog(page, categoryId);
	await confirmDeleteCategory(page, categoryId);
};

export const openDeleteCategoryDialog = async (page: Page, categoryId: string) => {
	await page.locator(`button[data-tn="delete-category-btn-${categoryId}"]`).click();
	await expect(page.locator('div[data-tn="confirm-delete-dialog"]')).toBeVisible();
};

export const confirmDeleteCategory = async (page: Page, categoryId: string) => {
	const deleteCategoryWaitForRequest = waitForRequest(page, 'deleteCategory');
	const getCategoryListWaitForRequest = waitForRequest(page, 'userCategories');
	await page.locator('button[data-tn="confirm-dialog-confirm-btn"]').click();
	await deleteCategoryWaitForRequest;
	const getCategoryListRequest = await getCategoryListWaitForRequest;
	const getCategoryListResponse = await getCategoryListRequest.response();
	const { data: { me: { categories } } } = await getCategoryListResponse.json();
	expect(Array.isArray(categories)).toBeTruthy();
	const foundNewCategory = categories.find(b => b.id === categoryId);
	expect(foundNewCategory).toBeFalsy();

	await expect(page.locator('div[data-tn="confirm-delete-dialog"]')).not.toBeVisible();
};
