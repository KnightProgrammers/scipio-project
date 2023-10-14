import { API_BASE_URL } from '../config';
import { Page } from '@playwright/test';

export const waitForRequest = async (page: Page, operationName: string) => {
	return page.waitForRequest((request) =>
		request.url() === `${API_BASE_URL}/graphql` && request.postDataJSON().operationName === operationName
	);
};
