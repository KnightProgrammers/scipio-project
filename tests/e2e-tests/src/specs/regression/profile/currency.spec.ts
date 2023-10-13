import { test, Page, expect } from '@playwright/test';
import firebaseService from '../../../services/firebase.service';
import { signUpUser, signInUser, DEFAULT_USER_CURRENCIES } from "../../../helpers/auth.helper";
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_CURRENCIES, goToUserProfile } from "../../../helpers/profile.helper";
import { API_BASE_URL } from '../../../config';
import { waitForRequest } from "../../../helpers/generic.helper";


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
    const waitForCurrenciesRequest = waitForRequest(page, 'currencies')
    await page.locator('div[data-tn="account-settings-page"] div.tab-nav[data-tn="profile-tab-currency"]').click();
    const currenciesRequest = await waitForCurrenciesRequest;

    const currenciesResponse = await currenciesRequest.response();
    const {data: { currencies }} = await currenciesResponse.json();

    expect(currencies.map(c => c.code)).toStrictEqual(DEFAULT_CURRENCIES)

    const currencyInputs = await page.locator('input[name="currencies"]').all();
    expect(currencyInputs).toHaveLength(DEFAULT_CURRENCIES.length)
    for (const i in currencyInputs) {
        const currencyInput = currencyInputs[i];
        await expect(currencyInput).toHaveAttribute('data-tn', DEFAULT_CURRENCIES[i])
        const currency = await currencyInput.getAttribute('data-tn')
        if (currency && DEFAULT_USER_CURRENCIES.includes(currency)) {
            await expect(currencyInput).toBeChecked();
        } else {
            await expect(currencyInput).not.toBeChecked();
        }
    }

    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).not.toHaveClass(/cursor-not-allowed/)
});

test('Update user currencies', async () => {
    const newUserCurrencies =[...DEFAULT_CURRENCIES]
        .sort(() => 0.5 - Math.random())
        .slice(0, 2)
        .sort();

    for (const currency of DEFAULT_CURRENCIES) {
        const currencyInput = page.locator(`input[data-tn="${currency}"]`);
        await currencyInput.setChecked(newUserCurrencies.includes(currency));
    }
    const userCurrenciesWaitForRequest = page.waitForRequest((request) =>
        request.url() === `${API_BASE_URL}/users/me/currencies` && request.method() === 'POST',
    )
    await page.locator('button[type="submit"]').click();
    const userCurrenciesRequest = await userCurrenciesWaitForRequest;
    const userCurrenciesResponse = await userCurrenciesRequest.response();
    const userCurrencies = await userCurrenciesResponse.json();
    const savedCurrencies = userCurrencies.map(c => c.code)
    expect(savedCurrencies.sort()).toStrictEqual(newUserCurrencies);
});
