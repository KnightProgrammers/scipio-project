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
    expect(bodyRequest.accountName).toEqual(accountName);
    expect(bodyRequest.accountNumber).toEqual(accountNumber);
    expect(bodyRequest.accountBalance).toEqual(accountBalance);
    expect(bodyRequest.accountBankId).toEqual(bankId);
    const getBankListResponse = await getBankAccountListRequest.response()
    const bankList = await getBankListResponse.json();
    expect(Array.isArray(bankList)).toBeTruthy();
    expect(bankList.length).toBeGreaterThanOrEqual(1);
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
