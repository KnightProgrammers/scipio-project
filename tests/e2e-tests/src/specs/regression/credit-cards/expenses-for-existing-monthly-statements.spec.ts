import { expect, Page, test } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';
import { DateTime } from 'luxon';
import { signInUser, signUpUser } from '../../../helpers/auth.helper';
import firebaseService from '../../../services/firebase.service';
import { waitForRequest } from '../../../helpers/generic.helper';
import { NAV_MENU, navigateMenu } from '../../../helpers/nav-menu.helper';
import {
	openCreditCardDetailView,
} from '../../../helpers/credit-card.helper';
import GraphqlService from '../../../services/graphql.service';

let email: string;
let password: string;
let name: string;

let graphqlService: GraphqlService;

let creditCardId: string;
let categoryId: string;
let currencyId: string;

const monthlyStatementIds: string[] = [];
const expenseIds: string[] = [];

test.describe.configure({ mode: 'serial' });

let page: Page;

const CREDIT_CARD_STATEMENT_DRAWER_LOCATOR: string = 'div[data-tn="credit-card-detail-drawer"]';

test.beforeAll(async ({ browser }) => {
	email = `test-${uuidv4()}@automation.com`;
	password = `password-${uuidv4()}`;
	name = 'Automation User';
	page = await browser.newPage();
	await page.goto('/');
	await page.waitForLoadState('load');
	await signUpUser(page, { email, password, name });
	const {authToken} = await signInUser(page, { email, password });
	graphqlService = new GraphqlService(authToken);
	// Wait until the save of the profile is completed
	await page.waitForTimeout(5000);

	const userCurrencies: any[] = await graphqlService.getUserCurrencies();

	currencyId = userCurrencies[0].id;

	const category = await graphqlService.createCategories({
		name: `Category ${uuidv4()}`,
		type: 'WANT',
		isFixedPayment: false
	});
	categoryId = category.id;

	const creditCard = await graphqlService.createCreditCard({
		label: 'Platinum',
		expiration: DateTime.now().plus({month: 8}).toFormat('MMyy'),
		issuer: 'visa',
		status: 'ACTIVE',
		creditLimitAmount: 5000,
		creditLimitCurrencyId: userCurrencies[0].id
	});
	creditCardId = creditCard.id;

	const statementsConf: any[] = [
		{
			closeDate: DateTime.fromJSDate(new Date()).minus({month: 1}).toISO({ includeOffset: false }), // Last Month
		},
		{
			closeDate: DateTime.fromJSDate(new Date()).minus({month: 2}).toISO({ includeOffset: false }), // Two months ago
		}
	];

	for (const conf of statementsConf) {
		const monthlyStatement = await graphqlService.createCreditCardMonthlyStatement({
			closeDate: conf.closeDate,
			creditCardId,
		});
		monthlyStatementIds.push(monthlyStatement.id);
	}



	const expensesConf = [
		{
			billableDate: DateTime.fromJSDate(new Date()).toISO({ includeOffset: false }) // Today
		},
		{
			billableDate: DateTime.fromJSDate(new Date()).minus({month: 1, day: 5}).toISO({ includeOffset: false }) // Last Month
		},
		{
			billableDate: DateTime.fromJSDate(new Date()).minus({month: 2, day: 10}).toISO({ includeOffset: false }) // Two months ago
		}
	];

	for (const conf of expensesConf) {
		const expense = await graphqlService.createExpense({
			amount: 200,
			categoryId: categoryId,
			billableDate: conf.billableDate,
			currencyId: currencyId,
			creditCardId: creditCardId,
			description: 'Expense for statement'
		});
		expenseIds.push(expense.id);
	}
	const waitForCreditCards = waitForRequest(page, 'userCreditCards');
	await navigateMenu(page, NAV_MENU.CREDIT_CARDS);
	await waitForCreditCards;
	await openCreditCardDetailView(page, creditCardId);
});

test.afterEach(async () => {
	await page.locator('div.dialog-overlay-after-open span.close-btn').click();
});

test.afterAll(async () => {
	try {
		const user = await  firebaseService.auth().getUserByEmail(email);
		await firebaseService.auth().deleteUser(user.uid);
	} catch {
		console.log('No user to be deleted');
	} finally {
		await page.close();
	}
});

test('Today\'s expense has no statement', async () => {
	await expect(
		page.locator(`${CREDIT_CARD_STATEMENT_DRAWER_LOCATOR} div[data-tn="expense-item-${expenseIds[0]}"]`)
	).toBeVisible();
	await expect(
		page.locator(`${CREDIT_CARD_STATEMENT_DRAWER_LOCATOR} div[data-tn="expense-item-${expenseIds[1]}"]`)
	).not.toBeVisible();
	await expect(
		page.locator(`${CREDIT_CARD_STATEMENT_DRAWER_LOCATOR} div[data-tn="expense-item-${expenseIds[2]}"]`)
	).not.toBeVisible();
});

test('One month ago expense on the last month statement', async () => {
	await page.locator(`div[data-tn="statement-card-${monthlyStatementIds[0]}"] button[data-tn="view-expenses-button"]`).click();
	await expect(
		page.locator(`${CREDIT_CARD_STATEMENT_DRAWER_LOCATOR} div[data-tn="expense-item-${expenseIds[0]}"]`)
	).not.toBeVisible();
	await expect(
		page.locator(`${CREDIT_CARD_STATEMENT_DRAWER_LOCATOR} div[data-tn="expense-item-${expenseIds[1]}"]`)
	).toBeVisible();
	await expect(
		page.locator(`${CREDIT_CARD_STATEMENT_DRAWER_LOCATOR} div[data-tn="expense-item-${expenseIds[2]}"]`)
	).not.toBeVisible();
});

test('Two months ago expense on the two months ago statement', async () => {
	await page.locator(`div[data-tn="statement-card-${monthlyStatementIds[1]}"] button[data-tn="view-expenses-button"]`).click();
	await expect(
		page.locator(`${CREDIT_CARD_STATEMENT_DRAWER_LOCATOR} div[data-tn="expense-item-${expenseIds[0]}"]`)
	).not.toBeVisible();
	await expect(
		page.locator(`${CREDIT_CARD_STATEMENT_DRAWER_LOCATOR} div[data-tn="expense-item-${expenseIds[1]}"]`)
	).not.toBeVisible();
	await expect(
		page.locator(`${CREDIT_CARD_STATEMENT_DRAWER_LOCATOR} div[data-tn="expense-item-${expenseIds[2]}"]`)
	).toBeVisible();
});
