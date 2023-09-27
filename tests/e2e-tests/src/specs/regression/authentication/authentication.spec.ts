import { test, Page, expect } from "@playwright/test";
import firebaseService from "../../../services/firebase.service";
import { signInUser, signUpUser } from "../../../helpers/auth.helper";
import { v4 as uuidv4 } from "uuid";


let email: string;
let password: string;
let name: string;

test.describe.configure({ mode: 'serial' });

let page: Page;

test.beforeAll(async ({ browser }) => {
    email = `test-${(new Date()).getTime()}@automation.com`;
    password = `password-${uuidv4()}`;
    name = 'Automation User';
    page = await browser.newPage();
    await page.goto('/');
    await page.waitForLoadState('load');
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

test('Successful sign-up', async () => {
    await signUpUser(page, { email, password, name });
    const user = await  firebaseService.auth().getUserByEmail(email)
    expect(user).not.toBeNull();
    expect(user.email).toEqual(email);
});

test('Successful sign-in', async () => {
    await signInUser(page, { email, password });
    await page.locator('div[data-tn="user-profile"]').click();
    await page.pause();
    await expect(page.locator('div[data-tn="profile-user-name"]'))
        .toHaveText(name);
    await expect(page.locator('div[data-tn="profile-user-email"]'))
        .toHaveText(email);
});
