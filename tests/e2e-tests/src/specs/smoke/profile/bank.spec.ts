import { test, Page, expect } from "@playwright/test";
import { signInUser } from "../../../helpers/auth.helper";
import { goToUserProfile } from "../../../helpers/profile.helper";
import { v4 as uuidv4 } from 'uuid';
import { API_BASE_URL, getDefaultUserData } from "../../../config";
import {
    confirmDeleteBank,
    createBank,
    editBank,
    openDeleteBankDialog,
    openEditBankForm
} from "../../../helpers/bank.helper";


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
    bankName = `Test Bank - ${uuidv4()}`
    page = await browser.newPage();
    await page.goto('/');
    await page.waitForLoadState('load');
    await signInUser(page, {email, password});
    await goToUserProfile(page);
});

test.afterAll(async () => {
    await page.close();
});

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

test('delete a bank', async () => {
    await openDeleteBankDialog(page, bankId);
    await confirmDeleteBank(page, bankId);
})
