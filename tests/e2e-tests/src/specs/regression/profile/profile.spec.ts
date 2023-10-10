import { test, Page, expect } from "@playwright/test";
import firebaseService from "../../../services/firebase.service";
import { fullSignUpUser, signInUser } from "../../../helpers/auth.helper";
import { v4 as uuidv4 } from "uuid";
import { goToUserProfile } from "../../../helpers/profile.helper";
import { API_BASE_URL } from "../../../config";


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
    console.log(`Creating account for user with email: "${email}"`)
    await fullSignUpUser(page, { email, password, name });
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

test('Profile is the selected by default tab', async () => {
    const selectedTab = page.locator('div [role="tablist"] div.tab-nav[aria-selected="true"]');
    await expect(selectedTab).toHaveAttribute('data-tn', 'profile-tab-profile');
});

test('Validate current user info', async () => {
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toHaveValue(name);
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toHaveValue(email);
    const countryInput = page.locator('input[name="country"]');
    await expect(countryInput).toHaveValue('Uruguay');
});

test('Readonly fields', async () => {
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toHaveAttribute('disabled', '');
    const countryInput = page.locator('input[name="country"]');
    await expect(countryInput).toHaveAttribute('disabled', '');
});

test('Update User Info', async () => {
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toHaveValue(name);
    await validateProfileUpdate(page, 'Name updated');
    await expect(nameInput).toHaveValue('Name updated');
    await validateProfileUpdate(page, name);
    await expect(nameInput).toHaveValue(name);
});

async function validateProfileUpdate(page: Page, name: string) {
    const nameInput = page.locator('input[name="name"]');
    const submitButton = page.locator('button[type="submit"]');
    await nameInput.fill(name)
    const updateProfileResponse = page.waitForResponse(response =>
        response.url() === `${API_BASE_URL}/users/me` && response.status() === 200,
    );
    await submitButton.click();
    const response = await updateProfileResponse;
    let userData = await response.json();
    const requestMethod = response.request().method();
    expect(requestMethod).toBe('POST');
    expect(userData.name).toBe(name);
}
