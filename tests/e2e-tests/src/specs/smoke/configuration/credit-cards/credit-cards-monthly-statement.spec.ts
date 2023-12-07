import { test, Page, expect } from '@playwright/test';
import { signInUser } from '../../../../helpers/auth.helper';
import { getDefaultUserData } from '../../../../config';
import {
	openCreditCardDetailView
} from '../../../../helpers/credit-card.helper';
import { waitForRequest } from '../../../../helpers/generic.helper';
import { NAV_MENU, navigateMenu } from '../../../../helpers/nav-menu.helper';
import { DateTime } from 'luxon';
import GraphqlService from '../../../../services/graphql.service';


let email: string;
let password: string;

let graphqlService: GraphqlService;

let creditCardId: string;

test.describe.configure({ mode: 'serial' });

let page: Page;

const CREDIT_CARD_STATEMENT_DRAWER_LOCATOR: string = 'div[data-tn="credit-card-detail-drawer"]';

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

	const userCurrencies = await graphqlService.getUserCurrencies();

	const creditCard1 = await graphqlService.createCreditCard({
		label: 'Gold',
		expiration: DateTime.now().plus({month: 8}).toFormat('MMyy'),
		issuer: 'visa',
		status: 'ACTIVE',
		creditLimitAmount: 5000,
		creditLimitCurrencyId: userCurrencies[0].id
	});
	creditCardId = creditCard1.id;
});

test.afterAll(async () => {
	if (graphqlService) {
		await graphqlService.deleteCreditCard(creditCardId);
	}
	await page.close();
});

test('User can open the credit card view to see the monthly statements', async () => {
	const waitForCreditCards = waitForRequest(page, 'userCreditCards');
	await navigateMenu(page, NAV_MENU.CREDIT_CARDS);
	await waitForCreditCards;
	await openCreditCardDetailView(page, creditCardId);
	const isNextStatementSelected: string = await page.locator(`${CREDIT_CARD_STATEMENT_DRAWER_LOCATOR} div.tab-nav[data-tn="next-statement"]`).getAttribute('aria-selected');
	expect(isNextStatementSelected).toEqual('true');
});
