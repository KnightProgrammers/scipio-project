import { test, Page, expect } from "@playwright/test";
import { signInUser } from '../../../helpers/auth.helper';
import { goToUserProfile } from '../../../helpers/profile.helper';
import { getDefaultUserData } from '../../../config';

import GraphqlService from '../../../services/graphql.service';
import { NAV_MENU, navigateMenu } from "../../../helpers/nav-menu.helper";

let email: string;
let password: string;

test.describe.configure({ mode: 'serial' });

let page: Page;

let graphqlService: GraphqlService;

test.beforeAll(async ({ browser }) => {
	const defaultUserData = getDefaultUserData();
	email = defaultUserData.email;
	password = defaultUserData.password;
	page = await browser.newPage();
	await page.goto('/');
	await page.waitForLoadState('load');
	const {authToken} = await signInUser(page, { email, password }, false);
	graphqlService = new GraphqlService(authToken);
});

test.afterAll(async () => {
	await page.close();
});

test('example', async () => {
	const data = await graphqlService.getCurrentUser();
	console.log(JSON.stringify(data, null, 2));
    await graphqlService.createCategories({
        name: 'Category 1',
        type: "WANT",
        isFixedPayment: true
    })
    await graphqlService.createCategories({
        name: 'Category 2',
        type: "WANT",
        isFixedPayment: true
    })
    await graphqlService.createCategories({
        name: 'Category 3',
        type: "WANT",
        isFixedPayment: true
    })

    await navigateMenu(page, NAV_MENU.CATEGORIES);

    const emptyStateContainer = page.locator('div[data-tn="empty-state-no-categories"]');
    await expect(emptyStateContainer).not.toBeVisible();
});
