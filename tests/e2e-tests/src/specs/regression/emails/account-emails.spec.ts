import { Page, expect, test} from '@playwright/test';
import firebaseService from '../../../services/firebase.service';
import {
	DEFAULT_USER_COUNTRY,
	DEFAULT_USER_CURRENCIES, logoutUser,
	signInUser,
	signUpUser,
	welcomeUser
} from '../../../helpers/auth.helper';
import { v4 as uuidv4 } from 'uuid';

import mailhog = require('mailhog');

test.describe.configure({ mode: 'serial' });

let page: Page;

let mailhogClient;

const LANG_CONFIG: any[] = [
	{
		name: 'EN',
		expects: {
			welcomeEmail: {
				subject: 'Welcome to Scipio',
			},
			resetPasswordEmail: {
				subject: 'Reset Password',
			}
		}
	},

	{
		name: 'ES',
		expects: {
			welcomeEmail: {
				subject: 'Bienvenido/a a Scipio',
			},
			resetPasswordEmail: {
				subject: 'Restablecer Contraseña',
			}
		}
	}
];

for (const lang of LANG_CONFIG) {
	test.describe(`Lang: ${lang.name}`, () => {
		let email: string;
		let password: string;
		let name: string;
		test.beforeAll(async ({ browser }) => {
			email = `test-${uuidv4()}@automation.com`;
			password = `password-${uuidv4()}`;
			name = 'Automation User';
			mailhogClient = mailhog({
				host: process.env.MAILHOG_HOST || 'localhost',
				port: process.env.MAILHOG_PORT ? parseInt(process.env.MAILHOG_PORT) : 8025
			});
			page = await browser.newPage();
			await page.goto('/');
			await page.waitForLoadState('load');
		});

		test.afterAll(async () => {
			try {
				const user = await  firebaseService.auth().getUserByEmail(email);
				if (user) {
					await firebaseService.auth().deleteUser(user.uid);
					console.log(`Deleted User "${email}"`);
				}
			} catch {
				console.log('No user to be deleted');
			} finally {
				await page.close();
			}
		});
		test('Welcome Email', async () => {
			await signUpUser(page, { email, password, name });
			await signInUser(page, { email, password }, false);
			await welcomeUser(page, {
				lang: lang.name.toLowerCase(),
				country: DEFAULT_USER_COUNTRY,
				currencies: DEFAULT_USER_CURRENCIES
			});
			await page.waitForTimeout(3000);
			// Check welcome Email
			const result = await mailhogClient.latestTo(email);
			expect(result).toBeDefined();
			expect(result.from).toEqual('no-reply@scipiofinances.com');
			expect(result.to).toEqual(email);
			expect(result.subject).toEqual(lang.expects.welcomeEmail.subject);
			await mailhogClient.deleteMessage(result.ID);
		});

		test('Forgot Password Email', async () => {
			await logoutUser(page);
			// Forgot Password
			await expect(page.locator('div[data-tn="sign-in-page"]')).toBeVisible();
			await page.locator('a[data-tn="forgot-password-link"]').click();
			await page.locator('input[name="email"]').fill(email);
			await page.locator('button[data-tn="send-email-btn"]').click();
			await page.waitForTimeout(3000);
			// Validate reset password email
			const result = await mailhogClient.latestTo(email);
			expect(result).toBeDefined();
			expect(result.from).toEqual('no-reply@scipiofinances.com');
			expect(result.to).toEqual(email);
			expect(result.subject).toEqual(lang.expects.resetPasswordEmail.subject);
			await mailhogClient.deleteMessage(result.ID);
		});
	});
}

