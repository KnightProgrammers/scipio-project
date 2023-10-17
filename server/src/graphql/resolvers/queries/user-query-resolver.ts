import * as gavatar from 'gravatar';
import BankService from '@/services/bank.service';
import CreditCardService from '@/services/credit-card-service';
import CategoryService from '@/services/category.service';

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
	creditCards: async (user: any) => CreditCardService.getAll(user._id),
	categories: async (user: any) => CategoryService.getAll(user._id)
};
