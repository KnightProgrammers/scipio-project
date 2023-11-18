import { expect, Page } from '@playwright/test';
import { DateTime } from 'luxon';
import { waitForRequest } from './generic.helper';

type SavingFilterType = {
	statuses: string[]
}

export const createSaving = async (page: Page, data: {
    name: string,
    targetDate: Date,
    targetAmount: number,
    bankAccountName: string
}) => {
	const {
		name,
		targetDate,
		targetAmount,
		bankAccountName,
	} = data;
	await page.locator('button[data-tn="add-saving-btn"]').click();
	const savingFormContainer = page.locator('div[role="dialog"]');
	await expect(savingFormContainer).toBeVisible();
	await page.locator('input[name="name"]').fill(name);
	await page.locator('input[data-tn="target-date-input"]').fill(DateTime.fromJSDate(targetDate).toFormat('MM/dd/yyyy'));
	await page.keyboard.press('Enter');
	await page.locator('input[name="targetAmount"]').fill(targetAmount.toString());
	await page.locator('#bank-account-select input.select__input').fill(bankAccountName);
	await page.keyboard.press('Enter');
	const saveSavingWaitForRequest = waitForRequest(page, 'createSaving');
	const getSavingListWaitForRequest = waitForRequest(page, 'userSavings');
	await page.locator('button[data-tn="modal-form-save-btn"]').click();
	const saveSavingRequest = await saveSavingWaitForRequest;
	const getSavingListRequest = await getSavingListWaitForRequest;
	const saveSavingResponse = await saveSavingRequest.response();
	const { data: { createSaving: newSaving } } = await saveSavingResponse.json();
	const getSavingListResponse = await getSavingListRequest.response();
	const { data: { me: { savings } } } = await getSavingListResponse.json();
	expect(newSaving.id).toBeDefined();
	expect(Array.isArray(savings)).toBeTruthy();
	const foundSaving = savings.find(s => s.id === newSaving.id);
	expect(foundSaving).toBeTruthy();
	expect(foundSaving.targetDate).toEqual(DateTime.fromJSDate(targetDate).set({
		hour: 0,
		minute: 0,
		second: 0,
		millisecond:0,
	}).toISO());
	expect(foundSaving.name).toEqual(name);
	expect(foundSaving.targetAmount).toEqual(targetAmount);
	expect(foundSaving.bankAccount.label).toEqual(bankAccountName);
	await expect(savingFormContainer).not.toBeVisible();
	return newSaving;
};

export const openSavingDropdownAction = async (page: Page, savingId: string) => {
	await page.locator(`div.card[data-tn="saving-card-${savingId}"] button[data-tn="dropdown-saving-btn"]`).click();
};

export const updateSaving = async (page: Page, savingId: string, data: {
    name: string,
    targetDate: Date,
    targetAmount: number,
    bankAccountName: string
}) => {
	await openSavingDropdownAction(page, savingId);
	await page.locator(`div.card[data-tn="saving-card-${savingId}"] li[data-tn="edit-saving-btn"]`).click();
	const {
		name,
		targetDate,
		targetAmount,
		bankAccountName,
	} = data;
	const savingFormContainer = page.locator('div[role="dialog"]');
	await expect(savingFormContainer).toBeVisible();
	await page.locator('input[name="name"]').fill(name);
	await page.locator('input[data-tn="target-date-input"]').fill(DateTime.fromJSDate(targetDate).toFormat('MM/dd/yyyy'));
	await page.keyboard.press('Enter');
	await page.locator('input[name="targetAmount"]').fill(targetAmount.toString());
	await page.locator('#bank-account-select input.select__input').fill(bankAccountName);
	await page.keyboard.press('Enter');
	const saveSavingWaitForRequest = waitForRequest(page, 'updateSaving');
	const getSavingListWaitForRequest = waitForRequest(page, 'userSavings');
	await page.locator('button[data-tn="modal-form-save-btn"]').click();
	const saveSavingRequest = await saveSavingWaitForRequest;
	const getSavingListRequest = await getSavingListWaitForRequest;
	const saveSavingResponse = await saveSavingRequest.response();
	const { data: { updateSaving: editedSaving } } = await saveSavingResponse.json();
	const getSavingListResponse = await getSavingListRequest.response();
	const { data: { me: { savings } } } = await getSavingListResponse.json();
	expect(editedSaving.id).toBeDefined();
	expect(editedSaving.id).toEqual(savingId);
	expect(Array.isArray(savings)).toBeTruthy();
	const foundSaving = savings.find(s => s.id === editedSaving.id);
	expect(foundSaving).toBeTruthy();
	expect(foundSaving.targetDate).toEqual(DateTime.fromJSDate(targetDate).set({
		hour: 0,
		minute: 0,
		second: 0,
		millisecond:0,
	}).toISO());
	expect(foundSaving.name).toEqual(name);
	expect(foundSaving.targetAmount).toEqual(targetAmount);
	expect(foundSaving.bankAccount.label).toEqual(bankAccountName);
	await expect(savingFormContainer).not.toBeVisible();
	return foundSaving;
};

export const deleteSaving = async (page: Page, savingId: string) => {
	await openSavingDropdownAction(page, savingId);
	await page.locator(`div.card[data-tn="saving-card-${savingId}"] li[data-tn="delete-saving-btn"]`).click();
	const deleteSavingWaitForRequest = waitForRequest(page, 'deleteSaving');
	const getSavingListWaitForRequest = waitForRequest(page, 'userSavings');
	await page.locator('button[data-tn="confirm-dialog-confirm-btn"]').click();
	await deleteSavingWaitForRequest;
	const getSavingListRequest = await getSavingListWaitForRequest;
	const getSavingListResponse = await getSavingListRequest.response();
	const { data: { me: { savings } } } = await getSavingListResponse.json();
	expect(Array.isArray(savings)).toBeTruthy();
	const foundSaving = savings.find(c => c.id === savingId);
	expect(foundSaving).toBeFalsy();
	await expect(page.locator('div[data-tn="confirm-delete-dialog"]')).not.toBeVisible();
};

export const setSavingFilters = async (page: Page, filters: SavingFilterType) => {
	await page.locator('button[data-tn="open-saving-filter-btn"]').click();
	if (filters.statuses) {
		for (const savingStatus of ["IN_PROGRESS", "NOT_CONCLUDED", "COMPLETED"]) {
			const isSelected: boolean = await page.locator(`div[data-tn="saving-status-filter-${savingStatus.toLowerCase()}-opt"] input`).isChecked();
			if (
				(isSelected && !filters.statuses.includes(savingStatus)) ||
				(!isSelected && filters.statuses.includes(savingStatus))
			) {
				// saving-status-filter-IN_PROGRESS-opt
				await page.locator(`div[data-tn="saving-status-filter-${savingStatus.toLowerCase()}-opt"]`).click();
			}
		}
	}
	await page.locator('button[data-tn="apply-saving-filter-btn"]').click();
}
