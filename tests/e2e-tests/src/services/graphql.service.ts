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
}

export default GraphqlService;
