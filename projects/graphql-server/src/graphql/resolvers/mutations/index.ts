import { BankMutation } from '@/graphql/resolvers/mutations/bank-mutation-resolver';
import { BankAccountMutation } from '@/graphql/resolvers/mutations/bank-account-mutation-resolver';
import { BudgetMutation } from '@/graphql/resolvers/mutations/budget-mutation-resolver';
import { CategoryMutation } from '@/graphql/resolvers/mutations/category-mutation-resolver';
import { CreditCardMutationResolver } from '@/graphql/resolvers/mutations/credit-card-mutation-resolver';
import { CreditCardMonthlyStatementMutationResolver } from '@/graphql/resolvers/mutations/credit-card-monthly-statement-mutation-resolver';
import { CreditCardStatementPaymentMutationResolver } from '@/graphql/resolvers/mutations/credit-card-statement-payment-mutation-resolver';
import { ExpenseMutation } from '@/graphql/resolvers/mutations/expense-mutation-resolver';
import { IncomeMutation } from '@/graphql/resolvers/mutations/income-mutation-resolver';
import { SavingMutation } from '@/graphql/resolvers/mutations/saving-mutation-resolver';
import { UserMutationResolver } from '@/graphql/resolvers/mutations/user-mutation-resolver';

export default  {
	...BankMutation,
	...BankAccountMutation,
	...BudgetMutation,
	...CategoryMutation,
	...CreditCardMutationResolver,
	...CreditCardMonthlyStatementMutationResolver,
	...CreditCardStatementPaymentMutationResolver,
	...ExpenseMutation,
	...IncomeMutation,
	...SavingMutation,
	...UserMutationResolver,
};
