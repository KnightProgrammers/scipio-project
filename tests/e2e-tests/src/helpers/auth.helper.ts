// @ts-ignore
import dotenv from 'dotenv';
dotenv.config();

import { Page } from "@playwright/test";

export const signUpUser = async (page: Page, data: {email:string, password: string, name: string}) => {
    const {email, password, name} = data;
    await page.getByRole('link', { name: 'Sign Up' }).waitFor({state: 'visible'});
    await page.getByRole('link', { name: 'Sign Up' }).click();
    await page.locator('input[name="name"]').click();
    await page.locator('input[name="name"]').fill(name);
    await page.locator('input[name="email"]').click();
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').click();
    await page.locator('input[name="password"]').fill(password);
    await page.locator('input[name="confirmPassword"]').click();
    await page.locator('input[name="confirmPassword"]').fill(password);
    await page.locator('.select__input-container').click();
    await page.locator('#react-select-2-option-0').click();
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await page.locator('button[data-tn="sign-in"]').waitFor({state: 'visible'});
    await page.locator('button[data-tn="sign-in"]').waitFor({state: 'visible'});
}

export const signInUser = async (page: Page, data?: {email:string, password: string}) => {
    const { email, password } = data || {
        email: process.env.TEST_USER_EMAIL,
        password: process.env.TEST_USER_PASS,
    };
    await page.locator('button[data-tn="sign-in"]').waitFor({state: 'visible'});
    await page.getByPlaceholder('Email').click();
    await page.getByPlaceholder('Email').fill(email);
    await page.getByPlaceholder('Email').press('Tab');
    await page.getByPlaceholder('Password').fill(password);
    await page.getByLabel('Remember Me').check();
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await page.getByRole('button', { name: 'Sign In', exact: true }).waitFor({state: 'detached', timeout: 30000});
    await page.locator('div.header-action-item > span.avatar').waitFor({state: 'attached', timeout: 30000});
}
