import { test, Page, expect } from "@playwright/test";
import firebaseService from "../../../services/firebase.service";
import {
    DEFAULT_USER_COUNTRY, DEFAULT_USER_CURRENCIES,
    DEFAULT_USER_LANG,
    signInUser,
    signUpUser,
    welcomeUser
} from "../../../helpers/auth.helper";
import { v4 as uuidv4 } from "uuid";


let email: string;
let password: string;
let name: string;

test.describe.configure({ mode: 'serial' });

let page: Page;

test.beforeAll(async ({ browser }) => {
    email = `test-${uuidv4()}@automation.com`;
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
    console.log(`Creating account for user with email: "${email}"`)
    await signUpUser(page, { email, password, name });
    const user = await  firebaseService.auth().getUserByEmail(email)
    expect(user).not.toBeNull();
    expect(user.email).toEqual(email);
});

test('Successful sign-in - first time', async () => {
    const {data: {me: userData}} = await signInUser(page, { email, password }, false);
    expect(userData.id).toBeTruthy();
    expect(userData.name).toBe(name);
    expect(userData.email).toBe(email);
    expect(userData.avatar).toBeTruthy();
    expect(userData.lang).toBeNull();
    expect(userData.country).toBeNull();
    // Validate welcome screen being present
    await expect(page.locator('div[data-tn="welcome-wizard-page"]')).toBeVisible();
    await welcomeUser(page, {
        lang: DEFAULT_USER_LANG,
        country: DEFAULT_USER_COUNTRY,
        currencies: DEFAULT_USER_CURRENCIES
    })
});


test('Successful sign-in - all the data', async ({page}) => {
    await page.goto('/');
    await page.waitForLoadState('load');
    const {data: {me: userData}} = await signInUser(page, { email, password }, false);
    expect(userData.id).toBeTruthy();
    expect(userData.name).toBe(name);
    expect(userData.email).toBe(email);
    expect(userData.avatar).toBeTruthy();
    expect(userData.lang).toBeTruthy();
    expect(userData.country).toBeTruthy();
    await page.locator('div[data-tn="user-profile"]').click();
    await expect(page.locator('div[data-tn="profile-user-name"]'))
        .toHaveText(name);
    await expect(page.locator('div[data-tn="profile-user-email"]'))
        .toHaveText(email);
});
