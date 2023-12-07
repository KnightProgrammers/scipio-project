import { test, Page, expect } from '@playwright/test';
import { signInUser } from '../../../../helpers/auth.helper';
import { goToUserProfile } from '../../../../helpers/profile.helper';
import { v4 as uuidv4 } from 'uuid';
import { getDefaultUserData } from '../../../../config';
import {
	confirmDeleteBank,
	createBank,
	editBank,
	openDeleteBankDialog,
	openEditBankForm
} from '../../../../helpers/bank.helper';
import { waitForRequest } from '../../../../helpers/generic.helper';
import { NAV_MENU, navigateMenu } from "../../../../helpers/nav-menu.helper";


let email: string;
let password: string;

test.describe.configure({ mode: 'serial' });

let page: Page;
let bankId: string;
let bankName: string;

test.beforeAll(async ({ browser }) => {
	const defaultUserData = getDefaultUserData();
	email = defaultUserData.email;
	password = defaultUserData.password;
	bankName = `Test Bank - ${uuidv4()}`;
	page = await browser.newPage();
	await page.goto('/');
	await page.waitForLoadState('load');
	await signInUser(page, {email, password}, false);
});

test.afterAll(async () => {
	await page.close();
});

test('load bank tab', async () => {
	const waitForBanksRequest = waitForRequest(page, 'userBankAccounts');
	await navigateMenu(page, NAV_MENU.BANK_ACCOUNTS);
	await waitForBanksRequest;
	const pageContainer = page.locator('div[data-tn="bank-accounts-page"]');
	await expect(pageContainer).toBeVisible();
	const addBankButton = page.locator('button[data-tn="add-bank-btn"]');
	await expect(addBankButton).toBeVisible();
});

test('create a bank', async () => {
	const bank = await createBank(page, {
		name: bankName
	});
	bankId = bank.id;
	// validate bank on the screen
	await expect(page.locator(`div[data-tn="bank-${bankId}-card"]`)).toBeVisible();
});

test('edit a bank', async () => {
	const newBankName = `Edited ${bankName}!`;
	await openEditBankForm(page, bankId);
	await editBank(page, bankId, {
		name: newBankName
	});
});

test('delete a bank', async () => {
	await openDeleteBankDialog(page, bankId);
	await confirmDeleteBank(page, bankId);
	await expect(page.locator(`div[data-tn="bank-${bankId}-card"]`)).not.toBeVisible();
});
