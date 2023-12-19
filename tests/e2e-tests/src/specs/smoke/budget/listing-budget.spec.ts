import { test, Page, expect } from '@playwright/test';
import { DEFAULT_USER_CURRENCIES, signInUser } from '../../../helpers/auth.helper';
import { getDefaultUserData } from '../../../config';

import { NAV_MENU, navigateMenu } from '../../../helpers/nav-menu.helper';
import { waitForRequest } from '../../../helpers/generic.helper';
import { convertToNumber } from '../../../utils/convertToNumber';
import GraphqlService from '../../../services/graphql.service';

let email: string;
let password: string;

test.describe.configure({ mode: 'serial' });

let graphqlService: GraphqlService;

let page: Page;

let budget: any;

test.beforeAll(async ({ browser }) => {
	const defaultUserData = getDefaultUserData();
	email = defaultUserData.email;
	password = defaultUserData.password;
	page = await browser.newPage();
	await page.goto('/');
	await page.waitForLoadState('load');
	const { authToken } = await signInUser(page, {email, password}, false);

	graphqlService = new GraphqlService(authToken);
	// Wait until the save of the profile is completed
	await page.waitForTimeout(5000);

	const budget = await graphqlService.getBudget();
	if (!budget) {
		const category1 = await graphqlService.createCategories({
			name: 'Category #1',
			type: 'NEED',
			isFixedPayment: false
		});
		const category2 = await graphqlService.createCategories({
			name: 'Category #2',
			type: 'NEED',
			isFixedPayment: false
		});
		const category3 = await graphqlService.createCategories({
			name: 'Category #3',
			type: 'WANT',
			isFixedPayment: false
		});
		const newBudget = await graphqlService.createBudget();
		const budgetId: string = newBudget.id;
		for (const categoryId of [category1.id, category2.id, category3.id]) {
			await graphqlService.upsertBudgetItem({
				budgetId,
				categoryId,
				currencies: [
					{
						currencyCode: DEFAULT_USER_CURRENCIES[0],
						limit: 200
					},
					{
						currencyCode: DEFAULT_USER_CURRENCIES[1],
						limit: 200
					}
				]
			});
		}
	}
});

test.afterAll(async () => {
	await page.close();
});

test('No Empty State', async () => {
	const waitForBudget = waitForRequest(page, 'userBudget');
	await navigateMenu(page, NAV_MENU.BUDGET);
	const getBudgetRequest = await waitForBudget;
	const getBudgetResponse = await getBudgetRequest.response();
	const { data: { me } } = await getBudgetResponse.json();
	budget = me.budget;
	const emptyStateContainer = page.locator(
		'div[data-tn="empty-state"]',
	);
	await expect(emptyStateContainer).not.toBeVisible();
});

test('Currency Selector', async () => {
	await expect(page.locator('div#currency-select')).toBeVisible();
	const selectedCurrencies = page.locator('div#currency-select div.select__multi-value__label');
	const currencyLabels = await selectedCurrencies.all();
	expect(currencyLabels.length).toEqual(DEFAULT_USER_CURRENCIES.length);
	for (const index in currencyLabels) {
		await expect(currencyLabels[index]).toHaveText(DEFAULT_USER_CURRENCIES[index]);
	}
});
test('Validate Budget Items', async () => {
	for (const budgetItem of budget.items) {
		expect(page.locator(`tr[data-tn="budget-item-${budgetItem.id}-row"]`)).toBeVisible();
		for (const currencyCode of DEFAULT_USER_CURRENCIES) {
			const totalCurrencyCell = page.locator(`td[data-tn="${budgetItem.id}-currency-${currencyCode.toLowerCase()}-limit"]`);
			await expect(totalCurrencyCell).toBeVisible();
			const actualTotal = await totalCurrencyCell.textContent();
			expect(convertToNumber(actualTotal)).toEqual(budgetItem.currencies.find((i: any) => i.currency.code === currencyCode).limit);
		}
	}
});
test('Validate Totals', async () => {
	await expect(page.locator('tr[data-tn="budget-totals-row"]')).toBeVisible();
	for (const currencyCode of DEFAULT_USER_CURRENCIES) {
		const expectedTotal = budget.items.reduce((prev, item) => {
			return prev + item.currencies.find((i: any) => i.currency.code === currencyCode).limit;
		}, 0);
		const totalCurrencyCell = page.locator(`tr[data-tn="budget-totals-row"] td[data-tn="budget-total-${currencyCode.toLowerCase()}"]`);
		await expect(totalCurrencyCell).toBeVisible();
		const actualTotal = await totalCurrencyCell.textContent();
		expect(convertToNumber(actualTotal)).toEqual(expectedTotal);
	}
});
