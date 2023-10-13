import { test, Page, expect } from '@playwright/test';
import firebaseService from '../../../services/firebase.service';
import { signUpUser, signInUser } from '../../../helpers/auth.helper';
import { v4 as uuidv4 } from 'uuid';
import { goToProfileTab, goToUserProfile } from '../../../helpers/profile.helper';
import {
	createBank, deleteBank
} from '../../../helpers/bank.helper';
import { NAV_MENU, navigateMenu } from '../../../helpers/nav-menu.helper';
import {
	createBankAccount,
	deleteBankAccount,
	editBankAccount,
	openEditBankAccountForm
} from '../../../helpers/bank-account.helper';
import { waitForRequest } from '../../../helpers/generic.helper';


let email: string;
let password: string;
let name: string;

let bankName: string;
let bankId: string;
let bankAccount: any;

test.describe.configure({ mode: 'serial' });

let page: Page;

test.beforeAll(async ({ browser }) => {
	email = `test-${uuidv4()}@automation.com`;
	password = `password-${uuidv4()}`;
	name = 'Automation User';
	bankName = `Bank - ${uuidv4()}`;
	page = await browser.newPage();
	await page.goto('/');
	await page.waitForLoadState('load');
	console.log(`Creating account for user with email: "${email}"`);
	await signUpUser(page, { email, password, name });
	await signInUser(page, { email, password });
});

test.afterAll(async () => {
	try {
		const user = await  firebaseService.auth().getUserByEmail(email);
		await firebaseService.auth().deleteUser(user.uid);
		console.log(`Deleted User "${email}"`);
	} catch {
		console.log('No user to be deleted');
	} finally {
		await page.close();
	}
});

test('bank account list without banks', async () => {
	const waitForBankAccounts = waitForRequest(page, 'userBankAccounts');
	await navigateMenu(page, NAV_MENU.BANK_ACCOUNTS);
	const bankAccountsRequest = await waitForBankAccounts;
	const bankAccountsResponse = await bankAccountsRequest.response();
	const {data} = await bankAccountsResponse.json();
	expect(data.me.banks).toEqual([]);

	const emptyStateContainer = page.locator('div[data-tn="empty-state-no-banks"]');
	await expect(emptyStateContainer).toBeVisible();
});
test('bank account list with banks', async () => {
	await goToUserProfile(page);
	await goToProfileTab(page, 'banks');
	const bank = await createBank(page, {
		name: bankName
	});
	bankId = bank.id;
	const waitForBankAccounts = waitForRequest(page, 'userBankAccounts');
	await navigateMenu(page, NAV_MENU.BANK_ACCOUNTS);
	const bankAccountsRequest = await waitForBankAccounts;
	const bankAccountsResponse = await bankAccountsRequest.response();
	const { data: { me: { banks } } } = await bankAccountsResponse.json();
	expect(banks).toHaveLength(1);
	expect(banks[0]).toEqual({
		bankAccounts: [],
		id: bankId,
		name: bankName,
		icon: null
	});
	const emptyStateContainer = page.locator('div[data-tn="empty-state-no-banks"]');
	await expect(emptyStateContainer).not.toBeVisible();
	const bankCardLocator = page.locator(`div[data-tn="bank-${bankId}-card"]`);
	await expect(bankCardLocator).toBeVisible();
	const noAccountBarCardLocator = page.locator(`div[data-tn="bank-${bankId}-card"] div[data-tn="empty-state"]`);
	await expect(noAccountBarCardLocator).toBeVisible();
});
test('the user has currencies selected by default', async () => {
	const addBankAccountBtnLocator = page.locator(`div[data-tn="bank-${bankId}-card"] button[data-tn="add-bank-account-btn"]`);
	await expect(addBankAccountBtnLocator).toBeVisible();
	await addBankAccountBtnLocator.click();
	await page.locator('#currency-select').click();
	await expect(page.locator('#currency-select div.select__menu-notice--no-options')).not.toBeVisible();
	await page.locator('#currency-select').click();
	await page.locator('button[data-tn="modal-form-cancel-btn"]').click();
});
test('create bank account', async () => {
	bankAccount = await createBankAccount(page, bankId, {
		accountName: 'Caja de Ahorros',
		accountNumber: '12345678',
		accountBalance: 123.56,
		currency: 'USD'
	});
	await expect(page.locator(`div[data-tn="bank-account-${bankAccount.id}"]`)).toBeVisible();
	await expect(page.locator(
		`div[data-tn="bank-account-${bankAccount.id}"] div[data-tn="bank-account-name"]`
	)).toHaveText(bankAccount.accountName);
	await expect(page.locator(
		`div[data-tn="bank-account-${bankAccount.id}"] span[data-tn="bank-account-number"]`
	)).toHaveText(bankAccount.accountNumber);
});
test('cannot delete a bank with at least one account', async () => {
	await goToUserProfile(page);
	await goToProfileTab(page, 'banks');
	await expect(page.locator(`button[data-tn="delete-bank-btn-${bankId}"]`)).toHaveClass(/cursor-not-allowed/);
	await page.locator(`button[data-tn="delete-bank-btn-${bankId}"]`).click();
});
test('validate editable fields', async () => {
	const waitForBankAccounts = waitForRequest(page, 'userBankAccounts');
	await navigateMenu(page, NAV_MENU.BANK_ACCOUNTS);
	await waitForBankAccounts;
	await openEditBankAccountForm(page, bankAccount.id);
	const currencyInput = page.locator('input[name="accountCurrencyName"]');
	await expect(currencyInput).toHaveAttribute('disabled', '');
});
test('edit bank account', async () => {
	await editBankAccount(page, bankId, bankAccount.id, {
		accountName: 'Cuenta Corriente',
		accountNumber: '87654321',
		accountBalance: 876.3
	});

	await expect(page.locator(`div[data-tn="bank-account-${bankAccount.id}"]`)).toBeVisible();
	await expect(page.locator(
		`div[data-tn="bank-account-${bankAccount.id}"] div[data-tn="bank-account-name"]`
	)).toHaveText('Cuenta Corriente');
	await expect(page.locator(
		`div[data-tn="bank-account-${bankAccount.id}"] span[data-tn="bank-account-number"]`
	)).toHaveText('87654321');
});
test('delete bank account', async () => {
	await deleteBankAccount(page, bankId, bankAccount.id);
	await expect(page.locator(`div[data-tn="bank-account-${bankAccount.id}"]`)).not.toBeVisible();
});

test('delete bank without bank accounts', async () => {
	await goToUserProfile(page);
	await goToProfileTab(page, 'banks');
	await deleteBank(page, bankId);
});
