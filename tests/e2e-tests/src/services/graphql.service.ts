import { API_BASE_URL } from '../config';

type NewCategoryInput = {
    name: string
    type: 'WANT' | 'NEED' | 'SAVE'
    isFixedPayment: boolean
}

type NewExpenseInput = {
	billableDate: string
	description?: string
	amount: number,
	currencyId: string
	categoryId: string
}

type BankInput = {
	name: string
}

type BankAccountInput = {
	label: string,
	accountNumber: string,
	balance: number,
	bankId: string,
	currencyId: string,
}

const graphQLClient = async (request: {authToken: string, query: string, variables?: any}) => {
	const {
		authToken,
		query = '',
		variables = {}
	} = request;
	const response = await fetch(`${API_BASE_URL}/graphql`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'authorization': authToken
		},
		body: JSON.stringify({
			query,
			variables,
		})
	});
	return response.json();
};

class GraphqlService {
	authToken: string;
	constructor(authToken: string) {
		this.authToken = authToken;
	}

	async getCurrentUser() {
		return graphQLClient({
			authToken: this.authToken,
			query: '{ me { id name email } }',
			variables: {}
		});
	}

	async createCategories(variables: NewCategoryInput) {
		const { data } = await graphQLClient({
			authToken: this.authToken,
			query: `
                mutation createCategory(
                    $name: String!
                    $type: CategoryType!
                    $isFixedPayment: Boolean!
                ) {
                  createCategory(input: {
                    name: $name
                    type: $type
                    isFixedPayment: $isFixedPayment
                  }) {
                    id
                    name
                    type
                    isFixedPayment
                  }
                }
            `,
			variables,
		});

		return data.createCategory;
	}

	async deleteCategory(id: string) {
		return graphQLClient({
			authToken: this.authToken,
			query: `
                mutation deleteCategory(
                    $id: String!
                ) {
                  deleteCategory(id: $id)
                }
            `,
			variables: {
				id
			},
		});
	}

	async createExpense(variables: NewExpenseInput) {
		const { data } = await graphQLClient({
			authToken: this.authToken,
			query: `
				mutation createExpense(
					$amount: Float!
					$description: String
					$billableDate: String!
					$currencyId: String!
					$categoryId: String!
				) {
					createExpense(input: {
						amount: $amount
						description: $description
						billableDate: $billableDate
						currencyId: $currencyId
						categoryId: $categoryId
					}) {
						id
					}
				}
			`,
			variables
		});
		return data.createExpense;
	}

	async getUserCurrencies () {
		const { data } = await graphQLClient({
			authToken: this.authToken,
			query: 'query userCurrencies { me { id currencies { id code } } }'
		});
		return data.me.currencies;
	}

	async createBank (variables: BankInput) {
		const { data } = await graphQLClient(({
			authToken: this.authToken,
			query: `
				mutation createBank(
					$name: String!
				) {
					createBank(input: {
						name: $name
					}) {
						id
					}
				}
			`,
			variables
		}));
		return data.createBank;
	}

	async deleteBank(id: string) {
		return graphQLClient({
			authToken: this.authToken,
			query: `
                mutation deleteBank(
                    $id: String!
                ) {
                  deleteBank(id: $id)
                }
            `,
			variables: {
				id
			},
		});
	}

	async createBankAccount (variables: BankAccountInput) {
		const { data } = await graphQLClient(({
			authToken: this.authToken,
			query: `
                mutation createBankAccount(
                    $label: String
                    $accountNumber: String!
                    $balance: Float!
                    $bankId: String!
                    $currencyId: String!
                ) {
                  createBankAccount(input: {
                    label: $label
                    accountNumber: $accountNumber
                    balance: $balance
                    bankId: $bankId
                    currencyId: $currencyId
                  }) {
                    id
                  }
                }
            
			`,
			variables
		}));
		return data.createBankAccount;
	}

	async deleteBankAccount(id: string) {
		return graphQLClient({
			authToken: this.authToken,
			query: `
                mutation deleteBankAccount(
                    $id: String!
                ) {
                  deleteBankAccount(id: $id)
                }
            `,
			variables: {
				id
			},
		});
	}
}

export default GraphqlService;
