import { test, Page, expect } from "@playwright/test";
import firebaseService from "../../services/firebase.service";
import { signInUser } from "../../helpers/auth.helper";
import { getDefaultUserData } from "../../config";


let email: string;
let password: string;
let name: string;

test.describe.configure({ mode: 'serial' });

let page: Page;

test.beforeAll(async ({ browser }) => {
    const defaultUserData = getDefaultUserData();
    email = defaultUserData.email;
    password = defaultUserData.password;
    name = defaultUserData.name;
    page = await browser.newPage();
    await page.goto('/');
    await page.waitForLoadState('load');
});

test.afterAll(async () => {
    try {
        const user = await  firebaseService.auth().getUserByEmail(email);
        await firebaseService.auth().deleteUser(user.uid)
        console.log(`Deleted User "${email}"`)
    } catch {
        console.log('No user to be deleted')
    } finally {
        await page.close();
    }
});

test('Successful sign-in', async () => {
    await signInUser(page);
    await page.locator('div[data-tn="user-profile"]').click();
    await page.locator('div[data-tn="user-profile"]').click();
    await expect(page.locator('div[data-tn="profile-user-name"]'))
        .toHaveText(name);
    await expect(page.locator('div[data-tn="profile-user-email"]'))
        .toHaveText(email);
});
