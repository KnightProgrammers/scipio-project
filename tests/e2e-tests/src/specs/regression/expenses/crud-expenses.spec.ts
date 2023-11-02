import { Page, test } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';
import { signInUser, signUpUser } from '../../../helpers/auth.helper';
import firebaseService from '../../../services/firebase.service';
import GraphqlService from '../../../services/graphql.service';

let email: string;
let password: string;
let name: string;

test.describe.configure({ mode: 'serial' });

let page: Page;

let graphqlService: GraphqlService;

let categoryId_1 : string;
let categoryId_2 : string;
let categoryId_3 : string;

test.beforeAll(async ({ browser }) => {
	email = `test-${uuidv4()}@automation.com`;
	password = `password-${uuidv4()}`;
	name = 'Automation User';
	page = await browser.newPage();
	await page.goto('/');
	await page.waitForLoadState('load');
	console.log(`Creating account for user with email: "${email}"`);
	await signUpUser(page, { email, password, name });
	const {authToken} = await signInUser(page, { email, password });

	graphqlService = new GraphqlService(authToken);
	const data1 = await graphqlService.createCategories({
		name: `Category ${uuidv4()}`,
		type: 'WANT',
		isFixedPayment: true
	});
	categoryId_1 = data1.id;
	console.log(data1);
	console.log(categoryId_1);
	const data2 = await graphqlService.createCategories({
		name: `Category ${uuidv4()}`,
		type: 'WANT',
		isFixedPayment: true
	});
	categoryId_2 = data2.id;
	const data3 = await graphqlService.createCategories({
		name: `Category ${uuidv4()}`,
		type: 'WANT',
		isFixedPayment: true
	});
	categoryId_3 = data3.id;
});

test.afterAll(async () => {
	try {
		const user = await  firebaseService.auth().getUserByEmail(email);
		await firebaseService.auth().deleteUser(user.uid);
		console.log(`Deleted User "${email}"`);
	} catch {
		console.log('No user to be deleted');
	} finally {
		await graphqlService.deleteCategory(categoryId_1);
		await graphqlService.deleteCategory(categoryId_2);
		await graphqlService.deleteCategory(categoryId_3);
		await page.close();
	}
});

test('example', async () => {
	const data = await graphqlService.getCurrentUser();
	console.log(JSON.stringify(data, null, 2));
});
