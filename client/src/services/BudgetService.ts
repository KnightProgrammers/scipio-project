import BaseService from '@/services/BaseService'

export async function apiGetBudget(): Promise<any> {
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'userBudget',
            query: `
                query userBudget {
                  me {
                    id
                    budget {
                      id
                      items {
                        id
                        category {
                          id
                          name
                        }
                        currencies {
                          currency {
                            id
                            code
                          }
                          limit
                        }
                      }
                    }
                  }
                }
            `,
            variables: {},
        },
    })
    return response.data.data.me.budget
}

export async function apiCreateBudget(): Promise<any> {
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'createBudget',
            query: `
                mutation createBudget {
                  createBudget {
                    id
                  }
                }
            `,
            variables: {},
        },
    })
    return response.data
}

export async function apiUpdateBudgetCurrencies(data: {
    id: string,
    currencies: string[]
}): Promise<any> {
    const {
        id,
        currencies
    } = data;
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'updateBudgetCurrencies',
            query: `
                mutation updateBudgetCurrencies(
                    $id: String!
                    $currencies: [String!]!
                ) {
                  updateBudgetCurrencies(
                    id: $id,
                    currencies: $currencies
                  ) {
                    id
                  }
                }
            `,
            variables: {
                id,
                currencies
            },
        },
    })
    return response.data
}

export async function apiUpsertBudgetItem(body: {
    budgetId: string
    categoryId: string
    currencies: any[]
}): Promise<any> {
    const { budgetId, categoryId, currencies } = body
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'upsertBudgetItem',
            query: `
                mutation upsertBudgetItem(
                  $budgetId: String!
                  $categoryId: String!
                  $currencies:  [BudgetItemCurrencyInput]!
                ) {
                  upsertBudgetItem(input: {
                    budgetId: $budgetId,
                    categoryId: $categoryId
                    currencies: $currencies
                  }) {
                    id
                  }
                }
            `,
            variables: {
                budgetId,
                categoryId,
                currencies,
            },
        },
    })
    return response.data
}

export async function apiDeleteBudgetItem(body: {
    id: string
    budgetId: string
}): Promise<any> {
    const { id, budgetId } = body
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'deleteBudgetItem',
            query: `
                mutation deleteBudgetItem(
                  $id: String!
                  $budgetId: String!
                ) {
                  deleteBudgetItem(
                    id: $id
                    budgetId: $budgetId
                  )
                }
            `,
            variables: {
                id,
                budgetId,
            },
        },
    })
    return response.data
}
