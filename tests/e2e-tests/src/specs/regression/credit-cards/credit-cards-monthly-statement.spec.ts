import { expect, Page, test } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';
import { DateTime } from 'luxon';
import { signInUser, signUpUser } from '../../../helpers/auth.helper';
import firebaseService from '../../../services/firebase.service';
import { waitForRequest } from '../../../helpers/generic.helper';
import { NAV_MENU, navigateMenu } from '../../../helpers/nav-menu.helper';
import {
	createMonthlyStatement,
	openCreditCardDetailView,
} from '../../../helpers/credit-card.helper';
import GraphqlService from '../../../services/graphql.service';

let email: string;
let password: string;
let name: string;

let graphqlService: GraphqlService;

let creditCardId: string;
let statementId: string;

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

	const currencyId = userCurrencies[0].id;

	const category = await graphqlService.createCategories({
		name: `Category ${uuidv4()}`,
		type: 'WANT',
		isFixedPayment: false
	});
	const categoryId = category.id;

	const creditCard1 = await graphqlService.createCreditCard({
		label: 'Platinum',
		expiration: DateTime.now().plus({month: 8}).toFormat('MMyy'),
		issuer: 'visa',
		status: 'ACTIVE',
		creditLimitAmount: 5000,
		creditLimitCurrencyId: userCurrencies[0].id
	});
	creditCardId = creditCard1.id;

	const creditCard2 = await graphqlService.createCreditCard({
		label: 'Gold',
		expiration: DateTime.now().plus({month: 8}).toFormat('MMyy'),
		issuer: 'mastercard',
		status: 'ACTIVE',
		creditLimitAmount: 5000,
		creditLimitCurrencyId: userCurrencies[0].id
	});

	const expensesConf = [
		{
			billableDate: DateTime.fromJSDate(new Date()).plus({day: 1}).toISO({ includeOffset: false }), // Tomorrow
			creditCardId: creditCard1.id
		},
		{
			billableDate: DateTime.fromJSDate(new Date()).toISO({ includeOffset: false }), // Today
			creditCardId: creditCard1.id
		},
		{
			billableDate: DateTime.fromJSDate(new Date()).minus({day: 1}).toISO({ includeOffset: false }), // Yesterday
			creditCardId: creditCard1.id
		},
		{
			billableDate: DateTime.fromJSDate(new Date()).minus({day: 1}).toISO({ includeOffset: false }), // Yesterday
			creditCardId: creditCard2.id
		},
		{
			billableDate: DateTime.fromJSDate(new Date()).minus({day: 1}).toISO({ includeOffset: false }), // Yesterday
			creditCardId: undefined // Cash expense
		}
	];

	for (const conf of expensesConf) {
		const expense = await graphqlService.createExpense({
			amount: 200,
			categoryId: categoryId,
			billableDate: conf.billableDate,
			currencyId: currencyId,
			creditCardId: conf.creditCardId,
			description: 'Expense #1'
		});
		expenseIds.push(expense.id);
	}
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

test('`Next Statement` tab - List of expenses', async () => {
	const waitForCreditCards = waitForRequest(page, 'userCreditCards');
	await navigateMenu(page, NAV_MENU.CREDIT_CARDS);
	await waitForCreditCards;
	await openCreditCardDetailView(page, creditCardId);
	await expect(
		page.locator(`${CREDIT_CARD_STATEMENT_DRAWER_LOCATOR} div[data-tn="expense-item-${expenseIds[0]}"]`)
	).toBeVisible();
	await expect(
		page.locator(`${CREDIT_CARD_STATEMENT_DRAWER_LOCATOR} div[data-tn="expense-item-${expenseIds[1]}"]`)
	).toBeVisible();
	await expect(
		page.locator(`${CREDIT_CARD_STATEMENT_DRAWER_LOCATOR} div[data-tn="expense-item-${expenseIds[2]}"]`)
	).toBeVisible();
	await expect(
		page.locator(`${CREDIT_CARD_STATEMENT_DRAWER_LOCATOR} div[data-tn="expense-item-${expenseIds[3]}"]`)
	).not.toBeVisible();
	await expect(
		page.locator(`${CREDIT_CARD_STATEMENT_DRAWER_LOCATOR} div[data-tn="expense-item-${expenseIds[4]}"]`)
	).not.toBeVisible();
});
test('Create Statement', async () => {
	// Create a Statement with a close date for today
	statementId = await createMonthlyStatement(page, new Date());
});
test('`Next Statement` tab - After statement Creation', async () => {
	const isNextStatementSelected: string = await page.locator(`${CREDIT_CARD_STATEMENT_DRAWER_LOCATOR} div.tab-nav[data-tn="next-statement"]`).getAttribute('aria-selected');
	expect(isNextStatementSelected).toEqual('true');
	await expect(
		page.locator(`${CREDIT_CARD_STATEMENT_DRAWER_LOCATOR} div[data-tn="expense-item-${expenseIds[0]}"]`)
	).toBeVisible();
	await expect(
		page.locator(`${CREDIT_CARD_STATEMENT_DRAWER_LOCATOR} div[data-tn="expense-item-${expenseIds[1]}"]`)
	).not.toBeVisible();
	await expect(
		page.locator(`${CREDIT_CARD_STATEMENT_DRAWER_LOCATOR} div[data-tn="expense-item-${expenseIds[2]}"]`)
	).not.toBeVisible();
	await expect(
		page.locator(`${CREDIT_CARD_STATEMENT_DRAWER_LOCATOR} div[data-tn="expense-item-${expenseIds[3]}"]`)
	).not.toBeVisible();
	await expect(
		page.locator(`${CREDIT_CARD_STATEMENT_DRAWER_LOCATOR} div[data-tn="expense-item-${expenseIds[4]}"]`)
	).not.toBeVisible();
});
test('New statement tab - List of expenses', async () => {
	const newStatementTab = page.locator(`${CREDIT_CARD_STATEMENT_DRAWER_LOCATOR} div.tab-nav[data-tn="statement-${statementId}"]`);
	expect(await newStatementTab.getAttribute('aria-selected')).toEqual('false');
	await newStatementTab.click();
	expect(await newStatementTab.getAttribute('aria-selected')).toEqual('true');
	await expect(
		page.locator(`${CREDIT_CARD_STATEMENT_DRAWER_LOCATOR} div[data-tn="expense-item-${expenseIds[0]}"]`)
	).not.toBeVisible();
	await expect(
		page.locator(`${CREDIT_CARD_STATEMENT_DRAWER_LOCATOR} div[data-tn="expense-item-${expenseIds[1]}"]`)
	).toBeVisible();
	await expect(
		page.locator(`${CREDIT_CARD_STATEMENT_DRAWER_LOCATOR} div[data-tn="expense-item-${expenseIds[2]}"]`)
	).toBeVisible();
	await expect(
		page.locator(`${CREDIT_CARD_STATEMENT_DRAWER_LOCATOR} div[data-tn="expense-item-${expenseIds[3]}"]`)
	).not.toBeVisible();
	await expect(
		page.locator(`${CREDIT_CARD_STATEMENT_DRAWER_LOCATOR} div[data-tn="expense-item-${expenseIds[4]}"]`)
	).not.toBeVisible();
});
