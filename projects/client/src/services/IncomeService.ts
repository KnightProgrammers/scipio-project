import BaseService from '@/services/BaseService'

export async function apiGetIncomeList({
    fromDate,
    toDate,
}: {
    fromDate?: string
    toDate?: string
}) {
    const { data } = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'userIncomes',
            query: `
                query userIncomes($fromDate: String, $toDate: String) {
                  me {
                    id
                    incomes(
                        fromDate: $fromDate
                        toDate: $toDate
                    ) {
                        id
                        amount
                        incomeDate
                        description
                        currency {
                            id
                            code
                        }
                        bankAccount {
                            id
                            label
                            accountNumber
                            bank {
                                id
                                name
                            }
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
    return data.data.me.incomes
}

export async function apiCreateIncome(data: {
    amount: number
    description?: string
    incomeDate: string
    bankAccountId: string
}) {
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'createIncome',
            query: `
                mutation createIncome(
                    $amount: Float!
                    $description: String
                    $incomeDate: String!
                    $bankAccountId: String!
                ) {
                    createIncome(input: {
                        amount: $amount
                        description: $description
                        incomeDate: $incomeDate
                        bankAccountId: $bankAccountId
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

export async function apiDeleteIncome(incomeId: string) {
    const response = await BaseService.request({
        url: '/graphql',
        method: 'POST',
        data: {
            operationName: 'deleteIncome',
            query: `mutation deleteIncome($id: String!) {
              deleteIncome(id: $id)
            }`,
            variables: {
                id: incomeId,
            },
        },
    })
    return response.data
}
