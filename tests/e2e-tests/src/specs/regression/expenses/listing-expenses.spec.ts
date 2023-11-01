import { expect, Page, test } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';
import { signInUser, signUpUser } from '../../../helpers/auth.helper';
import firebaseService from '../../../services/firebase.service';
import { waitForRequest } from '../../../helpers/generic.helper';
import { NAV_MENU, navigateMenu } from '../../../helpers/nav-menu.helper';
import {
	createCategory,
	deleteCategory,
	editCategory,
	openEditCategoryForm
} from '../../../helpers/category.helper';
import GraphqlService from "../../../services/graphql.service";

let email: string;
let password: string;
let name: string;

test.describe.configure({ mode: 'serial' });

let page: Page;

let graphqlService: GraphqlService;

test.beforeAll(async ({ browser }) => {
	email = `test-${uuidv4()}@automation.com`;
	password = `password-${uuidv4()}`;
	name = 'Automation User';
	page = await browser.newPage();
	await page.goto('/');
	await page.waitForLoadState('load');
	console.log(`Creating account for user with email: "${email}"`);
	await signUpUser(page, { email, password, name });
	const {authToken} = await signInUser(page, { email, password }, false);
	graphqlService = new GraphqlService(authToken);
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
