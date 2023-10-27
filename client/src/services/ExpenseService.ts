import BaseService from '@/services/BaseService'

export async function apiGetExpenseList({
    fromDate,
    toDate,
}: {
    fromDate?: string
    toDate?: string
}) {
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'userExpensesByCategory',
            query: `
                query userExpensesByCategory($fromDate: String, $toDate: String) {
                  me {
                    id
                    categories {
                      id
                      name
                      isFixedPayment
                      expenses(
                                fromDate: $fromDate
                                toDate: $toDate
                            ) {
                        id
                        amount
                        billableDate
                        description
                        currency {
                          id
                          code
                        }
                      }
                    }
                  }
                }
            `,
            variables: {
                fromDate,
                toDate,
            },
        },
    })
    return response.data.data.me.categories
}

export async function apiCreateExpense(data: {
    amount: number
    description?: string
    billableDate: string
    currencyId: string
    categoryId: string
}) {
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'createExpense',
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
            variables: data,
        },
    })
    return response.data
}

export async function apiDeleteExpense(expenseId: string) {
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'deleteExpense',
            query: `mutation deleteExpense($id: String!) {
              deleteExpense(id: $id)
            }`,
            variables: {
                id: expenseId,
            },
        },
    })
    return response.data
}
