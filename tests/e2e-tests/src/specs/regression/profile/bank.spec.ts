import { test, Page, expect } from '@playwright/test';
import firebaseService from '../../../services/firebase.service';
import { signInUser, signUpUser } from '../../../helpers/auth.helper';
import { v4 as uuidv4 } from 'uuid';
import { goToProfileTab, goToUserProfile } from "../../../helpers/profile.helper";
import { API_BASE_URL } from '../../../config';
import {
    confirmDeleteBank,
    createBank,
    editBank,
    openDeleteBankDialog,
    openEditBankForm
} from "../../../helpers/bank.helper";


let email: string;
let password: string;
let name: string;

let bankName: string = 'Bank #1';
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
    console.log(`Creating account for user with email: "${email}"`)
    await signUpUser(page, { email, password, name });
    await signInUser(page, { email, password });
    await goToUserProfile(page);
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

test('empty state', async () => {
    const waitForBanks = page.waitForResponse((response) =>
        response.url() === `${API_BASE_URL}/banks` && response.status() === 200,
    )
    await goToProfileTab(page, 'banks');
    const banksResponse = await waitForBanks;
    expect(await banksResponse.json()).toEqual([]);

    const pageContainer = page.locator('div[data-tn="account-banks-page"]');
    await expect(pageContainer).toBeVisible();

    const emptyStateContainer = page.locator('div[data-tn="empty-state"]')
    await expect(emptyStateContainer).toBeVisible();

    const addBankButton = page.locator('button[data-tn="add-bank-btn"]')
    await expect(addBankButton).toBeVisible();
})

test('create a bank', async () => {
    const bank = await createBank(page, {
        name: bankName
    })
    bankId = bank.id;
    // validate bank on the screen
    await expect(page.locator(`span[data-tn="name-bank-lbl-${bank.id}"]`))
        .toHaveText(bankName);
    await expect(page.locator(`span[data-tn="icon-bank-lbl-${bank.id}"] svg`))
        .toBeVisible();
})

test('edit a bank', async () => {
    const newBankName = `Edited ${bankName}!`;
    await openEditBankForm(page, bankId);
    await editBank(page, bankId, {
        name: newBankName
    })
    // validate bank on the screen
    await expect(page.locator(`span[data-tn="name-bank-lbl-${bankId}"]`))
        .toHaveText(newBankName);
})

test('delete a bank - last bank', async () => {
    await openDeleteBankDialog(page, bankId);
    await confirmDeleteBank(page, bankId);
    // Validates that the empty state is displayed
    const emptyStateContainer = page.locator('div[data-tn="empty-state"]')
    await expect(emptyStateContainer).toBeVisible();
})

test('delete a bank - there are more banks listed', async () => {
    const bank1 = await createBank(page, {
        name: 'Bank #1'
    })
    const bank2 = await createBank(page, {
        name: 'Bank #2'
    })
    bankId = bank2.id;
    // Delete Bank #2
    await openDeleteBankDialog(page, bankId);
    await confirmDeleteBank(page, bankId);
    // Validates that Bank #1 still listed
    const emptyStateContainer = page.locator('div[data-tn="empty-state"]')
    await expect(emptyStateContainer).not.toBeVisible();
    // validate bank on the screen
    await expect(page.locator(`span[data-tn="name-bank-lbl-${bank1.id}"]`))
        .toHaveText('Bank #1');
})
