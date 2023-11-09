import { BankMutation } from '@/graphql/resolvers/mutations/bank-mutation-resolver';
import { BankAccountMutation } from '@/graphql/resolvers/mutations/bank-account-mutation-resolver';
import { CategoryMutation } from '@/graphql/resolvers/mutations/category-mutation-resolver';
import { CreditCardMutationResolver } from '@/graphql/resolvers/mutations/credit-card-mutation-resolver';
import { ExpenseMutation } from '@/graphql/resolvers/mutations/expense-mutation-resolver';
import { SavingMutation } from '@/graphql/resolvers/mutations/saving-mutation-resolver';
import { UserMutationResolver } from '@/graphql/resolvers/mutations/user-mutation-resolver';

export default  {
	...BankMutation,
	...BankAccountMutation,
	...CategoryMutation,
	...CreditCardMutationResolver,
	...ExpenseMutation,
	...SavingMutation,
	...UserMutationResolver,
};
