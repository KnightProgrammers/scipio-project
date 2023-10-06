import { expect, Page } from "@playwright/test";
import { API_BASE_URL } from "../config";

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
    await page.keyboard.press('Enter')
    const saveBankAccountWaitForRequest = page.waitForRequest((request) =>
        request.url() === `${API_BASE_URL}/bank-accounts` && request.method() === 'POST'
    );
    const getBankAccountListWaitForRequest = page.waitForRequest((request) =>
        request.url() === `${API_BASE_URL}/bank-accounts` && request.method() === 'GET'
    );
    await page.locator(`button[data-tn="modal-form-save-btn"]`).click();
    const saveBankAccountRequest = await saveBankAccountWaitForRequest;
    const getBankAccountListRequest = await getBankAccountListWaitForRequest;

    const bodyRequest: any = await saveBankAccountRequest.postDataJSON()
    const saveBankResponse = await saveBankAccountRequest.response();
    const newBankAccount = await saveBankResponse.json();
    console.log({newBankAccount})
    expect(bodyRequest.accountName).toEqual(accountName);
    expect(bodyRequest.accountNumber).toEqual(accountNumber);
    expect(bodyRequest.accountBalance).toEqual(accountBalance);
    expect(bodyRequest.accountBankId).toEqual(bankId);
    const getBankListResponse = await getBankAccountListRequest.response()
    const bankAccountList = await getBankListResponse.json();
    expect(Array.isArray(bankAccountList)).toBeTruthy();
    expect(bankAccountList.length).toBeGreaterThanOrEqual(1);
    const foundBank = bankAccountList.find(b => b.id === newBankAccount.accountBankId);
    expect(foundBank).toBeTruthy();
    const foundNewBankAccount = foundBank.accounts.find(ba => ba.id === newBankAccount.id);
    expect(foundNewBankAccount).toBeTruthy();
    await expect(formLocator).not.toBeVisible();
    expect(newBankAccount.accountName).toEqual(accountName);
    expect(newBankAccount.accountNumber).toEqual(accountNumber);
    expect(newBankAccount.accountBalance).toEqual(accountBalance);
    expect(newBankAccount.accountBankId).toEqual(bankId);
    expect(newBankAccount.accountCurrency.code).toEqual(currency);
    return newBankAccount;
}

export const openEditBankAccountForm = async (page: Page, bankAccountId: string) => {
    await page.locator(`div[data-tn="bank-account-${bankAccountId}"] button[data-tn="dropdown-bank-account-btn"]`).click();
    await page.locator(`div[data-tn="bank-account-${bankAccountId}"] li[data-tn="edit-bank-account-btn"]`).click();
    const formLocator = page.locator('div[role="dialog"]');
    await expect(formLocator).toBeVisible();
}

export const editBankAccount = async (page: Page, bankAccountId: string, data: {accountName: string, accountNumber: string, accountBalance: number}) => {
    const {accountName, accountNumber, accountBalance} = data;
    const formLocator = page.locator('div[role="dialog"]');
    await expect(formLocator).toBeVisible();
    await page.locator('input[name="accountName"]').fill(accountName);
    await page.locator('input[name="accountNumber"]').fill(accountNumber);
    await page.locator('input[name="accountBalance"]').fill(accountBalance.toString());
    const saveBankAccountWaitForRequest = page.waitForRequest((request) =>
        request.url() === `${API_BASE_URL}/bank-accounts/${bankAccountId}` && request.method() === 'PUT'
    );
    const getBankAccountListWaitForRequest = page.waitForRequest((request) =>
        request.url() === `${API_BASE_URL}/bank-accounts` && request.method() === 'GET'
    );
    await page.locator(`button[data-tn="modal-form-save-btn"]`).click();
    const saveBankAccountRequest = await saveBankAccountWaitForRequest;
    const getBankAccountListRequest = await getBankAccountListWaitForRequest;
    const bodyRequest: any = await saveBankAccountRequest.postDataJSON()
    const saveBankResponse = await saveBankAccountRequest.response();
    const updatedBankAccount = await saveBankResponse.json();
    expect(bodyRequest.accountName).toEqual(accountName);
    expect(bodyRequest.accountNumber).toEqual(accountNumber);
    expect(bodyRequest.accountBalance).toEqual(accountBalance);
    const getBankAccountListResponse = await getBankAccountListRequest.response()
    const bankAccountList = await getBankAccountListResponse.json();
    expect(Array.isArray(bankAccountList)).toBeTruthy();
    expect(bankAccountList.length).toBeGreaterThanOrEqual(1);
    const foundBank = bankAccountList.find(b => b.id === updatedBankAccount.accountBankId);
    expect(foundBank).toBeTruthy();
    const foundNewBankAccount = foundBank.accounts.find(ba => ba.id === bankAccountId);
    expect(foundNewBankAccount).toBeTruthy();
    await expect(formLocator).not.toBeVisible();
    expect(updatedBankAccount.accountName).toEqual(accountName);
    expect(updatedBankAccount.accountNumber).toEqual(accountNumber);
    expect(updatedBankAccount.accountBalance).toEqual(accountBalance);
    return updatedBankAccount;
}

export const deleteBankAccount = async (page: Page, bankId: string, bankAccountId: string) => {
    await openDeleteBankAccountDialog(page, bankAccountId);
    await confirmDeleteBankAccount(page, bankId, bankAccountId);
}

export const openDeleteBankAccountDialog = async (page: Page, bankAccountId: string) => {
    await page.locator(`div[data-tn="bank-account-${bankAccountId}"] button[data-tn="dropdown-bank-account-btn"]`).click();
    await page.locator(`div[data-tn="bank-account-${bankAccountId}"] li[data-tn="delete-bank-account-btn"]`).click();
    await expect(page.locator('div[data-tn="confirm-delete-bank-account-dialog"]')).toBeVisible();
}

export const confirmDeleteBankAccount = async (page: Page, bankId: string, bankAccountId: string) => {
    const saveBankAccountWaitForRequest = page.waitForRequest((request) =>
        request.url() === `${API_BASE_URL}/bank-accounts/${bankAccountId}` && request.method() === "DELETE"
    );
    const getBankAccountListWaitForRequest = page.waitForRequest((request) =>
        request.url() === `${API_BASE_URL}/bank-accounts` && request.method() === 'GET'
    );
    await page.locator('button[data-tn="confirm-dialog-confirm-btn"]').click();
    await saveBankAccountWaitForRequest;
    const getBankAccountListRequest = await getBankAccountListWaitForRequest;
    const getBankAccountListResponse = await getBankAccountListRequest.response()
    const bankAccountList = await getBankAccountListResponse.json();
    expect(Array.isArray(bankAccountList)).toBeTruthy();
    expect(bankAccountList.length).toBeGreaterThanOrEqual(1);
    const foundBank = bankAccountList.find(b => b.id === bankId);
    expect(foundBank).toBeTruthy();
    const foundNewBankAccount = foundBank.accounts.find(ba => ba.id === bankAccountId);
    expect(foundNewBankAccount).toBeFalsy();

    await expect(page.locator('div[data-tn="confirm-delete-dialog"]')).not.toBeVisible();
}


