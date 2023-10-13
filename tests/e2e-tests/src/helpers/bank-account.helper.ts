import { expect, Page } from '@playwright/test';
import { waitForRequest } from './generic.helper';

export const createBankAccount = async (
	page: Page, bankId: string, data: { accountName: string, accountNumber: string, accountBalance: number, currency: string}
) => {
	const {accountName, accountNumber, accountBalance, currency} = data;
	await page.locator(`div[data-tn="bank-${bankId}-card"] button[data-tn="add-bank-account-btn"]`).click();
	const formLocator = page.locator('div[role="dialog"]');
	await expect(formLocator).toBeVisible();
	await page.locator('input[name="accountName"]').fill(accountName);
	await page.locator('input[name="accountNumber"]').fill(accountNumber);
	await page.locator('input[name="accountBalance"]').fill(accountBalance.toString());
	await page.locator('#currency-select').click();
	await page.locator('#currency-select input.select__input').fill(currency);
	await page.keyboard.press('Enter');
	const saveBankAccountWaitForRequest = waitForRequest(page, 'createBankAccount');
	const getBankAccountListWaitForRequest = waitForRequest(page, 'userBankAccounts');
	await page.locator('button[data-tn="modal-form-save-btn"]').click();
	const saveBankAccountRequest = await saveBankAccountWaitForRequest;
	const getBankAccountListRequest = await getBankAccountListWaitForRequest;
	const saveBankResponse = await saveBankAccountRequest.response();
	const {data: { createBankAccount: newBankAccount }} = await saveBankResponse.json();
	const getBankListResponse = await getBankAccountListRequest.response();
	const { data: { me: { banks } } } = await getBankListResponse.json();
	expect(Array.isArray(banks)).toBeTruthy();
	expect(banks.length).toBeGreaterThanOrEqual(1);
	const foundBank = banks.find(b => b.id === bankId);
	expect(foundBank).toBeTruthy();
	const foundNewBankAccount = foundBank.bankAccounts.find(ba => ba.id === newBankAccount.id);
	expect(foundNewBankAccount).toBeTruthy();
	await expect(formLocator).not.toBeVisible();
	return foundNewBankAccount;
};

export const openEditBankAccountForm = async (page: Page, bankAccountId: string) => {
	await page.locator(`div[data-tn="bank-account-${bankAccountId}"] button[data-tn="dropdown-bank-account-btn"]`).click();
	await page.locator(`div[data-tn="bank-account-${bankAccountId}"] li[data-tn="edit-bank-account-btn"]`).click();
	const formLocator = page.locator('div[role="dialog"]');
	await expect(formLocator).toBeVisible();
};

export const editBankAccount = async (page: Page, bankId: string, bankAccountId: string, data: {accountName: string, accountNumber: string, accountBalance: number}) => {
	const {accountName, accountNumber, accountBalance} = data;
	const formLocator = page.locator('div[role="dialog"]');
	await expect(formLocator).toBeVisible();
	await page.locator('input[name="accountName"]').fill(accountName);
	await page.locator('input[name="accountNumber"]').fill(accountNumber);
	await page.locator('input[name="accountBalance"]').fill(accountBalance.toString());
	const saveBankAccountWaitForRequest = waitForRequest(page, 'updateBankAccount');
	const getBankAccountListWaitForRequest = waitForRequest(page, 'userBankAccounts');
	await page.locator('button[data-tn="modal-form-save-btn"]').click();
	const saveBankAccountRequest = await saveBankAccountWaitForRequest;
	const getBankAccountListRequest = await getBankAccountListWaitForRequest;
	const saveBankResponse = await saveBankAccountRequest.response();
	const {data: { updateBankAccount: updatedBankAccount }} = await saveBankResponse.json();
	const getBankAccountListResponse = await getBankAccountListRequest.response();
	const { data: { me: { banks } } } = await getBankAccountListResponse.json();
	expect(Array.isArray(banks)).toBeTruthy();
	expect(banks.length).toBeGreaterThanOrEqual(1);
	const foundBank = banks.find(b => b.id === bankId);
	expect(foundBank).toBeTruthy();
	const foundUpdatedBankAccount = foundBank.bankAccounts.find(ba => ba.id === updatedBankAccount.id);
	expect(foundUpdatedBankAccount).toBeTruthy();
	await expect(formLocator).not.toBeVisible();
	expect(foundUpdatedBankAccount.accountName).toEqual(accountName);
	expect(foundUpdatedBankAccount.accountNumber).toEqual(accountNumber);
	expect(foundUpdatedBankAccount.accountBalance).toEqual(accountBalance);
	return foundUpdatedBankAccount;
};

export const deleteBankAccount = async (page: Page, bankId: string, bankAccountId: string) => {
	await openDeleteBankAccountDialog(page, bankAccountId);
	await confirmDeleteBankAccount(page, bankId, bankAccountId);
};

export const openDeleteBankAccountDialog = async (page: Page, bankAccountId: string) => {
	await page.locator(`div[data-tn="bank-account-${bankAccountId}"] button[data-tn="dropdown-bank-account-btn"]`).click();
	await page.locator(`div[data-tn="bank-account-${bankAccountId}"] li[data-tn="delete-bank-account-btn"]`).click();
	await expect(page.locator('div[data-tn="confirm-delete-bank-account-dialog"]')).toBeVisible();
};

export const confirmDeleteBankAccount = async (page: Page, bankId: string, bankAccountId: string) => {
	const deleteBankAccountWaitForRequest = waitForRequest(page, 'deleteBankAccount');
	const getBankAccountListWaitForRequest = waitForRequest(page, 'userBankAccounts');
	await page.locator('button[data-tn="confirm-dialog-confirm-btn"]').click();
	await deleteBankAccountWaitForRequest;
	const getBankAccountListRequest = await getBankAccountListWaitForRequest;
	const getBankAccountListResponse = await getBankAccountListRequest.response();
	const { data: { me: { banks } } } = await getBankAccountListResponse.json();
	expect(Array.isArray(banks)).toBeTruthy();
	expect(banks.length).toBeGreaterThanOrEqual(1);
	const foundBank = banks.find(b => b.id === bankId);
	expect(foundBank).toBeTruthy();
	const foundNewBankAccount = foundBank.bankAccounts.find(ba => ba.id === bankAccountId);
	expect(foundNewBankAccount).toBeFalsy();
	await expect(page.locator('div[data-tn="confirm-delete-dialog"]')).not.toBeVisible();
};


