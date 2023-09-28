// @ts-ignore
import dotenv from 'dotenv';
dotenv.config();

import { Page } from "@playwright/test";
import { API_BASE_URL, getDefaultUserData } from "../config";

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
    const signUpRequest = page.waitForRequest(request =>
        request.url() === `${API_BASE_URL}/auth/sign-up` && request.method() === 'POST',
    );
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await signUpRequest;
    await page.waitForResponse(response =>
        response.url() === `${API_BASE_URL}/auth/sign-up` && response.status() === 201,
    );
    await page.locator('button[data-tn="sign-in"]').waitFor({state: 'visible'});
}

export const signInUser = async (page: Page, data: {email:string, password: string}): Promise<any> => {
    const { email, password } = data;
    await page.locator('button[data-tn="sign-in"]').waitFor({state: 'visible'});
    await page.locator('input[name="email"]').click();
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').click();
    await page.locator('input[name="password"]').fill(password);
    await page.getByLabel('Remember Me').check();
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await page.getByRole('button', { name: 'Sign In', exact: true }).waitFor({state: 'detached', timeout: 30000});
    await page.waitForRequest(request =>
        request.url() === `${API_BASE_URL}/users/me` && request.method() === 'GET',
    );
    const response = await page.waitForResponse(response =>
        response.url() === `${API_BASE_URL}/users/me` && response.status() === 200,
    );
    return response.json();
}
