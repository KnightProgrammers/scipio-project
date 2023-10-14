import { expect, Page } from '@playwright/test';
import { waitForRequest } from './generic.helper';

export const createBank = async (page: Page, data: { name: string })=>  {
	const { name } = data;
	await page.locator('button[data-tn="add-bank-btn"]').click();
	const bankFormContainer = page.locator('div[role="dialog"]');
	await expect(bankFormContainer).toBeVisible();
	await page.locator('input[name="name"]').fill(name);
	const saveBankWaitForRequest = waitForRequest(page, 'createBank');
	const getBankListWaitForRequest = waitForRequest(page, 'userBanks');
	await page.locator('button[data-tn="modal-form-save-btn"]').click();
	const saveBankRequest = await saveBankWaitForRequest;
	const getBankListRequest = await getBankListWaitForRequest;
	const saveBankResponse = await saveBankRequest.response();
	const { data: { createBank: newBank } } = await saveBankResponse.json();
	const getBankListResponse = await getBankListRequest.response();
	const { data: { me: { banks } } } = await getBankListResponse.json();
	expect(newBank.id).toBeDefined();
	expect(Array.isArray(banks)).toBeTruthy();
	const foundNewBank = banks.find(b => b.id === newBank.id);
	expect(foundNewBank).toBeTruthy();
	expect(foundNewBank.name).toEqual(name);
	await expect(bankFormContainer).not.toBeVisible();
	return newBank;
};

export const openEditBankForm = async (page: Page, bankId: string) => {
	await page.locator(`button[data-tn="edit-bank-btn-${bankId}"]`).click();
	const bankFormContainer = page.locator('div[role="dialog"]');
	await expect(bankFormContainer).toBeVisible();
};

export const editBank = async (page: Page, bankId: string, data: {name: string}) => {
	const {name} = data;
	await page.locator('input[name="name"]').clear();
	await page.locator('input[name="name"]').fill(name);
	const saveBankWaitForRequest = waitForRequest(page, 'updateBank');
	const getBankListWaitForRequest = waitForRequest(page, 'userBanks');
	await page.locator('button[data-tn="modal-form-save-btn"]').click();
	const saveBankRequest = await saveBankWaitForRequest;
	const getBankListRequest = await getBankListWaitForRequest;
	const saveBankResponse = await saveBankRequest.response();
	const { data: { updateBank: updated } } = await saveBankResponse.json();
	const getBankListResponse = await getBankListRequest.response();
	const { data: { me: { banks } } } = await getBankListResponse.json();
	expect(updated.id).toEqual(bankId);
	expect(Array.isArray(banks)).toBeTruthy();
	const foundNewBank = banks.find(b => b.id === updated.id);
	expect(foundNewBank).toBeTruthy();
	expect(foundNewBank.name).toEqual(name);
	const bankFormContainer = page.locator('div[role="dialog"]');
	await expect(bankFormContainer).not.toBeVisible();
	return updated;
};

export const deleteBank = async (page: Page, bankId: string) => {
	await openDeleteBankDialog(page, bankId);
	await confirmDeleteBank(page, bankId);
};

export const openDeleteBankDialog = async (page: Page, bankId: string) => {
	await page.locator(`button[data-tn="delete-bank-btn-${bankId}"]`).click();
	await expect(page.locator('div[data-tn="confirm-delete-dialog"]')).toBeVisible();
};

export const confirmDeleteBank = async (page: Page, bankId: string) => {
	const deleteBankWaitForRequest = waitForRequest(page, 'deleteBank');
	const getBankListWaitForRequest = waitForRequest(page, 'userBanks');
	await page.locator('button[data-tn="confirm-dialog-confirm-btn"]').click();
	await deleteBankWaitForRequest;
	const getBankListRequest = await getBankListWaitForRequest;
	const getBankListResponse = await getBankListRequest.response();
	const { data: { me: { banks } } } = await getBankListResponse.json();
	expect(Array.isArray(banks)).toBeTruthy();
	const foundNewBank = banks.find(b => b.id === bankId);
	expect(foundNewBank).toBeFalsy();

	await expect(page.locator('div[data-tn="confirm-delete-dialog"]')).not.toBeVisible();
};
