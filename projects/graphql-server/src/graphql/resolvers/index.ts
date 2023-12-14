import {
	BankAccountQueryResolver,
	BankQueryResolver,
	BudgetQueryResolver,
	BudgetItemQueryResolver,
	CategoryQueryResolver,
	CreditCardQueryResolver,
	CreditCardMonthlyStatementQueryResolver,
	CurrencyQueryResolver,
	IncomeQueryResolver,
	ExpenseQueryResolver,
	SavingQueryResolver,
	UserQueryResolver,
} from '@/graphql/resolvers/queries';

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
	Budget: BudgetQueryResolver,
	BudgetItem: BudgetItemQueryResolver,
	UserCurrency: CurrencyQueryResolver,
	Category: CategoryQueryResolver,
	CreditCard: CreditCardQueryResolver,
	CreditCardMonthlyStatement: CreditCardMonthlyStatementQueryResolver,
	Expense: ExpenseQueryResolver,
	Income: IncomeQueryResolver,
	Saving: SavingQueryResolver,
	User: UserQueryResolver,
	Mutation
};
export default resolvers;
