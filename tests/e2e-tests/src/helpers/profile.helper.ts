import { Page } from "@playwright/test";

export const goToUserProfile = async (page: Page) => {
    await page.locator('div[data-tn="user-profile"]').click();
    await page.locator('li.menu-item[data-tn="profile-settings"]').click();
}
