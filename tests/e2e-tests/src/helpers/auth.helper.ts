import dotenv from 'dotenv';

import { expect, Page } from '@playwright/test';
import { API_BASE_URL } from '../config';
import { waitForRequest } from './generic.helper';

dotenv.config();

export const DEFAULT_USER_LANG: string = 'Español (Latinoamérica)';
export const DEFAULT_USER_COUNTRY: string = 'Uruguay';
export const DEFAULT_USER_CURRENCIES: string[] = ['USD', 'UYU'];

export const signUpUser = async (page: Page, data: { email: string, password: string, name: string }) => {
	const { email, password, name } = data;
	await page.getByRole('link', { name: 'Sign Up' }).waitFor({ state: 'visible' });
	await page.getByRole('link', { name: 'Sign Up' }).click();
	await page.locator('input[name="name"]').click();
	await page.locator('input[name="name"]').fill(name);
	await page.locator('input[name="email"]').click();
	await page.locator('input[name="email"]').fill(email);
	await page.locator('input[name="password"]').click();
	await page.locator('input[name="password"]').fill(password);
	await page.locator('input[name="confirmPassword"]').click();
	await page.locator('input[name="confirmPassword"]').fill(password);
	const signUpRequest = page.waitForRequest(request =>
		request.url() === `${API_BASE_URL}/auth/sign-up` && request.method() === 'POST'
	);
	await page.getByRole('button', { name: 'Sign Up' }).click();
	await signUpRequest;
	await page.waitForResponse(response =>
		response.url() === `${API_BASE_URL}/auth/sign-up` && response.status() === 201
	);
	await page.locator('button[data-tn="sign-in"]').waitFor({ state: 'visible' });
};

export const signInUser = async (page: Page, data: {
    email: string,
    password: string
}, withWelcome: boolean = true): Promise<any> => {
	const { email, password } = data;
	await page.locator('button[data-tn="sign-in"]').waitFor({ state: 'visible' });
	await page.locator('input[name="email"]').click();
	await page.locator('input[name="email"]').fill(email);
	await page.locator('input[name="password"]').click();
	await page.locator('input[name="password"]').fill(password);
	await page.getByLabel('Remember Me').check();
	await page.getByRole('button', { name: 'Sign In', exact: true }).waitFor({ state: 'visible', timeout: 30000 });
	const waitForUserProfileRequest = waitForRequest(page, 'currentUserInfo');
	await page.getByRole('button', { name: 'Sign In', exact: true }).click();
	const userProfileRequest = await waitForUserProfileRequest;
	const userProfileResponse = await userProfileRequest.response();
	if (withWelcome) {
		await welcomeUser(page, {
			lang: DEFAULT_USER_LANG,
			country: DEFAULT_USER_COUNTRY,
			currencies: DEFAULT_USER_CURRENCIES
		});
	}
	const { data: { me: userProfile } } = await userProfileResponse.json();
	return userProfile;
};

export const welcomeUser = async (page: Page, data: { lang: string, country: string, currencies: string[] }) => {
	const {
		lang,
		country,
		currencies
	} = data;
	const nextBtn = page.locator('button[data-tn="next-btn"]');

	// start step
	await nextBtn.click();

	// lang step
	const langSelect = page.locator('div#lang-select');
	await expect(langSelect).toBeVisible();
	await page.locator('#lang-select input.select__input').fill(lang);
	await page.keyboard.press('Enter');
	await nextBtn.click();

	// country step
	const countrySelect = page.locator('div#country-select');
	await expect(countrySelect).toBeVisible();
	await page.locator('#country-select input.select__input').fill(country);
	await page.keyboard.press('Enter');
	await nextBtn.click();

	// currencies step
	await expect(page.locator('div[data-tn="currency-ckb"]')).toBeVisible();
	for (const currency of currencies) {
		const currencyCheckbox = page.locator(`input[data-tn="${currency}"]`);
		await currencyCheckbox.setChecked(true);
	}
	const patchUserDataRequest = page.waitForRequest(request =>
		request.url() === `${API_BASE_URL}/users/me` && request.method() === 'PATCH'
	);
	const getUserDataResponse = page.waitForResponse(response =>
		response.url() === `${API_BASE_URL}/users/me` && response.status() === 200
	);
	await nextBtn.click();
	await patchUserDataRequest;
	await getUserDataResponse;
};
