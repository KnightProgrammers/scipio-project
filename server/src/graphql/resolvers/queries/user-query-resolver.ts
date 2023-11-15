import * as gavatar from 'gravatar';
import BankService from '@/services/bank.service';
import CreditCardService from '@/services/credit-card-service';
import CategoryService from '@/services/category.service';
import ExpenseService from '@/services/expense.service';
import SavingService, { SAVING_STATUS_TYPE } from '@/services/saving.service';
import BankAccountService from "@/services/bank-account.service";

export const UserQueryResolver = {
	id: (user: any) => user._id,
	avatar: (user: any) => {
		if (user.avatar) return user.avatar;
		return gavatar.url(user.email, {
			protocol: 'https',
			s: '100',
		});
	},
	country: (user: any) => {
		if (!user.country) return null;
		return {
			id: user.country._id,
			code: user.country.code,
			name: user.country.name
		};
	},
	currencies: (user: any) => {
		return user.currencies.map((c: any) => ({
			id: c._id,
			code: c.code
		}));
	},
	banks: async (user: any) => BankService.getAll(user),
	bankAccounts: async (user: any) => BankAccountService.getAll(user._id),
	creditCards: async (user: any) => CreditCardService.getAll(user._id),
	categories: async (user: any) => CategoryService.getAll(user._id),
	expenses: async (user: any, params: {fromDate?: string, toDate?: string}) => {
		return ExpenseService.getAll(user._id, params.fromDate, params.toDate);
	},
	savings: async (user: any, params: { statuses?: SAVING_STATUS_TYPE[] }) => {
		return SavingService.getAll(user._id, params.statuses);
	}
};
