import { test, Page, expect } from '@playwright/test';
import firebaseService from '../../../../services/firebase.service';
import { signUpUser, signInUser } from '../../../../helpers/auth.helper';
import { v4 as uuidv4 } from 'uuid';
import { goToProfileTab, goToUserProfile } from '../../../../helpers/profile.helper';
import {
	createBank, deleteBank,
	editBank,
	openEditBankForm
} from '../../../../helpers/bank.helper';
import { waitForRequest } from '../../../../helpers/generic.helper';
import { NAV_MENU, navigateMenu } from "../../../../helpers/nav-menu.helper";


let email: string;
let password: string;
let name: string;

const bankName: string = 'Bank #1';
let bankId: string;

test.describe.configure({ mode: 'serial' });

let page: Page;

test.beforeAll(async ({ browser }) => {
	email = `test-${uuidv4()}@automation.com`;
	password = `password-${uuidv4()}`;
	name = 'Automation User';
	page = await browser.newPage();
	await page.goto('/');
	await page.waitForLoadState('load');
	console.log(`Creating account for user with email: "${email}"`);
	await signUpUser(page, { email, password, name });
	await signInUser(page, { email, password });
	await goToUserProfile(page);
});

test.afterAll(async () => {
	try {
		const user = await firebaseService.auth().getUserByEmail(email);
		await firebaseService.auth().deleteUser(user.uid);
		console.log(`Deleted User "${email}"`);
	} catch {
		console.log('No user to be deleted');
	} finally {
		await page.close();
	}
});

test('empty state', async () => {
	const waitForBanksRequest = waitForRequest(page, 'userBankAccounts');
	await navigateMenu(page, NAV_MENU.BANK_ACCOUNTS);
	const banksRequest = await waitForBanksRequest;
	const banksResponse = await banksRequest.response();
	const { data: { me: { banks } } } = await banksResponse.json();
	expect(banks).toEqual([]);

	const pageContainer = page.locator('div[data-tn="bank-accounts-page"]');
	await expect(pageContainer).toBeVisible();

	const emptyStateContainer = page.locator('div[data-tn="empty-state-no-banks"]');
	await expect(emptyStateContainer).toBeVisible();

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
	const emptyStateContainer = page.locator('div[data-tn="empty-state-no-banks"]');
	await expect(emptyStateContainer).not.toBeVisible();
});

test('edit a bank', async () => {
	const newBankName = `Edited ${bankName}!`;
	await openEditBankForm(page, bankId);
	await editBank(page, bankId, {
		name: newBankName
	});
});

test('delete a bank - last bank', async () => {
	await deleteBank(page, bankId);
	// Validates that the empty state is displayed
	const emptyStateContainer = page.locator('div[data-tn="empty-state-no-banks"]');
	await expect(emptyStateContainer).toBeVisible();
});

test('delete a bank - there are more banks listed', async () => {
	const bank1 = await createBank(page, {
		name: 'Bank #1'
	});
	const bank2 = await createBank(page, {
		name: 'Bank #2'
	});
	// Delete Bank #2
	await deleteBank(page, bank2.id);
	// Validates that Bank #1 still listed
	const emptyStateContainer = page.locator('div[data-tn="empty-state-no-banks"]');
	await expect(emptyStateContainer).not.toBeVisible();
	// validate bank on the screen
	await expect(page.locator(`div[data-tn="bank-${bank1.id}-card"]`)).toBeVisible();
	await expect(page.locator(`div[data-tn="bank-${bank2.id}-card"]`)).not.toBeVisible();
});
