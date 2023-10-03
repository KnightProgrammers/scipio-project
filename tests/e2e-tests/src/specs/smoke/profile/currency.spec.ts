import { test, Page, expect } from "@playwright/test";
import { signInUser } from "../../../helpers/auth.helper";
import { DEFAULT_CURRENCIES, goToUserProfile } from "../../../helpers/profile.helper";
import { API_BASE_URL, getDefaultUserData } from "../../../config";


let email: string;
let password: string;

test.describe.configure({ mode: 'serial' });

let page: Page;

const USER_SELECTED_CURRENCIES: string[] = [ 'USD', 'UYU' ];

test.beforeAll(async ({ browser }) => {
    const defaultUserData = getDefaultUserData();
    email = defaultUserData.email;
    password = defaultUserData.password;
    page = await browser.newPage();
    await page.goto('/');
    await page.waitForLoadState('load');
    await signInUser(page, {email, password});
    await goToUserProfile(page);
});

test.afterAll(async () => {
    await page.close();
});

test('Default list of currencies', async () => {
    const waitForResponse = page.waitForResponse((response) =>
        response.url() === `${API_BASE_URL}/users/me/currencies` && response.status() === 200,
    )
    const systemCurrenciesResponse = page.waitForResponse((response) =>
        response.url() === `${API_BASE_URL}/currencies` && response.status() === 200,
    )
    await page.locator('div[data-tn="account-settings-page"] div.tab-nav[data-tn="profile-tab-currency"]').click();
    const response = await waitForResponse;
    await systemCurrenciesResponse;
    const userCurrencies = await response.json();
    expect(userCurrencies.map(c => c.code)).toStrictEqual(USER_SELECTED_CURRENCIES);
    const currencyInputs = await page.locator('input[name="currencies"]').all();
    expect(currencyInputs).toHaveLength(DEFAULT_CURRENCIES.length)
    for (const i in currencyInputs) {
        const currencyInput = currencyInputs[i];
        const currencyCode:string =  await currencyInput.getAttribute('data-tn');
        expect(currencyCode).toBeDefined();
        if(USER_SELECTED_CURRENCIES.includes(currencyCode)) {
            await expect(currencyInput).toBeChecked();
        } else {
            await expect(currencyInput).not.toBeChecked();
        }
    }
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).not.toHaveClass(/cursor-not-allowed/)
});
