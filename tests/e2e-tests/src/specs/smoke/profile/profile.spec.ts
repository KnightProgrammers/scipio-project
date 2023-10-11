import { test, Page, expect } from "@playwright/test";
import { signInUser } from "../../../helpers/auth.helper";
import { goToUserProfile } from "../../../helpers/profile.helper";
import { API_BASE_URL, getDefaultUserData } from "../../../config";


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
    await signInUser(page, {email, password}, false);
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
