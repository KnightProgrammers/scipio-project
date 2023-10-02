import { expect, Page } from "@playwright/test";
import { API_BASE_URL } from "../config";

export const createBank = async (page: Page, data: { name: string })=>  {
    const { name } = data;
    await page.locator('button[data-tn="add-bank-btn"]').click();
    const bankFormContainer = page.locator('div[data-tn="bank-form"]');
    await expect(bankFormContainer).toBeVisible();
    await page.locator('input[name="name"]').fill(name);
    const saveBankWaitForRequest = page.waitForRequest((request) =>
        request.url() === `${API_BASE_URL}/banks` && request.method() === 'POST'
    );
    const getBankListWaitForRequest = page.waitForRequest((request) =>
        request.url() === `${API_BASE_URL}/banks` && request.method() === 'GET'
    );
    await page.locator('button[data-tn="save-bank-btn"]').click();
    const saveBankRequest = await saveBankWaitForRequest;
    const getBankListRequest = await getBankListWaitForRequest;
    const bodyRequest = await saveBankRequest.postDataJSON()
    const saveBankResponse = await saveBankRequest.response();
    const newBank = await saveBankResponse.json();
    expect(bodyRequest).toEqual({
        name
    });
    const getBankListResponse = await getBankListRequest.response()
    const bankList = await getBankListResponse.json();
    expect(Array.isArray(bankList)).toBeTruthy();
    const foundNewBank = bankList.find(b => b.id === newBank.id);
    expect(foundNewBank).toBeTruthy();
    expect(foundNewBank.name).toEqual(name)
    await expect(bankFormContainer).not.toBeVisible();
    expect(newBank.id).toBeDefined();
    expect(newBank.name).toEqual(name);
    return newBank;
}

export const openEditBankForm = async (page: Page, bankId: string) => {
    await page.locator(`button[data-tn="edit-bank-btn-${bankId}"]`).click();
    const bankFormContainer = page.locator('div[data-tn="bank-form"]');
    await expect(bankFormContainer).toBeVisible();
}

export const editBank = async (page: Page, bankId: string, data: {name: string}) => {
    const {name} = data;
    await page.locator('input[name="name"]').clear();
    await page.locator('input[name="name"]').fill(name);
    const saveBankWaitForRequest = page.waitForRequest((request) =>
        request.url() === `${API_BASE_URL}/banks/${bankId}` && request.method() === 'PUT'
    );
    const getBankListWaitForRequest = page.waitForRequest((request) =>
        request.url() === `${API_BASE_URL}/banks` && request.method() === 'GET'
    );
    await page.locator('button[data-tn="save-bank-btn"]').click();
    const saveBankRequest = await saveBankWaitForRequest;
    const getBankListRequest = await getBankListWaitForRequest;
    const bodyRequest = await saveBankRequest.postDataJSON()
    const saveBankResponse = await saveBankRequest.response();
    const updated = await saveBankResponse.json();
    expect(bodyRequest).toEqual({
        id: bankId,
        name,
        accountsCount: 0
    });
    const getBankListResponse = await getBankListRequest.response()
    const bankList = await getBankListResponse.json();
    expect(Array.isArray(bankList)).toBeTruthy();
    const foundNewBank = bankList.find(b => b.id === updated.id);
    expect(foundNewBank).toBeTruthy();
    expect(foundNewBank.name).toEqual(name)
    const bankFormContainer = page.locator('div[data-tn="bank-form"]');
    await expect(bankFormContainer).not.toBeVisible();
    expect(updated.id).toEqual(bankId);
    expect(updated.name).toEqual(name);
    return updated;
}

export const openDeleteBankDialog = async (page: Page, bankId: string) => {
    await page.locator(`button[data-tn="delete-bank-btn-${bankId}"]`).click();
    await expect(page.locator('div[data-tn="confirm-delete-dialog"]')).toBeVisible();
}

export const confirmDeleteBank = async (page: Page, bankId: string) => {
    const saveBankWaitForRequest = page.waitForRequest((request) =>
        request.url() === `${API_BASE_URL}/banks/${bankId}` && request.method() === "DELETE"
    );
    const getBankListWaitForRequest = page.waitForRequest((request) =>
        request.url() === `${API_BASE_URL}/banks` && request.method() === 'GET'
    );
    await page.locator('button[data-tn="confirm-dialog-confirm-btn"]').click();
    await saveBankWaitForRequest;
    const getBankListRequest = await getBankListWaitForRequest;
    const getBankListResponse = await getBankListRequest.response()
    const bankList = await getBankListResponse.json();
    expect(Array.isArray(bankList)).toBeTruthy();
    const foundNewBank = bankList.find(b => b.id === bankId);
    expect(foundNewBank).toBeFalsy();

    await expect(page.locator('div[data-tn="confirm-delete-dialog"]')).not.toBeVisible();
}
