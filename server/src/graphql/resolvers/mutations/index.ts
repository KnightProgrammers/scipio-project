import { BankMutation } from '@/graphql/resolvers/mutations/bank-mutation-resolver';
import { BankAccountMutation } from '@/graphql/resolvers/mutations/bank-account-mutation-resolver';
import { UserMutationResolver } from '@/graphql/resolvers/mutations/user-mutation-resolver';

export default  {
	...BankMutation,
	...BankAccountMutation,
	...UserMutationResolver
};
