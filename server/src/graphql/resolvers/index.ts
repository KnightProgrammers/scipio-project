import {
	BankAccountQueryResolver,
	BankQueryResolver,
	CategoryQueryResolver,
	CreditCardQueryResolver, CurrencyQueryResolver,
	ExpenseQueryResolver,
	UserQueryResolver
} from "@/graphql/resolvers/queries";

import Mutation from '@/graphql/resolvers/mutations';
import CurrencyService from '@/services/currency.service';
import CountryService from '@/services/country.service';

const resolvers = {
	Query: {
		me: async (obj: any, params: any, ctx: any) => ctx.auth,
		currencies: async () => CurrencyService.findAll(),
		countries: async () => CountryService.getAll()
	},
	Bank: BankQueryResolver,
	BankAccount: BankAccountQueryResolver,
	UserCurrency: CurrencyQueryResolver,
	Category: CategoryQueryResolver,
	CreditCard: CreditCardQueryResolver,
	Expense: ExpenseQueryResolver,
	User: UserQueryResolver,
	Mutation
};
export default resolvers;
