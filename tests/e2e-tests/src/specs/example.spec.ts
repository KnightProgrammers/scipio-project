import { test, Page } from "@playwright/test";


let email: string = `test@automation.com`;
const password: string = 'ThisIsRanpomPassword(123)';

test.describe.configure({ mode: 'serial' });

let page: Page;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  await page.waitForLoadState('load');
  await page.goto('http://localhost:5173/sign-in');
});

test.afterAll(async () => {
  await page.close();
});

test('test', async () => {
  /*
    await page.getByRole('link', { name: 'Sign Up' }).waitFor({state: 'visible'});
    await page.getByRole('link', { name: 'Sign Up' }).click();
    await page.locator('input[name="name"]').click();
    await page.locator('input[name="name"]').fill('Javier');
    await page.locator('input[name="email"]').click();
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').click();
    await page.locator('input[name="password"]').fill(password);
    await page.locator('input[name="confirmPassword"]').click();
    await page.locator('input[name="confirmPassword"]').fill(password);
    await page.locator('.select__input-container').click();
    await page.locator('#react-select-2-option-0').click();
    await page.getByRole('button', { name: 'Sign Up' }).click();
  */
  await page.locator('button[data-tn="sign-in"]').waitFor({state: 'visible'});
  await page.getByPlaceholder('Email').click();
  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Email').press('Tab');
  await page.getByPlaceholder('Password').fill(password);
  await page.getByLabel('Remember Me').check();
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await page.getByRole('button', { name: 'Sign In', exact: true }).waitFor({state: 'detached', timeout: 30000});
  await page.locator('div.header-action-item > span.avatar').waitFor({state: 'attached', timeout: 30000});
  await page.locator('div[data-tn="user-profile"]').click();
  await page.getByRole('link', { name: 'Profile' }).click();
  await page.getByRole('tab', { name: 'Banks' }).click();
  await page.getByRole('button', { name: 'Add new bank' }).click();
  await page.getByPlaceholder('Name').click();
  await page.getByPlaceholder('Name').fill('ITAU');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('tab', { name: 'Currencies' }).click();
  await page.getByText('USD (Dolar - US)').click();
  await page.getByText('UYU (Peso - Uruguay)').click();
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByText('Configuration').click();
  await page.getByRole('link', { name: 'Bank Accounts' }).click();
  await page.getByRole('button', { name: 'Add an account' }).click();
  await page.getByPlaceholder('Label').click();
  await page.getByPlaceholder('Label').fill('Caja de Ahorros');
  await page.getByPlaceholder('Label').press('Tab');
  await page.getByPlaceholder('Account Number').fill('12345678');
  await page.getByPlaceholder('Account Number').press('Tab');
  await page.getByPlaceholder('Balance').fill('6456.32');
  await page.locator('.currency-select').click();
  await page.locator('.currency-select input:visible').fill('Peso');
  await page.locator('div.select-option').first().click();
  await page.getByRole('button', { name: 'Save' }).click();
  await page.locator('div.header-action-item > span.avatar').click();
  await page.getByText('Sign Out').click();
  await page.getByRole('img').first().click();
  await page.getByText('Español').click();
});
