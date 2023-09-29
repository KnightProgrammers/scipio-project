import { test, Page, expect } from '@playwright/test';
import firebaseService from '../../../services/firebase.service';
import { signInUser, signUpUser } from '../../../helpers/auth.helper';
import { v4 as uuidv4 } from 'uuid';
import { goToUserProfile } from '../../../helpers/profile.helper';
import { API_BASE_URL } from '../../../config';


let email: string;
let password: string;
let name: string;

const DEFAULT_CURRENCIES: string[] = [ 'ARS', 'EUR', 'USD', 'UYI', 'UYU' ];

let userSelectedCurrencies: string[] = [];

test.describe.configure({ mode: 'serial' });

let page: Page;

test.beforeAll(async ({ browser }) => {
    email = `test-${(new Date()).getTime()}@automation.com`;
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

test('Default list of currencies', async () => {
    const userCurrenciesResponse = page.waitForResponse((response) =>
        response.url() === `${API_BASE_URL}/users/me/currencies` && response.status() === 200,
    )
    const systemCurrenciesResponse = page.waitForResponse((response) =>
        response.url() === `${API_BASE_URL}/currencies` && response.status() === 200,
    )
    await page.locator('div[data-tn="account-settings-page"] div.tab-nav[data-tn="profile-tab-currency"]').click();
    const systemCurrencies = await systemCurrenciesResponse;
    const currencies = await systemCurrencies.json()
    expect(currencies.map(c => c.code)).toEqual(DEFAULT_CURRENCIES)
    const userCurrencies = await userCurrenciesResponse;
    expect(await userCurrencies.json()).toStrictEqual(userSelectedCurrencies);

    const currencyInputs = await page.locator('input[name="currencies"]').all();
    expect(currencyInputs).toHaveLength(DEFAULT_CURRENCIES.length)
    for (const i in currencyInputs) {
        const currencyInput = currencyInputs[i];
        await expect(currencyInput).not.toBeChecked();
        await expect(currencyInput).toHaveAttribute('data-tn', DEFAULT_CURRENCIES[i])
    }

    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toHaveClass(/cursor-not-allowed/)
});

test('Save user currencies', async () => {
    userSelectedCurrencies = DEFAULT_CURRENCIES
        .sort(() => 0.5 - Math.random())
        .slice(0, 2)
        .sort();

    for(const userSelectedCurrency of userSelectedCurrencies) {
        await page.locator(`input[name="currencies"][data-tn="${userSelectedCurrency}"]`).click()
    }
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).not.toHaveClass(/cursor-not-allowed/)
    const userCurrenciesRequest = page.waitForRequest((request) =>
        request.url() === `${API_BASE_URL}/users/me/currencies` && request.method() === 'POST',
    )
    await submitButton.click();
    const userCurrencies = await userCurrenciesRequest
    const userCurrenciesResponse = await userCurrencies.response();
    const savedCurrencies = (await userCurrenciesResponse.json()).map(c => c.code)
    expect(savedCurrencies.sort()).toStrictEqual(userSelectedCurrencies);
});


test('On page reload keep the changes', async () => {
    await page.reload({waitUntil: 'load'});
    const waitForResponse = page.waitForResponse((response) =>
        response.url() === `${API_BASE_URL}/users/me/currencies` && response.status() === 200,
    )
    const response = await waitForResponse;
    const userCurrencies = await response.json();
    expect(userCurrencies.map(c => c.code)).toStrictEqual(userSelectedCurrencies);
    const currencyInputs = await page.locator('input[name="currencies"]').all();
    expect(currencyInputs).toHaveLength(DEFAULT_CURRENCIES.length)
    for (const i in currencyInputs) {
        const currencyInput = currencyInputs[i];
        const currencyCode:string =  await currencyInput.getAttribute('data-tn');
        expect(currencyCode).toBeDefined();
        if(userSelectedCurrencies.includes(currencyCode)) {
            await expect(currencyInput).toBeChecked();
        } else {
            await expect(currencyInput).not.toBeChecked();
        }
    }
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).not.toHaveClass(/cursor-not-allowed/)
});
