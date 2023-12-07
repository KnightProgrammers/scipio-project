import { test, Page } from '@playwright/test';
import { signInUser } from '../../../../helpers/auth.helper';
import { getDefaultUserData } from '../../../../config';
import { createBank, deleteBank } from '../../../../helpers/bank.helper';
import { goToProfileTab, goToUserProfile } from '../../../../helpers/profile.helper';
import { v4 as uuidv4 } from 'uuid';
import {
	createBankAccount,
	deleteBankAccount,
	editBankAccount,
	openEditBankAccountForm
} from '../../../../helpers/bank-account.helper';
import { NAV_MENU, navigateMenu } from '../../../../helpers/nav-menu.helper';


let email: string;
let password: string;

let bankName: string;
let bankId: string;
let bankAccount: any;

test.describe.configure({ mode: 'serial' });

let page: Page;

test.beforeAll(async ({ browser }) => {
	const defaultUserData = getDefaultUserData();
	email = defaultUserData.email;
	password = defaultUserData.password;
	bankName = `bank - ${uuidv4()}`;
	page = await browser.newPage();
	await page.goto('/');
	await page.waitForLoadState('load');
	await signInUser(page, {email, password}, false);
});

test.afterAll(async () => {
	await page.close();
});

test('create bank', async () => {
	await navigateMenu(page, NAV_MENU.BANK_ACCOUNTS);
	const bank = await createBank(page, {
		name: bankName
	});
	bankId = bank.id;
});
test('add bank-account to the bank', async () => {
	bankAccount = await createBankAccount(page, bankId, {
		accountName: 'Caja de Ahorros',
		accountNumber: '12345678',
		accountBalance: 123.2,
		currency: 'USD'
	});
});
test('edit bank account', async () => {
	await openEditBankAccountForm(page, bankAccount.id);
	await editBankAccount(page, bankId, bankAccount.id, {
		accountName: 'Cuenta Corriente',
		accountNumber: '87654321',
		accountBalance: 93.6,
	});
});
test('delete bank account', async () => {
	await deleteBankAccount(page, bankId, bankAccount.id);
});
test('delete bank', async () => {
	await goToUserProfile(page);
	await goToProfileTab(page, 'banks');
	await deleteBank(page, bankId);
});
