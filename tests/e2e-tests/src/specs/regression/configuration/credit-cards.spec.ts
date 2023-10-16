import { expect, Page, test } from "@playwright/test";
import { v4 as uuidv4 } from "uuid";
import { signInUser, signUpUser } from "../../../helpers/auth.helper";
import firebaseService from "../../../services/firebase.service";
import { waitForRequest } from "../../../helpers/generic.helper";
import { NAV_MENU, navigateMenu } from "../../../helpers/nav-menu.helper";

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
    console.log(`Creating account for user with email: "${email}"`);
    await signUpUser(page, { email, password, name });
    await signInUser(page, { email, password });
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

test('Empty state', async () => {
    const waitForCreditCards = waitForRequest(page, 'userCreditCards');
    const waitForUserCurrencies = waitForRequest(page, 'userCurrencies');
    await navigateMenu(page, NAV_MENU.CREDIT_CARDS);
    const creditCardsRequest = await waitForCreditCards;
    await waitForUserCurrencies;
    const creditCardsResponse = await creditCardsRequest.response();
    const {data} = await creditCardsResponse.json();
    expect(data.me.creditCards).toEqual([]);

    const emptyStateContainer = page.locator('div[data-tn="empty-state-no-credit-cards"]');
    await expect(emptyStateContainer).toBeVisible();
})
test('Add a credit card', async () => {})
test('Edit a credit card', async () => {})
test('delete a credit card', async () => {})
