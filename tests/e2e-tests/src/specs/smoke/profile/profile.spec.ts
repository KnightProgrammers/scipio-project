import { test, Page, expect } from "@playwright/test";
import { signInUser } from "../../helpers/auth.helper";
import { goToUserProfile } from "../../helpers/profile.helper";
import { API_BASE_URL, getDefaultUserData } from "../../config";


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
    await signInUser(page, {email, password});
    await goToUserProfile(page);
});

test.afterAll(async () => {
    await page.close();
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
