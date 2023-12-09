import { Page, expect, test} from "@playwright/test";
import firebaseService from '../../../services/firebase.service';
import {
    DEFAULT_USER_COUNTRY, DEFAULT_USER_CURRENCIES,
    DEFAULT_USER_LANG,
    signInUser,
    signUpUser,
    welcomeUser
} from '../../../helpers/auth.helper';
import { v4 as uuidv4 } from 'uuid';

import mailhog = require("mailhog");

test.describe.configure({ mode: 'serial' });

let page: Page;

let mailhogClient;

const LANG_CONFIG: any[] = [
    {
        name: 'EN',
        expects: {
            welcomeEmail: {
                emailSubject: '',
            },
            resetPasswordEmail: {
                emailSubject: '',
            }
        }
    },

    {
        name: 'ES',
        expects: {
            welcomeEmail: {
                emailSubject: '',
            },
            resetPasswordEmail: {
                emailSubject: '',
            }
        }
    }
]

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
            })
            page = await browser.newPage();
            await page.goto('/');
            await page.waitForLoadState('load');
        });

        test.afterAll(async () => {
            try {
                // const user = await  firebaseService.auth().getUserByEmail(email);
                // if (user) {
                //     await firebaseService.auth().deleteUser(user.uid);
                //     console.log(`Deleted User "${email}"`);
                // }
            } catch {
                console.log('No user to be deleted');
            } finally {
                await page.close();
            }
        });
        test('Welcome Email', async () => {
            // await signUpUser(page, { email, password, name });
            // login
            // welcome: LANG = lang.name
            // Check welcome Email
            const result = await mailhogClient.latestTo("test@scipio.com");
            // Validate result is not undefined/null
            console.log('ID: ', result.ID) // Forgot password email id is different that welcome email id
            console.log('From: ', result.from)
            console.log('To: ', result.to)
            console.log('Subject: ', result.subject)
        });

        test('Forgot Password Email', async () => {
            // Log off
            // Forgot Password
            // Validate Welcome email
        });
    })
}

